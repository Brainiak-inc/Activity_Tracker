import { Component, inject, signal } from '@angular/core';
import { BackupService } from '../../services/backup.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-data-controls',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './data-controls.component.html',
  styleUrl: './data-controls.component.less',
})
export class DataControlsComponent {
  private readonly backup = inject(BackupService);

  readonly confirmOpen = signal(false);

  exportData(): void {
    this.backup.export();
  }

  onImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.backup.import(String(reader.result));
    reader.readAsText(file);
    input.value = '';
  }

  askDelete(): void {
    this.confirmOpen.set(true);
  }

  cancelDelete(): void {
    this.confirmOpen.set(false);
  }

  confirmDelete(): void {
    this.backup.deleteAll();
  }
}
