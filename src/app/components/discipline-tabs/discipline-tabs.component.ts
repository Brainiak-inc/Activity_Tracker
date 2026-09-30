import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-discipline-tabs',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './discipline-tabs.component.html',
  styleUrl: './discipline-tabs.component.less',
})
export class DisciplineTabsComponent {
  readonly subs = [
    { path: 'swim', label: 'Плав' },
    { path: 'bike', label: 'Вело' },
    { path: 'run', label: 'Бег' },
  ];
}
