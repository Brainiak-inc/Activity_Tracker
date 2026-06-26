import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.less',
  host: { '(document:keydown.escape)': 'close.emit()' },
})
export class ModalComponent {
  title = input<string>('');
  close = output<void>();
}
