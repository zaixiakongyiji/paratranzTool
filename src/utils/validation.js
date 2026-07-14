/**
 * 保存前校验工具模块
 * 对原文和译文进行质量检查，在提交保存前发现潜在问题
 * 
 * 设计为可扩展的校验规则链，新增检查项只需添加对应的检查函数即可
 */

/**
 * 标签提取的正则模式列表
 * 长期维护：发现新的标签格式就往这里添加
 * 
 * 每个模式是一个正则表达式，用于匹配文本中的标签/占位符
 */
const TAG_PATTERNS = [
  // 尖括号标签：从 < 开始，到同行内最近的 > 结束（允许中间包含嵌套的 <）
  // 匹配示例:
  //   简单标签: <player_name>, <npc_i(felicia)>
  //   嵌套标签: <switch_privates(Your <adjective_penis1> (作为整体匹配)
  // 长期维护：发现新的标签格式就往这里添加新的正则
  /<[^>\n]*>/g,
];

/**
 * 从文本中提取所有标签
 * @param {string} text - 待提取的文本
 * @returns {string[]} 匹配到的标签数组
 */
function extractTags(text) {
  const tags = [];
  for (const pattern of TAG_PATTERNS) {
    // 重置正则的 lastIndex（全局匹配需要）
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      tags.push(...matches);
    }
  }
  return tags;
}

/**
 * 检查行数一致性
 * @param {string} original - 原文
 * @param {string} translation - 译文
 * @returns {object|null} 检查结果，无问题返回 null
 */
function checkLineCount(original, translation) {
  const originalLines = original.split('\n').length;
  const translationLines = translation.split('\n').length;
  
  if (originalLines !== translationLines) {
    return {
      type: 'warning',
      category: 'lineCount',
      title: '行数不一致',
      message: `译文与原文行数不一致，原文为${originalLines}行，译文为${translationLines}行`,
      details: [],
    };
  }
  return null;
}

/**
 * 检查标签一致性（缺失和多余）
 * @param {string} original - 原文
 * @param {string} translation - 译文
 * @returns {object[]} 检查结果数组
 */
function checkTags(original, translation) {
  const issues = [];
  const originalTags = extractTags(original);
  const translationTags = extractTags(translation);

  // 若原文本身没有标签，跳过检查
  if (originalTags.length === 0 && translationTags.length === 0) {
    return issues;
  }

  // 用计数器比较（处理同一标签出现多次的情况）
  const originalCount = new Map();
  const translationCount = new Map();

  for (const tag of originalTags) {
    originalCount.set(tag, (originalCount.get(tag) || 0) + 1);
  }
  for (const tag of translationTags) {
    translationCount.set(tag, (translationCount.get(tag) || 0) + 1);
  }

  // 检查缺失的标签（原文有但译文没有/数量不够）
  const missingTags = [];
  for (const [tag, count] of originalCount) {
    const tCount = translationCount.get(tag) || 0;
    for (let i = 0; i < count - tCount; i++) {
      missingTags.push(tag);
    }
  }

  // 检查多余的标签（译文有但原文没有/数量多出）
  const extraTags = [];
  for (const [tag, count] of translationCount) {
    const oCount = originalCount.get(tag) || 0;
    for (let i = 0; i < count - oCount; i++) {
      extraTags.push(tag);
    }
  }

  if (missingTags.length > 0) {
    issues.push({
      type: 'warning',
      category: 'missingTags',
      title: '缺失的Tag',
      message: `译文中缺少以下原文中存在的标签`,
      details: missingTags,
    });
  }

  if (extraTags.length > 0) {
    issues.push({
      type: 'warning',
      category: 'extraTags',
      title: '不存在的Tag',
      message: `译文中包含以下原文中不存在的标签`,
      details: extraTags,
    });
  }

  return issues;
}

/**
 * 检查首尾空白符一致性
 * @param {string} original - 原文
 * @param {string} translation - 译文
 * @returns {object|null} 检查结果
 */
function checkWhitespace(original, translation) {
  const details = [];

  // 检查前导换行
  const originalLeadingNewlines = (original.match(/^\n*/)||[''])[0].length;
  const translationLeadingNewlines = (translation.match(/^\n*/)||[''])[0].length;
  if (originalLeadingNewlines !== translationLeadingNewlines) {
    details.push(`前导换行数不同（原文${originalLeadingNewlines}个，译文${translationLeadingNewlines}个）`);
  }

  // 检查末尾换行
  const originalTrailingNewlines = (original.match(/\n*$/)||[''])[0].length;
  const translationTrailingNewlines = (translation.match(/\n*$/)||[''])[0].length;
  if (originalTrailingNewlines !== translationTrailingNewlines) {
    details.push(`末尾换行数不同（原文${originalTrailingNewlines}个，译文${translationTrailingNewlines}个）`);
  }

  // 检查前导空格
  const originalLeadingSpaces = (original.match(/^[^\S\n]*/)||[''])[0];
  const translationLeadingSpaces = (translation.match(/^[^\S\n]*/)||[''])[0];
  if (originalLeadingSpaces !== translationLeadingSpaces) {
    details.push(`前导空格不一致`);
  }

  // 检查末尾空格
  const originalTrailingSpaces = (original.match(/[^\S\n]*$/)||[''])[0];
  const translationTrailingSpaces = (translation.match(/[^\S\n]*$/)||[''])[0];
  if (originalTrailingSpaces !== translationTrailingSpaces) {
    details.push(`末尾空格不一致`);
  }

  if (details.length > 0) {
    return {
      type: 'warning',
      category: 'whitespace',
      title: '首尾空白符差异',
      message: '译文与原文的首尾空白符不一致',
      details,
    };
  }
  return null;
}

/**
 * 执行全部校验规则
 * @param {string} original - 原文
 * @param {string} translation - 译文
 * @returns {object[]} 所有检查结果的数组
 *   每项格式: { type: 'warning', category: string, title: string, message: string, details: string[] }
 */
export function validateTranslation(original, translation) {
  const issues = [];

  // 运行所有校验规则
  const lineIssue = checkLineCount(original, translation);
  if (lineIssue) issues.push(lineIssue);

  const tagIssues = checkTags(original, translation);
  issues.push(...tagIssues);

  const wsIssue = checkWhitespace(original, translation);
  if (wsIssue) issues.push(wsIssue);

  return issues;
}

// 导出内部函数用于单元测试
export const _internal = {
  extractTags,
  checkLineCount,
  checkTags,
  checkWhitespace,
  TAG_PATTERNS,
};
