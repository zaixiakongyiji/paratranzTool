/* @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getProject: vi.fn(),
  getFiles: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('../api/paratranz.js', () => ({
  paraTranzApi: {
    getProject: mocks.getProject,
    getFiles: mocks.getFiles
  }
}));

vi.mock('../router.js', () => ({
  navigate: mocks.navigate
}));

import { render } from './files.js';

describe('files page rendering', () => {
  it('escapes project and file names before inserting HTML', async () => {
    mocks.getProject.mockResolvedValue({
      name: '<img src=x onerror=alert(1)>'
    });
    mocks.getFiles.mockResolvedValue([
      {
        id: 'file-1',
        name: 'folder/<img src=x>.json',
        total: 1,
        translated: 0,
        hidden: 0,
        reviewed: 0
      }
    ]);

    const container = document.createElement('div');

    await render(container, new URLSearchParams('projectId=99'));

    expect(container.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(container.innerHTML).toContain('&lt;img src=x&gt;.json');
    expect(container.innerHTML).not.toContain('<img src=x>.json');
  });
});
