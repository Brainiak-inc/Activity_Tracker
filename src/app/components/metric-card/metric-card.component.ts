import { Component, input } from '@angular/core';
import { InfoHintComponent } from '../info-hint/info-hint.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [InfoHintComponent],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.less',
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  unit = input<string>();
  sub = input<string>();
  hint = input<string>();
  accent = input<string>('var(--text)');
}
