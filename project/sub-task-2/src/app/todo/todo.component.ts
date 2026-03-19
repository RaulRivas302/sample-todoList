import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-todo.component',
    templateUrl: './todo.component.html',
    styleUrl: './todo.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoComponent {
}
