import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.less',
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  unit = input<string>();
  sub = input<string>();
  accent = input<string>('var(--text)');
}
