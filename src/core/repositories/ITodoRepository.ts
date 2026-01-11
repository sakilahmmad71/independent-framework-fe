// Repository interface - defines data access contract
import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../models/Todo';

export interface ITodoRepository {
	getAll(): Promise<Todo[]>;
  getAllByUserId(userId: string): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  create(data: CreateTodoDTO, userId: string): Promise<Todo>;
