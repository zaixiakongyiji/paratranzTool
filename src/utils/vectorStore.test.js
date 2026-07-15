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
    qdrantClient.upsertPoints.mockReset();
    qdrantClient.upsertPoints.mockResolvedValue(undefined);
    qdrantClient.search.mockReset();
    qdrantClient.getExistingIds.mockReset();
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

  it('correctly saves embeddings in batch and triggers mock Qdrant client', async () => {
    localStorage.setItem('pt_settings', JSON.stringify({
      qdrantEnabled: true,
      qdrantUrl: 'http://qdrant.local',
      qdrantApiKey: 'test-key'
    }));

    const { VectorStore } = await import('./vectorStore.js');
    const projectId = 'batch-project';

    // 1. 准备多条测试词条
    const count = 50;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: `batch-item-${i}`,
        original: `hello ${i}`,
        translation: `你好 ${i}`,
        fileId: 'file-1',
        fileName: 'dialogue.json',
        stage: 1,
        updatedAt: new Date().toISOString()
      });
    }

    await VectorStore.upsertItems(projectId, items);

    // 2. 批量设置 embedding 数组
    const list = items.map((item, idx) => ({
      id: item.id,
      embedding: [idx, 1.0],
      modelName: 'batch-test-model'
    }));

    // 3. 执行批量向量写入并统计时间
    const tBatchStart = performance.now();
    await VectorStore.setEmbeddingsBatch(list);
    const tBatchEnd = performance.now();
    const batchTime = tBatchEnd - tBatchStart;

    // 4. 验证 Qdrant mock 被调用
    expect(qdrantClient.upsertPoints).toHaveBeenCalled();
    const calledArgs = qdrantClient.upsertPoints.mock.calls[0];
    expect(calledArgs[0]).toBe('http://qdrant.local');
    expect(calledArgs[1]).toBe('test-key');
    expect(calledArgs[2]).toHaveLength(count);
    expect(calledArgs[2][0].vector).toEqual([0, 1.0]);

    // 5. 验证本地存储是否包含向量
    const withoutEmb = await VectorStore.getItemsWithoutEmbedding(projectId);
    expect(withoutEmb).toHaveLength(0); // 应该全都被向量化了

    const withEmb = await VectorStore.getItemsWithEmbedding(projectId);
    expect(withEmb).toHaveLength(count);

    // 6. 对比单事务逐条写入（性能统计）
    const singleItems = [];
    for (let i = 0; i < count; i++) {
      singleItems.push({
        id: `single-item-${i}`,
        original: `single hello ${i}`,
        translation: `single 你好 ${i}`,
        fileId: 'file-1',
        fileName: 'dialogue.json',
        stage: 1,
        updatedAt: new Date().toISOString()
      });
    }
    await VectorStore.upsertItems(projectId, singleItems);

    const tSingleStart = performance.now();
    for (let i = 0; i < count; i++) {
      await VectorStore.setEmbedding(`single-item-${i}`, [i, 1.0], 'batch-test-model');
    }
    const tSingleEnd = performance.now();
    const singleTime = tSingleEnd - tSingleStart;

    console.log(`[性能测试] 批量写入 50 条用时: ${batchTime.toFixed(2)} ms, 逐条写入 50 条用时: ${singleTime.toFixed(2)} ms`);
    // 理论上批量写入的时间应低于逐条写入
    expect(batchTime).toBeLessThanOrEqual(singleTime * 1.5);
  });

  it('correctly saves and searches in the translation_memory object store', async () => {
    const { VectorStore } = await import('./vectorStore.js');
    const projectId = 'tm-test-project';

    await VectorStore.saveTM(projectId, 'apple', '苹果');
    await VectorStore.saveTM(projectId, 'banana', '香蕉');

    const result1 = await VectorStore.searchTM(projectId, 'apple');
    const result2 = await VectorStore.searchTM(projectId, 'banana');
    const result3 = await VectorStore.searchTM(projectId, 'cherry');

    expect(result1).toBe('苹果');
    expect(result2).toBe('香蕉');
    expect(result3).toBeNull();

    // 验证 getAllTM
    const allTMs = await VectorStore.getAllTM(projectId);
    expect(allTMs).toHaveLength(2);
    expect(allTMs.map(it => it.original)).toContain('apple');
    expect(allTMs.map(it => it.original)).toContain('banana');
  });

  it('correctly migrates TM records from localStorage to IndexedDB translation_memory store and clears old keys', async () => {
    const { VectorStore, migrateTMToIndexedDB } = await import('./vectorStore.js');
    
    // 1. 在 localStorage 写入模拟的历史 TM 数据
    const projectId = 'migration-project';
    const legacyTM = {
      'dog': { translation: '狗', lastUpdated: 123456789 },
      'cat': '猫'
    };
    localStorage.setItem(`pt_tm_${projectId}`, JSON.stringify(legacyTM));

    // 2. 触发迁移
    await migrateTMToIndexedDB();

    // 3. 验证 localStorage 的键已被删除
    expect(localStorage.getItem(`pt_tm_${projectId}`)).toBeNull();

    // 4. 验证数据已写入 IndexedDB
    const resultDog = await VectorStore.searchTM(projectId, 'dog');
    const resultCat = await VectorStore.searchTM(projectId, 'cat');

    expect(resultDog).toBe('狗');
    expect(resultCat).toBe('猫');

    const all = await VectorStore.getAllTM(projectId);
    expect(all).toHaveLength(2);
  });
});
