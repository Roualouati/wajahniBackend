// recommendation.module.ts
import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [RecommendationController],
  providers: [RecommendationService, PrismaService, OpenAIService],
  exports: [RecommendationService],
})
export class RecommendationModule {}