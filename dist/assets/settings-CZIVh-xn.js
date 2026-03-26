const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vectorStore-BwS8jpvf.js","assets/index-LDMxwuiV.js","assets/index-DHAYdvpI.css","assets/storage-CDYOJb6j.js","assets/ai-C8C5Ab_V.js"])))=>i.map(i=>d[i]);
import{_ as u}from"./index-LDMxwuiV.js";import{Storage as E}from"./storage-CDYOJb6j.js";function h(l,a,f,i,e,t={}){const{isOptional:n=!1,hasPrompt:o=!1,hasRefCount:g=!1}=t,v=n?i[`${e}Enabled`]:!0,p=i[`${e}ApiFormat`]||i.aiApiFormat||"openai",m=i[`${e}BaseUrl`]||"",r=i[`${e}ApiKey`]||"",y=i[`${e}Model`]||"",b=o&&i[`${e}Prompt`]||"",s=g&&i[`${e}RefCount`]||3;return`
    <div class="glass-panel" style="margin-bottom: 1.2rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-panel-toggle="${l}">
        <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="${f}" style="color: var(--accent-color);"></i> ${a}
          ${n?"":'<span style="font-size: 0.7rem; background: var(--accent-color); color: #fff; padding: 1px 6px; border-radius: 4px;">必填</span>'}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          ${n?`
            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation()">
              <input type="checkbox" id="chk-${l}-enabled" ${v?"checked":""} style="accent-color: var(--accent-color); width: 16px; height: 16px;" />
              启用
            </label>
          `:""}
          <i class="fas fa-chevron-down" id="icon-${l}" style="color: var(--text-secondary); transition: transform 0.2s; font-size: 0.8rem;"></i>
        </div>
      </div>
      
      <div id="panel-${l}" style="display: ${n&&!v?"none":"block"}; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API 格式</label>
            <select id="sel-${l}-format" style="padding: 0.5rem; width: 100%;">
              <option value="openai" ${p==="openai"?"selected":""}>OpenAI 兼容</option>
              <option value="gemini" ${p==="gemini"?"selected":""}>Gemini 原生</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">模型名称</label>
            <div style="display: flex; gap: 0.4rem; position: relative;" id="model-wrapper-${l}">
              <input type="text" id="inp-${l}-model" placeholder="模型名称" value="${y}" style="flex: 1;" autocomplete="off" />
              <button type="button" class="btn" id="btn-fetch-${l}" style="padding: 0 0.6rem; white-space: nowrap; font-size: 0.8rem;" title="获取模型列表"><i class="fas fa-sync-alt"></i></button>
              <div id="dropdown-${l}" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 200px; overflow-y: auto; z-index: 1000; padding: 0.4rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Base URL</label>
          <input type="text" id="inp-${l}-url" placeholder="API 服务地址" value="${m}" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Key</label>
          <input type="password" id="inp-${l}-key" placeholder="密钥" value="${r}" />
        </div>
        
        ${g?`
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">注入参考条数</label>
            <select id="sel-${l}-refcount" style="padding: 0.5rem; width: auto;">
              ${[1,2,3,4,5].map(d=>`<option value="${d}" ${s===d?"selected":""}>${d} 条</option>`).join("")}
            </select>
          </div>
        `:""}
        
        ${o?`
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">提示词</label>
            <textarea id="inp-${l}-prompt" rows="4" style="font-size: 0.9rem;">${b}</textarea>
          </div>
        `:""}
      </div>
    </div>
  `}function $(l){const a=E.getSettings();l.innerHTML=`
    <div style="flex: 1; overflow-y: auto; padding-bottom: 2rem;">
      <div style="max-width: 700px; margin: 0 auto;">
        <h2 style="margin-bottom: 1.5rem;">系统设置</h2>
      
      <!-- ParaTranz Token -->
      <div class="glass-panel" style="margin-bottom: 1.2rem;">
        <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-key" style="color: var(--accent-color);"></i> ParaTranz 凭据</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="password" id="input-pt-token" placeholder="ParaTranz API Token" value="${a.ptToken||""}" />
          ${a.ptUsername?`<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${a.ptUsername}</span>`:""}
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">paratranz.cn</a> 获取。</small>
      </div>

      <!-- 翻译主模型 -->
      ${h("main","翻译主模型","fas fa-robot",{mainApiFormat:a.aiApiFormat,mainBaseUrl:a.aiBaseUrl,mainApiKey:a.aiApiKey,mainModel:a.aiModel,mainPrompt:a.aiPrompt},"main",{isOptional:!1,hasPrompt:!0})}

      <!-- 向量化模型 -->
      ${h("embed","向量化模型 (Embedding)","fas fa-project-diagram",a,"embedding",{isOptional:!0,hasRefCount:!0})}

      <!-- 过滤模型 -->
      ${h("filter","过滤模型","fas fa-filter",a,"filter",{isOptional:!0,hasPrompt:!0})}

      <!-- 重排序模型 -->
      ${h("rerank","重排序模型","fas fa-sort-amount-down",a,"rerank",{isOptional:!0})}

      <!-- 数据库存储介质配置 -->
      <div style="margin-top: 2rem; margin-bottom: 0.8rem;">
        <h2 style="margin: 0; font-size: 1.2rem;">🗄️ 向量数据库存储介质</h2>
        <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">IndexedDB 存在本地浏览器（适合轻量使用），Qdrant 为专业外置服务（适合团队或重度使用）。</p>
      </div>
      <div class="glass-panel" style="padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid var(--accent-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600;">启用 Qdrant 专业版引擎</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">开启后每次检索与语料同步均采用 Payload 与 projectId 严格隔离的方式存入 Qdrant</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="chk-qdrant-enabled" ${a.qdrantEnabled?"checked":""} />
            <span class="slider"></span>
          </label>
        </div>
        
        <div id="panel-qdrant" style="display: ${a.qdrantEnabled?"block":"none"}; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API URL</label>
              <input type="text" id="inp-qdrant-url" placeholder="如 http://localhost:6333" value="${a.qdrantUrl||"http://localhost:6333"}" style="width: 100%;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API Key (无须鉴权留空)</label>
              <input type="password" id="inp-qdrant-key" placeholder="API Key" value="${a.qdrantApiKey||""}" style="width: 100%;" />
            </div>
          </div>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end;">
            <button id="btn-reset-qdrant" class="btn btn-sm" style="background: none; border: 1px solid var(--danger-color); color: var(--danger-color);" title="当更换 Embedding 模型导致维度报错时，使用此功能清空远端集合并重置本地状态">
              <i class="fas fa-exclamation-triangle"></i> 重置 Qdrant 架构
            </button>
          </div>
        </div>
      </div>

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">保存所有设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
      </div>
    </div>
  `,document.querySelectorAll("[data-panel-toggle]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.panelToggle,n=document.getElementById(`panel-${t}`),o=document.getElementById(`icon-${t}`);n.style.display==="none"?(n.style.display="block",o.style.transform="rotate(180deg)"):(n.style.display="none",o.style.transform="rotate(0deg)")})}),["embed","filter","rerank"].forEach(e=>{const t=document.getElementById(`chk-${e}-enabled`);t&&t.addEventListener("change",()=>{const n=document.getElementById(`panel-${e}`);n.style.display=t.checked?"block":"none"})});const f=document.getElementById("chk-qdrant-enabled");f&&f.addEventListener("change",()=>{document.getElementById("panel-qdrant").style.display=f.checked?"block":"none"});const i=document.getElementById("btn-reset-qdrant");i&&i.addEventListener("click",async()=>{if(confirm(`【警告：不可逆操作】
检测到向量维度冲突或更换模型时，需要执行此重置。
操作将：
1. 永久删除 Qdrant 上的 paratranz_rag 集合(包含所有项目数据)；
2. 重置本地所有词条的“已向量化”标记。

是否继续？`)){i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> 正在重置...';try{const{VectorStore:t}=await u(async()=>{const{VectorStore:o}=await import("./vectorStore-BwS8jpvf.js");return{VectorStore:o}},__vite__mapDeps([0,1,2,3]));await t.resetQdrantCollection();const{showToast:n}=await u(async()=>{const{showToast:o}=await import("./toast-_A8NGhfi.js");return{showToast:o}},[]);n("Qdrant 架构与本地状态已成功重置！","success"),setTimeout(()=>{location.reload()},1500)}catch(t){console.error(t);const{showToast:n}=await u(async()=>{const{showToast:o}=await import("./toast-_A8NGhfi.js");return{showToast:o}},[]);n("重置失败: "+t.message,"error"),i.disabled=!1,i.innerHTML='<i class="fas fa-exclamation-triangle"></i> 重置 Qdrant 架构'}}}),document.getElementById("btn-save-settings").addEventListener("click",async()=>{var o,g,v,p,m,r,y,b;const e=document.getElementById("btn-save-settings");e.disabled=!0,e.innerText="正在保存...";const t={ptToken:document.getElementById("input-pt-token").value.trim(),ptUsername:a.ptUsername||"",ptEmail:a.ptEmail||"",aiApiFormat:document.getElementById("sel-main-format").value,aiBaseUrl:document.getElementById("inp-main-url").value.trim(),aiApiKey:document.getElementById("inp-main-key").value.trim(),aiModel:document.getElementById("inp-main-model").value.trim(),aiPrompt:document.getElementById("inp-main-prompt").value.trim(),embeddingEnabled:((o=document.getElementById("chk-embed-enabled"))==null?void 0:o.checked)||!1,embeddingApiFormat:document.getElementById("sel-embed-format").value,embeddingBaseUrl:document.getElementById("inp-embed-url").value.trim(),embeddingApiKey:document.getElementById("inp-embed-key").value.trim(),embeddingModel:document.getElementById("inp-embed-model").value.trim(),embeddingRefCount:parseInt(((g=document.getElementById("sel-embed-refcount"))==null?void 0:g.value)||"3"),filterEnabled:((v=document.getElementById("chk-filter-enabled"))==null?void 0:v.checked)||!1,filterApiFormat:document.getElementById("sel-filter-format").value,filterBaseUrl:document.getElementById("inp-filter-url").value.trim(),filterApiKey:document.getElementById("inp-filter-key").value.trim(),filterModel:document.getElementById("inp-filter-model").value.trim(),filterPrompt:((p=document.getElementById("inp-filter-prompt"))==null?void 0:p.value.trim())||"",rerankEnabled:((m=document.getElementById("chk-rerank-enabled"))==null?void 0:m.checked)||!1,rerankApiFormat:document.getElementById("sel-rerank-format").value,rerankBaseUrl:document.getElementById("inp-rerank-url").value.trim(),rerankApiKey:document.getElementById("inp-rerank-key").value.trim(),rerankModel:document.getElementById("inp-rerank-model").value.trim(),qdrantEnabled:((r=document.getElementById("chk-qdrant-enabled"))==null?void 0:r.checked)||!1,qdrantUrl:((y=document.getElementById("inp-qdrant-url"))==null?void 0:y.value.trim())||"",qdrantApiKey:((b=document.getElementById("inp-qdrant-key"))==null?void 0:b.value.trim())||""};E.saveSettings(t);const n=document.getElementById("save-msg");n.style.display="block",setTimeout(async()=>{n.style.display="none";const{navigate:s}=await u(async()=>{const{navigate:d}=await import("./index-LDMxwuiV.js").then(c=>c.r);return{navigate:d}},__vite__mapDeps([1,2]));s("/settings")},1e3),e.disabled=!1,e.innerText="保存所有设置"}),["main","embed","filter","rerank"].forEach(e=>{const t=document.getElementById(`btn-fetch-${e}`);t&&t.addEventListener("click",async()=>{const n=document.getElementById(`inp-${e}-url`).value.trim(),o=document.getElementById(`inp-${e}-key`).value.trim(),g=document.getElementById(`sel-${e}-format`).value;if(!n||!o){const{showToast:p}=await u(async()=>{const{showToast:m}=await import("./toast-_A8NGhfi.js");return{showToast:m}},[]);p("请先填写该面板的 Base URL 和 API Key","warning");return}const v=t.innerHTML;t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>';try{const{AIClient:p}=await u(async()=>{const{AIClient:r}=await import("./ai-C8C5Ab_V.js");return{AIClient:r}},__vite__mapDeps([4,3])),m=await p.getModels({baseUrl:n,apiKey:o,apiFormat:g});if(Array.isArray(m)){const r=document.getElementById(`dropdown-${e}`),y=document.getElementById(`inp-${e}-model`);r.innerHTML="",m.forEach(s=>{const d=s.id||s.name||(typeof s=="string"?s:JSON.stringify(s)),c=document.createElement("div");c.style.cssText="padding: 0.5rem 0.8rem; cursor: pointer; transition: background 0.2s; font-size: 0.85rem;",c.innerText=d,c.onmouseenter=()=>c.style.background="var(--bg-surface-hover)",c.onmouseleave=()=>c.style.background="transparent",c.onclick=()=>{y.value=d,r.style.display="none"},r.appendChild(c)}),y.onfocus=()=>{r.children.length>0&&(r.style.display="block")},y.oninput=()=>{const s=y.value.toLowerCase();let d=!1;Array.from(r.children).forEach(c=>{const k=c.innerText.toLowerCase().includes(s);c.style.display=k?"block":"none",k&&(d=!0)}),r.style.display=d?"block":"none"},document.addEventListener("click",s=>{const d=document.getElementById(`model-wrapper-${e}`);d&&!d.contains(s.target)&&(r.style.display="none")}),r.style.display="block",y.focus();const{showToast:b}=await u(async()=>{const{showToast:s}=await import("./toast-_A8NGhfi.js");return{showToast:s}},[]);b(`已获取 ${m.length} 个模型，可输入筛选`,"success")}}catch(p){const{showToast:m}=await u(async()=>{const{showToast:r}=await import("./toast-_A8NGhfi.js");return{showToast:r}},[]);m("获取失败: "+p.message,"error")}finally{t.disabled=!1,t.innerHTML=v}})})}export{$ as render};
