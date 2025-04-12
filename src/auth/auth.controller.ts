import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Response } from 'express';
import { Public } from './decorators/public.decorators';
import { Roles } from './decorators/roles.decorators';


@Public()
@Controller('auth')
export  class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("register")
  async registerUser(@Body() createUserDto: CreateUserDto ){
    return await this.authService.registerUser(createUserDto)
  }
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
login(@Request() req) {
  console.log('Login Request:', req.user); 
  return this.authService.login(req.user.id, req.user.firstName, req.user.lastName,req.user.role);
}
@Roles('ADMIN')
@Get('protected')
getAll(@Request() req) {
  console.log("🔑 Received token:", req.headers.authorization);
  return { message: `Access granted, User ID: ${req.user?.id}` };
}

@Public()
@UseGuards(RefreshAuthGuard)
@Post('refresh')
refreshToken(@Request() req){
  return this.authService.refreshToken(req.user.id,req.user.firstName,req.user.lastName);
}
@Public()
@UseGuards(GoogleAuthGuard)
@Get('google/login')
googleLogin() {}

@Public()
@UseGuards(GoogleAuthGuard)
@Get('google/callback')
  async googleCallback(@Request() req, @Res() res:Response) {
  console.log('Google Callback:', req.user);
  const resopnse = await this.authService.login(
    req.user.id,
    req.user.firstName,
    req.user
      .lastName,
    req.user
      .role,
  );
  res.redirect(
    `http://localhost:3000/api/auth/google/callback?userId=${resopnse.id}&firstName=${resopnse.firstName}&accessToken=${resopnse.accessToken}&refreshToken=${resopnse.refreshToken}&lastName=${resopnse.lastName} &role=${resopnse.role}`,
  );
}



}
