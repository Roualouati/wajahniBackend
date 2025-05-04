import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly prisma: PrismaService
  ) {}

  @Post(':userId/generate')
  async generateRecommendations(@Param('userId') userId: string) {
    const parsedUserId = this.validateAndParseUserId(userId);
    return await this.recommendationService.generateRecommendations(parsedUserId);
  }

  @Get(':userId')
  async getRecommendations(@Param('userId') userId: string) {
    const parsedUserId = this.validateAndParseUserId(userId);
    const recommendations = await this.prisma.recommendation.findMany({
      where: { userId: parsedUserId },
      orderBy: { createdAt: 'desc' },
    });

    if (!recommendations || recommendations.length === 0) {
      throw new Error('No recommendations found');
    }

    return recommendations;
  }

  @Get('detail/:recommendationId')
  async getRecommendationDetail(
    @Param('recommendationId') recommendationId: string,
    @Query('userId') userId: string
  ) {
    const parsedRecommendationId = parseInt(recommendationId);
    const parsedUserId = this.validateAndParseUserId(userId);

    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: parsedRecommendationId },
      include: {
        personalityTest: true,
      },
    });

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (recommendation.userId !== parsedUserId) {
      throw new Error('Unauthorized');
    }

    return recommendation;
  }

  private validateAndParseUserId(userId: string): number {
    const parsed = parseInt(userId, 10);
    if (isNaN(parsed)) {
      throw new Error('User ID must be a number');
    }
    return parsed;
  }
}
