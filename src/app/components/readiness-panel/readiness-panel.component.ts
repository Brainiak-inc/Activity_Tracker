import { Component, computed, input, output } from '@angular/core';
import { DISCIPLINE_META, Discipline } from '../../domain/discipline';
import { formatClock, formatDistance } from '../../domain/format';
import { tsbStatus } from '../../domain/form-status';
import { RACE_LABEL, RaceConfig, Readiness } from '../../domain/readiness';

function pluralMonths(m: number): string {
  const mod10 = m % 10;
  const mod100 = m % 100;
  if (mod10 === 1 && mod100 !== 11) return 'месяц';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'месяца';
  return 'месяцев';
}

@Component({
  selector: 'app-readiness-panel',
  standalone: true,
  templateUrl: './readiness-panel.component.html',
  styleUrl: './readiness-panel.component.less',
})
export class ReadinessPanelComponent {
  readiness = input.required<Readiness>();
  config = input.required<RaceConfig>();
  edit = output<void>();
  clear = output<void>();

  readonly raceLabel = computed(() => RACE_LABEL[this.config().distance]);
  readonly targetTime = computed(() => formatClock(this.config().targetSeconds));
  readonly limitingLabel = computed(
    () => DISCIPLINE_META[this.readiness().limiting].label,
  );

  readonly etaText = computed(() => {
    const m = this.readiness().monthsToReady;
    if (m <= 0) return 'Объёмы на целевом уровне';
    if (m >= 12) {
      const years = (m / 12).toFixed(1).replace('.', ',');
      return `≈ ${m} ${pluralMonths(m)} · ~${years} г`;
    }
    return `≈ ${m} ${pluralMonths(m)}`;
  });

  readonly statusText = computed(() => {
    const r = this.readiness();
    if (!r.status) return null;
    if (r.status === 'ahead') return 'Успеваешь с запасом';
    if (r.status === 'ontrack') return 'Идёшь в графике';
    const behind = Math.max(
      1,
      Math.round(r.monthsToReady * 4.345 - (r.weeksToRace ?? 0)),
    );
    return `Отстаёшь ~${behind} нед`;
  });

  readonly statusColor = computed(() =>
    this.readiness().status === 'behind' ? 'var(--warn)' : 'var(--ok)',
  );

  readonly hasFitness = computed(() => this.readiness().ctl !== null);

  readonly trend = computed(() => {
    const t = this.readiness().ctlTrend;
    if (t === null) return null;
    return {
      arrow: t > 0.5 ? '▲' : t < -0.5 ? '▼' : '→',
      color:
        t > 0.5
          ? 'var(--accent)'
          : t < -0.5
            ? 'var(--fatigue)'
            : 'var(--text-muted)',
    };
  });

  readonly freshness = computed(() => {
    const tsb = this.readiness().tsb;
    return tsb === null ? null : tsbStatus(tsb);
  });

  readonly tsbText = computed(() => {
    const tsb = this.readiness().tsb;
    if (tsb === null) return '';
    return tsb > 0 ? `+${tsb}` : `${tsb}`;
  });

  readonly fitnessNote = computed(() => {
    const r = this.readiness();
    if (r.ctl === null) return null;
    if (r.fitnessBonus > 0) {
      return `Фитнес растёт — оценка объёма ${r.volumeScore}% поднята до ${r.overall}%`;
    }
    if (r.fitnessBonus < 0) {
      return `Фитнес снижается — оценка объёма ${r.volumeScore}% снижена до ${r.overall}%`;
    }
    return 'Фитнес стабилен — оценка по объёму без поправки';
  });

  code(d: Discipline): string {
    return DISCIPLINE_META[d].code;
  }

  label(d: Discipline): string {
    return DISCIPLINE_META[d].label;
  }

  dist(d: Discipline, km: number): string {
    return formatDistance(d, km);
  }

  colorFor(percent: number): string {
    return percent >= 75
      ? 'var(--accent)'
      : percent >= 40
        ? 'var(--form)'
        : 'var(--fatigue)';
  }
}
