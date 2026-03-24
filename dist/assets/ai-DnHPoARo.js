import{S as u}from"./storage-BQ5PE7ds.js";const g={async getModels({baseUrl:s,apiKey:r,apiFormat:d}){if(!r)throw new Error("请输入 API Key 以获取模型");if(!s)throw new Error("请输入 Base URL");const c=s.endsWith("/")?s.slice(0,-1):s;if(d==="gemini"){const t=`${c}/models?key=${r}`,e=await fetch(t);if(!e.ok){const n=await e.text();throw new Error(`Gemini 获取失败: ${e.status} - ${n}`)}return((await e.json()).models||[]).map(n=>({id:n.name.replace("models/",""),name:n.displayName||n.name.replace("models/","")}))}else{const t=`${c}/models`,e=await fetch(t,{method:"GET",headers:{Authorization:`Bearer ${r}`}});if(!e.ok){const n=await e.text();throw new Error(`获取失败: ${e.status} - ${n}`)}return(await e.json()).data||[]}},async translateSingle({original:s,terms:r=[],systemPrompt:d,suggestion:c}){const t=u.getSettings();if(!t.aiApiKey)throw new Error("未配置 AI API Key，请前往设置页修改。");const e=t.aiBaseUrl.endsWith("/")?t.aiBaseUrl.slice(0,-1):t.aiBaseUrl,l=t.aiApiFormat==="gemini";let n="";r&&r.length>0&&(n=`

请严格遵守以下游戏术语翻译:
`+r.map(o=>`- "${o.term}" 翻译为 "${o.translation}"`).join(`
`));const w=(d||t.aiPrompt||"你是一个专业翻译。")+n,$=c?`

用户对这句原文的翻译提出了特别的修改建议/要求，请在这次重新翻译中严格遵循：
【用户建议】：${c}`:"",h=`请将以下文本翻译成中文，提供4种不同风格的翻译版本。每一版翻译的结果必须直接用中文方括号【】包裹。
绝对不要添加“译文1”、“版本1”等任何多余的说明性文字，也不要在【】外附加任何文本。【】内必须且只能是翻译后的纯文本。格式示例：
【这是第一种风格的翻译结果...】
【这是第二种风格的翻译结果...】
【这是第三种风格的翻译结果...】
【这是第四种风格的翻译结果...】

原文：${s}${$}`;try{if(l){const o=t.aiModel||"gemini-1.5-pro",m=`${e}/models/${o}:generateContent?key=${t.aiApiKey}`,a=await fetch(m,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:h}]}],systemInstruction:{parts:[{text:w}]},generationConfig:{temperature:.7}})});if(!a.ok){const p=await a.text();throw new Error(`Gemini 请求失败: ${a.status} - ${p}`)}const i=await a.json();if(i.candidates&&i.candidates[0]&&i.candidates[0].content&&i.candidates[0].content.parts[0])return i.candidates[0].content.parts[0].text.trim();throw new Error("Gemini API 响应解析失败")}else{const o=`${e}/chat/completions`,m=[{role:"system",content:w},{role:"user",content:h}],a=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t.aiApiKey}`},body:JSON.stringify({model:t.aiModel||"gpt-3.5-turbo",messages:m,temperature:.7})});if(!a.ok){const p=await a.text();throw new Error(`AI 请求失败: ${a.status} - ${p}`)}return(await a.json()).choices[0].message.content.trim()}}catch(o){throw console.error("AI Translation Error:",o),o}}};export{g as AIClient};
