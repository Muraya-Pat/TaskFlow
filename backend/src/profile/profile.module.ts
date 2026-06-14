import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({ dest: './uploads' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, JwtAuthGuard],
})
export class ProfileModule {}