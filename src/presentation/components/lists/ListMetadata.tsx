import { Globe, Lock, Calendar, User } from 'lucide-react';
import { Text } from '@/presentation/components/ui/Text';

interface ListMetadataProps {
  isPublic: boolean;
  createdAt: Date;
  ownerName: string;
  isOwner: boolean;
}

export function ListMetadata({ isPublic, createdAt, ownerName, isOwner }: ListMetadataProps) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(createdAt);

  return (
    <Text
      as="div"
      variant="body"
      textColor="secondary"
      className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"
    >
      <span className="flex items-center gap-1">
        {isPublic ? (
          <>
            <Globe className="h-3.5 w-3.5" />
            Pública
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" />
            Privada
          </>
        )}
      </span>

      <span className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        Criada em {formattedDate}
      </span>

      <span className="flex items-center gap-1">
        <User className="h-3.5 w-3.5" />
        {isOwner ? 'Por você' : ownerName}
      </span>
    </Text>
  );
}
