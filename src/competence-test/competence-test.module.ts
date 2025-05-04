import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { BaccalaureateController } from './competence-test.controller';
import { BaccalaureateService } from './competence-test.service';

@Module({
  controllers: [BaccalaureateController],
  providers: [BaccalaureateService, PrismaService],
})
export class BaccalaureateModule {}
