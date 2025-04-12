// src/personality/personality.module.ts
import { Module } from '@nestjs/common';
import { PersonalityTestService } from './personality-test.service';
import { PersonalityTestController } from './personality-test.controller';
import { OpenAIService } from '../openai/openai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PersonalityTestController],
  providers: [PersonalityTestService, PrismaService, OpenAIService]
})
export class PersonalityModule {}