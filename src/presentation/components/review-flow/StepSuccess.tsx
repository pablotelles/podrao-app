'use client';

interface StepSuccessProps {
  points?: number;
  onContinue: () => void;
}

export function StepSuccess({ points = 10, onContinue }: StepSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <svg
          className="h-10 w-10 text-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-text-primary">Avaliação publicada!</h2>
      <p className="mb-6 text-center text-sm text-text-secondary">
        Obrigado por compartilhar sua experiência
      </p>

      {/* Gamificação */}
      <div className="mb-8 flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-xs text-text-secondary">Você ganhou</p>
          <p className="font-bold text-brand">+{points} pontos</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="rounded-full bg-brand px-6 py-3 font-medium text-white transition-transform hover:scale-105"
      >
        Ver minha avaliação
      </button>
    </div>
  );
}
