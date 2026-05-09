export function calcPlaceScore(place: {
  rating: number;
  reviewsCount: number;
  distanceM?: number;
}): number {
  const PRIOR_RATING = 3.5;
  const PRIOR_WEIGHT = 5;

  const bayesianRating =
    (PRIOR_WEIGHT * PRIOR_RATING + place.reviewsCount * place.rating) /
    (PRIOR_WEIGHT + place.reviewsCount);

  const reviewBoost = Math.log1p(place.reviewsCount);

  const distancePenalty = place.distanceM !== undefined ? 1 / (1 + place.distanceM / 1000) : 0.5;

  return bayesianRating * 2 + reviewBoost * 0.5 + distancePenalty;
}
