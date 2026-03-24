const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/paratranz-BehdmDyJ.js","assets/storage-BQ5PE7ds.js","assets/index-C_T7Xp4D.js","assets/index-DF5UtTsd.css","assets/ai-DnHPoARo.js"])))=>i.map(i=>d[i]);
import{_ as c}from"./index-C_T7Xp4D.js";import{S as u}from"./storage-BQ5PE7ds.js";function w(v){const t=u.getSettings();v.innerHTML=`
    <div class="glass-panel" style="max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 2rem;">系统设置</h2>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          ParaTranz API Token
        </label>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="password" id="input-pt-token" placeholder="你的 ParaTranz 身份验证 token" value="${t.ptToken||""}" />
          ${t.ptUsername?`<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${t.ptUsername}</span>`:""}
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">此凭据用于访问你在 ParaTranz 上的项目和词条。在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">https://paratranz.cn/users/my</a> 设置处获取。</small>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 接口通信格式
        </label>
        <select id="select-ai-format" style="padding: 0.6rem;">
          <option value="openai" ${!t.aiApiFormat||t.aiApiFormat==="openai"?"selected":""}>OpenAI 兼容格式</option>
          <option value="gemini" ${t.aiApiFormat==="gemini"?"selected":""}>Google Gemini 原生格式</option>
        </select>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">如果你使用 DeepSeek、通义千问等中转 API 或硅基流动，通常选择 OpenAI 兼容格式。</small>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 接口服务地址 (Base URL)
        </label>
        <input type="text" id="input-ai-url" placeholder="如 https://api.openai.com/v1" value="${t.aiBaseUrl||""}" />
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI API Key
        </label>
        <input type="password" id="input-ai-key" placeholder="你的 AI 密钥" value="${t.aiApiKey||""}" />
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 模型名称
        </label>
        <div style="display: flex; gap: 0.5rem; position: relative;">
          <div style="flex: 1; position: relative;" id="model-input-wrapper">
            <input type="text" id="input-ai-model" placeholder="如 gpt-3.5-turbo (点右获取或输入筛选)" value="${t.aiModel||""}" style="width: 100%;" autocomplete="off" />
            
            <!-- 自定义下拉列表 -->
            <div id="model-dropdown" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 250px; overflow-y: auto; z-index: 1000; padding: 0.5rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            </div>
          </div>
          <button id="btn-fetch-models" type="button" class="btn" style="white-space: nowrap;"><i class="fas fa-sync-alt"></i> 获取列表</button>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          全局系统提示词 (System Prompt)
        </label>
        <textarea id="input-ai-prompt" rows="10" placeholder="你是一个专业游戏翻译，请将以下文本翻译为简体中文。请参考提供的术语表。">${t.aiPrompt||""}</textarea>
      </div>

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%;">保存设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
    </div>
  `,document.getElementById("btn-save-settings").addEventListener("click",async()=>{const o=document.getElementById("btn-save-settings");o.disabled=!0,o.innerText="正在保存并验证 Token...";const i={ptToken:document.getElementById("input-pt-token").value.trim(),ptUsername:t.ptUsername||"",ptEmail:t.ptEmail||"",aiApiFormat:document.getElementById("select-ai-format").value,aiBaseUrl:document.getElementById("input-ai-url").value.trim(),aiApiKey:document.getElementById("input-ai-key").value.trim(),aiModel:document.getElementById("input-ai-model").value.trim(),aiPrompt:document.getElementById("input-ai-prompt").value.trim()};u.saveSettings(i);try{if(i.ptToken){const{paraTranzApi:m}=await c(async()=>{const{paraTranzApi:d}=await import("./paratranz-BehdmDyJ.js");return{paraTranzApi:d}},__vite__mapDeps([0,1])),r=await m.getProfile();r&&(i.ptUsername=r.username||r.name||i.ptUsername,i.ptEmail=r.email||i.ptEmail,u.saveSettings(i))}const s=document.getElementById("save-msg");s.style.display="block",setTimeout(async()=>{s.style.display="none";const{navigate:m}=await c(async()=>{const{navigate:r}=await import("./index-C_T7Xp4D.js").then(d=>d.r);return{navigate:r}},__vite__mapDeps([2,3]));m("/settings")},1e3)}catch(s){alert("配置已部分保存，但在验证 Token 时发生网络错误: "+s.message)}finally{o.disabled=!1,o.innerText="保存设置"}}),document.getElementById("btn-fetch-models").addEventListener("click",async()=>{const o=document.getElementById("btn-fetch-models"),i=document.getElementById("input-ai-url").value.trim(),s=document.getElementById("input-ai-key").value.trim(),m=document.getElementById("select-ai-format").value;if(!i||!s){alert("请先填写并确保上方的 '服务地址 (Base URL)' 和 'API Key' 均不为空。");return}const r=o.innerHTML;o.disabled=!0,o.innerHTML="获取中...";try{const{AIClient:d}=await c(async()=>{const{AIClient:e}=await import("./ai-DnHPoARo.js");return{AIClient:e}},__vite__mapDeps([4,1])),p=await d.getModels({baseUrl:i,apiKey:s,apiFormat:m});if(Array.isArray(p)){const e=document.getElementById("model-dropdown");e.innerHTML="",p.forEach(a=>{const l=a.id||a.name||(typeof a=="string"?a:JSON.stringify(a)),n=document.createElement("div");n.style.cssText="padding: 0.6rem 1rem; cursor: pointer; transition: background 0.2s; font-size: 0.95rem;",n.innerText=l,n.onmouseenter=()=>n.style.background="var(--bg-surface-hover)",n.onmouseleave=()=>n.style.background="transparent",n.onclick=()=>{document.getElementById("input-ai-model").value=l,e.style.display="none"},e.appendChild(n)});const y=document.getElementById("input-ai-model");y.onfocus=()=>{e.children.length>0&&(e.style.display="block")},y.oninput=()=>{const a=y.value.toLowerCase();let l=!1;Array.from(e.children).forEach(n=>{const g=n.innerText.toLowerCase().includes(a);n.style.display=g?"block":"none",g&&(l=!0)}),e.style.display=l?"block":"none"},document.addEventListener("click",a=>{const l=document.getElementById("model-input-wrapper");l&&!l.contains(a.target)&&(e.style.display="none")},{once:!1}),e.style.display="block",y.focus();const{showToast:b}=await c(async()=>{const{showToast:a}=await import("./toast-_A8NGhfi.js");return{showToast:a}},[]);b("模型列表获取成功，可在输入框中键入筛选。","success")}else throw new Error("未知的模型列表数据格式返回")}catch(d){const{showToast:p}=await c(async()=>{const{showToast:e}=await import("./toast-_A8NGhfi.js");return{showToast:e}},[]);p(d.message,"error")}finally{o.disabled=!1,o.innerHTML=r}})}export{w as render};
