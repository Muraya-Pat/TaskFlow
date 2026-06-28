import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo, TodoStatus, TodoPriority } from './todo.entity';
import { UpdateTodoDto } from './todos.controller';

@Injectable()
export class TodosService implements OnModuleInit {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
  ) {}

  async onModuleInit() {
    // Backfill missing due dates → 7 days from now
    const futureFallback = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await this.todosRepository
      .createQueryBuilder()
      .update(Todo)
      .set({ dueDate: futureFallback })
      .where('dueDate IS NULL')
      .execute();

    // Backfill completedAt for already-done todos that predate this column → 3 days ago
    const pastFallback = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await this.todosRepository
      .createQueryBuilder()
      .update(Todo)
      .set({ completedAt: pastFallback })
      .where('status = :status AND "completedAt" IS NULL', { status: TodoStatus.DONE })
      .execute();
  }

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

    if (filters.dateFrom) {
      query.andWhere('todo.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      query.andWhere('todo.createdAt <= :dateTo', {
        dateTo: `${filters.dateTo} 23:59:59`,
      });
    }

    return query.orderBy('todo.createdAt', 'DESC').getMany();
  }

  async create(
    userId: string,
    title: string,
    description?: string,
    priority?: TodoPriority,
    dueDate?: string,
    status?: TodoStatus,
  ): Promise<Todo> {
    const todo = this.todosRepository.create({
      title,
      description,
      userId,
      status: status ?? TodoStatus.TO_BE_DONE,
      priority: priority ?? TodoPriority.MEDIUM,
      dueDate: dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    return this.todosRepository.save(todo);
  }

  async update(id: string, userId: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id, userId } });
    if (!todo) throw new NotFoundException('Todo not found');
    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.description !== undefined) todo.description = dto.description;
    if (dto.priority !== undefined) todo.priority = dto.priority;
    if (dto.dueDate !== undefined && dto.dueDate !== null) todo.dueDate = dto.dueDate;
    return this.todosRepository.save(todo);
  }

  async updateStatus(id: string, userId: string, status: TodoStatus): Promise<Todo> {
    const todo = await this.todosRepository.findOne({ where: { id, userId } });
    if (!todo) throw new NotFoundException('Todo not found');
    todo.status = status;
    todo.completedAt = status === TodoStatus.DONE ? new Date() : null;
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
