import { Controller, Post, Get, Put, Param, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { PersonalityTestService } from './personality-test.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpenAIService } from 'src/openai/openai.service';
import { PersonalityProfile } from 'src/interfaces/personality-profile.interface';


@Controller('personality-test')
export class PersonalityTestController {
  constructor(private readonly testService: PersonalityTestService,private readonly prisma :PrismaService,private readonly  openai: OpenAIService
  ) {}

  @Post(':userId/start')
  async startTest(@Param('userId') userId: string) {
    try {
      const parsedUserId = this.validateAndParseUserId(userId);
      const testData = await this.testService.startTest(parsedUserId);
  
      // Fix validation to match actual response
      if (!testData || !testData.test?.id || !testData.currentCritique?.id) {
        console.error('Invalid test data:', testData);
        throw new HttpException('Invalid test data structure', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  
      return {
        testId: testData.test.id,
        firstQuestion: testData.questions[0],
        totalQuestions: testData.totalQuestions,
        currentCritique: testData.currentCritique,
        isLastCritique: testData.isLastCritique,
        totalUnanswered: testData.totalUnanswered
      };
    } catch (error) {
      console.error('Start test error:', error);
      throw new HttpException(
        error.message || 'Failed to start test',
        HttpStatus.BAD_REQUEST
      );
    }
  }
  private validateAndParseUserId(userId: string): number {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    const parsed = parseInt(userId, 10);
    if (isNaN(parsed)) {
      throw new HttpException('User ID must be a number', HttpStatus.BAD_REQUEST);
    }

    return parsed;
  }
  @Put('question/:questionId/answer')
  async submitAnswer(
    @Param('questionId') questionId: string,
    @Body() body: { answer: string, testId: number }
  ) {
    const validAnswers = ['Agree', 'Neutral', 'Disagree'] as const;
    if (!validAnswers.includes(body.answer as any)) {
      throw new HttpException('Invalid answer option', HttpStatus.BAD_REQUEST);
    }
  
    const question = await this.prisma.personalityQuestion.findUnique({
      where: { id: parseInt(questionId) },
      include: { critique: true }
    });
  
    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }
  
    if (question.critique.testId !== body.testId) {
      throw new HttpException('Question does not belong to this test', HttpStatus.BAD_REQUEST);
    }
  
    return this.testService.submitAnswerAndGetNext(
      parseInt(questionId),
      body.answer as 'Agree' | 'Neutral' | 'Disagree',
      body.testId
    );
  }
  
  



  @Get(':testId/result')
  async getResult(@Param('testId') testId: string) {
    return this.testService.getTestResult(parseInt(testId));
  }

 
  @Get('/questions/:questionId')
  async getQuestionData(
    @Param('questionId') questionId: string,
    @Query('userId') userId: string
  ) {
    try {
      const question = await this.prisma.personalityQuestion.findUnique({
        where: { id: parseInt(questionId) },
        include: {
          critique: {
            include: {
              test: {
                include: {
                  critiques: {
                    include: {
                      questions: true
                    }
                  }
                }
              }
            }
          }
        }
      });
  
      if (!question) throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      if (question.critique.test.userId !== parseInt(userId)) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
  
      const currentCritique = question.critique;
      const test = currentCritique.test;
      const allQuestions = test.critiques.flatMap(c => c.questions);
      const currentPosition = allQuestions.findIndex(q => q.id === question.id) + 1;
  
      return {
        testId: test.id,
        firstQuestion: {
          ...question,
          indexInTest: currentPosition,
          text: question.text, // Make sure this exists in your question model
          critiqueDescription: currentCritique.description,
          nextQuestionId: allQuestions[currentPosition]?.id || null,
          // Add other required fields
        },
        totalQuestions: allQuestions.length,
        currentCritique: {
          ...currentCritique,
          questions: test.critiques.find(c => c.id === currentCritique.id)?.questions || []
        },
        isLastCritique: test.critiques[test.critiques.length - 1].id === currentCritique.id
      };
    } catch (error) {
      console.error('Error in getQuestionData:', error);
      throw new HttpException(
        error.message || 'Failed to fetch question data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Post('generate')
  async generateProfile(
    @Body() body: { type: string; description: string },
  ): Promise<PersonalityProfile> {
    const { type, description } = body;
    return this.openai.generatePersonalityProfile(type, description);
  }
}