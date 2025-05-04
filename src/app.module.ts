import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { PersonalityModule } from './personality-test/personality-test.module';
import { PdfService } from './pdf/pdf.service';
import { PdfController } from './pdf/pdf.controller';
import { BaccalaureateModule } from './competence-test/competence-test.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    // Your existing modules
    AuthModule, 
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    AdminModule,
    PersonalityModule,
    BaccalaureateModule,
    RecommendationModule,
    
    // Add MulterModule for file uploads
    MulterModule.register({
      dest: './temp',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      } // Temporary upload directory
    }),
  ],
  controllers: [AppController,  PdfController],
  providers: [AppService, PrismaService, PdfService],
})
export class AppModule {}