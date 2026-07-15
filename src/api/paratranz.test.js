/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { paraTranzApi } from './paratranz.js';

describe('paraTranzApi.getStrings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('pt_settings', JSON.stringify({
      ptToken: 'token',
      ptBaseUrl: '/api'
    }));
  });

  it('paginates until all string pages are fetched', async () => {
    const firstPage = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
    const secondPage = Array.from({ length: 10 }, (_, i) => ({ id: 101 + i }));

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

    const results = await paraTranzApi.getStrings('42', '7', 1);

    expect(results).toHaveLength(110);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstCallParams = new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams;
    const secondCallParams = new URL(fetchMock.mock.calls[1][0], 'http://localhost').searchParams;

    expect(firstCallParams.get('stage')).toBe('1');
    expect(firstCallParams.get('page')).toBe('1');
    expect(secondCallParams.get('page')).toBe('2');
  });

  it('omits the stage filter when requesting all strings', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [] })
    });

    vi.stubGlobal('fetch', fetchMock);

    await paraTranzApi.getStrings('42', '7', null);

    const params = new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams;
    expect(params.has('stage')).toBe(false);
  });
});

describe('paraTranzApi.getTerms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem('pt_settings', JSON.stringify({
      ptToken: 'token',
      ptBaseUrl: '/api'
    }));
  });

  it('paginates until all term pages are fetched', async () => {
    const firstPage = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, name: `term_${i + 1}` }));
    const secondPage = Array.from({ length: 100 }, (_, i) => ({ id: 501 + i, name: `term_${501 + i}` }));

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

    const results = await paraTranzApi.getTerms('42');

    expect(results).toHaveLength(600);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstCallUrl = new URL(fetchMock.mock.calls[0][0], 'http://localhost');
    const secondCallUrl = new URL(fetchMock.mock.calls[1][0], 'http://localhost');

    expect(firstCallUrl.pathname).toBe('/api/projects/42/terms');
    expect(firstCallUrl.searchParams.get('page')).toBe('1');
    expect(firstCallUrl.searchParams.get('pageSize')).toBe('500');

    expect(secondCallUrl.pathname).toBe('/api/projects/42/terms');
    expect(secondCallUrl.searchParams.get('page')).toBe('2');
    expect(secondCallUrl.searchParams.get('pageSize')).toBe('500');
  });
});

