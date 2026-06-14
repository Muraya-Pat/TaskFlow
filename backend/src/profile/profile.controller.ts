import { Controller, Get, Patch, Post, Delete, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ProfileService } from './profile.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getProfile(@GetUser() user: User) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Patch('password')
  changePassword(@GetUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  uploadAvatar(@GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.profileService.updateAvatar(user.id, file.filename);
  }

  @Delete()
  deleteAccount(@GetUser() user: User) {
    return this.profileService.deleteAccount(user.id);
  }
}
