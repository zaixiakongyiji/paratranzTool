import { describe, it, expect } from 'vitest';
import { validateTranslation, _internal } from './validation.js';

const { extractTags, checkLineCount, checkTags, checkWhitespace } = _internal;

describe('extractTags', () => {
  it('提取尖括号标签', () => {
    const text = 'Hello <player_name>, welcome!';
    const tags = extractTags(text);
    expect(tags).toContain('<player_name>');
  });

  it('提取带参数的尖括号标签', () => {
    const text = '<switch_privates(Your <adjective_penis1>';
    // 此文本中 <adjective_penis1> 是一个完整标签
    const tags = extractTags(text);
    expect(tags.length).toBeGreaterThan(0);
  });

  it('无标签时返回空数组', () => {
    const tags = extractTags('普通文本，没有标签');
    expect(tags).toEqual([]);
  });

  it('提取多个标签', () => {
    const text = '<tag1> some text <tag2> more <tag3>';
    const tags = extractTags(text);
    expect(tags).toHaveLength(3);
  });
});

describe('checkLineCount', () => {
  it('行数一致时返回 null', () => {
    const result = checkLineCount('line1\nline2', 'line1\nline2');
    expect(result).toBeNull();
  });

  it('行数不一致时返回警告', () => {
    const result = checkLineCount('line1\nline2', 'line1\nline2\nline3');
    expect(result).not.toBeNull();
    expect(result.category).toBe('lineCount');
    expect(result.type).toBe('warning');
    expect(result.message).toContain('2');
    expect(result.message).toContain('3');
  });

  it('单行对单行无问题', () => {
    const result = checkLineCount('single line', 'translated line');
    expect(result).toBeNull();
  });
});

describe('checkTags', () => {
  it('标签一致时返回空数组', () => {
    const issues = checkTags('Hello <name>!', '你好 <name>！');
    expect(issues).toHaveLength(0);
  });

  it('检测缺失的标签', () => {
    const issues = checkTags('Hello <name> <title>!', '你好！');
    const missing = issues.find(i => i.category === 'missingTags');
    expect(missing).toBeDefined();
    expect(missing.details).toContain('<name>');
    expect(missing.details).toContain('<title>');
  });

  it('检测多余的标签', () => {
    const issues = checkTags('Hello!', '你好 <extra_tag>！');
    const extra = issues.find(i => i.category === 'extraTags');
    expect(extra).toBeDefined();
    expect(extra.details).toContain('<extra_tag>');
  });

  it('检测同时缺失和多余（标签内容被翻译）', () => {
    // 模拟截图中的情况：翻译者把标签内部的 Your 翻译成了 你的
    const original = 'text <switch_privates(Your <adjective_penis1> more';
    const translation = 'text <switch_privates(你的 <adjective_penis1> more';
    const issues = checkTags(original, translation);
    // 原文标签 <switch_privates(Your <adjective_penis1> 被替换成了不同的标签
    const missing = issues.find(i => i.category === 'missingTags');
    const extra = issues.find(i => i.category === 'extraTags');
    expect(missing).toBeDefined();
    expect(extra).toBeDefined();
  });

  it('原文无标签时跳过检查', () => {
    const issues = checkTags('普通文本', '翻译文本');
    expect(issues).toHaveLength(0);
  });

  it('处理同一标签出现多次', () => {
    const issues = checkTags('<tag> <tag> text', '<tag> text');
    const missing = issues.find(i => i.category === 'missingTags');
    expect(missing).toBeDefined();
    expect(missing.details).toHaveLength(1);
  });
});

describe('checkWhitespace', () => {
  it('空白符一致时返回 null', () => {
    const result = checkWhitespace('hello', 'world');
    expect(result).toBeNull();
  });

  it('检测前导换行差异', () => {
    const result = checkWhitespace('\nhello', 'hello');
    expect(result).not.toBeNull();
    expect(result.category).toBe('whitespace');
  });

  it('检测末尾换行差异', () => {
    const result = checkWhitespace('hello\n', 'hello');
    expect(result).not.toBeNull();
  });

  it('检测前导空格差异', () => {
    const result = checkWhitespace('  hello', 'hello');
    expect(result).not.toBeNull();
  });
});

describe('validateTranslation', () => {
  it('无问题时返回空数组', () => {
    const issues = validateTranslation('Hello <name>!', '你好 <name>！');
    expect(issues).toHaveLength(0);
  });

  it('多种问题同时检出', () => {
    const original = 'line1\nline2 <tag>';
    const translation = 'line1\nline2\nline3';
    const issues = validateTranslation(original, translation);
    // 行数不一致 + 缺失标签
    expect(issues.length).toBeGreaterThanOrEqual(2);
    const categories = issues.map(i => i.category);
    expect(categories).toContain('lineCount');
    expect(categories).toContain('missingTags');
  });
});
