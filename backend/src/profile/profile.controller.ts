import { Controller, Get, Patch, Post, Delete, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

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
  @MinLength(8)
  newPassword!: string;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  getProfile(@GetUser() user) {
    return this.profileService.getProfile(user.sub);
  }

  @Patch()
  updateProfile(@GetUser() user, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.sub, dto);
  }

  @Patch('password')
changePassword(@GetUser() user, @Body() dto: ChangePasswordDto) {
  return this.profileService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadAvatar(@GetUser() user, @UploadedFile() file: Express.Multer.File) {
    return this.profileService.updateAvatar(user.sub, file.path);
  }

  @Delete()
  deleteAccount(@GetUser() user) {
    return this.profileService.deleteAccount(user.sub);
  }
}