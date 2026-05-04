import type { Review } from '@/domain/entities/Review';
import type { IReviewRepository, CreateReviewData } from '@/domain/interfaces/IReviewRepository';
import type { MealType } from '@/domain/value-objects/MealType';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

interface ReviewRow {
  id: string;
  place_id: string;
  user_id: string;
  thumbs_up: boolean;
  amount_paid: number | null;
  meal_type: string | null;
  comment: string | null;
  created_at: string;
}

function toDomain(row: ReviewRow): Review {
  return {
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    thumbsUp: row.thumbs_up,
    amountPaid: row.amount_paid ?? undefined,
    mealType: (row.meal_type as MealType) ?? undefined,
    comment: row.comment ?? undefined,
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
    return (data as ReviewRow[]).map(toDomain);
  }

  async findByUser(userId: string): Promise<Review[]> {
    const { data, error } = await this.db
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ReviewRow[]).map(toDomain);
  }

  async create(data: CreateReviewData): Promise<Review> {
    const { data: row, error } = await this.db
      .from('reviews')
      .insert({
        place_id: data.placeId,
        user_id: data.userId,
        thumbs_up: data.thumbsUp,
        amount_paid: data.amountPaid,
        meal_type: data.mealType,
        comment: data.comment,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as ReviewRow);
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
