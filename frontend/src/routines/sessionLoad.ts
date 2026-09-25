export interface SessionLoadExercise {
  series: number;
  repetitions: number;
}

export function describeSessionLoad(
  exercises: readonly SessionLoadExercise[],
): string {
  if (exercises.length === 0) return "Sin ejercicios";

  const hasInvalidQuantity = exercises.some(
    (exercise) =>
      !Number.isInteger(exercise.series) ||
      !Number.isInteger(exercise.repetitions) ||
      exercise.series < 0 ||
      exercise.repetitions < 0,
  );
  if (hasInvalidQuantity) return "Carga inválida";

  const configured = exercises.filter(
    (exercise) => exercise.series > 0 && exercise.repetitions > 0,
  );
  if (configured.length === 0) return "Sin carga configurada";
  if (configured.length !== exercises.length) return "Carga parcial";

  const totalRepetitions = configured.reduce(
    (total, exercise) => total + exercise.series * exercise.repetitions,
    0,
  );
  if (totalRepetitions <= 30) return "Carga baja";
  if (totalRepetitions <= 60) return "Carga media";
  return "Carga alta";
}
