import {
    Body,
    Controller,
    Post,
    UseGuards,
    Req,
    BadRequestException,
    Get,
  } from '@nestjs/common';
 
  import { Request } from 'express';
import { BaccalaureateService } from './competence-test.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { SaveBacDataDto } from './dto/competence-test.dto';
  
  @Controller('baccalaureate')
  export class BaccalaureateController {
    constructor(private readonly bacService: BaccalaureateService) {}
  
    @UseGuards(JwtAuthGuard)
    @Post('save')
    async saveBaccalaureateData(
      @Req() req: Request,
      @Body() data: SaveBacDataDto,
    ): Promise<any> {
      const user = req.user as { id: number };
  
      if (!user || !user.id) {
        throw new BadRequestException('User not authenticated');
      }
  
      return this.bacService.saveBacData({ userId: user.id, ...data });
    }
    @UseGuards(JwtAuthGuard)
  @Get('score')
  async getScore(@Req() req: Request): Promise<any> {
    const user = req.user as { id: number };

    if (!user || !user.id) {
      throw new BadRequestException('User not authenticated');
    }

    const score = await this.bacService.getScore(user.id);

    return { userId: user.id, score };
  }
  }
  