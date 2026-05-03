import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';

/** text-embedding-3-small — 1536 dims, ~$0.02/1M tokens
 *  Ver docs/ai/embedding-strategy.md para detalhes de custo e ativação */
export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  private readonly apiKey: string;
  private readonly model = 'text-embedding-3-small';

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('OpenAI API key não fornecida');
    this.apiKey = apiKey;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text, model: this.model }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding falhou: ${response.status}`);
    }

    const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
    return data.data[0].embedding;
  }
}
