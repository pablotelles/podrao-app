interface ProgressStepsProps {
  currentStep: number;   // 0-based
  totalSteps: number;
  labels?: readonly string[];
}

/**
 * Horizontal step progress bar.
 * Each segment fills when currentStep >= its index.
 */
export function ProgressSteps({ currentStep, totalSteps, labels }: ProgressStepsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
        {steps.map((i) => (
          <div
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= currentStep ? 'bg-brand' : 'bg-border',
            ].join(' ')}
          />
        ))}
      </div>
      {labels && (
        <p className="text-xs text-text-secondary">
          Passo {currentStep + 1} de {totalSteps}
          {labels[currentStep] ? ` — ${labels[currentStep]}` : ''}
        </p>
      )}
    </div>
  );
}
