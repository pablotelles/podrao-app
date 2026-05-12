'use client';

import { useState } from 'react';

export interface ProposeEditArgs {
  placeId: string;
  fieldName: string;
  newValue: unknown;
  note?: string;
}

export type ProposeEditState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'rate_limited'; message: string }
  | { status: 'conflict'; editId: string }
  | { status: 'error'; message: string };

export function useProposeEdit(): {
  propose: (args: ProposeEditArgs) => Promise<void>;
  state: ProposeEditState;
  reset: () => void;
} {
  const [state, setState] = useState<ProposeEditState>({ status: 'idle' });

  async function propose(args: ProposeEditArgs): Promise<void> {
    setState({ status: 'loading' });

    try {
      const res = await fetch(`/api/places/${args.placeId}/edits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName: args.fieldName,
          newValue: args.newValue,
          note: args.note,
        }),
      });

      if (res.ok) {
        setState({ status: 'success' });
        return;
      }

      if (res.status === 429) {
        setState({
          status: 'rate_limited',
          message:
            'Você atingiu o limite de sugestões por hoje. Tente novamente amanhã ou vote nas sugestões de outros usuários.',
        });
        return;
      }

      if (res.status === 409) {
        const body = (await res.json()) as { code?: string; editId?: string };
        if (body.code === 'EDIT_CONFLICT' && body.editId) {
          setState({ status: 'conflict', editId: body.editId });
          return;
        }
      }

      const body = (await res.json()) as { error?: string };
      setState({
        status: 'error',
        message: body.error ?? 'Ocorreu um erro ao enviar a sugestão. Tente novamente.',
      });
    } catch {
      setState({
        status: 'error',
        message: 'Falha de conexão. Verifique sua internet e tente novamente.',
      });
    }
  }

  function reset() {
    setState({ status: 'idle' });
  }

  return { propose, state, reset };
}
