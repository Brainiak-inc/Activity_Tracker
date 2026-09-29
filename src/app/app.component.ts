import { Component, effect, inject, signal } from '@angular/core';
import { DisciplineComponent } from './components/discipline/discipline.component';
import { HudStripComponent } from './components/hud-strip/hud-strip.component';
import { OverviewComponent } from './components/overview/overview.component';
import { PlanComponent } from './components/plan/plan.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { Discipline } from './domain/discipline';
import { DashboardService } from './services/dashboard.service';
import { PlanService } from './services/plan.service';

type TabKey = 'overview' | 'plan' | Discipline;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HudStripComponent,
    OverviewComponent,
    DisciplineComponent,
    PlanComponent,
    SideMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
})
export class AppComponent {
  readonly service = inject(DashboardService);
  private readonly planService = inject(PlanService);

  readonly menuOpen = signal(false);

  constructor() {
    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Общее' },
    { key: Discipline.Swim, label: 'Плав' },
    { key: Discipline.Bike, label: 'Вело' },
    { key: Discipline.Run, label: 'Бег' },
    { key: 'plan', label: 'План' },
  ];

  readonly activeTab = signal<TabKey>(
    this.service.hasData() ? 'overview' : 'plan',
  );
  readonly toast = signal<string | null>(null);

  isOverview(key: TabKey): boolean {
    return key === 'overview';
  }

  isPlan(key: TabKey): boolean {
    return key === 'plan';
  }

  tabCount(key: TabKey): number {
    if (key === 'overview') return this.service.activities().length;
    if (key === 'plan') return this.planService.plans().length;
    return this.service.countByDiscipline()[key];
  }

  asDiscipline(key: TabKey): Discipline {
    return key as Discipline;
  }

  activeLabel(): string {
    return this.tabs.find((t) => t.key === this.activeTab())?.label ?? '';
  }

  screenContext(): string {
    const key = this.activeTab();
    if (key === 'overview') return 'Сводка';
    if (key === 'plan') return 'Планировщик';
    return 'Аналитика';
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
