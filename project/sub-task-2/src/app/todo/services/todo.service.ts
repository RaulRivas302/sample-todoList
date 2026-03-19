import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITodo } from '../models/todo.interface';
import { ITodoResponse } from '../models/todo-response.interface';
import { TodoBaseService } from './todo-base.service';

const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=20';

const randomDate = (): string => {
    const start = new Date(2025, 0, 1).getTime();
    const end = new Date(2025, 6, 1).getTime();
    const date = new Date(start + Math.random() * (end - start));
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
};

@Injectable({ providedIn: 'root' })
export class TodoService extends TodoBaseService {
    private readonly _todos = signal<ITodo[]>([]);

    // Public readable signal
    readonly todos = this._todos.asReadonly();

    constructor(private http: HttpClient) {
        super();
    }

    fetchTodos(): void {
        this.http.get<ITodoResponse[]>(API_URL).subscribe({
            next: (response) => {
                const todos: ITodo[] = response.map((item) => ({
                    ...item,
                    createdAt: randomDate(),
                }));
                this.setTodos(todos);
            },
            error: (err) => console.error('Failed to fetch todos', err),
        });
    }

    setTodos(todos: ITodo[]): void {
        this._todos.set(todos);
    }

    addTodo(todo: ITodo): void {
        this._todos.update((todos) => [...todos, todo]);
    }

    deleteTodo(id: number): void {
        this._todos.update((todos) => todos.filter((t) => t.id !== id));
    }

    updateTodo(id: number, changes: Partial<ITodo>): void {
        this._todos.update((todos) =>
            todos.map((t) => (t.id === id ? { ...t, ...changes } : t))
        );
    }
}