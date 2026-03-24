import { Storage } from '../utils/storage.js';

export const AIClient = {
  async getModels({ baseUrl, apiKey, apiFormat }) {
    if (!apiKey) throw new Error('请输入 API Key 以获取模型');
    if (!baseUrl) throw new Error('请输入 Base URL');
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    if (apiFormat === 'gemini') {
      // Gemini 原生格式：通过 URL 参数传递 key
      const url = `${base}/models?key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gemini 获取失败: ${response.status} - ${text}`);
      }
      const data = await response.json();
      // Gemini 返回 { models: [{ name: 'models/gemini-xxx', ... }] }
      return (data.models || []).map(m => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name.replace('models/', '')
      }));
    } else {
      // OpenAI 兼容格式
      const url = `${base}/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`获取失败: ${response.status} - ${text}`);
      }
      const data = await response.json();
      return data.data || [];
    }
  },

  async translateSingle({ original, terms = [], systemPrompt, suggestion }) {
    const settings = Storage.getSettings();
    if (!settings.aiApiKey) throw new Error('未配置 AI API Key，请前往设置页修改。');

    const baseUrl = settings.aiBaseUrl.endsWith('/') ? settings.aiBaseUrl.slice(0, -1) : settings.aiBaseUrl;
    const isGemini = settings.aiApiFormat === 'gemini';

    let termContext = '';
    if (terms && terms.length > 0) {
      termContext = "\n\n请严格遵守以下游戏术语翻译:\n" + 
        terms.map(t => `- "${t.term}" 翻译为 "${t.translation}"`).join("\n");
    }

    const finalSystemPrompt = (systemPrompt || settings.aiPrompt || "你是一个专业翻译。") + termContext;
    const suggestionText = suggestion ? `\n\n用户对这句原文的翻译提出了特别的修改建议/要求，请在这次重新翻译中严格遵循：\n【用户建议】：${suggestion}` : '';
    
    const userPrompt = `请将以下文本翻译成中文，提供4种不同风格的翻译版本。每一版翻译的结果必须直接用中文方括号【】包裹。
绝对不要添加“译文1”、“版本1”等任何多余的说明性文字，也不要在【】外附加任何文本。【】内必须且只能是翻译后的纯文本。格式示例：
【这是第一种风格的翻译结果...】
【这是第二种风格的翻译结果...】
【这是第三种风格的翻译结果...】
【这是第四种风格的翻译结果...】

原文：${original}${suggestionText}`;

    try {
      if (isGemini) {
        const model = settings.aiModel || 'gemini-1.5-pro';
        const url = `${baseUrl}/models/${model}:generateContent?key=${settings.aiApiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: finalSystemPrompt }] },
            generationConfig: { temperature: 0.7 }
          })
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Gemini 请求失败: ${response.status} - ${err}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          return data.candidates[0].content.parts[0].text.trim();
        } else {
          throw new Error('Gemini API 响应解析失败');
        }
      } else {
        const url = `${baseUrl}/chat/completions`;
        const messages = [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userPrompt }
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.aiApiKey}`
          },
          body: JSON.stringify({
            model: settings.aiModel || 'gpt-3.5-turbo',
            messages,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`AI 请求失败: ${response.status} - ${err}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
      }
    } catch (error) {
      console.error("AI Translation Error:", error);
      throw error;
    }
  }
};
