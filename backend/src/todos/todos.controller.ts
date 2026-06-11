import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { TodoStatus } from './todo.entity';
import { IsString, IsOptional,IsEnum } from 'class-validator';



export class CreateTodoDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStatusDto {
  @IsEnum(TodoStatus)
  status!: TodoStatus;
}


@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Get()
  findAll(
    @GetUser() user,
    @Query('status') status?: TodoStatus,
    @Query('search') search?: string,
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.todosService.findAll(user.sub, { status, search, date, dateFrom, dateTo });
  }

  @Post()
  create(@GetUser() user, @Body() dto: CreateTodoDto) {
    return this.todosService.create(user.sub, dto.title, dto.description);
  }

  @Patch(':id/status')
  updateStatus(
    @GetUser() user,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.todosService.updateStatus(id, user.sub, dto.status);
  }

  @Delete(':id')
  remove(@GetUser() user, @Param('id') id: string) {
    return this.todosService.remove(id, user.sub);
  }
}