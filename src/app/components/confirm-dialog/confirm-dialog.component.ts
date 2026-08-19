import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input<string>('');
  confirmLabel = input<string>('Удалить');
  confirm = output<void>();
  cancel = output<void>();
}
