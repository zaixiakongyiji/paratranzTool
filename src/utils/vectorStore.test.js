/* @vitest-environment jsdom */

import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const qdrantClient = {
  deleteCollection: vi.fn(),
  deletePointsByProjectId: vi.fn(),
  getExistingIds: vi.fn(),
  search: vi.fn(),
  upsertPoints: vi.fn()
};

vi.mock('../api/qdrant.js', () => ({
  QdrantClient: qdrantClient
}));

describe('VectorStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    qdrantClient.upsertPoints.mockResolvedValue(undefined);
    qdrantClient.search.mockReset();
    qdrantClient.getExistingIds.mockResolvedValue(new Set());
    localStorage.clear();
  });

  it('falls back to local embeddings when Qdrant search fails', async () => {
    localStorage.setItem('pt_settings', JSON.stringify({
      qdrantEnabled: true,
      qdrantUrl: 'http://qdrant.local'
    }));

    const { VectorStore } = await import('./vectorStore.js');
    const projectId = 'fallback-project';

    await VectorStore.upsertItems(projectId, [{
      id: 'entry-1',
      original: 'hello',
      translation: '你好',
      fileId: 'file-1',
      fileName: 'dialogue.json',
      stage: 1,
      updatedAt: '2026-06-01T00:00:00.000Z'
    }]);
    await VectorStore.setEmbedding('entry-1', [1, 0], 'test-model');

    qdrantClient.search.mockRejectedValueOnce(new Error('qdrant down'));

    const results = await VectorStore.searchSimilar(projectId, [1, 0], 5);

    expect(results).toHaveLength(1);
    expect(results[0].item.translation).toBe('你好');
  });
});
