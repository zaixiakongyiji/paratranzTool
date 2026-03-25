import{Storage as y}from"./storage-CDYOJb6j.js";const A={async getModels({baseUrl:r,apiKey:i,apiFormat:h}){if(!i)throw new Error("请输入 API Key 以获取模型");if(!r)throw new Error("请输入 Base URL");const l=r.endsWith("/")?r.slice(0,-1):r;if(h==="gemini"){const n=`${l}/models?key=${i}`,e=await fetch(n);if(!e.ok){const a=await e.text();throw new Error(`Gemini 获取失败: ${e.status} - ${a}`)}return((await e.json()).models||[]).map(a=>({id:a.name.replace("models/",""),name:a.displayName||a.name.replace("models/","")}))}else{let n=l;n.endsWith("/embeddings")&&(n=n.slice(0,-11)),n.endsWith("/rerank")&&(n=n.slice(0,-7)),n.endsWith("/")&&(n=n.slice(0,-1));const e=`${n}/models`,o=await fetch(e,{method:"GET",headers:{Authorization:`Bearer ${i}`}});if(!o.ok){const m=await o.text();throw new Error(`获取失败: ${o.status} - ${m}`)}return(await o.json()).data||[]}},async translateSingle({original:r,terms:i=[],systemPrompt:h,suggestion:l,references:n}){const e=y.getSettings();if(!e.aiApiKey)throw new Error("未配置 AI API Key，请前往设置页修改。");const o=e.aiBaseUrl.endsWith("/")?e.aiBaseUrl.slice(0,-1):e.aiBaseUrl,a=e.aiApiFormat==="gemini";let m="";i&&i.length>0&&(m=`

请严格遵守以下游戏术语翻译:
`+i.map(t=>`- "${t.term}" 翻译为 "${t.translation}"`).join(`
`));let p="";n&&n.length>0&&(p=`

以下是该项目中相似内容的历史翻译参考，请保持风格一致：
`+n.map((t,d)=>`${d+1}. "${t.original.substring(0,150)}" → "${t.translation.substring(0,150)}"`).join(`
`));const w=(h||e.aiPrompt||"你是一个专业翻译。")+m+p,g=l?`

用户对这句原文的翻译提出了特别的修改建议/要求，请在这次重新翻译中严格遵循：
【用户建议】：${l}`:"",f=`请将以下文本翻译成中文，提供4种不同风格的翻译版本。每一版翻译的结果必须直接用中文方括号【】包裹。
绝对不要添加“译文1”、“版本1”等任何多余的说明性文字，也不要在【】外附加任何文本。【】内必须且只能是翻译后的纯文本。
【重要格式要求】：
1. 务必严格保留原文中的所有换行符（如多次回车换行）以及特殊排版标记，直接将换行对应到译文中，绝对不要擅自合并段落！
2. 务必严格保留原文中的引号格式：如果原文使用了半角双引号 "" 或单引号 ''，译文中也必须使用相同的半角引号，绝对不要将其自动替换为中文全角引号 “” 或 ‘’！

格式示例：
【这是第一种风格的翻译结果...】
【这是第二种风格的翻译结果...】
【这是第三种风格的翻译结果...】
【这是第四种风格的翻译结果...】

原文：${r}${g}`;try{if(a){const t=e.aiModel||"gemini-1.5-pro",d=`${o}/models/${t}:generateContent?key=${e.aiApiKey}`,c=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:f}]}],systemInstruction:{parts:[{text:w}]},generationConfig:{temperature:.7}})});if(!c.ok){const $=await c.text();throw new Error(`Gemini 请求失败: ${c.status} - ${$}`)}const s=await c.json();if(s.candidates&&s.candidates[0]&&s.candidates[0].content&&s.candidates[0].content.parts[0])return s.candidates[0].content.parts[0].text.trim();throw new Error("Gemini API 响应解析失败")}else{let t=o;t.endsWith("/embeddings")&&(t=t.slice(0,-11)),t.endsWith("/rerank")&&(t=t.slice(0,-7)),t.endsWith("/")&&(t=t.slice(0,-1));const d=`${t}/chat/completions`,c=[{role:"system",content:w},{role:"user",content:f}],s=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.aiApiKey}`},body:JSON.stringify({model:e.aiModel||"gpt-3.5-turbo",messages:c,temperature:.7})});if(!s.ok){const u=await s.text();throw new Error(`AI 请求失败: ${s.status} - ${u}`)}return(await s.json()).choices[0].message.content.trim()}}catch(t){throw console.error("AI Translation Error:",t),t}}};export{A as AIClient};
