import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AdherenceStatus,
  CalendarCell,
  buildYearWeeks,
} from '../../domain/adherence';
import { AdherenceService } from '../../services/adherence.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.less',
})
export class CalendarComponent implements AfterViewInit {
  private readonly adherence = inject(AdherenceService);

  track = input.required<string>();

  readonly year = new Date().getFullYear();
  readonly weeks = buildYearWeeks(this.year, new Date());
  readonly weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  readonly marks = computed(() => this.adherence.data()[this.track()] ?? {});

  readonly selected = signal<CalendarCell | null>(null);
  readonly draftStatus = signal<AdherenceStatus | null>(null);
  readonly draftComment = signal('');

  ngAfterViewInit(): void {
    setTimeout(
      () =>
        document
          .getElementById('cal-today')
          ?.scrollIntoView({ block: 'center' }),
      0,
    );
  }

  statusOf(key: string): AdherenceStatus | null {
    return this.marks()[key]?.status ?? null;
  }

  commentOf(key: string): string {
    return this.marks()[key]?.comment ?? '';
  }

  open(cell: CalendarCell): void {
    if (!cell.inYear) return;
    const mark = this.marks()[cell.key];
    this.selected.set(cell);
    this.draftStatus.set(mark?.status ?? null);
    this.draftComment.set(mark?.comment ?? '');
  }

  pick(status: AdherenceStatus): void {
    this.draftStatus.set(status);
  }

  onComment(event: Event): void {
    this.draftComment.set((event.target as HTMLTextAreaElement).value);
  }

  save(): void {
    const cell = this.selected();
    const status = this.draftStatus();
    if (cell && status) {
      this.adherence.setMark(this.track(), cell.key, status, this.draftComment());
    }
    this.close();
  }

  clear(): void {
    const cell = this.selected();
    if (cell) this.adherence.clearMark(this.track(), cell.key);
    this.close();
  }

  close(): void {
    this.selected.set(null);
  }

  selectedLabel(): string {
    const cell = this.selected();
    return cell
      ? cell.date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';
  }
}
