-- Criar bucket para fotos de lugares (storage bucket)
-- Nota: Policies RLS para este bucket estão em policies/storage.sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;
