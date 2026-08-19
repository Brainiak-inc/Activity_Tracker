import { Component, input } from '@angular/core';

@Component({
  selector: 'app-info-hint',
  standalone: true,
  templateUrl: './info-hint.component.html',
  styleUrl: './info-hint.component.less',
})
export class InfoHintComponent {
  hint = input.required<string>();
}
