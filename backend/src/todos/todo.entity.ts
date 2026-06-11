import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum TodoStatus {
  TO_BE_DONE = 'to_be_done',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.TO_BE_DONE,
  })
  status!: TodoStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}