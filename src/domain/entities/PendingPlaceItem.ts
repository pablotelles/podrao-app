import type { Place } from './Place';

export interface PendingPlaceItem extends Place {
  creatorNickname?: string;
}
