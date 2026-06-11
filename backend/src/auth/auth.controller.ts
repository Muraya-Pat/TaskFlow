import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user) {
  return user;
}
}