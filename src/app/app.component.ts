import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { HudStripComponent } from './components/hud-strip/hud-strip.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { Discipline } from './domain/discipline';
import { DashboardService } from './services/dashboard.service';
import { PlanService } from './services/plan.service';

interface Tab {
  path: string;
  label: string;
  count?: () => number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HudStripComponent,
    SideMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
})
export class AppComponent {
  readonly service = inject(DashboardService);
  private readonly planService = inject(PlanService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  constructor() {
    effect(() => {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }

  readonly tabs: Tab[] = [
    {
      path: '/overview',
      label: 'Обзор',
      count: () => this.service.activities().length,
    },
    { path: '/readiness', label: 'Готовность' },
    {
      path: '/discipline',
      label: 'Дисциплины',
      count: () => {
        const c = this.service.countByDiscipline();
        return c[Discipline.Swim] + c[Discipline.Bike] + c[Discipline.Run];
      },
    },
    {
      path: '/plan',
      label: 'План',
      count: () => this.planService.plans().length,
    },
  ];

  private readonly meta = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.root;
        let data: Record<string, unknown> = {};
        while (route) {
          data = { ...data, ...route.snapshot.data };
          route = route.firstChild!;
        }
        return data;
      }),
    ),
    { initialValue: {} as Record<string, unknown> },
  );

  readonly screenLabel = computed(() => (this.meta()['label'] as string) ?? '');
  readonly screenContext = computed(
    () => (this.meta()['context'] as string) ?? '',
  );

  readonly toast = signal<string | null>(null);

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
