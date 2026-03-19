import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './services/todo.service';
import { ITodo } from './models/todo.interface';

type SortField = 'name' | 'date';
type SortDir = 'asc' | 'desc';

@Component({
    selector: 'app-todo',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './todo.component.html',
    styleUrl: './todo.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoComponent implements OnInit {
    private todoService = inject(TodoService);

    readonly filterDateMin = signal<string>('');
    readonly filterDateMax = signal<string>('');
    readonly appliedDateMin = signal<string>('');
    readonly appliedDateMax = signal<string>('');

    readonly sortField = signal<SortField>('date');
    readonly sortDir = signal<SortDir>('desc');

    readonly showMobileFilter = signal(false);
    readonly editingTodo = signal<ITodo | null>(null);
    readonly editTitle = signal<string>('');

    readonly displayedTodos = computed(() => {
        const todos = this.todoService.todos();
        const min = this.appliedDateMin();
        const max = this.appliedDateMax();
        const field = this.sortField();
        const dir = this.sortDir();

        let result = [...todos];

        if (min) {
            result = result.filter((t) => new Date(t.createdAt) >= new Date(min));
        }
        if (max) {
            result = result.filter((t) => new Date(t.createdAt) <= new Date(max));
        }

        result.sort((a, b) => {
            if (field === 'date') {
                const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                return dir === 'asc' ? diff : -diff;
            } else {
                return dir === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
        });

        return result;
    });

    ngOnInit(): void {
        this.todoService.fetchTodos();
    }

    applyFilter(): void {
        this.appliedDateMin.set(this.filterDateMin());
        this.appliedDateMax.set(this.filterDateMax());
        this.showMobileFilter.set(false);
    }

    resetFilter(): void {
        this.filterDateMin.set('');
        this.filterDateMax.set('');
        this.appliedDateMin.set('');
        this.appliedDateMax.set('');
    }
    sortBy(field: SortField): void {
        if (this.sortField() === field) {
            this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            this.sortField.set(field);
            this.sortDir.set(field === 'date' ? 'desc' : 'asc');
        }
    }
    toggleCompleted(todo: ITodo): void {
        this.todoService.updateTodo(todo.id, { completed: !todo.completed });
    }

    deleteTodo(id: number): void {
        this.todoService.deleteTodo(id);
    }
    openEdit(todo: ITodo): void {
        this.editingTodo.set(todo);
        this.editTitle.set(todo.title);
        this.showMobileFilter.set(false);
    }

    closeEdit(): void {
        this.editingTodo.set(null);
        this.editTitle.set('');
    }

    saveEdit(): void {
        const todo = this.editingTodo();
        if (todo && this.editTitle().trim()) {
            this.todoService.updateTodo(todo.id, { title: this.editTitle().trim() });
        }
        this.closeEdit();
    }
}