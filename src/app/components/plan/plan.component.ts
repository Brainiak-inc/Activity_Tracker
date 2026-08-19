import { Component, inject, signal } from '@angular/core';
import { DISCIPLINE_META, Discipline } from '../../domain/discipline';
import {
  PlannedWorkout,
  WorkoutInput,
  weekDayLabel,
  weekLabel,
} from '../../domain/plan';
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

  code(d: Discipline): string {
    return DISCIPLINE_META[d].code;
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
