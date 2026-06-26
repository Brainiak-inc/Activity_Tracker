export interface FormStatus {
  label: string;
  color: string;
}

export function tsbStatus(tsb: number): FormStatus {
  if (tsb > 5) return { label: 'свежесть', color: 'var(--form)' };
  if (tsb >= -10) return { label: 'норма', color: 'var(--text)' };
  if (tsb >= -30) return { label: 'рост формы', color: 'var(--accent)' };
  return { label: 'перегрузка', color: 'var(--fatigue)' };
}
