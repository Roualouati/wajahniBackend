import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { PersonalityTestService } from './personality-test.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('personality-test')
export class PersonalityTestController {
  constructor(
    private readonly testService: PersonalityTestService,
    private readonly prisma: PrismaService
  ) {}

  @Post(':userId/start')
  async startTest(@Param('userId') userId: string) {
    return this.testService.startTest(parseInt(userId));
  }

  @Put('/questions/:questionId/answer')
  async submitAnswer(
    @Param('questionId') questionId: string,
    @Body() body: { answer: string }
  ) {
    return this.testService.submitAnswer(parseInt(questionId), body.answer);
  }

  @Put(':testId/complete-critique')
  async completeCritique(
    @Param('testId') testId: string,
    @Body() body: { currentCritiqueId: number, remainingCritiques: any[] }
  ) {
    return this.testService.completeCritique(
      parseInt(testId),
      body.currentCritiqueId,
      body.remainingCritiques
    );
  }

  @Get(':testId/result')
  async getResult(@Param('testId') testId: string) {
    return this.testService.getTestResult(parseInt(testId));
  }
}