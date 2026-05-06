import type { Review } from '@/domain/entities/Review';
import type { ReviewScore } from '@/domain/entities/ReviewScore';
import type { IReviewRepository, CreateReviewData } from '@/domain/interfaces/IReviewRepository';
import type { MealType } from '@/domain/value-objects/MealType';
import type { ReviewCategory } from '@/domain/value-objects/ReviewCategory';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

interface ReviewRow {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  amount_paid: number | null;
  meal_type: string | null;
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
    mealType: (row.meal_type as MealType) ?? undefined,
    amountPaidPerPerson: row.amount_paid ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseReviewRepository implements IReviewRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async findByPlace(placeId: string): Promise<Review[]> {
    const { data, error } = await this.db
      .from('reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Convert all rows to domain entities with their scores and photos
    const reviews = await Promise.all((data as ReviewRow[]).map((row) => toDomain(row, this.db)));

    return reviews;
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
        amount_paid: data.amountPaidPerPerson,
        meal_type: data.mealType,
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
