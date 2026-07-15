/* @vitest-environment jsdom */

import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { highlightTerms } from './translate.js';
import { VectorStore, migrateTMToIndexedDB } from '../utils/vectorStore.js';
import { paraTranzApi } from '../api/paratranz.js';
import { Storage } from '../utils/storage.js';

// mock Qdrant 客户端，避免真实网络调用
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

describe('Milestone 5 - 对抗性与健壮性验证测试', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    qdrantClient.upsertPoints.mockReset();
    qdrantClient.upsertPoints.mockResolvedValue(undefined);
    qdrantClient.search.mockReset();
    qdrantClient.getExistingIds.mockReset();
    qdrantClient.getExistingIds.mockResolvedValue(new Set());
    localStorage.clear();
    localStorage.setItem('pt_settings', JSON.stringify({
      ptToken: 'test-token',
      ptBaseUrl: '/api'
    }));
  });

  // ==========================================
  // 1. 【高亮对抗】测试
  // ==========================================
  describe('【高亮对抗】占位符高亮匹配防二次匹配与嵌套匹配', () => {
    it('应防范相互嵌套的子词导致的二次匹配与破坏', () => {
      // 场景 A: 包含相互嵌套的子词："color", "or", "span", "an"
      // 待翻文本: "Color the span."
      // "Color" 应该被匹配 (不区分大小写)，"span" 应该被匹配。
      // "or" 尽管是 "Color" 的子串，但因为 "Color" 先匹配并替换成占位符，且 "or" 具有单词边界检测，所以不应再次匹配到占位符内部或已被替换的 "Color" 中。
      // "an" 是 "span" 的子串，也不应再次匹配到 "span" 对应的占位符内部。
      const terms = [
        { term: 'color', translation: '颜色', caseSensitive: false },
        { term: 'or', translation: '或者', caseSensitive: false },
        { term: 'span', translation: '跨度', caseSensitive: false },
        { term: 'an', translation: '一个', caseSensitive: false }
      ];

      const text = 'Color the span.';
      const highlighted = highlightTerms(text, terms);

      // 验证: "Color" 和 "span" 被正确高亮
      expect(highlighted).toContain('Color');
      expect(highlighted).toContain('span');
      expect(highlighted).toContain('title="颜色"');
      expect(highlighted).toContain('title="跨度"');

      // 验证: 占位符和标签没有被 "or" 和 "an" 破坏
      // 最终的 html 不应该包含 "或者" 或 "一个" 翻译的高亮，因为它们在此文本中应判定为没有单独的匹配项（"or" 在 Color 中，"an" 在 span 中，都没有独立的单词边界）。
      expect(highlighted).not.toContain('title="或者"');
      expect(highlighted).not.toContain('title="一个"');
      
      // 确保 HTML 结构完整（如闭合标签数量）
      const spanCount = (highlighted.match(/<span/g) || []).length;
      const endSpanCount = (highlighted.match(/<\/span>/g) || []).length;
      expect(spanCount).toBe(2);
      expect(endSpanCount).toBe(2);
    });

    it('应防范长短词包含关系导致的二次高亮（例如 sword 和 word）', () => {
      const terms = [
        { term: 'sword', translation: '剑', caseSensitive: false },
        { term: 'word', translation: '词', caseSensitive: false }
      ];

      const text = 'A sharp sword and a word.';
      const highlighted = highlightTerms(text, terms);

      // "sword" 应该高亮为 "剑"，"word" 应该高亮为 "词"。
      // "sword" 中的 "word" 部分绝对不应该被二次高亮，即不应该出现嵌套的高亮标签
      expect(highlighted).toContain('title="剑"');
      expect(highlighted).toContain('title="词"');
      
      // 整体应该刚好有 2 处高亮（4 个 span，因为 2 个开始 2 个闭合）
      const spanCount = (highlighted.match(/<span/g) || []).length;
      expect(spanCount).toBe(2);
    });

    it('应正确处理包含特殊正则字符的术语匹配，不发生正则解析崩溃或漏配', () => {
      const terms = [
        { term: 'C++', translation: '丙加加', caseSensitive: false },
        { term: '$.ajax', translation: '艾杰克斯', caseSensitive: false },
        { term: '[test]', translation: '测试括弧', caseSensitive: false }
      ];

      const text = 'Use C++ and $.ajax and [test].';
      const highlighted = highlightTerms(text, terms);

      expect(highlighted).toContain('title="丙加加"');
      expect(highlighted).toContain('title="艾杰克斯"');
      expect(highlighted).toContain('title="测试括弧"');
      
      const spanCount = (highlighted.match(/<span/g) || []).length;
      expect(spanCount).toBe(3);
    });
  });

  // ==========================================
  // 2. 【存储迁移异常】测试
  // ==========================================
  describe('【存储迁移异常】损坏的 LocalStorage TM 数据的优雅降级', () => {
    it('当 LocalStorage 中的 TM 数据损坏时，应能够优雅降级、不阻塞并安全跳过', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 1. 设置一个合法的 TM
      localStorage.setItem('pt_tm_good_proj', JSON.stringify({
        'apple': { translation: '苹果', lastUpdated: 9999 }
      }));
      // 2. 设置一个损坏的 TM（不是合法的 JSON）
      localStorage.setItem('pt_tm_bad_proj', 'invalid-json{');
      // 3. 设置一个空字符的 TM
      localStorage.setItem('pt_tm_empty_proj', '');

      // 执行迁移
      await expect(migrateTMToIndexedDB()).resolves.not.toThrow();

      // 验证: 合法的项被成功迁移到 IndexedDB，且 localStorage 的键被移除
      const goodTM = await VectorStore.searchTM('good_proj', 'apple');
      expect(goodTM).toBe('苹果');
      expect(localStorage.getItem('pt_tm_good_proj')).toBeNull();

      // 验证: 损坏的项虽然迁移失败，但没有导致崩溃，且控制台打印了错误
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // 验证: 坏数据仍在 localStorage 中（由于没有成功解析，没有触发 removeItem）
      expect(localStorage.getItem('pt_tm_bad_proj')).toBe('invalid-json{');

      consoleErrorSpy.mockRestore();
    });

    it('当调用 Storage.getTM 时，即使 localStorage 损坏也能安全初始化为空的缓存，不崩溃', () => {
      localStorage.setItem('pt_tm_corrupted_123', 'bad-data-{');
      
      let tm;
      expect(() => {
        tm = Storage.getTM('corrupted_123');
      }).not.toThrow();

      expect(tm).toEqual({});
    });
  });

  // ==========================================
  // 3. 【批量保存临界值与异常】测试
  // ==========================================
  describe('【批量保存临界值与异常】空值、极值以及网络降级一致性保证', () => {
    it('当传入 0 条或 null 记录时，setEmbeddingsBatch 应安全返回，不抛出异常', async () => {
      await expect(VectorStore.setEmbeddingsBatch(null)).resolves.not.toThrow();
      await expect(VectorStore.setEmbeddingsBatch([])).resolves.not.toThrow();
    });

    it('当启用 Qdrant 且 Qdrant 上传抛出网络错误时，setEmbeddingsBatch 应当抛出异常且本地不更新状态', async () => {
      // 1. 开启 Qdrant 选项
      localStorage.setItem('pt_settings', JSON.stringify({
        qdrantEnabled: true,
        qdrantUrl: 'http://qdrant.test',
        qdrantApiKey: 'key'
      }));

      const projectId = 'err-project';
      // 2. 在 IndexedDB 写入初始词条
      await VectorStore.upsertItems(projectId, [
        {
          id: 'item-err-1',
          original: 'error',
          translation: '错误',
          fileId: 'f1',
          fileName: 't.json',
          stage: 1,
          updatedAt: '2026-07-01'
        }
      ]);

      // 验证当前本地 hasEmbedding 确实是 0
      const unVectorized = await VectorStore.getItemsWithoutEmbedding(projectId);
      expect(unVectorized).toHaveLength(1);
      expect(unVectorized[0].id).toBe('item-err-1');

      // 3. 模拟 Qdrant 客户端抛出网络降级异常
      qdrantClient.upsertPoints.mockRejectedValueOnce(new Error('Network Degradation / Connection Timeout'));

      // 4. 执行批量写入向量，应抛出异常
      const list = [{
        id: 'item-err-1',
        embedding: [0.1, 0.2, 0.3],
        modelName: 'test-model'
      }];

      await expect(VectorStore.setEmbeddingsBatch(list)).rejects.toThrow('Network Degradation / Connection Timeout');

      // 5. 数据一致性验证：本地 IndexedDB 的 hasEmbedding 应该依然是 0
      const postUnVectorized = await VectorStore.getItemsWithoutEmbedding(projectId);
      expect(postUnVectorized).toHaveLength(1);
      expect(postUnVectorized[0].hasEmbedding).toBe(0);
      expect(postUnVectorized[0].embedding).toBeNull();
    });
  });

  // ==========================================
  // 4. 【API 分页临界值】测试
  // ==========================================
  describe('【API 分页临界值】术语刚好是 500 条整倍数及异常空数据安全退出', () => {
    it('当术语数据刚好是 500 条时，循环拉取应能通过第二页返回空数组安全退出', async () => {
      const firstPage = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, name: `term_${i + 1}` }));
      const secondPage = []; // 第二页为空，刚好 500 条时

      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ results: firstPage })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ results: secondPage })
        });

      vi.stubGlobal('fetch', fetchMock);

      const results = await paraTranzApi.getTerms('500');

      expect(results).toHaveLength(500);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      const firstCallUrl = new URL(fetchMock.mock.calls[0][0], 'http://localhost');
      const secondCallUrl = new URL(fetchMock.mock.calls[1][0], 'http://localhost');
      expect(firstCallUrl.searchParams.get('page')).toBe('1');
      expect(secondCallUrl.searchParams.get('page')).toBe('2');
    });

    it('当第二页的 results 字段未定义 (undefined) 或为空对象时，应优雅跳过并退出循环，不发生崩溃', async () => {
      const firstPage = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, name: `term_${i + 1}` }));

      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ results: firstPage })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({}) // 第二页没有 results 字段
        });

      vi.stubGlobal('fetch', fetchMock);

      const results = await paraTranzApi.getTerms('500');

      expect(results).toHaveLength(500);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('如果接口由于某些极特殊情况返回了 null (比如 204)，拉取逻辑应稳妥处理，而不崩溃抛错', async () => {
      const firstPage = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, name: `term_${i + 1}` }));

      const fetchMock = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ results: firstPage })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204, // 返回 204 No Content
          text: async () => ''
        });

      vi.stubGlobal('fetch', fetchMock);

      // 注意: 在 paratranz.js 的 _request 中，如果 status 是 204 会返回 null
      // 让我们测试 getTerms 能否抵御 null 值的崩溃
      let results;
      let error = null;
      try {
        results = await paraTranzApi.getTerms('500');
      } catch (e) {
        error = e;
      }

      // 如果有崩溃，我们期望它不崩溃，或者我们可以在之后修复它
      // 这里我们在测试里检测它是否崩溃
      expect(error).toBeNull();
      expect(results).toHaveLength(500);
    });
  });
});
