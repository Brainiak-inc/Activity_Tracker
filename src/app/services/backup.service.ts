import { Injectable } from '@angular/core';
import { dayKey } from '../domain/activity';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly keys = [
    'activities_v1',
    'settings_v1',
    'lthr_manual_v1',
    'adherence_v1',
  ];

  export(): void {
    const dump: Record<string, unknown> = {
      app: 'ironman-tracker',
      version: 1,
      exportedAt: new Date().toISOString(),
    };
    for (const k of this.keys) dump[k] = localStorage.getItem(k);

    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironman-tracker-${dayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  import(content: string): void {
    const dump = JSON.parse(content) as Record<string, unknown>;
    for (const k of this.keys) {
      const v = dump[k];
      if (typeof v === 'string') localStorage.setItem(k, v);
      else if (v === null) localStorage.removeItem(k);
    }
    location.reload();
  }

  deleteAll(): void {
    for (const k of this.keys) localStorage.removeItem(k);
    location.reload();
  }
}
