/* @vitest-environment jsdom */

import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const getFiles = vi.fn();
const getStrings = vi.fn();

vi.mock('../api/paratranz.js', () => ({
  paraTranzApi: {
    getFiles,
    getStrings
  }
}));

describe('RAG.syncCorpus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('pt_settings', JSON.stringify({
      embeddingEnabled: false
    }));
  });

  it('removes stale project items that no longer exist upstream', async () => {
    const { VectorStore } = await import('./vectorStore.js');
    const { RAG } = await import('./rag.js');
    const projectId = 'stale-project';

    await VectorStore.upsertItems(projectId, [
      {
        id: 'keep-me',
        original: 'A',
        translation: '甲',
        fileId: 'file-1',
        fileName: 'a.json',
        stage: 1,
        updatedAt: '2026-06-01T00:00:00.000Z'
      },
      {
        id: 'remove-me',
        original: 'B',
        translation: '乙',
        fileId: 'file-1',
        fileName: 'a.json',
        stage: 1,
        updatedAt: '2026-06-01T00:00:00.000Z'
      }
    ]);

    getFiles.mockResolvedValue([{ id: 'file-1', name: 'a.json' }]);
    getStrings.mockImplementation(async (_projectId, _fileId, stage) => {
      if (stage === 1) {
        return [{
          id: 'keep-me',
          original: 'A',
          translation: '甲',
          stage: 1,
          updatedAt: '2026-06-01T01:00:00.000Z'
        }];
      }
      return [];
    });

    await RAG.syncCorpus(projectId);

    expect(await VectorStore.getProjectItemCount(projectId)).toBe(1);
  });
});
