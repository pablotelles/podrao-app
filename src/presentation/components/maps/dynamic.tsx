/**
 * Wrappers dinâmicos centralizados para todos os mapas da aplicação.
 * Todos usam MapSkeleton como loading — consistência garantida em um único lugar.
 * Importe daqui em vez de criar dynamic() em cada página.
 */
import dynamic from 'next/dynamic';
import { MapSkeleton } from './MapSkeleton';

const loading = () => <MapSkeleton />;

export const DynamicPlaceMap = dynamic(
  () => import('@/presentation/components/places/PlaceMap'),
  { ssr: false, loading },
);

export const DynamicLocationPickerMap = dynamic(
  () => import('@/presentation/components/maps/LocationPickerMap'),
  { ssr: false, loading },
);

export const DynamicPlaceDetailMap = dynamic(
  () =>
    import('@/presentation/components/places/PlaceDetailMap').then((m) => m.PlaceDetailMap),
  { ssr: false, loading },
);
