import { Injectable, computed, signal } from '@angular/core';
import {
  PlanWeek,
  PlannedWorkout,
  TrainingPlan,
  emptyWeek,
} from '../domain/plan';

type WorkoutInput = Omit<PlannedWorkout, 'id'>;

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly storageKey = 'plan_v1';
  private readonly _plans = signal<TrainingPlan[]>(this.read());
  private readonly _activeId = signal<string | null>(
    this._plans()[0]?.id ?? null,
  );

  readonly plans = this._plans.asReadonly();
  readonly activeId = this._activeId.asReadonly();
  readonly activePlan = computed(
    () => this._plans().find((p) => p.id === this._activeId()) ?? null,
  );

  selectPlan(id: string): void {
    this._activeId.set(id);
  }

  createPlan(
    name: string,
    startMonday: string | null,
    weeksCount: number,
  ): void {
    const weeks = Array.from({ length: Math.max(1, weeksCount) }, () =>
      emptyWeek(),
    );
    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      name,
      startMonday,
      weeks,
    };
    this._plans.update((plans) => [...plans, plan]);
    this._activeId.set(plan.id);
    this.persist();
  }

  removePlan(planId: string): void {
    this._plans.update((plans) => plans.filter((p) => p.id !== planId));
    if (this._activeId() === planId) {
      this._activeId.set(this._plans()[0]?.id ?? null);
    }
    this.persist();
  }

  addWeek(planId: string): void {
    this.mutatePlan(planId, (p) => ({ ...p, weeks: [...p.weeks, emptyWeek()] }));
  }

  removeWeek(planId: string, weekId: string): void {
    this.mutatePlan(planId, (p) => ({
      ...p,
      weeks: p.weeks.filter((w) => w.id !== weekId),
    }));
  }

  addWorkout(
    planId: string,
    weekId: string,
    dayIndex: number,
    data: WorkoutInput,
  ): void {
    this.mutateWeek(planId, weekId, (w) => ({
      ...w,
      days: w.days.map((list, i) =>
        i === dayIndex ? [...list, { id: crypto.randomUUID(), ...data }] : list,
      ),
    }));
  }

  updateWorkout(
    planId: string,
    weekId: string,
    dayIndex: number,
    workoutId: string,
    data: WorkoutInput,
  ): void {
    this.mutateWeek(planId, weekId, (w) => ({
      ...w,
      days: w.days.map((list, i) =>
        i === dayIndex
          ? list.map((wo) => (wo.id === workoutId ? { ...wo, ...data } : wo))
          : list,
      ),
    }));
  }

  removeWorkout(
    planId: string,
    weekId: string,
    dayIndex: number,
    workoutId: string,
  ): void {
    this.mutateWeek(planId, weekId, (w) => ({
      ...w,
      days: w.days.map((list, i) =>
        i === dayIndex ? list.filter((wo) => wo.id !== workoutId) : list,
      ),
    }));
  }

  private mutatePlan(
    planId: string,
    fn: (p: TrainingPlan) => TrainingPlan,
  ): void {
    this._plans.update((plans) =>
      plans.map((p) => (p.id === planId ? fn(p) : p)),
    );
    this.persist();
  }

  private mutateWeek(
    planId: string,
    weekId: string,
    fn: (w: PlanWeek) => PlanWeek,
  ): void {
    this.mutatePlan(planId, (p) => ({
      ...p,
      weeks: p.weeks.map((w) => (w.id === weekId ? fn(w) : w)),
    }));
  }

  private read(): TrainingPlan[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (
        Array.isArray(data) &&
        data.every((p) => p && Array.isArray(p.weeks))
      ) {
        return data as TrainingPlan[];
      }
      return [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this._plans()));
  }
}
