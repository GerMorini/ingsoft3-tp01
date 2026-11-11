export interface ScheduledSession {
  day: number;
}

export function routineScheduleSummary(
  assignments: readonly ScheduledSession[],
): string {
  if (assignments.length === 0) return "Sin sesiones programadas";

  const scheduledDays = new Set(assignments.map((assignment) => assignment.day));
  if (assignments.length === 1) return "1 sesión programada";
  if (scheduledDays.size === 1)
    return `${assignments.length} sesiones en un día`;
  if (scheduledDays.size === 7)
    return `${assignments.length} sesiones durante toda la semana`;
  return `${assignments.length} sesiones distribuidas en ${scheduledDays.size} días`;
}
