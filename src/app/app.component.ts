import { Component, effect, inject, signal } from '@angular/core';
import { DisciplineComponent } from './components/discipline/discipline.component';
import { OverviewComponent } from './components/overview/overview.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import {
  DISCIPLINE_META,
  Discipline,
  IRONMAN_DISCIPLINES,
} from './domain/discipline';
import { DashboardService } from './services/dashboard.service';

type TabKey = 'overview' | Discipline;

interface TabDef {
  key: TabKey;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverviewComponent, DisciplineComponent, SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
})
export class AppComponent {
  readonly service = inject(DashboardService);

  readonly menuOpen = signal(false);

  constructor() {
    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  readonly tabs: TabDef[] = [
    { key: 'overview', label: 'Общее', emoji: '📊' },
    ...IRONMAN_DISCIPLINES.map((d) => ({
      key: d,
      label: DISCIPLINE_META[d].label,
      emoji: DISCIPLINE_META[d].emoji,
    })),
  ];

  readonly activeTab = signal<TabKey>('overview');
  readonly toast = signal<string | null>(null);

  isOverview(key: TabKey): boolean {
    return key === 'overview';
  }

  asDiscipline(key: TabKey): Discipline {
    return key as Discipline;
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.service.import(String(reader.result));
      this.showToast(this.service.lastImportInfo());
      input.value = '';
    };
    reader.readAsText(file);
  }

  private showToast(msg: string | null): void {
    this.toast.set(msg);
    if (msg) {
      setTimeout(() => this.toast.set(null), 4000);
    }
  }
}
