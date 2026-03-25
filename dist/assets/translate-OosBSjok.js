const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/paratranz-B8WEvIb5.js","assets/storage-CDYOJb6j.js","assets/rag-BOJCsgZC.js","assets/index-D-Nc9a5v.js","assets/index-DHAYdvpI.css","assets/vectorStore-CSCThsyl.js"])))=>i.map(i=>d[i]);
import{n as C,_}from"./index-D-Nc9a5v.js";import{paraTranzApi as P}from"./paratranz-B8WEvIb5.js";import{AIClient as F}from"./ai-C8C5Ab_V.js";import{Storage as z}from"./storage-CDYOJb6j.js";import{showToast as E}from"./toast-_A8NGhfi.js";async function X(s,m){const u=m.get("projectId"),g=m.get("fileId");if(!u||!g){s.innerHTML='<div class="glass-panel text-center">缺少 projectId 或 fileId</div>';return}const y=m.get("stage")||"0";s.innerHTML='<div style="text-align:center; padding: 2rem;">加载词条数据中...</div>';try{let[b,d]=await Promise.all([P.getTerms(u).catch(()=>[]),P.getStrings(u,g,y==="all"?null:y)]);const x=z.getLocalGlossary(),L=new Map;b.forEach(p=>L.set(p.term,p)),x.forEach(p=>L.set(p.term,Object.assign({},L.get(p.term),p)));const M=Array.from(L.values()).map(p=>({term:p.term,translation:p.translation,caseSensitive:p.caseSensitive||!1,variants:Array.isArray(p.variants)?p.variants:p.variants?String(p.variants).split(/[|,\n]+/).map(R=>R.trim()).filter(Boolean):[]}));d=d||[],document.body.classList.add("translate-mode"),W(s,u,g,d,M,y)}catch(b){document.body.classList.remove("translate-mode"),s.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${b.message}</div>`}}function W(s,m,u,g,y,b){let d=-1,x="none",L=[];function M(){s.innerHTML=`
      <div style="display: flex; flex: 1; min-height: 0; gap: 1.2rem; width: 100%;">
        <!-- 左侧：词条列表 -->
        <div class="glass-panel" style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; min-width: 0;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.1rem;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${x==="none"?"":x==="asc"?"↑":"↓"}
              </button>
              <button id="btn-back" class="btn btn-sm">返回</button>
            </div>
          </div>
  
          <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; margin-bottom: 1rem;">
            <button class="stage-tab ${b==="0"?"active":""}" data-stage="0" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">未翻</button>
            <button class="stage-tab ${b==="1"?"active":""}" data-stage="1" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">已翻</button>
            <button class="stage-tab ${b==="all"?"active":""}" data-stage="all" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">全部</button>
          </div>
  
          <div id="string-list" style="flex: 1; overflow-y: auto; padding-right: 0.5rem;"></div>
        </div>

        <!-- 中间：编辑器 (核心自适应区) -->
        <div class="glass-panel" style="flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-y: auto; padding-right: 0.8rem;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem; flex-shrink: 0;">工作台</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem; flex-shrink: 0; padding-bottom: 1rem;">
            <div style="display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">原文</label>
              <div id="text-original" style="background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 1.1rem; line-height: 1.6; white-space: pre-wrap;"></div>
            </div>
            
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; flex-shrink: 0;">
              <button id="btn-ai-translate" class="btn btn-primary" style="flex: 1; min-width: 110px;"><i class="fas fa-robot"></i> AI 翻译</button>
              <button id="btn-get-rag" class="btn" style="white-space: nowrap; flex: 0.5;" title="手动从本地语料库检索参考"><i class="fas fa-search"></i> 检索参考</button>
              <button id="btn-tm-match" class="btn" style="white-space: nowrap; flex: 0.5;"><i class="fas fa-database"></i> 记忆库</button>
              <button id="btn-toggle-candidates" class="btn" style="padding: 0 0.8rem;" title="展开/收起 AI 候选面板"><i class="fas fa-layer-group"></i> 已有候选</button>
              <button id="btn-ai-suggest" class="btn" style="padding: 0 0.8rem;" title="提供修改建议重新生成"><i class="fas fa-comment-dots"></i> 修改建议</button>
            </div>
            
            <div id="ai-suggest-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface); flex-shrink: 0;">
              <label style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">给 AI 提供修改建议</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="input-ai-suggest" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-color);" placeholder="输入希望调整的方向或注意点..." />
                <button id="btn-submit-suggest" class="btn btn-primary" style="white-space: nowrap;"><i class="fas fa-paper-plane"></i> 重新生成</button>
              </div>
            </div>

            <div id="ai-candidates-panel" style="display: none; flex-direction: column; max-height: 35vh; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-color); flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600;">AI 候选译文</label>
                  <div style="display: inline-flex; border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden; font-size: 0.75rem;">
                    <button class="ai-mode-btn active" data-mode="overwrite" style="padding: 2px 8px; border: none; cursor: pointer; background: var(--accent-color); color: #fff;">覆盖</button>
                    <button class="ai-mode-btn" data-mode="append" style="padding: 2px 8px; border: none; cursor: pointer; background: transparent; color: var(--text-secondary);">追加</button>
                  </div>
                </div>
                <div style="display: flex; gap: 0.3rem;">
                  <button id="btn-show-prev" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; display: none;">上一轮</button>
                  <button id="btn-close-candidates" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1rem;">&times;</button>
                </div>
              </div>
              <div id="ai-candidates-list" style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; flex: 1; padding-right: 0.3rem;"></div>
              <div id="ai-prev-list" style="display: none; flex-direction: column; margin-top: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; flex-shrink: 0; max-height: 30%; overflow-y: auto;">
                <label style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.3rem; display: block;">上一轮候选:</label>
                <div id="ai-prev-items" style="display: flex; flex-direction: column; gap: 0.3rem;"></div>
              </div>
            </div>

            <div id="rag-ref-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface); flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600;"><i class="fas fa-project-diagram"></i> RAG 参考翻译</label>
                <button id="btn-close-rag" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1rem;">&times;</button>
              </div>
              <div id="rag-ref-list" style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; max-height: 120px; overflow-y: auto;"></div>
            </div>

            <div style="display: flex; flex-direction: column; flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-shrink: 0;">
                <label style="color: var(--text-secondary); font-size: 0.9rem;">译文 (支持手动编辑)</label>
                <button id="btn-submit" class="btn btn-primary btn-sm" style="padding: 0.3rem 1rem; font-size: 0.85rem;">提交至服务器并保存 (下一条)</button>
              </div>
              <textarea id="text-translation" placeholder="输入译文..." style="min-height: 120px; resize: none; overflow-y: hidden; font-size: 1.1rem; line-height: 1.6; padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color); transition: height 0.1s ease;"></textarea>
            </div>
          </div>
        </div>

        <!-- 右侧：术语管理栏 (内联常驻) -->
        <div class="glass-panel" id="term-sidebar" style="width: 320px; flex-shrink: 0; display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden;">
          <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-book" style="color: var(--accent-color);"></i> 术语管理</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-terms" class="btn btn-sm" title="管理项目全量术语"><i class="fas fa-external-link-alt"></i></button>
              <button id="btn-add-term-toggle" class="btn btn-sm" title="显示/隐藏新增表单"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          
          <!-- 新增表单 (默认折叠) -->
          <div id="inline-term-add" style="display: none; padding: 1rem; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); animation: slideDown 0.2s ease;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.8rem;">
              <select id="inline-term-type" style="padding: 0.4rem; font-size: 0.8rem;">
                <option value="1">名词</option><option value="2">动词</option><option value="3">形容词</option><option value="4">副词</option><option value="0">其他</option>
              </select>
              <label style="display: flex; align-items: center; font-size: 0.75rem; color: var(--text-secondary); cursor:pointer;">
                <input type="checkbox" id="inline-term-cs" style="margin-right: 3px;" /> 区分大小写
              </label>
            </div>
            <input type="text" id="inline-term-ori" placeholder="原文" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;" />
            <input type="text" id="inline-term-tran" placeholder="译文" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;" />
            <input type="text" id="inline-term-vars" placeholder="变体 (用 | 分割)" style="width: 100%; padding: 0.5rem; margin-bottom: 0.8rem; font-size: 0.85rem;" />
            <button id="btn-inline-add-term" class="btn btn-primary btn-sm" style="width: 100%;">确定添加</button>
          </div>

          <!-- 搜索与列表 -->
          <div style="padding: 0.8rem; border-bottom: 1px solid var(--border-color);">
            <div style="position: relative;">
              <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.8rem;"></i>
              <input type="text" id="inline-term-search" placeholder="在库中检索..." style="width: 100%; padding: 0.4rem 0.6rem 0.4rem 2rem; font-size: 0.85rem;" />
            </div>
          </div>

          <div id="inline-term-list" style="flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <!-- 术语条目将渲染在此 -->
          </div>
        </div>
      </div>
    `,R(),p(),G(),g.length>0&&H(0)}function p(){const n=document.getElementById("string-list");if(g.length===0){n.innerHTML='<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">当前状态下暂无词条</div>';return}let f=[...g].map((a,i)=>({...a,originalIndex:i}));x==="asc"?f.sort((a,i)=>new Date(a.updatedAt||0)-new Date(i.updatedAt||0)):x==="desc"&&f.sort((a,i)=>new Date(i.updatedAt||0)-new Date(a.updatedAt||0)),n.innerHTML=f.map(a=>{const i=a.stage===1;return`
        <div class="string-item" data-idx="${a.originalIndex}" style="padding: 0.8rem; border-bottom: 1px solid var(--border-color); cursor: pointer; border-radius: 4px; ${i?"opacity: 0.6":""}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${a.id}</span>
            ${i?'<span style="color: var(--success-color); font-size: 0.7rem;">✔</span>':""}
          </div>
          <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${i?"text-decoration: line-through;":""}">${A(a.original)}</div>
          ${a.updatedAt?`<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(a.updatedAt).toLocaleString()}</div>`:""}
        </div>
      `}).join(""),n.querySelectorAll(".string-item").forEach(a=>{a.addEventListener("click",()=>H(parseInt(a.dataset.idx)))})}function R(){document.getElementById("btn-back").addEventListener("click",()=>{document.body.style.overflow="",document.querySelector(".app-container").style.height="",C(`/files?projectId=${m}`)}),document.getElementById("btn-terms").addEventListener("click",()=>C(`/terms?projectId=${m}`)),document.getElementById("btn-sort").addEventListener("click",()=>{x==="none"?x="asc":x==="asc"?x="desc":x="none",M()}),s.querySelectorAll(".stage-tab").forEach(n=>{n.addEventListener("click",()=>{C(`/translate?projectId=${m}&fileId=${u}&stage=${n.dataset.stage}`)})})}function H(n){if(n<0||n>=g.length)return;d=n;const f=g[n];document.querySelectorAll(".string-item").forEach(v=>{v.classList.remove("active"),v.style.background="transparent"});const a=s.querySelector(`.string-item[data-idx="${n}"]`);a&&(a.classList.add("active"),a.style.background="var(--bg-surface-hover)",a.scrollIntoView({behavior:"smooth",block:"nearest"})),document.getElementById("text-original").innerHTML=N(f.original,y),document.getElementById("text-translation").value=f.translation||"",q(document.getElementById("text-translation"));const i=z.searchTM(m,f.original);i&&!document.getElementById("text-translation").value&&(document.getElementById("text-translation").value=i);const $=document.getElementById("ai-candidates-panel");$&&($.style.display="none");const S=document.getElementById("ai-candidates-list");S&&(S.innerHTML="");const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e&&(e.style.display="none"),t&&(t.value=""),L=[];const r=document.getElementById("rag-ref-panel");r&&(r.style.display="none");const o=f.stage===2,l=document.getElementById("text-translation"),c=document.getElementById("btn-submit"),T=document.getElementById("btn-ai-translate"),k=document.getElementById("btn-tm-match"),w=document.getElementById("btn-toggle-candidates");o?(l.disabled=!0,l.style.background="var(--bg-surface)",l.placeholder="当前词条已审核通过，已锁定，禁止修改",c.disabled=!0,c.innerHTML='<i class="fas fa-lock"></i> 词条已审核，禁止修改',c.style.background="var(--bg-surface)",c.style.borderColor="var(--border-color)",c.style.color="var(--text-secondary)",[T,k,w,document.getElementById("btn-ai-suggest")].forEach(v=>{v&&(v.disabled=!0,v.style.opacity="0.5",v.style.cursor="not-allowed")})):(l.disabled=!1,l.style.background="var(--bg-color)",l.placeholder="",c.disabled=!1,c.innerHTML="提交至服务器并保存 TM 记录 (下一条)",c.style.background="",c.style.borderColor="",c.style.color="",[T,k,w,document.getElementById("btn-ai-suggest")].forEach(v=>{v&&(v.disabled=!1,v.style.opacity="1",v.style.cursor="pointer")}))}function D(n=""){const f=document.getElementById("inline-term-list");if(!f)return;const a=y.filter(i=>(i.term||"").toLowerCase().includes(n.toLowerCase())||(i.translation||"").toLowerCase().includes(n.toLowerCase()));f.innerHTML=a.map(i=>`
      <div class="glass-panel" style="padding: 0.6rem; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-weight: 600; color: var(--text-color);">${A(i.term)}</span>
          ${i.caseSensitive?'<span style="font-size: 0.7rem; color: var(--warning-color); border: 1px solid var(--warning-color); padding: 0 4px; border-radius: 3px;">大小写</span>':""}
        </div>
        <div style="color: var(--accent-color); font-weight: 500;">${A(i.translation)}</div>
        ${i.variants&&i.variants.length?`<div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8;">变体: ${A(i.variants.join(", "))}</div>`:""}
      </div>
    `).join("")||'<div style="text-align:center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">未找到相关术语</div>'}function q(n){n&&(n.style.height="auto",n.style.height=n.scrollHeight+"px")}function G(){const n=document.getElementById("text-translation");n.addEventListener("input",()=>q(n)),D(),document.getElementById("inline-term-search").addEventListener("input",e=>{D(e.target.value)}),document.getElementById("btn-add-term-toggle").addEventListener("click",()=>{const e=document.getElementById("inline-term-add");e.style.display=e.style.display==="none"?"block":"none"}),document.getElementById("btn-inline-add-term").addEventListener("click",async()=>{const e=document.getElementById("inline-term-ori").value.trim(),t=document.getElementById("inline-term-tran").value.trim();if(!e||!t){const{showToast:o}=await _(async()=>{const{showToast:l}=await import("./toast-_A8NGhfi.js");return{showToast:l}},[]);o("原文和译文不能为空","warning");return}const r=document.getElementById("btn-inline-add-term");r.disabled=!0,r.innerText="提交中...";try{const o=document.getElementById("inline-term-vars").value.trim(),l=o?o.split(/[|,\n]+/).map(w=>w.trim()).filter(Boolean):[],c={term:e,translation:t,type:parseInt(document.getElementById("inline-term-type").value),caseSensitive:document.getElementById("inline-term-cs").checked,variants:l,description:""},{paraTranzApi:T}=await _(async()=>{const{paraTranzApi:w}=await import("./paratranz-B8WEvIb5.js");return{paraTranzApi:w}},__vite__mapDeps([0,1]));await T.createTerm(m,c),y.unshift(c);const{showToast:k}=await _(async()=>{const{showToast:w}=await import("./toast-_A8NGhfi.js");return{showToast:w}},[]);k("术语创建成功","success"),document.getElementById("inline-term-ori").value="",document.getElementById("inline-term-tran").value="",document.getElementById("inline-term-vars").value="",document.getElementById("inline-term-add").style.display="none",D(document.getElementById("inline-term-search").value),d!==-1&&H(d)}catch(o){const{showToast:l}=await _(async()=>{const{showToast:c}=await import("./toast-_A8NGhfi.js");return{showToast:c}},[]);l("创建失败: "+o.message,"error")}finally{r.disabled=!1,r.innerText="确定添加"}}),document.getElementById("btn-tm-match").addEventListener("click",()=>{if(d===-1)return;const e=g[d],t=z.searchTM(m,e.original);t?(n.value=t,E("完成记忆回显","success")):E("记忆库无匹配内容","warning")});let f="overwrite",a=[];document.getElementById("btn-close-candidates").addEventListener("click",()=>{document.getElementById("ai-candidates-panel").style.display="none"}),document.querySelectorAll(".ai-mode-btn").forEach(e=>{e.addEventListener("click",()=>{f=e.dataset.mode,document.querySelectorAll(".ai-mode-btn").forEach(t=>{t.style.background="transparent",t.style.color="var(--text-secondary)"}),e.style.background="var(--accent-color)",e.style.color="#fff"})}),document.getElementById("btn-show-prev").addEventListener("click",()=>{const e=document.getElementById("ai-prev-list");e.style.display=e.style.display==="none"?"flex":"none"});function i(e,t){e.innerHTML=t.map((r,o)=>`
        <div class="ai-card" data-ci="${o}" style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
          <span style="color: var(--accent-color); font-weight:600;">#${o+1}</span> ${A(r)}
        </div>
      `).join(""),e.querySelectorAll(".ai-card").forEach((r,o)=>{r.addEventListener("click",()=>{f==="append"?n.value+=(n.value?`
`:"")+t[o]:n.value=t[o],e.querySelectorAll(".ai-card").forEach(l=>{l.style.borderColor="var(--border-color)",l.style.background="transparent"}),r.style.borderColor="var(--accent-color)",r.style.background="rgba(99, 102, 241, 0.1)",E(`已${f==="append"?"追加":"选择"}版本 #${o+1}`,"success"),document.getElementById("ai-candidates-panel").style.display="none"})})}document.getElementById("btn-toggle-candidates").addEventListener("click",()=>{const e=document.getElementById("ai-candidates-panel");if(document.getElementById("ai-candidates-list").innerHTML.trim()===""){E("当前没有候选文本，请先执行 AI 翻译","warning");return}e.style.display=e.style.display==="none"?"flex":"none"}),document.getElementById("btn-close-rag").addEventListener("click",()=>{document.getElementById("rag-ref-panel").style.display="none"});async function $(){if(d===-1)return!1;const e=g[d];if(!z.getSettings().embeddingEnabled)return E("未开启向量化模型，无法检索","warning"),!1;const r=document.getElementById("btn-get-rag");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> 检索中...');try{const{RAG:o}=await _(async()=>{const{RAG:c}=await import("./rag-BOJCsgZC.js");return{RAG:c}},__vite__mapDeps([2,3,4,1,5])),l=await o.retrieveReferences(m,e.original,{fileId:u});if(L=l,l.length>0){const c=document.getElementById("rag-ref-list"),T=document.getElementById("rag-ref-panel");return c.innerHTML=l.map((k,w)=>`<div style="padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color);">
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.2rem;">相似度: ${(k.score*100).toFixed(1)}% | ${k.fileName}</div>
              <div style="font-size: 0.8rem;"><strong>原:</strong> ${k.original.substring(0,80)}...</div>
              <div style="font-size: 0.8rem; color: var(--success-color);"><strong>译:</strong> ${k.translation.substring(0,80)}...</div>
            </div>`).join(""),T.style.display="block",!0}else return E("未找到高相关历史参考","info"),!1}catch(o){return E("RAG 检索失败: "+o.message,"error"),!1}finally{r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-search"></i> 检索参考')}}document.getElementById("btn-get-rag").addEventListener("click",$);async function S(e=null){if(d===-1)return;const t=g[d],r=document.getElementById("btn-ai-translate"),o=document.getElementById("ai-candidates-panel"),l=document.getElementById("ai-candidates-list"),c=document.getElementById("btn-show-prev"),T=document.getElementById("ai-prev-items");z.getSettings().embeddingEnabled&&L.length===0&&await $(),r.disabled=!0,r.innerText=e?"获取建议修改中...":"AI 翻译中...";const w=document.getElementById("text-translation"),v=y.filter(B=>{const I=V(B);return I?I.test(t.original):!1});try{const B=await F.translateSingle({original:t.original,terms:v,suggestion:e,references:L});let I=[];const j=[...B.matchAll(/【(.*?)】/gs)];j.length>0?I=j.map(h=>h[1].trim()).filter(h=>h.length>0&&!/^译文\\d*$/.test(h)&&!/^版本\\d*$/.test(h)&&!/^选项\\d*$/.test(h)):B.includes("\\n")?I=B.split("\\n").filter(h=>h.trim().length>0).map(h=>h.replace(/^[-*0-9.]+\\s*/,"").trim()):I=[B.trim()],I.length===0&&(I=[B]),I.length<=1?w.value=I[0]||B:(l.querySelectorAll(".ai-card").length>0&&(a=Array.from(l.querySelectorAll(".ai-card")).map(h=>h.textContent.replace(/^#\\d+\\s*/,"").trim()),i(T,a),c.style.display="inline-block"),document.getElementById("ai-prev-list").style.display="none",i(l,I),o.style.display="flex")}catch(B){E(B.message,"error")}finally{r.disabled=!1,r.innerHTML='<i class="fas fa-robot"></i> AI 执行翻译'}}document.getElementById("btn-ai-translate").addEventListener("click",()=>S(null)),document.getElementById("btn-ai-suggest").addEventListener("click",()=>{if(d===-1)return;const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e.style.display==="none"?(e.style.display="block",t.focus()):(e.style.display="none",t.value="")}),document.getElementById("btn-submit-suggest").addEventListener("click",()=>{const t=document.getElementById("input-ai-suggest").value.trim();if(!t)return E("修改建议不能为空","warning");S(t)}),document.getElementById("input-ai-suggest").addEventListener("keydown",e=>{e.key==="Enter"&&document.getElementById("btn-submit-suggest").click()}),document.getElementById("btn-submit").addEventListener("click",async()=>{if(d===-1)return;const e=g[d],t=n.value.trim();if(!t)return E("翻译不能为空","error");const r=document.getElementById("btn-submit");r.disabled=!0;try{await P.updateString(m,e.id,t,1),z.saveTM(m,e.original,t),g[d].stage=1,g[d].translation=t,g[d].updatedAt=new Date().toISOString(),E("保存成功","success"),p(),H(d+1)}catch(o){E(o.message,"error")}finally{r.disabled=!1}})}M()}function N(s,m){if(!m||m.length===0)return A(s);let u=A(s);return[...m].sort((y,b)=>(b.term||"").length-(y.term||"").length).forEach(y=>{const b=V(y);b&&(u=u.replace(b,`<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${A(y.translation||"")}">$&</span>`))}),u}function A(s){return(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function O(s){return s.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}function V(s){if(!s||!s.term)return null;const m=[s.term];Array.isArray(s.variants)&&m.push(...s.variants);const u=m.map(x=>O(x)),g=u.length>1?`(${u.join("|")})`:u[0],y=/^\w/.test(s.term)?"\\b":"",b=/\w$/.test(s.term)?"\\b":"",d=s.caseSensitive?"g":"gi";return new RegExp(y+g+b,d)}export{X as render};
