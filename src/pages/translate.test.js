/* @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';

vi.mock('../router.js', () => ({
  navigate: vi.fn()
}));

vi.mock('../api/paratranz.js', () => ({
  paraTranzApi: {}
}));

vi.mock('../api/ai.js', () => ({
  AIClient: {}
}));

vi.mock('../utils/storage.js', () => ({
  Storage: {}
}));

import { highlightTerms } from './translate.js';

describe('highlightTerms', () => {
  it('正确高亮基本术语并保留大小写变体', () => {
    const terms = [
      { term: 'Sword', translation: '剑', caseSensitive: false, variants: [] },
      { term: 'shield', translation: '盾', caseSensitive: true, variants: [] }
    ];
    
    // caseSensitive: false 的情况
    const text1 = 'A golden sword and a SWORD.';
    const res1 = highlightTerms(text1, terms);
    // 应该分别保留 sword 和 SWORD 的原始大小写
    expect(res1).toContain('title="剑">sword</span>');
    expect(res1).toContain('title="剑">SWORD</span>');
    
    // caseSensitive: true 的情况
    const text2 = 'A shield and a SHIELD.';
    const res2 = highlightTerms(text2, terms);
    // 应该只匹配 shield，不匹配 SHIELD
    expect(res2).toContain('title="盾">shield</span>');
    expect(res2).not.toContain('title="盾">SHIELD</span>');
  });

  it('支持术语变体匹配并保留变体的大写和小写', () => {
    const terms = [
      { term: 'apple', translation: '苹果', caseSensitive: false, variants: ['apples', 'ApPlE'] }
    ];
    const text = 'I have an apple, some apples, and a special ApPlE.';
    const res = highlightTerms(text, terms);
    
    expect(res).toContain('title="苹果">apple</span>');
    expect(res).toContain('title="苹果">apples</span>');
    expect(res).toContain('title="苹果">ApPlE</span>');
  });

  it('防止术语高亮损坏：包含 style, color, span, title 等敏感术语时结构完好', () => {
    const terms = [
      { term: 'style', translation: '样式', caseSensitive: false, variants: [] },
      { term: 'color', translation: '颜色', caseSensitive: false, variants: [] },
      { term: 'span', translation: '标签', caseSensitive: false, variants: [] },
      { term: 'title', translation: '标题', caseSensitive: false, variants: [] }
    ];
    
    const text = 'The style color is red, please span the word.';
    const res = highlightTerms(text, terms);
    
    // 验证高亮 HTML 标签结构完好、各 span 属性完整，不存在嵌套崩坏和破坏
    // 我们预期每个术语都被高亮包装一次，且没有出现嵌套的 span
    // 可以检查生成的 HTML 中，属性是否都被正确解析
    const container = document.createElement('div');
    container.innerHTML = res;
    
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(3); // 'style', 'color', 'span' 应该被高亮 ('title' 没在 text 中出现)
    
    // 检查每个 span 的属性和内容
    const spanStyle = Array.from(spans).find(s => s.textContent === 'style');
    expect(spanStyle).toBeTruthy();
    expect(spanStyle.getAttribute('title')).toBe('样式');
    expect(spanStyle.style.color).toContain('var(--accent-color)');
    
    const spanColor = Array.from(spans).find(s => s.textContent === 'color');
    expect(spanColor).toBeTruthy();
    expect(spanColor.getAttribute('title')).toBe('颜色');
    
    const spanSpan = Array.from(spans).find(s => s.textContent === 'span');
    expect(spanSpan).toBeTruthy();
    expect(spanSpan.getAttribute('title')).toBe('标签');
    
    // 检查是否有任何嵌套的 span
    spans.forEach(span => {
      expect(span.querySelector('span')).toBeNull();
    });
  });
});
