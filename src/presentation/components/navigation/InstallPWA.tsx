'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

const DISMISSED_KEY = 'pwa-install-dismissed';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Já instalado — não mostrar
    if (isInStandaloneMode()) return;
    // Usuário já dispensou — não mostrar
    if (localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setShowIOSHint(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 mx-3 rounded-xl border border-border bg-bg shadow-lg p-4 flex items-start gap-3"
      style={{ bottom: 'calc(4rem + 12px + env(safe-area-inset-bottom))', zIndex: 'var(--z-sticky)' }}
    >
      {/* Ícone */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Download className="h-5 w-5" />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">Adicionar à tela inicial</p>
        {showIOSHint ? (
          <p className="mt-0.5 text-xs text-text-secondary">
            Toque em <Share className="inline h-3.5 w-3.5 align-text-bottom" /> e depois{' '}
            <strong>"Adicionar à tela de início"</strong>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-text-secondary">
            Instale o app para usar offline e ter acesso rápido.
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="flex shrink-0 items-center gap-2">
        {!showIOSHint && (
          <button
            onClick={install}
            className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
          >
            Instalar
          </button>
        )}
        <button onClick={dismiss} className="text-text-secondary" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
