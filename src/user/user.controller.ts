import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BaccalaureateType } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Post(':id/edit')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/profile', // store files in /uploads/profile
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async editUser(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() editUser: CreateUserDto,
  ) {
    return this.userService.updateUser(+id, editUser, file);
  }
  @Get('bacType/:id')
  async getBaccalaureateType(@Param('id') id: string) {
    try {
      if (!id || isNaN(+id)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      const result = await this.userService.findBaccalaureateType(+id);
      return {
        success: true,
        exists: result.exists,
        bacType: result.type
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch baccalaureate type',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 
  @Post(':id/baccalaureate-type')
  async editBaccalaureateType(
    @Param('id') id: string,
    @Body() body: { baccalaureateType: BaccalaureateType },
  ) {
    console.log('Received:', body);
    return this.userService.editBaccalaureateType(+id, body.baccalaureateType);
  }
  
  @Get('has-test/:userId')
  async hasPersonalityTest(@Param('userId') userId: number) {
    return {
      hasTest: await this.userService.getPersonalityTestWithDetails(+userId),
    };
  }
  @Get('has-baccalaureate/:userId')
  async hasBaccalaureate(@Param('userId') userId: number) {
    return {
      hasBaccalaureate: await this.userService.getBaccalaureateWithDetails(+userId),
    };
}  
}