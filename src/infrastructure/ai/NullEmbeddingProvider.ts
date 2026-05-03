import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';

/**
 * Implementação nula de IEmbeddingProvider.
 * Usada no MVP enquanto OPENAI_API_KEY não está configurada.
 * Retorna array vazio — nenhum embedding é gerado nem armazenado.
 * Ativar embeddings reais: definir OPENAI_API_KEY no .env.local.
 */
export class NullEmbeddingProvider implements IEmbeddingProvider {
  async embed(_text: string): Promise<number[]> {
    return [];
  }
}
