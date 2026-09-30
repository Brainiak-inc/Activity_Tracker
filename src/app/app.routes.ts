import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { Discipline } from './domain/discipline';
import { DashboardService } from './services/dashboard.service';

const discipline = () =>
  import('./components/discipline/discipline.component').then(
    (m) => m.DisciplineComponent,
  );

export const routes: Routes = [
  {
    path: 'overview',
    data: { label: 'Обзор', context: 'Сводка' },
    loadComponent: () =>
      import('./components/overview/overview.component').then(
        (m) => m.OverviewComponent,
      ),
  },
  {
    path: 'readiness',
    data: { label: 'Готовность', context: 'Цель' },
    loadComponent: () =>
      import('./components/readiness/readiness.component').then(
        (m) => m.ReadinessComponent,
      ),
  },
  {
    path: 'form',
    data: { label: 'Форма', context: 'Фитнес' },
    loadComponent: () =>
      import('./components/form-page/form-page.component').then(
        (m) => m.FormPageComponent,
      ),
  },
  {
    path: 'volume',
    data: { label: 'Объём', context: 'Динамика' },
    loadComponent: () =>
      import('./components/volume-page/volume-page.component').then(
        (m) => m.VolumePageComponent,
      ),
  },
  {
    path: 'discipline',
    data: { label: 'Дисциплины', context: 'Аналитика' },
    loadComponent: () =>
      import('./components/discipline-tabs/discipline-tabs.component').then(
        (m) => m.DisciplineTabsComponent,
      ),
    children: [
      { path: 'swim', data: { discipline: Discipline.Swim }, loadComponent: discipline },
      { path: 'bike', data: { discipline: Discipline.Bike }, loadComponent: discipline },
      { path: 'run', data: { discipline: Discipline.Run }, loadComponent: discipline },
      { path: '', pathMatch: 'full', redirectTo: 'swim' },
    ],
  },
  {
    path: 'plan',
    data: { label: 'План', context: 'Планировщик' },
    loadComponent: () =>
      import('./components/plan/plan.component').then((m) => m.PlanComponent),
  },
  {
    path: 'activities',
    data: { label: 'Тренировки', context: 'Данные' },
    loadComponent: () =>
      import('./components/activities-page/activities-page.component').then(
        (m) => m.ActivitiesPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => (inject(DashboardService).hasData() ? 'overview' : 'plan'),
  },
  { path: '**', redirectTo: 'overview' },
];
