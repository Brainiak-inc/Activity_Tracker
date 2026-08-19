import { Component, computed, inject } from '@angular/core';
import { tsbStatus } from '../../domain/form-status';
import { DashboardService } from '../../services/dashboard.service';
import { InfoHintComponent } from '../info-hint/info-hint.component';

@Component({
  selector: 'app-hud-strip',
  standalone: true,
  imports: [InfoHintComponent],
  templateUrl: './hud-strip.component.html',
  styleUrl: './hud-strip.component.less',
})
export class HudStripComponent {
  private readonly service = inject(DashboardService);
  private readonly series = this.service.overallSeries;
  private readonly form = this.service.currentForm;

  readonly ctl = computed(() => this.form()?.ctl ?? 0);
  readonly tsb = computed(() => this.form()?.tsb ?? 0);

  readonly status = computed(() => {
    const f = this.form();
    return f ? tsbStatus(f.tsb) : null;
  });

  readonly weekly = computed(() =>
    this.series()
      .slice(-7)
      .reduce((sum, p) => sum + p.tss, 0),
  );

  readonly trend = computed(() => {
    const s = this.series();
    if (s.length < 8) return null;
    const delta = s[s.length - 1].ctl - s[s.length - 8].ctl;
    const arrow = delta > 0.5 ? '▲' : delta < -0.5 ? '▼' : '→';
    return { arrow, delta: Math.abs(Math.round(delta)) };
  });

  round(v: number): string {
    return Math.round(v).toString();
  }
}
