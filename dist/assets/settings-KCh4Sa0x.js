const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/paratranz-DQKCRvjE.js","assets/storage-D0vRnQMA.js","assets/index-DCt6G-sU.js","assets/index-DF5UtTsd.css"])))=>i.map(i=>d[i]);
import{_ as v}from"./index-DCt6G-sU.js";import{S as g}from"./storage-D0vRnQMA.js";function y(n,a,l,e,t,o={}){const{isOptional:i=!1,hasPrompt:d=!1,hasRefCount:c=!1}=o,m=i?e[`${t}Enabled`]:!0,s=e[`${t}ApiFormat`]||e.aiApiFormat||"openai",r=e[`${t}BaseUrl`]||"",p=e[`${t}ApiKey`]||"",f=e[`${t}Model`]||"",b=d&&e[`${t}Prompt`]||"",k=c&&e[`${t}RefCount`]||3;return`
    <div class="glass-panel" style="margin-bottom: 1.2rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-panel-toggle="${n}">
        <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="${l}" style="color: var(--accent-color);"></i> ${a}
          ${i?"":'<span style="font-size: 0.7rem; background: var(--accent-color); color: #fff; padding: 1px 6px; border-radius: 4px;">必填</span>'}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          ${i?`
            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation()">
              <input type="checkbox" id="chk-${n}-enabled" ${m?"checked":""} style="accent-color: var(--accent-color); width: 16px; height: 16px;" />
              启用
            </label>
          `:""}
          <i class="fas fa-chevron-down" id="icon-${n}" style="color: var(--text-secondary); transition: transform 0.2s; font-size: 0.8rem;"></i>
        </div>
      </div>
      
      <div id="panel-${n}" style="display: ${i&&!m?"none":"block"}; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API 格式</label>
            <select id="sel-${n}-format" style="padding: 0.5rem; width: 100%;">
              <option value="openai" ${s==="openai"?"selected":""}>OpenAI 兼容</option>
              <option value="gemini" ${s==="gemini"?"selected":""}>Gemini 原生</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">模型名称</label>
            <input type="text" id="inp-${n}-model" placeholder="模型名称" value="${f}" style="width: 100%;" />
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Base URL</label>
          <input type="text" id="inp-${n}-url" placeholder="API 服务地址" value="${r}" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Key</label>
          <input type="password" id="inp-${n}-key" placeholder="密钥" value="${p}" />
        </div>
        
        ${c?`
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">注入参考条数</label>
            <select id="sel-${n}-refcount" style="padding: 0.5rem; width: auto;">
              ${[1,2,3,4,5].map(u=>`<option value="${u}" ${k===u?"selected":""}>${u} 条</option>`).join("")}
            </select>
          </div>
        `:""}
        
        ${d?`
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">提示词</label>
            <textarea id="inp-${n}-prompt" rows="4" style="font-size: 0.9rem;">${b}</textarea>
          </div>
        `:""}
      </div>
    </div>
  `}function h(n){const a=g.getSettings();n.innerHTML=`
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
      ${y("main","翻译主模型","fas fa-robot",{mainApiFormat:a.aiApiFormat,mainBaseUrl:a.aiBaseUrl,mainApiKey:a.aiApiKey,mainModel:a.aiModel,mainPrompt:a.aiPrompt},"main",{isOptional:!1,hasPrompt:!0})}

      <!-- 向量化模型 -->
      ${y("embed","向量化模型 (Embedding)","fas fa-project-diagram",a,"embedding",{isOptional:!0,hasRefCount:!0})}

      <!-- 过滤模型 -->
      ${y("filter","过滤模型","fas fa-filter",a,"filter",{isOptional:!0,hasPrompt:!0})}

      <!-- 重排序模型 -->
      ${y("rerank","重排序模型","fas fa-sort-amount-down",a,"rerank",{isOptional:!0})}

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">保存所有设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
    </div>
  `,document.querySelectorAll("[data-panel-toggle]").forEach(l=>{l.addEventListener("click",()=>{const e=l.dataset.panelToggle,t=document.getElementById(`panel-${e}`),o=document.getElementById(`icon-${e}`);t.style.display==="none"?(t.style.display="block",o.style.transform="rotate(180deg)"):(t.style.display="none",o.style.transform="rotate(0deg)")})}),["embed","filter","rerank"].forEach(l=>{const e=document.getElementById(`chk-${l}-enabled`);e&&e.addEventListener("change",()=>{const t=document.getElementById(`panel-${l}`);t.style.display=e.checked?"block":"none"})}),document.getElementById("btn-save-settings").addEventListener("click",async()=>{var t,o,i,d,c;const l=document.getElementById("btn-save-settings");l.disabled=!0,l.innerText="正在保存...";const e={ptToken:document.getElementById("input-pt-token").value.trim(),ptUsername:a.ptUsername||"",ptEmail:a.ptEmail||"",aiApiFormat:document.getElementById("sel-main-format").value,aiBaseUrl:document.getElementById("inp-main-url").value.trim(),aiApiKey:document.getElementById("inp-main-key").value.trim(),aiModel:document.getElementById("inp-main-model").value.trim(),aiPrompt:document.getElementById("inp-main-prompt").value.trim(),embeddingEnabled:((t=document.getElementById("chk-embed-enabled"))==null?void 0:t.checked)||!1,embeddingApiFormat:document.getElementById("sel-embed-format").value,embeddingBaseUrl:document.getElementById("inp-embed-url").value.trim(),embeddingApiKey:document.getElementById("inp-embed-key").value.trim(),embeddingModel:document.getElementById("inp-embed-model").value.trim(),embeddingRefCount:parseInt(((o=document.getElementById("sel-embed-refcount"))==null?void 0:o.value)||"3"),filterEnabled:((i=document.getElementById("chk-filter-enabled"))==null?void 0:i.checked)||!1,filterApiFormat:document.getElementById("sel-filter-format").value,filterBaseUrl:document.getElementById("inp-filter-url").value.trim(),filterApiKey:document.getElementById("inp-filter-key").value.trim(),filterModel:document.getElementById("inp-filter-model").value.trim(),filterPrompt:((d=document.getElementById("inp-filter-prompt"))==null?void 0:d.value.trim())||"",rerankEnabled:((c=document.getElementById("chk-rerank-enabled"))==null?void 0:c.checked)||!1,rerankApiFormat:document.getElementById("sel-rerank-format").value,rerankBaseUrl:document.getElementById("inp-rerank-url").value.trim(),rerankApiKey:document.getElementById("inp-rerank-key").value.trim(),rerankModel:document.getElementById("inp-rerank-model").value.trim()};g.saveSettings(e);try{if(e.ptToken){const{paraTranzApi:s}=await v(async()=>{const{paraTranzApi:p}=await import("./paratranz-DQKCRvjE.js");return{paraTranzApi:p}},__vite__mapDeps([0,1])),r=await s.getProfile();r&&(e.ptUsername=r.username||r.name||"",e.ptEmail=r.email||"",g.saveSettings(e))}const m=document.getElementById("save-msg");m.style.display="block",setTimeout(async()=>{m.style.display="none";const{navigate:s}=await v(async()=>{const{navigate:r}=await import("./index-DCt6G-sU.js").then(p=>p.r);return{navigate:r}},__vite__mapDeps([2,3]));s("/settings")},1e3)}catch(m){alert("配置已保存，但验证 Token 时出错: "+m.message)}finally{l.disabled=!1,l.innerText="保存所有设置"}})}export{h as render};
