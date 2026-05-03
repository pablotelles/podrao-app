# Sistema de Localização Global

Este diretório contém o sistema de localização global do usuário, implementado com React Context API.

## Arquitetura

- **LocationContext.tsx** - Context + Provider que gerencia o estado global da localização
- **useUserLocation.ts** - Hook para consumir a localização em qualquer componente

## Configuração

### Variável de Ambiente

```env
# Intervalo de atualização da localização em milissegundos (padrão: 30000 = 30s)
NEXT_PUBLIC_LOCATION_UPDATE_INTERVAL_MS=30000
```

### Setup no App

O `LocationProvider` está configurado no layout root (`src/app/layout.tsx`):

```tsx
import { LocationProvider } from '@/presentation/contexts/LocationContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
```

## Uso

### Exemplo Básico

```tsx
'use client';

import { useUserLocation } from '@/presentation/hooks/useUserLocation';

export function MyComponent() {
  const { location, isLoading, error, requestLocation } = useUserLocation();

  if (isLoading) {
    return <p>Obtendo sua localização...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Erro: {error}</p>
        <button onClick={requestLocation}>Tentar novamente</button>
      </div>
    );
  }

  if (!location) {
    return <button onClick={requestLocation}>Ativar localização</button>;
  }

  return (
    <div>
      <p>Latitude: {location.lat}</p>
      <p>Longitude: {location.lng}</p>
      <p>Precisão: {location.accuracy}m</p>
      <p>Última atualização: {new Date(location.timestamp).toLocaleTimeString()}</p>
    </div>
  );
}
```

### Busca de Lugares Próximos

```tsx
'use client';

import { useUserLocation } from '@/presentation/hooks/useUserLocation';
import { useEffect, useState } from 'react';

export function NearbyPlaces() {
  const { location } = useUserLocation();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (!location) return;

    // Buscar lugares próximos sempre que a localização atualizar
    fetch(`/api/places?lat=${location.lat}&lng=${location.lng}&radius=1000`)
      .then((res) => res.json())
      .then((data) => setPlaces(data.places));
  }, [location?.lat, location?.lng]);

  return <ul>{/* renderizar places */}</ul>;
}
```

### Calcular Distância

```tsx
'use client';

import { useDistance } from '@/presentation/hooks/useDistance';

interface PlaceCardProps {
  place: { lat: number; lng: number; name: string };
}

export function PlaceCard({ place }: PlaceCardProps) {
  const { distanceText, distanceM, hasUserLocation } = useDistance(place.lat, place.lng);

  return (
    <div>
      <h3>{place.name}</h3>
      {hasUserLocation && <p className="text-sm text-gray-500">{distanceText} de você</p>}
    </div>
  );
}
```

**Valores retornados:**

- `distanceM` - Distância em metros (number | null)
- `distanceText` - String formatada: "350 m" ou "1.2 km"
- `hasUserLocation` - Boolean indicando se há localização disponível

````

## Migração do `useGeolocation` (antigo)

### Antes (hook local, sem atualização)

```tsx
import { useGeolocation } from '@/presentation/hooks/useGeolocation';

function Component() {
  const { lat, lng, error, loading, request } = useGeolocation();

  useEffect(() => {
    request(); // Pede localização uma vez
  }, [request]);

  return (
    <div>
      {lat}, {lng}
    </div>
  );
}
````

### Depois (context global, auto-atualização)

```tsx
import { useUserLocation } from '@/presentation/hooks/useUserLocation';

function Component() {
  const { location, error, isLoading } = useUserLocation();
  // Localização já está sendo obtida automaticamente pelo Provider!
  // Atualiza a cada X segundos conforme NEXT_PUBLIC_LOCATION_UPDATE_INTERVAL_MS

  return (
    <div>
      {location?.lat}, {location?.lng}
    </div>
  );
}
```

### Exemplo completo: HomePage

**ANTES:**

```tsx
const geo = useGeolocation();

const { places } = useNearbyPlaces(
  geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng, radiusMeters: 1000 } : null,
);

return (
  <div>
    {geo.loading && <p>Carregando...</p>}
    {geo.error && <p>{geo.error}</p>}
    {geo.lat && <PlaceMap places={places} />}
  </div>
);
```

**DEPOIS:**

```tsx
const { location, isLoading, error } = useUserLocation();

const { places } = useNearbyPlaces(
  location ? { lat: location.lat, lng: location.lng, radiusMeters: 1000 } : null,
);

return (
  <div>
    {isLoading && !location && <p>Carregando...</p>}
    {error && <p>{error}</p>}
    {location && <PlaceMap places={places} />}
  </div>
);
```

**Resumo das mudanças:**

- `geo.lat` → `location?.lat`
- `geo.lng` → `location?.lng`
- `geo.loading` → `isLoading`
- `geo.error` → `error`
- ❌ **Remover `geo.request()`** - atualização é automática!

## API do Hook

### `useUserLocation()`

Retorna um objeto com:

```ts
{
  location: UserLocation | null;  // { lat, lng, accuracy, timestamp }
  isLoading: boolean;              // true durante a primeira leitura
  error: string | null;            // Mensagem de erro em português
  requestLocation: () => void;     // Força nova leitura imediata
  clearError: () => void;          // Limpa mensagem de erro
}
```

## Props do Provider (avançado)

Se precisar customizar o comportamento em casos específicos:

```tsx
<LocationProvider
  updateIntervalMs={60000} // Override: atualizar a cada 60s
  enableAutoUpdate={false} // Desabilitar atualização automática
>
  {children}
</LocationProvider>
```

**Normalmente você não precisa passar props** - o Provider usa as configurações de `.env` automaticamente.

## Comportamento

1. **Primeira leitura**: Ao montar, pede permissão e obtém localização inicial
2. **Atualização contínua**: Usa `watchPosition` (se disponível) ou polling com intervalo configurável
3. **Limpeza**: Remove watchers/timers ao desmontar
4. **Otimização**: Usa `maximumAge` para evitar leituras desnecessárias do GPS
5. **Baixa precisão**: `enableHighAccuracy: false` economiza bateria (±10-50m é suficiente para buscar lugares)

## Boas Práticas

### ✅ Usar localização global

```tsx
const { location } = useUserLocation();
// Localização já está sincronizada globalmente
```

### ✅ Mostrar estado de loading

```tsx
if (isLoading) return <Spinner />;
```

### ✅ Tratar erros gracefully

```tsx
if (error)
  return (
    <p>
      {error} <button onClick={requestLocation}>Tentar novamente</button>
    </p>
  );
```

### ✅ Renderizar condicional

```tsx
{
  location && <Map center={[location.lat, location.lng]} />;
}
```

### ❌ Não pedir localização manualmente

```tsx
// ❌ Não faça isso - redundante
useEffect(() => {
  const { requestLocation } = useUserLocation();
  requestLocation();
}, []);

// ✅ Faça isso - já atualiza automaticamente
const { location } = useUserLocation();
```

### ❌ Não criar múltiplos providers

```tsx
// ❌ Não faça isso
function Page() {
  return (
    <LocationProvider>
      <Component />
    </LocationProvider>
  );
}

// ✅ Já existe no layout root
function Page() {
  return <Component />;
}
```
