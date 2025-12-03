import { useState, useCallback } from "react";

export default function useStep(initialStep = 1, totalSteps = 4) {
  const [step, setStep] = useState(initialStep);

  const next = useCallback(() => setStep((s) => (s < totalSteps ? s + 1 : s)), [totalSteps]);
  const prev = useCallback(() => setStep((s) => (s > 1 ? s - 1 : s)), []);
  const reset = useCallback(() => setStep(initialStep), [initialStep]);

  return { step, next, prev, reset, setStep };
}
