import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo, TodoStatus } from './todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
  ) {}

  async findAll(userId: string, filters: {
    status?: TodoStatus;
    search?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Todo[]> {
    const query = this.todosRepository
      .createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId });

    if (filters.status) {
      query.andWhere('todo.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere('LOWER(todo.title) LIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.date) {
      query.andWhere('DATE(todo.createdAt) = :date', { date: filters.date });
    }

    if (filters.dateFrom && filters.dateTo) {
      query.andWhere('todo.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
    }

    return query.orderBy('todo.createdAt', 'DESC').getMany();
  }

  async create(userId: string, title: string, description?: string): Promise<Todo> {
    const todo = this.todosRepository.create({
      title,
      description,
      userId,
      status: TodoStatus.TO_BE_DONE,
    });
    return this.todosRepository.save(todo);
  }

  async updateStatus(id: string, userId: string, status: TodoStatus): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id, userId },
    });
    if (!todo) throw new NotFoundException('Todo not found');
    todo.status = status;
    return this.todosRepository.save(todo);
  }

  async remove(id: string, userId: string): Promise<void> {
    const todo = await this.todosRepository.findOne({
      where: { id, userId },
    });
    if (!todo) throw new NotFoundException('Todo not found');
    await this.todosRepository.remove(todo);
  }

  async seedDefaultTodos(userId: string): Promise<void> {
    const defaultTodos = [
      'Set up development environment',
      'Learn NestJS basics',
      'Build authentication system',
      'Create todo API endpoints',
      'Connect frontend to backend',
    ];

    for (const title of defaultTodos) {
      await this.create(userId, title);
    }
  }
}