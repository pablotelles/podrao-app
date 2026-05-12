'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FAB } from '@/presentation/components/ui/FAB';

export function CriarListaFAB() {
  const router = useRouter();

  return (
    <FAB
      actions={[{ icon: Plus, label: 'Criar lista', onClick: () => router.push('/lists/new') }]}
    />
  );
}
