import { List, Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/presentation/components/ui/EmptyState';

export function RecentesEmptyState() {
  return (
    <div className="mx-(--spacing-page-x) mb-4">
      <EmptyState
        icon={<List size={36} strokeWidth={1.4} />}
        title="Ainda não há listas recentes aqui"
        description="Seja a primeira a mapear os melhores lugares do seu bairro."
        action={
          <Link
            href="/lists/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[0.8125rem] font-semibold text-text-inverse"
          >
            <Plus size={14} strokeWidth={2} />
            Criar lista
          </Link>
        }
      />
    </div>
  );
}
