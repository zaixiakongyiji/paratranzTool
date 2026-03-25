const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B2wNt7Gv.js","assets/index-DF5UtTsd.css","assets/ai-C8C5Ab_V.js","assets/storage-CDYOJb6j.js"])))=>i.map(i=>d[i]);
import{_ as b}from"./index-B2wNt7Gv.js";import{Storage as k}from"./storage-CDYOJb6j.js";function f(o,n,v,e,t,i={}){const{isOptional:s=!1,hasPrompt:y=!1,hasRefCount:u=!1}=i,c=s?e[`${t}Enabled`]:!0,d=e[`${t}ApiFormat`]||e.aiApiFormat||"openai",a=e[`${t}BaseUrl`]||"",p=e[`${t}ApiKey`]||"",g=e[`${t}Model`]||"",l=y&&e[`${t}Prompt`]||"",m=u&&e[`${t}RefCount`]||3;return`
    <div class="glass-panel" style="margin-bottom: 1.2rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-panel-toggle="${o}">
        <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="${v}" style="color: var(--accent-color);"></i> ${n}
          ${s?"":'<span style="font-size: 0.7rem; background: var(--accent-color); color: #fff; padding: 1px 6px; border-radius: 4px;">必填</span>'}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          ${s?`
            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation()">
              <input type="checkbox" id="chk-${o}-enabled" ${c?"checked":""} style="accent-color: var(--accent-color); width: 16px; height: 16px;" />
              启用
            </label>
          `:""}
          <i class="fas fa-chevron-down" id="icon-${o}" style="color: var(--text-secondary); transition: transform 0.2s; font-size: 0.8rem;"></i>
        </div>
      </div>
      
      <div id="panel-${o}" style="display: ${s&&!c?"none":"block"}; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API 格式</label>
            <select id="sel-${o}-format" style="padding: 0.5rem; width: 100%;">
              <option value="openai" ${d==="openai"?"selected":""}>OpenAI 兼容</option>
              <option value="gemini" ${d==="gemini"?"selected":""}>Gemini 原生</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">模型名称</label>
            <div style="display: flex; gap: 0.4rem; position: relative;" id="model-wrapper-${o}">
              <input type="text" id="inp-${o}-model" placeholder="模型名称" value="${g}" style="flex: 1;" autocomplete="off" />
              <button type="button" class="btn" id="btn-fetch-${o}" style="padding: 0 0.6rem; white-space: nowrap; font-size: 0.8rem;" title="获取模型列表"><i class="fas fa-sync-alt"></i></button>
              <div id="dropdown-${o}" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 200px; overflow-y: auto; z-index: 1000; padding: 0.4rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Base URL</label>
          <input type="text" id="inp-${o}-url" placeholder="API 服务地址" value="${a}" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Key</label>
          <input type="password" id="inp-${o}-key" placeholder="密钥" value="${p}" />
        </div>
        
        ${u?`
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">注入参考条数</label>
            <select id="sel-${o}-refcount" style="padding: 0.5rem; width: auto;">
              ${[1,2,3,4,5].map(r=>`<option value="${r}" ${m===r?"selected":""}>${r} 条</option>`).join("")}
            </select>
          </div>
        `:""}
        
        ${y?`
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">提示词</label>
            <textarea id="inp-${o}-prompt" rows="4" style="font-size: 0.9rem;">${l}</textarea>
          </div>
        `:""}
      </div>
    </div>
  `}function $(o){const n=k.getSettings();o.innerHTML=`
    <div style="max-width: 700px; margin: 0 auto;">
      <h2 style="margin-bottom: 1.5rem;">系统设置</h2>
      
      <!-- ParaTranz Token -->
      <div class="glass-panel" style="margin-bottom: 1.2rem;">
        <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-key" style="color: var(--accent-color);"></i> ParaTranz 凭据</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="password" id="input-pt-token" placeholder="ParaTranz API Token" value="${n.ptToken||""}" />
          ${n.ptUsername?`<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${n.ptUsername}</span>`:""}
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">paratranz.cn</a> 获取。</small>
      </div>

      <!-- 翻译主模型 -->
      ${f("main","翻译主模型","fas fa-robot",{mainApiFormat:n.aiApiFormat,mainBaseUrl:n.aiBaseUrl,mainApiKey:n.aiApiKey,mainModel:n.aiModel,mainPrompt:n.aiPrompt},"main",{isOptional:!1,hasPrompt:!0})}

      <!-- 向量化模型 -->
      ${f("embed","向量化模型 (Embedding)","fas fa-project-diagram",n,"embedding",{isOptional:!0,hasRefCount:!0})}

      <!-- 过滤模型 -->
      ${f("filter","过滤模型","fas fa-filter",n,"filter",{isOptional:!0,hasPrompt:!0})}

      <!-- 重排序模型 -->
      ${f("rerank","重排序模型","fas fa-sort-amount-down",n,"rerank",{isOptional:!0})}

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
            <input type="checkbox" id="chk-qdrant-enabled" ${n.qdrantEnabled?"checked":""} />
            <span class="slider"></span>
          </label>
        </div>
        
        <div id="panel-qdrant" style="display: ${n.qdrantEnabled?"block":"none"}; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API URL</label>
              <input type="text" id="inp-qdrant-url" placeholder="如 http://localhost:6333" value="${n.qdrantUrl||"http://localhost:6333"}" style="width: 100%;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API Key (无须鉴权留空)</label>
              <input type="password" id="inp-qdrant-key" placeholder="API Key" value="${n.qdrantApiKey||""}" style="width: 100%;" />
            </div>
          </div>
        </div>
      </div>

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">保存所有设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
    </div>
  `,document.querySelectorAll("[data-panel-toggle]").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.panelToggle,i=document.getElementById(`panel-${t}`),s=document.getElementById(`icon-${t}`);i.style.display==="none"?(i.style.display="block",s.style.transform="rotate(180deg)"):(i.style.display="none",s.style.transform="rotate(0deg)")})}),["embed","filter","rerank"].forEach(e=>{const t=document.getElementById(`chk-${e}-enabled`);t&&t.addEventListener("change",()=>{const i=document.getElementById(`panel-${e}`);i.style.display=t.checked?"block":"none"})});const v=document.getElementById("chk-qdrant-enabled");v&&v.addEventListener("change",()=>{document.getElementById("panel-qdrant").style.display=v.checked?"block":"none"}),document.getElementById("btn-save-settings").addEventListener("click",async()=>{var s,y,u,c,d,a,p,g;const e=document.getElementById("btn-save-settings");e.disabled=!0,e.innerText="正在保存...";const t={ptToken:document.getElementById("input-pt-token").value.trim(),ptUsername:n.ptUsername||"",ptEmail:n.ptEmail||"",aiApiFormat:document.getElementById("sel-main-format").value,aiBaseUrl:document.getElementById("inp-main-url").value.trim(),aiApiKey:document.getElementById("inp-main-key").value.trim(),aiModel:document.getElementById("inp-main-model").value.trim(),aiPrompt:document.getElementById("inp-main-prompt").value.trim(),embeddingEnabled:((s=document.getElementById("chk-embed-enabled"))==null?void 0:s.checked)||!1,embeddingApiFormat:document.getElementById("sel-embed-format").value,embeddingBaseUrl:document.getElementById("inp-embed-url").value.trim(),embeddingApiKey:document.getElementById("inp-embed-key").value.trim(),embeddingModel:document.getElementById("inp-embed-model").value.trim(),embeddingRefCount:parseInt(((y=document.getElementById("sel-embed-refcount"))==null?void 0:y.value)||"3"),filterEnabled:((u=document.getElementById("chk-filter-enabled"))==null?void 0:u.checked)||!1,filterApiFormat:document.getElementById("sel-filter-format").value,filterBaseUrl:document.getElementById("inp-filter-url").value.trim(),filterApiKey:document.getElementById("inp-filter-key").value.trim(),filterModel:document.getElementById("inp-filter-model").value.trim(),filterPrompt:((c=document.getElementById("inp-filter-prompt"))==null?void 0:c.value.trim())||"",rerankEnabled:((d=document.getElementById("chk-rerank-enabled"))==null?void 0:d.checked)||!1,rerankApiFormat:document.getElementById("sel-rerank-format").value,rerankBaseUrl:document.getElementById("inp-rerank-url").value.trim(),rerankApiKey:document.getElementById("inp-rerank-key").value.trim(),rerankModel:document.getElementById("inp-rerank-model").value.trim(),qdrantEnabled:((a=document.getElementById("chk-qdrant-enabled"))==null?void 0:a.checked)||!1,qdrantUrl:((p=document.getElementById("inp-qdrant-url"))==null?void 0:p.value.trim())||"",qdrantApiKey:((g=document.getElementById("inp-qdrant-key"))==null?void 0:g.value.trim())||""};k.saveSettings(t);const i=document.getElementById("save-msg");i.style.display="block",setTimeout(async()=>{i.style.display="none";const{navigate:l}=await b(async()=>{const{navigate:m}=await import("./index-B2wNt7Gv.js").then(r=>r.r);return{navigate:m}},__vite__mapDeps([0,1]));l("/settings")},1e3),e.disabled=!1,e.innerText="保存所有设置"}),["main","embed","filter","rerank"].forEach(e=>{const t=document.getElementById(`btn-fetch-${e}`);t&&t.addEventListener("click",async()=>{const i=document.getElementById(`inp-${e}-url`).value.trim(),s=document.getElementById(`inp-${e}-key`).value.trim(),y=document.getElementById(`sel-${e}-format`).value;if(!i||!s){const{showToast:c}=await b(async()=>{const{showToast:d}=await import("./toast-_A8NGhfi.js");return{showToast:d}},[]);c("请先填写该面板的 Base URL 和 API Key","warning");return}const u=t.innerHTML;t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i>';try{const{AIClient:c}=await b(async()=>{const{AIClient:a}=await import("./ai-C8C5Ab_V.js");return{AIClient:a}},__vite__mapDeps([2,3])),d=await c.getModels({baseUrl:i,apiKey:s,apiFormat:y});if(Array.isArray(d)){const a=document.getElementById(`dropdown-${e}`),p=document.getElementById(`inp-${e}-model`);a.innerHTML="",d.forEach(l=>{const m=l.id||l.name||(typeof l=="string"?l:JSON.stringify(l)),r=document.createElement("div");r.style.cssText="padding: 0.5rem 0.8rem; cursor: pointer; transition: background 0.2s; font-size: 0.85rem;",r.innerText=m,r.onmouseenter=()=>r.style.background="var(--bg-surface-hover)",r.onmouseleave=()=>r.style.background="transparent",r.onclick=()=>{p.value=m,a.style.display="none"},a.appendChild(r)}),p.onfocus=()=>{a.children.length>0&&(a.style.display="block")},p.oninput=()=>{const l=p.value.toLowerCase();let m=!1;Array.from(a.children).forEach(r=>{const h=r.innerText.toLowerCase().includes(l);r.style.display=h?"block":"none",h&&(m=!0)}),a.style.display=m?"block":"none"},document.addEventListener("click",l=>{const m=document.getElementById(`model-wrapper-${e}`);m&&!m.contains(l.target)&&(a.style.display="none")}),a.style.display="block",p.focus();const{showToast:g}=await b(async()=>{const{showToast:l}=await import("./toast-_A8NGhfi.js");return{showToast:l}},[]);g(`已获取 ${d.length} 个模型，可输入筛选`,"success")}}catch(c){const{showToast:d}=await b(async()=>{const{showToast:a}=await import("./toast-_A8NGhfi.js");return{showToast:a}},[]);d("获取失败: "+c.message,"error")}finally{t.disabled=!1,t.innerHTML=u}})})}export{$ as render};
