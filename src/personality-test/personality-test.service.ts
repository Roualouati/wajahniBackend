// src/personality-test/personality-test.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class PersonalityTestService {
  constructor(
    private prisma: PrismaService,
    private openai: OpenAIService
  ) {}

  private readonly options = ["Agree", "Neutral", "Disagree"];

  async getTestResult(testId: number) {
    return this.prisma.personalityTest.findUnique({
      where: { id: testId },
      select: { personalityType: true }
    });
  }

  async startTest(userId: number) {
    const userExists = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const test = await this.prisma.personalityTest.create({
      data: { userId }
    });

    const defaultCritiques = [
      { name: "Extraversion", description: "Measures social orientation and energy" },
      { name: "Intuition", description: "Measures information processing style" },
      { name: "Feeling", description: "Measures decision-making approach" },
      { name: "Judging", description: "Measures planning and structure preference" }
    ];

    await this.prisma.$transaction(
      defaultCritiques.map(critique => 
        this.prisma.personalityCritique.create({
          data: {
            ...critique,
            testId: test.id
          }
        })
      )
    );

    const critiques = await this.prisma.personalityCritique.findMany({
      where: { testId: test.id },
      orderBy: { id: 'asc' },
      include: { questions: true }
    });

    if (!critiques.length) {
      throw new Error('Failed to initialize critiques');
    }

    const firstCritique = critiques[0];
    const questions = await this.generateDiverseQuestions(firstCritique.id, firstCritique.name);
    
    return {
      test,
      currentCritique: {
        ...firstCritique,
        description: this.getEnhancedDescription(firstCritique.name)
      },
      questions,
      isLastCritique: critiques.length === 1,
      remainingCritiques: critiques.slice(1).map(c => ({
        ...c,
        description: this.getEnhancedDescription(c.name)
      }))
    };
  }

  private getEnhancedDescription(critiqueName: string): string {
    const descriptions = {
      "Extraversion": "Assesses whether you gain energy from social interaction (Extraversion) or from alone time (Introversion)",
      "Intuition": "Evaluates how you process information - through patterns and possibilities (Intuition) or concrete facts (Sensing)",
      "Feeling": "Measures your decision-making style - values and harmony (Feeling) or logic and objectivity (Thinking)",
      "Judging": "Examines your approach to structure - planned and organized (Judging) or flexible and spontaneous (Perceiving)"
    };
    return descriptions[critiqueName] || "Measures an important personality dimension";
  }

  private async generateDiverseQuestions(critiqueId: number, critiqueName: string, count = 5): Promise<any[]> {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const questionText = await this.openai.generateQuestion(critiqueName, i+1);
      
      const question = await this.prisma.personalityQuestion.create({
        data: {
          text: questionText,
          options: this.options,
          position: i + 1,
          critiqueId
        }
      });
      questions.push(question);
    }
    return questions;
  }

  async submitAnswer(questionId: number, answer: string) {
    if (!this.options.includes(answer)) {
      throw new Error('Invalid answer option');
    }

    return this.prisma.personalityQuestion.update({
      where: { id: questionId },
      data: { selectedOption: answer }
    });
  }

  async completeCritique(testId: number, currentCritiqueId: number, remainingCritiques: any[]) {
    await this.calculateScore(currentCritiqueId);

    if (remainingCritiques.length > 0) {
      const nextCritique = remainingCritiques[0];
      const questions = await this.generateDiverseQuestions(nextCritique.id, nextCritique.name);

      return {
        nextCritique: {
          ...nextCritique,
          description: this.getEnhancedDescription(nextCritique.name)
        },
        questions,
        isLastCritique: remainingCritiques.length === 1,
        remainingCritiques: remainingCritiques.slice(1).map(c => ({
          ...c,
          description: this.getEnhancedDescription(c.name)
        }))
      };
    }

    const personalityType = await this.determinePersonalityType(testId);
    await this.prisma.personalityTest.update({
      where: { id: testId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        personalityType
      }
    });

    return { completed: true, personalityType };
  }

  private async calculateScore(critiqueId: number) {
    const questions = await this.prisma.personalityQuestion.findMany({
      where: { critiqueId, selectedOption: { not: null } }
    });

    let score = 0;
    questions.forEach(q => {
      switch (q.selectedOption) {
        case 'Agree': score += 2; break;
        case 'Neutral': score += 1; break;
        case 'Disagree': score += 0; break;
      }
    });

    const maxScore = questions.length * 2;
    const percentage = Math.round((score / maxScore) * 100);

    await this.prisma.personalityCritique.update({
      where: { id: critiqueId },
      data: { score: percentage }
    });

    return percentage;
  }

  private async determinePersonalityType(testId: number) {
    const critiques = await this.prisma.personalityCritique.findMany({
      where: { testId }
    });

    const scores = {};
    critiques.forEach(c => {
      scores[c.name] = c.score || 0;
    });

    return this.openai.determinePersonalityType(scores);
  }
}