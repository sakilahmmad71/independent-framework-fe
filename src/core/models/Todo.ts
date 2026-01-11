// Core Models - Pure TypeScript interfaces and types
export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	userId: string; // Owner of the todo
}

export type UpdateTodoDTO = {
	id: string;
	title?: string;
	completed?: boolean;
};
