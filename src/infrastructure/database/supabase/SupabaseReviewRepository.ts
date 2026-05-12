import type { Review } from '@/domain/entities/Review';
import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type {
  IReviewRepository,
  CreateReviewData,
  UpdateReviewData,
} from '@/domain/interfaces/IReviewRepository';
import type { ReviewCategory } from '@/domain/value-objects/ReviewCategory';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { SupabaseReactionRepository } from './SupabaseReactionRepository';

interface ReviewRow {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  price_bucket: string | null;
  comment: string | null;
  created_at: string;
}

interface ReviewScoreRow {
  category: string;
  score: number;
}

interface ReviewPhotoRow {
  url: string;
}

async function toDomain(row: ReviewRow, db: SupabaseClient): Promise<Review> {
  // Fetch scores for this review
  const { data: scoresData } = await db
    .from('review_scores')
    .select('category, score')
    .eq('review_id', row.id);

  const scores: ReviewScore[] | undefined = scoresData
    ? scoresData.map((s: ReviewScoreRow) => ({
        category: s.category as ReviewCategory,
        score: s.score,
      }))
    : undefined;

  // Fetch photos for this review
  const { data: photosData } = await db
    .from('review_photos')
    .select('url')
    .eq('review_id', row.id)
    .order('created_at', { ascending: true });

  const photos: string[] | undefined = photosData
    ? photosData.map((p: ReviewPhotoRow) => p.url)
    : undefined;

  return {
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    rating: row.rating,
    scores: scores && scores.length > 0 ? scores : undefined,
    photos: photos && photos.length > 0 ? photos : undefined,
    comment: row.comment ?? undefined,
    priceBucket: (row.price_bucket as PriceBucket) ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseReviewRepository implements IReviewRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async findByPlace(placeId: string, viewerUserId?: string): Promise<Review[]> {
    const { data, error } = await this.db
      .from('reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const rows = data as ReviewRow[];
    const reviewIds = rows.map((r) => r.id);
    const userIds = [...new Set(rows.map((r) => r.user_id))];

    // Batch fetch: scores, photos, profiles + reactions (4-6 queries fixas para qualquer N)
    const reactionRepo = new SupabaseReactionRepository();
    const [scoresRes, photosRes, profilesRes, reactionCounts, viewerActiveTypes] =
      await Promise.all([
        this.db
          .from('review_scores')
          .select('review_id, category, score')
          .in('review_id', reviewIds),
        this.db
          .from('review_photos')
          .select('review_id, url')
          .in('review_id', reviewIds)
          .order('created_at', { ascending: true }),
        this.db.from('profiles').select('id, nickname, avatar_url').in('id', userIds),
        reactionRepo.getCountsBatch('review', reviewIds),
        viewerUserId
          ? reactionRepo.getUserActiveTypesBatch(viewerUserId, 'review', reviewIds)
          : Promise.resolve(new Map<string, string>()),
      ]);

    // Indexar por ID para lookup O(1)
    const scoresByReview = new Map<string, ReviewScore[]>();
    for (const s of (scoresRes.data ?? []) as (ReviewScoreRow & { review_id: string })[]) {
      const arr = scoresByReview.get(s.review_id) ?? [];
      arr.push({ category: s.category as ReviewCategory, score: s.score });
      scoresByReview.set(s.review_id, arr);
    }

    const photosByReview = new Map<string, string[]>();
    for (const p of (photosRes.data ?? []) as { review_id: string; url: string }[]) {
      const arr = photosByReview.get(p.review_id) ?? [];
      arr.push(p.url);
      photosByReview.set(p.review_id, arr);
    }

    const profileById = new Map<string, { nickname: string; avatar_url: string | null }>();
    for (const p of (profilesRes.data ?? []) as {
      id: string;
      nickname: string;
      avatar_url: string | null;
    }[]) {
      profileById.set(p.id, p);
    }

    return rows.map((row) => {
      const profile = profileById.get(row.user_id);
      return {
        id: row.id,
        placeId: row.place_id,
        userId: row.user_id,
        rating: row.rating,
        scores: scoresByReview.get(row.id),
        photos: photosByReview.get(row.id),
        comment: row.comment ?? undefined,
        priceBucket: (row.price_bucket as PriceBucket) ?? undefined,
        createdAt: new Date(row.created_at),
        reactionCounts: reactionCounts.get(row.id) ?? {},
        viewerReactionType: viewerActiveTypes.get(row.id) ?? null,
        authorNickname: profile?.nickname,
        authorAvatarUrl: profile?.avatar_url ?? undefined,
      };
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    const { data, error } = await this.db
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Convert all rows to domain entities with their scores and photos
    const reviews = await Promise.all((data as ReviewRow[]).map((row) => toDomain(row, this.db)));

    return reviews;
  }

  async create(data: CreateReviewData): Promise<Review> {
    // 1. Insert the main review
    const { data: row, error } = await this.db
      .from('reviews')
      .insert({
        place_id: data.placeId,
        user_id: data.userId,
        rating: data.rating,
        price_bucket: data.priceBucket ?? null,
        comment: data.comment,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const reviewRow = row as ReviewRow;

    // 2. Insert category scores if provided
    if (data.scores && data.scores.length > 0) {
      const scoreRows = data.scores.map((score) => ({
        review_id: reviewRow.id,
        category: score.category,
        score: score.score,
      }));

      const { error: scoresError } = await this.db.from('review_scores').insert(scoreRows);

      if (scoresError) throw new Error(scoresError.message);
    }

    // 3. Insert photos if provided
    if (data.photoUrls && data.photoUrls.length > 0) {
      const photoRows = data.photoUrls.map((url) => ({
        review_id: reviewRow.id,
        url,
      }));

      const { error: photosError } = await this.db.from('review_photos').insert(photoRows);

      if (photosError) throw new Error(photosError.message);
    }

    // 4. Return the complete review with scores and photos
    return toDomain(reviewRow, this.db);
  }

  async update(reviewId: string, data: UpdateReviewData): Promise<Review> {
    const patch: Record<string, unknown> = {};
    if (data.rating !== undefined) patch.rating = data.rating;
    if (data.priceBucket !== undefined) patch.price_bucket = data.priceBucket;
    if ('comment' in data) patch.comment = data.comment ?? null;

    if (Object.keys(patch).length > 0) {
      const { error } = await this.db.from('reviews').update(patch).eq('id', reviewId);
      if (error) throw new Error(error.message);
    }

    if (data.scores !== undefined) {
      await this.db.from('review_scores').delete().eq('review_id', reviewId);
      if (data.scores.length > 0) {
        const { error } = await this.db
          .from('review_scores')
          .insert(
            data.scores.map((s) => ({ review_id: reviewId, category: s.category, score: s.score })),
          );
        if (error) throw new Error(error.message);
      }
    }

    if (data.photoUrls !== undefined) {
      await this.db.from('review_photos').delete().eq('review_id', reviewId);
      if (data.photoUrls.length > 0) {
        const { error } = await this.db
          .from('review_photos')
          .insert(data.photoUrls.map((url) => ({ review_id: reviewId, url })));
        if (error) throw new Error(error.message);
      }
    }

    const updated = await this.findById(reviewId);
    if (!updated) throw new Error('Review not found after update');
    return updated;
  }

  async findById(reviewId: string): Promise<Review | null> {
    const { data, error } = await this.db.from('reviews').select('*').eq('id', reviewId).single();

    if (error || !data) return null;
    return toDomain(data as ReviewRow, this.db);
  }

  async delete(reviewId: string): Promise<void> {
    const { error } = await this.db.from('reviews').delete().eq('id', reviewId);
    if (error) throw new Error(error.message);
  }

  async existsForUser(placeId: string, userId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
