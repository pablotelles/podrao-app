import type { IPlaceVisitRepository } from '@/domain/interfaces/IPlaceVisitRepository';

export interface GetPlaceVisitStatsDTO {
  placeId: string;
  userId?: string;
}

export interface PlaceVisitStats {
  distinctVisitors: number;
  viewerHasVisited: boolean;
  /** Number of check-ins the authenticated viewer has at this place. Used to compute dynamic review limit. */
  viewerVisitCount: number;
  /** True if the viewer registered a check-in today (calendar day, server time). */
  viewerVisitedToday: boolean;
  /** Timestamp of viewer's most recent visit, or null if none. */
  viewerLastVisitedAt: Date | null;
}

export class GetPlaceVisitStats {
  constructor(private readonly visitRepo: IPlaceVisitRepository) {}

  async execute(dto: GetPlaceVisitStatsDTO): Promise<PlaceVisitStats> {
    const [distinctVisitors, viewerVisitCount, lastVisit] = await Promise.all([
      this.visitRepo.countDistinctVisitorsForPlace(dto.placeId),
      dto.userId ? this.visitRepo.countByUserForPlace(dto.placeId, dto.userId) : Promise.resolve(0),
      dto.userId
        ? this.visitRepo.getLastVisitForUser(dto.placeId, dto.userId)
        : Promise.resolve(null),
    ]);

    const viewerHasVisited = viewerVisitCount > 0;
    const viewerLastVisitedAt = lastVisit?.visitedAt ?? null;

    // "visited today" = last check-in was registered today AND user chose recency 'today'.
    // visited_at reflects registration time, not the actual visit date — so we need both conditions.
    // Uses server process timezone (UTC). BRT users have a ≤3h window of drift — acceptable for MVP.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewerVisitedToday =
      lastVisit !== null && lastVisit.recency === 'today' && lastVisit.visitedAt >= today;

    return {
      distinctVisitors,
      viewerHasVisited,
      viewerVisitCount,
      viewerVisitedToday,
      viewerLastVisitedAt,
    };
  }
}
