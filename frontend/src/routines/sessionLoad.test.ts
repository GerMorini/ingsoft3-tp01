// @vitest-environment node

import { describe, expect, it } from "vitest";
import { describeSessionLoad } from "./sessionLoad";

describe("describeSessionLoad", () => {
  it("describes a session without exercises", () => {
    expect(describeSessionLoad([])).toBe("Sin ejercicios");
  });

  it("describes exercises without configured load", () => {
    expect(
      describeSessionLoad([
        { series: 0, repetitions: 10 },
        { series: 3, repetitions: 0 },
      ]),
    ).toBe("Sin carga configurada");
  });

  it.each([
    { series: -1, repetitions: 10 },
    { series: 3, repetitions: -1 },
    { series: 1.5, repetitions: 10 },
    { series: 3, repetitions: 10.5 },
  ])("rejects invalid quantities: %o", (exercise) => {
    expect(describeSessionLoad([exercise])).toBe("Carga inválida");
  });

  it("reports partially configured exercises", () => {
    expect(
      describeSessionLoad([
        { series: 3, repetitions: 10 },
        { series: 0, repetitions: 10 },
      ]),
    ).toBe("Carga parcial");
  });

  it.each([
    { total: 30, exercise: { series: 3, repetitions: 10 }, expected: "Carga baja" },
    { total: 31, exercise: { series: 1, repetitions: 31 }, expected: "Carga media" },
    { total: 60, exercise: { series: 3, repetitions: 20 }, expected: "Carga media" },
    { total: 61, exercise: { series: 1, repetitions: 61 }, expected: "Carga alta" },
  ])("classifies the $total repetition boundary", ({ exercise, expected }) => {
    expect(describeSessionLoad([exercise])).toBe(expected);
  });
});
