const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/paratranz-CmxxXTVm.js","assets/storage-gCDr8-fQ.js","assets/index-CR5PaB1c.js","assets/index-DF5UtTsd.css","assets/ai-OpbjDDFA.js"])))=>i.map(i=>d[i]);
import{_ as v}from"./index-CR5PaB1c.js";import{Storage as h}from"./storage-gCDr8-fQ.js";function b(o,r,t,e,a,c={}){const{isOptional:y=!1,hasPrompt:u=!1,hasRefCount:m=!1}=c,l=y?e[`${a}Enabled`]:!0,n=e[`${a}ApiFormat`]||e.aiApiFormat||"openai",i=e[`${a}BaseUrl`]||"",g=e[`${a}ApiKey`]||"",s=e[`${a}Model`]||"",p=u&&e[`${a}Prompt`]||"",d=m&&e[`${a}RefCount`]||3;return`
    <div class="glass-panel" style="margin-bottom: 1.2rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-panel-toggle="${o}">
        <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="${t}" style="color: var(--accent-color);"></i> ${r}
          ${y?"":'<span style="font-size: 0.7rem; background: var(--accent-color); color: #fff; padding: 1px 6px; border-radius: 4px;">必填</span>'}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          ${y?`
            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation()">
              <input type="checkbox" id="chk-${o}-enabled" ${l?"checked":""} style="accent-color: var(--accent-color); width: 16px; height: 16px;" />
              启用
            </label>
          `:""}
          <i class="fas fa-chevron-down" id="icon-${o}" style="color: var(--text-secondary); transition: transform 0.2s; font-size: 0.8rem;"></i>
        </div>
      </div>
      
      <div id="panel-${o}" style="display: ${y&&!l?"none":"block"}; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API 格式</label>
            <select id="sel-${o}-format" style="padding: 0.5rem; width: 100%;">
              <option value="openai" ${n==="openai"?"selected":""}>OpenAI 兼容</option>
              <option value="gemini" ${n==="gemini"?"selected":""}>Gemini 原生</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">模型名称</label>
            <div style="display: flex; gap: 0.4rem; position: relative;" id="model-wrapper-${o}">
              <input type="text" id="inp-${o}-model" placeholder="模型名称" value="${s}" style="flex: 1;" autocomplete="off" />
              <button type="button" class="btn" id="btn-fetch-${o}" style="padding: 0 0.6rem; white-space: nowrap; font-size: 0.8rem;" title="获取模型列表"><i class="fas fa-sync-alt"></i></button>
              <div id="dropdown-${o}" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 200px; overflow-y: auto; z-index: 1000; padding: 0.4rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Base URL</label>
          <input type="text" id="inp-${o}-url" placeholder="API 服务地址" value="${i}" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Key</label>
          <input type="password" id="inp-${o}-key" placeholder="密钥" value="${g}" />
        </div>
        
        ${m?`
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">注入参考条数</label>
            <select id="sel-${o}-refcount" style="padding: 0.5rem; width: auto;">
              ${[1,2,3,4,5].map(f=>`<option value="${f}" ${d===f?"selected":""}>${f} 条</option>`).join("")}
            </select>
          </div>
        `:""}
        
        ${u?`
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">提示词</label>
            <textarea id="inp-${o}-prompt" rows="4" style="font-size: 0.9rem;">${p}</textarea>
          </div>
        `:""}
      </div>
    </div>
  `}function $(o){const r=h.getSettings();o.innerHTML=`
    <div style="max-width: 700px; margin: 0 auto;">
      <h2 style="margin-bottom: 1.5rem;">系统设置</h2>
      
      <!-- ParaTranz Token -->
      <div class="glass-panel" style="margin-bottom: 1.2rem;">
        <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-key" style="color: var(--accent-color);"></i> ParaTranz 凭据</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="password" id="input-pt-token" placeholder="ParaTranz API Token" value="${r.ptToken||""}" />
          ${r.ptUsername?`<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${r.ptUsername}</span>`:""}
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">paratranz.cn</a> 获取。</small>
      </div>

      <!-- 翻译主模型 -->
      ${b("main","翻译主模型","fas fa-robot",{mainApiFormat:r.aiApiFormat,mainBaseUrl:r.aiBaseUrl,mainApiKey:r.aiApiKey,mainModel:r.aiModel,mainPrompt:r.aiPrompt},"main",{isOptional:!1,hasPrompt:!0})}

      <!-- 向量化模型 -->
      ${b("embed","向量化模型 (Embedding)","fas fa-project-diagram",r,"embedding",{isOptional:!0,hasRefCount:!0})}

      <!-- 过滤模型 -->
      ${b("filter","过滤模型","fas fa-filter",r,"filter",{isOptional:!0,hasPrompt:!0})}

      <!-- 重排序模型 -->
      ${b("rerank","重排序模型","fas fa-sort-amount-down",r,"rerank",{isOptional:!0})}

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">保存所有设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
    </div>
  `,document.querySelectorAll("[data-panel-toggle]").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.panelToggle,a=document.getElementById(`panel-${e}`),c=document.getElementById(`icon-${e}`);a.style.display==="none"?(a.style.display="block",c.style.transform="rotate(180deg)"):(a.style.display="none",c.style.transform="rotate(0deg)")})}),["embed","filter","rerank"].forEach(t=>{const e=document.getElementById(`chk-${t}-enabled`);e&&e.addEventListener("change",()=>{const a=document.getElementById(`panel-${t}`);a.style.display=e.checked?"block":"none"})}),document.getElementById("btn-save-settings").addEventListener("click",async()=>{var a,c,y,u,m;const t=document.getElementById("btn-save-settings");t.disabled=!0,t.innerText="正在保存...";const e={ptToken:document.getElementById("input-pt-token").value.trim(),ptUsername:r.ptUsername||"",ptEmail:r.ptEmail||"",aiApiFormat:document.getElementById("sel-main-format").value,aiBaseUrl:document.getElementById("inp-main-url").value.trim(),aiApiKey:document.getElementById("inp-main-key").value.trim(),aiModel:document.getElementById("inp-main-model").value.trim(),aiPrompt:document.getElementById("inp-main-prompt").value.trim(),embeddingEnabled:((a=document.getElementById("chk-embed-enabled"))==null?void 0:a.checked)||!1,embeddingApiFormat:document.getElementById("sel-embed-format").value,embeddingBaseUrl:document.getElementById("inp-embed-url").value.trim(),embeddingApiKey:document.getElementById("inp-embed-key").value.trim(),embeddingModel:document.getElementById("inp-embed-model").value.trim(),embeddingRefCount:parseInt(((c=document.getElementById("sel-embed-refcount"))==null?void 0:c.value)||"3"),filterEnabled:((y=document.getElementById("chk-filter-enabled"))==null?void 0:y.checked)||!1,filterApiFormat:document.getElementById("sel-filter-format").value,filterBaseUrl:document.getElementById("inp-filter-url").value.trim(),filterApiKey:document.getElementById("inp-filter-key").value.trim(),filterModel:document.getElementById("inp-filter-model").value.trim(),filterPrompt:((u=document.getElementById("inp-filter-prompt"))==null?void 0:u.value.trim())||"",rerankEnabled:((m=document.getElementById("chk-rerank-enabled"))==null?void 0:m.checked)||!1,rerankApiFormat:document.getElementById("sel-rerank-format").value,rerankBaseUrl:document.getElementById("inp-rerank-url").value.trim(),rerankApiKey:document.getElementById("inp-rerank-key").value.trim(),rerankModel:document.getElementById("inp-rerank-model").value.trim()};h.saveSettings(e);try{if(e.ptToken){const{paraTranzApi:n}=await v(async()=>{const{paraTranzApi:g}=await import("./paratranz-CmxxXTVm.js");return{paraTranzApi:g}},__vite__mapDeps([0,1])),i=await n.getProfile();i&&(e.ptUsername=i.username||i.name||"",e.ptEmail=i.email||"",h.saveSettings(e))}const l=document.getElementById("save-msg");l.style.display="block",setTimeout(async()=>{l.style.display="none";const{navigate:n}=await v(async()=>{const{navigate:i}=await import("./index-CR5PaB1c.js").then(g=>g.r);return{navigate:i}},__vite__mapDeps([2,3]));n("/settings")},1e3)}catch(l){alert("配置已保存，但验证 Token 时出错: "+l.message)}finally{t.disabled=!1,t.innerText="保存所有设置"}}),["main","embed","filter","rerank"].forEach(t=>{const e=document.getElementById(`btn-fetch-${t}`);e&&e.addEventListener("click",async()=>{const a=document.getElementById(`inp-${t}-url`).value.trim(),c=document.getElementById(`inp-${t}-key`).value.trim(),y=document.getElementById(`sel-${t}-format`).value;if(!a||!c){const{showToast:m}=await v(async()=>{const{showToast:l}=await import("./toast-_A8NGhfi.js");return{showToast:l}},[]);m("请先填写该面板的 Base URL 和 API Key","warning");return}const u=e.innerHTML;e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i>';try{const{AIClient:m}=await v(async()=>{const{AIClient:n}=await import("./ai-OpbjDDFA.js");return{AIClient:n}},__vite__mapDeps([4,1])),l=await m.getModels({baseUrl:a,apiKey:c,apiFormat:y});if(Array.isArray(l)){const n=document.getElementById(`dropdown-${t}`),i=document.getElementById(`inp-${t}-model`);n.innerHTML="",l.forEach(s=>{const p=s.id||s.name||(typeof s=="string"?s:JSON.stringify(s)),d=document.createElement("div");d.style.cssText="padding: 0.5rem 0.8rem; cursor: pointer; transition: background 0.2s; font-size: 0.85rem;",d.innerText=p,d.onmouseenter=()=>d.style.background="var(--bg-surface-hover)",d.onmouseleave=()=>d.style.background="transparent",d.onclick=()=>{i.value=p,n.style.display="none"},n.appendChild(d)}),i.onfocus=()=>{n.children.length>0&&(n.style.display="block")},i.oninput=()=>{const s=i.value.toLowerCase();let p=!1;Array.from(n.children).forEach(d=>{const f=d.innerText.toLowerCase().includes(s);d.style.display=f?"block":"none",f&&(p=!0)}),n.style.display=p?"block":"none"},document.addEventListener("click",s=>{const p=document.getElementById(`model-wrapper-${t}`);p&&!p.contains(s.target)&&(n.style.display="none")}),n.style.display="block",i.focus();const{showToast:g}=await v(async()=>{const{showToast:s}=await import("./toast-_A8NGhfi.js");return{showToast:s}},[]);g(`已获取 ${l.length} 个模型，可输入筛选`,"success")}}catch(m){const{showToast:l}=await v(async()=>{const{showToast:n}=await import("./toast-_A8NGhfi.js");return{showToast:n}},[]);l("获取失败: "+m.message,"error")}finally{e.disabled=!1,e.innerHTML=u}})})}export{$ as render};
