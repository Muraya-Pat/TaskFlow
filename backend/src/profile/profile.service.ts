import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<Partial<User>> {
    await this.usersRepository.update(userId, data);
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new NotFoundException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<Partial<User>> {
    await this.usersRepository.update(userId, { avatarUrl });
    return this.getProfile(userId);
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    await this.usersRepository.update(userId, { isActive: false });
    return { message: 'Account deactivated successfully' };
  }
}