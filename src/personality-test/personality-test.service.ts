// src/personality/personality-test.service.ts
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
// In personality-test.service.ts
async getTestResult(testId: number) {
  return this.prisma.personalityTest.findUnique({
    where: { id: testId },
    select: { personalityType: true }
  });
}
  // src/personality-test/personality-test.service.ts
async startTest(userId: number) {
  // 1. Create the test first
  const test = await this.prisma.personalityTest.create({
    data: { userId }
  });

  // 2. Create default critiques for this test
  const defaultCritiques = [
    { name: "Extraversion", description: "Measures social orientation" },
    { name: "Intuition", description: "Measures information processing style" },
    { name: "Feeling", description: "Measures decision-making approach" },
    { name: "Judging", description: "Measures structure preference" }
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
  // 3. Get all critiques with questions
  const critiques = await this.prisma.personalityCritique.findMany({
    where: { testId: test.id },
    include: { questions: true }
  });

  if (!critiques.length) {
    throw new Error('Failed to initialize critiques');
  }

  // 4. Generate questions for first critique
  const firstCritique = critiques[0];
  const questions = await this.generateQuestions(firstCritique.id);
  
  return {
    test,
    currentCritique: firstCritique,
    questions,
    isLastCritique: critiques.length === 1,
    remainingCritiques: critiques.slice(1)
  };
}

  async generateQuestions(critiqueId: number, count = 5) {
    const critique = await this.prisma.personalityCritique.findUnique({
      where: { id: critiqueId }
    });

    if (!critique) throw new Error('Critique not found');

    const questions = [];
    for (let i = 0; i < count; i++) {
      const questionText = await this.openai.generateQuestion(critique.name);
      
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
    // 1. Calculate score for current critique
    await this.calculateScore(currentCritiqueId);

    // 2. If more critiques remaining, return next one
    if (remainingCritiques.length > 0) {
      const nextCritique = remainingCritiques[0];
      const questions = await this.generateQuestions(nextCritique.id);

      return {
        nextCritique,
        questions,
        isLastCritique: remainingCritiques.length === 1,
        remainingCritiques: remainingCritiques.slice(1)
      };
    }

    // 3. If no more critiques, complete test
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

    // Prepare scores for OpenAI
    const scores = {};
    critiques.forEach(c => {
      scores[c.name] = c.score || 0;
    });

    // Use OpenAI to determine final type
    return this.openai.determinePersonalityType(scores);
  }
}