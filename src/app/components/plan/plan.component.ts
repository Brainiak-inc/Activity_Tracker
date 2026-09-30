import { Component, inject, signal } from '@angular/core';
import { DISCIPLINE_META, Discipline } from '../../domain/discipline';
import {
  DisciplineVolume,
  PlanWeek,
  PlannedWorkout,
  VolumeCompare,
  WeekProgress,
  WorkoutInput,
  weekComparison,
  weekDayLabel,
  weekLabel,
  weekProgress,
  weekStartDate,
  weekVolume,
} from '../../domain/plan';
import { formatDistance } from '../../domain/format';
import { DashboardService } from '../../services/dashboard.service';
import { PlanService } from '../../services/plan.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {
  CreatePlanData,
  PlanCreateDialogComponent,
} from '../plan-create-dialog/plan-create-dialog.component';
import { WorkoutDialogComponent } from '../workout-dialog/workout-dialog.component';

interface WorkoutTarget {
  weekId: string;
  dayIndex: number;
  workout: PlannedWorkout | null;
}

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    PlanCreateDialogComponent,
    WorkoutDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.less',
})
export class PlanComponent {
  private readonly plan = inject(PlanService);
  private readonly dashboard = inject(DashboardService);

  readonly plans = this.plan.plans;
  readonly activeId = this.plan.activeId;
  readonly activePlan = this.plan.activePlan;

  readonly creating = signal(false);
  readonly editing = signal<WorkoutTarget | null>(null);
  readonly deletingWeekId = signal<string | null>(null);
  readonly deletingPlan = signal(false);

  selectPlan(id: string): void {
    this.plan.selectPlan(id);
  }

  weekLabel(index: number): string {
    const p = this.activePlan();
    return p ? weekLabel(p, index) : '';
  }

  dayLabel(weekIndex: number, dayIndex: number): string {
    const p = this.activePlan();
    return p ? weekDayLabel(p, weekIndex, dayIndex) : '';
  }

  label(d: Discipline): string {
    return DISCIPLINE_META[d].label;
  }

  dist(w: PlannedWorkout): string {
    return w.distanceKm != null ? formatDistance(w.discipline, w.distanceKm) : '';
  }

  volume(week: PlanWeek): DisciplineVolume[] {
    return weekVolume(week);
  }

  volumeText(v: DisciplineVolume): string {
    return formatDistance(v.discipline, v.km);
  }

  comparison(weekIndex: number, week: PlanWeek): VolumeCompare[] | null {
    const p = this.activePlan();
    if (!p) return null;
    const start = weekStartDate(p, weekIndex);
    if (!start || start.getTime() > Date.now()) return null;
    const end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 7,
    );
    const cmp = weekComparison(week, this.dashboard.activities(), start, end);
    return cmp.some((c) => c.actual > 0) ? cmp : null;
  }

  cmpPercent(c: VolumeCompare): number {
    if (c.planned <= 0) return c.actual > 0 ? 100 : 0;
    return Math.min(100, Math.round((c.actual / c.planned) * 100));
  }

  cmpText(c: VolumeCompare): string {
    const actual = formatDistance(c.discipline, c.actual);
    if (c.planned <= 0) return `${actual} факт (вне плана)`;
    const planned = formatDistance(c.discipline, c.planned);
    return `${actual} / ${planned} · ${this.cmpPercent(c)}%`;
  }

  cmpColor(c: VolumeCompare): string {
    if (c.planned <= 0) return 'var(--text-muted)';
    const pct = this.cmpPercent(c);
    return pct >= 90
      ? 'var(--ok)'
      : pct >= 50
        ? 'var(--form)'
        : 'var(--fatigue)';
  }

  progress(week: PlanWeek): WeekProgress {
    return weekProgress(week);
  }

  segments(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i);
  }

  toggleDay(weekId: string, dayIndex: number): void {
    const p = this.activePlan();
    if (p) this.plan.toggleDay(p.id, weekId, dayIndex);
  }

  addWeek(): void {
    const p = this.activePlan();
    if (p) this.plan.addWeek(p.id);
  }

  onCreatePlan(data: CreatePlanData): void {
    this.plan.createPlan(data.name, data.startMonday, data.weeks);
    this.creating.set(false);
  }

  openAddWorkout(weekId: string, dayIndex: number): void {
    this.editing.set({ weekId, dayIndex, workout: null });
  }

  openEditWorkout(
    weekId: string,
    dayIndex: number,
    workout: PlannedWorkout,
  ): void {
    this.editing.set({ weekId, dayIndex, workout });
  }

  onSaveWorkout(data: WorkoutInput): void {
    const p = this.activePlan();
    const target = this.editing();
    if (!p || !target) return;
    if (target.workout) {
      this.plan.updateWorkout(
        p.id,
        target.weekId,
        target.dayIndex,
        target.workout.id,
        data,
      );
    } else {
      this.plan.addWorkout(p.id, target.weekId, target.dayIndex, data);
    }
    this.editing.set(null);
  }

  onRemoveWorkout(): void {
    const p = this.activePlan();
    const target = this.editing();
    if (p && target?.workout) {
      this.plan.removeWorkout(
        p.id,
        target.weekId,
        target.dayIndex,
        target.workout.id,
      );
    }
    this.editing.set(null);
  }

  onConfirmDeleteWeek(): void {
    const p = this.activePlan();
    const weekId = this.deletingWeekId();
    if (p && weekId) this.plan.removeWeek(p.id, weekId);
    this.deletingWeekId.set(null);
  }

  onConfirmDeletePlan(): void {
    const p = this.activePlan();
    if (p) this.plan.removePlan(p.id);
    this.deletingPlan.set(false);
  }
}
