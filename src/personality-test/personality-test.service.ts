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
    console.log(`Starting test for user ${userId}`);
    try {
      const existingTest = await this.prisma.personalityTest.findFirst({
        where: { userId, isCompleted: false },
        include: {
          critiques: {
            include: { questions: true },
            orderBy: { id: 'asc' }
          }
        }
      });
  
      if (existingTest) {
        // Find the first unfinished critique
        const unfinishedCritique = existingTest.critiques.find(c =>
          c.questions.some(q => !q.selectedOption)
        );
        
  
        if (!unfinishedCritique) {
          // All critiques are done, but test not marked complete (edge case)
          throw new Error("All critiques completed but test not marked as complete.");
        }
  
        const firstUnansweredQuestion = unfinishedCritique.questions.find(q => !q.selectedOption);
  
        const totalUnanswered = existingTest.critiques.reduce((sum, c) => {
          return sum + c.questions.filter(q => !q.selectedOption).length;
        }, 0);
  
        return {
          test: existingTest,
          currentCritique: {
            ...unfinishedCritique,
            description: this.getEnhancedDescription(unfinishedCritique.name),
            questions: unfinishedCritique.questions
          },
          questions: unfinishedCritique.questions,
          firstQuestion: firstUnansweredQuestion,
          isLastCritique: existingTest.critiques.indexOf(unfinishedCritique) === existingTest.critiques.length - 1,
          totalQuestions: existingTest.critiques.reduce((sum, c) => sum + c.questions.length, 0),
          totalUnanswered
        };
      }
  
      // If no existing test, create a new one
      const test = await this.prisma.personalityTest.create({
        data: { userId }
      });
  
      const critiqueNames = ["Extraversion", "Intuition", "Feeling", "Judging"];
      const critiques = await Promise.all(
        critiqueNames.map(name =>
          this.prisma.personalityCritique.create({
            data: {
              name,
              description: this.getEnhancedDescription(name),
              testId: test.id
            }
          })
        )
      );
  
      for (const critique of critiques) {
        await this.generateDiverseQuestions(critique.id, critique.name);
      }
  
      // Wait a bit for DB propagation
      await new Promise(resolve => setTimeout(resolve,1000));
  
      const createdTest = await this.prisma.personalityTest.findUnique({
        where: { id: test.id },
        include: {
          critiques: {
            include: { questions: true },
            orderBy: { id: 'asc' }
          }
        }
      });
  
      if (!createdTest?.critiques?.length) {
        throw new Error('Failed to initialize test');
      }
  
      const firstCritique = createdTest.critiques[0];
      const firstQuestion = firstCritique.questions[0];
      const totalUnanswered = createdTest.critiques.reduce(
        (sum, c) => sum + c.questions.filter(q => !q.selectedOption).length,
        0
      );
  
      return {
        test: createdTest,
        currentCritique: {
          ...firstCritique,
          description: this.getEnhancedDescription(firstCritique.name),
          questions: firstCritique.questions
        },
        questions: firstCritique.questions,
        firstQuestion,
        isLastCritique: createdTest.critiques.length === 1,
        totalQuestions: createdTest.critiques.reduce((sum, c) => sum + c.questions.length, 0),
        totalUnanswered
      };
    } catch (error) {
      console.error('Failed to start test:', error);
      throw new Error('Failed to initialize test. Please try again.');
    }
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

  async submitAnswerAndGetNext(
    questionId: number,
    selectedOption: 'Agree' | 'Neutral' | 'Disagree',
    testId: number
  ) {
    // Update the question with the selected option
    const question = await this.prisma.personalityQuestion.update({
      where: { id: questionId },
      data: { selectedOption }
    });
  
    // Fetch the current critique and test information
    const currentCritique = await this.prisma.personalityCritique.findUnique({
      where: { id: question.critiqueId },
      include: {
        questions: {
          orderBy: { id: 'asc' }
        },
        test: {
          include: {
            critiques: {
              include: { questions: true },
              orderBy: { id: 'asc' }
            }
          }
        }
      }
    });
  
    if (!currentCritique || !currentCritique.test) {
      throw new Error('Critique or test not found');
    }
  
    // Get next unanswered question in the current critique
    const unanswered = currentCritique.questions.filter(q => q.selectedOption === null);
    if (unanswered.length > 0) {
      return {
        nextQuestion: unanswered[0],
        
        critiqueCompleted: false
      };
    }
  
    return await this.completeCritique(testId, currentCritique.id);
  }
  
  
  async completeCritique(testId: number, currentCritiqueId: number) {
    
    // Calculate the score for the current critique
    await this.calculateScore(currentCritiqueId);
  
    // Find all critiques for the test
    const allCritiques = await this.prisma.personalityCritique.findMany({
      where: { testId },
      include: { 
        questions: true 
      }
    });
  
    // Check if all critiques are complete (all questions answered)
    const allCritiquesComplete = allCritiques.every(critique => {
      return critique.questions.every(q => q.selectedOption !== null);
    });
  
    if (!allCritiquesComplete) {
      // Find the next critique with unanswered questions
      const nextCritique = allCritiques.find(critique => 
        critique.id !== currentCritiqueId && 
        critique.questions.some(q => q.selectedOption === null)
      );
  
      if (nextCritique) {
        return {
          critiqueCompleted: true,
          nextCritique: {
            ...nextCritique,
            description: this.getEnhancedDescription(nextCritique.name),
            questions: nextCritique.questions
          },
          isLastCritique: false // We can't be sure it's the last until we check all
        };
      }
    }
    // If all critiques are complete, finalize the test
    else{
      const { type, description } = await this.determinePersonalityType(testId);

      try {
        await this.prisma.personalityTest.update({
          where: { id: testId },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            personalityType: type,
            personalityTypeDescription: description
          }
        });
     
        return {
          completed: true,
          personalityType: type,
          personalityDescription: description
        };
      } catch (error) {
        console.error('Failed to complete test:', error);
        
        throw new Error('Could not complete the test. You may have already completed a test.');
      }
    }
 

 
}

  

  private async calculateScore(critiqueId: number) {
    const critiqueExists = await this.prisma.personalityCritique.findUnique({
      where: { id: critiqueId }
    });
  
    if (!critiqueExists) {
      throw new Error(`Critique with ID ${critiqueId} not found`);
    }
  
    const questions = await this.prisma.personalityQuestion.findMany({
      where: { 
        critiqueId, 
        selectedOption: { not: null } 
      }
    });
  
    if (questions.length === 0) {
      throw new Error(`No answered questions found for critique ${critiqueId}`);
    }
  
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
  
    try {
      await this.prisma.personalityCritique.update({
        where: { id: critiqueId },
        data: { score: percentage }
      });
      return percentage;
    } catch (error) {
      console.error(`Failed to update score for critique ${critiqueId}:`, error);
      throw new Error(`Failed to update critique score`);
    }
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