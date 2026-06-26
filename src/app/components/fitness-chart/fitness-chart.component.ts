import { Component, computed, input } from '@angular/core';
import { formatDate } from '../../domain/format';
import { LoadPoint } from '../../services/training-load';

interface GridLine {
  y: number;
  value: number;
}

interface ChartGeometry {
  width: number;
  height: number;
  ctlLine: string;
  ctlArea: string;
  atlLine: string;
  gridLines: GridLine[];
  ctlEnd: { x: number; y: number };
  atlEnd: { x: number; y: number };
  startLabel: string;
  endLabel: string;
}

@Component({
  selector: 'app-fitness-chart',
  standalone: true,
  templateUrl: './fitness-chart.component.html',
  styleUrl: './fitness-chart.component.less',
})
export class FitnessChartComponent {
  series = input.required<LoadPoint[]>();

  readonly geometry = computed<ChartGeometry | null>(() => {
    const s = this.series();
    if (s.length < 2) return null;

    const width = 700;
    const height = 240;
    const padL = 6;
    const padR = 6;
    const padT = 14;
    const padB = 6;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;
    const baseline = padT + chartH;

    const maxRaw = Math.max(...s.map((p) => Math.max(p.ctl, p.atl)), 1);
    const maxY = maxRaw * 1.15;

    const x = (i: number) => padL + (i / (s.length - 1)) * chartW;
    const y = (v: number) => padT + chartH - (v / maxY) * chartH;

    const lineFor = (sel: (p: LoadPoint) => number) =>
      s
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(sel(p)).toFixed(1)}`)
        .join(' ');

    const ctlLine = lineFor((p) => p.ctl);
    const atlLine = lineFor((p) => p.atl);
    const lastX = x(s.length - 1).toFixed(1);
    const ctlArea = `${ctlLine} L ${lastX} ${baseline.toFixed(1)} L ${padL.toFixed(1)} ${baseline.toFixed(1)} Z`;

    const gridCount = 3;
    const gridLines: GridLine[] = Array.from({ length: gridCount + 1 }, (_, i) => {
      const value = (maxY / gridCount) * i;
      return { y: y(value), value: Math.round(value) };
    });

    const last = s[s.length - 1];
    return {
      width,
      height,
      ctlLine,
      ctlArea,
      atlLine,
      gridLines,
      ctlEnd: { x: x(s.length - 1), y: y(last.ctl) },
      atlEnd: { x: x(s.length - 1), y: y(last.atl) },
      startLabel: formatDate(s[0].day),
      endLabel: formatDate(last.day),
    };
  });
}
