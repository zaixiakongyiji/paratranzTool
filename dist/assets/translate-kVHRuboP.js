const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/paratranz-B8WEvIb5.js","assets/storage-CDYOJb6j.js","assets/rag-DauMPrO4.js","assets/index-LDMxwuiV.js","assets/index-DHAYdvpI.css","assets/vectorStore-BwS8jpvf.js"])))=>i.map(i=>d[i]);
import{n as P,_ as M}from"./index-LDMxwuiV.js";import{paraTranzApi as q}from"./paratranz-B8WEvIb5.js";import{AIClient as F}from"./ai-C8C5Ab_V.js";import{Storage as A}from"./storage-CDYOJb6j.js";import{showToast as k}from"./toast-_A8NGhfi.js";async function X(s,c){const y=c.get("projectId"),g=c.get("fileId");if(!y||!g){s.innerHTML='<div class="glass-panel text-center">缺少 projectId 或 fileId</div>';return}const f=c.get("stage")||"0";s.innerHTML='<div style="text-align:center; padding: 2rem;">加载词条数据中...</div>';try{let[x,d]=await Promise.all([q.getTerms(y).catch(()=>[]),q.getStrings(y,g,f==="all"?null:f)]);const h=A.getLocalGlossary(),T=new Map;x.forEach(p=>T.set(p.term,p)),h.forEach(p=>T.set(p.term,Object.assign({},T.get(p.term),p)));const H=Array.from(T.values()).map(p=>({term:p.term,translation:p.translation,caseSensitive:p.caseSensitive||!1,variants:Array.isArray(p.variants)?p.variants:p.variants?String(p.variants).split(/[|,\n]+/).map(C=>C.trim()).filter(Boolean):[]}));d=d||[],document.body.classList.add("translate-mode"),W(s,y,g,d,H,f)}catch(x){document.body.classList.remove("translate-mode"),s.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${x.message}</div>`}}function W(s,c,y,g,f,x){let d=-1,h="none",T=[];function H(){s.innerHTML=`
      <div style="display: flex; flex: 1; min-height: 0; gap: 1.2rem; width: 100%;">
        <!-- 左侧：词条列表 -->
        <div class="glass-panel" style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; min-width: 0;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.1rem;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${h==="none"?"":h==="asc"?"↑":"↓"}
              </button>
              <button id="btn-back" class="btn btn-sm">返回</button>
            </div>
          </div>
  
          <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; margin-bottom: 1rem;">
            <button class="stage-tab ${x==="0"?"active":""}" data-stage="0" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">未翻</button>
            <button class="stage-tab ${x==="1"?"active":""}" data-stage="1" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">已翻</button>
            <button class="stage-tab ${x==="all"?"active":""}" data-stage="all" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">全部</button>
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

            <div id="rag-ref-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-surface); flex-shrink: 0; overflow: hidden;">
              <div id="rag-ref-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; cursor: pointer; user-select: none; background: rgba(255,255,255,0.02);">
                <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;"><i class="fas fa-project-diagram"></i> RAG 参考翻译 <span id="rag-ref-count" style="font-weight: normal; opacity: 0.7;"></span></label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <i id="rag-ref-chevron" class="fas fa-chevron-down" style="font-size: 0.8rem; color: var(--text-secondary); transition: transform 0.2s;"></i>
                  <button id="btn-close-rag" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; padding: 0 4px;">&times;</button>
                </div>
              </div>
              <div id="rag-ref-list" style="display: none; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; max-height: 250px; overflow-y: auto; padding: 0 0.8rem 0.8rem 0.8rem; border-top: 1px solid var(--border-color);"></div>
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
    `,C(),p(),G(),g.length>0&&R(0)}function p(){const n=document.getElementById("string-list");if(g.length===0){n.innerHTML='<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">当前状态下暂无词条</div>';return}let b=[...g].map((i,o)=>({...i,originalIndex:o}));h==="asc"?b.sort((i,o)=>new Date(i.updatedAt||0)-new Date(o.updatedAt||0)):h==="desc"&&b.sort((i,o)=>new Date(o.updatedAt||0)-new Date(i.updatedAt||0)),n.innerHTML=b.map(i=>{const o=i.stage===1;return`
        <div class="string-item" data-idx="${i.originalIndex}" style="padding: 0.8rem; border-bottom: 1px solid var(--border-color); cursor: pointer; border-radius: 4px; ${o?"opacity: 0.6":""}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${i.id}</span>
            ${o?'<span style="color: var(--success-color); font-size: 0.7rem;">✔</span>':""}
          </div>
          <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${o?"text-decoration: line-through;":""}">${L(i.original)}</div>
          ${i.updatedAt?`<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(i.updatedAt).toLocaleString()}</div>`:""}
        </div>
      `}).join(""),n.querySelectorAll(".string-item").forEach(i=>{i.addEventListener("click",()=>R(parseInt(i.dataset.idx)))})}function C(){document.getElementById("btn-back").addEventListener("click",()=>{document.body.style.overflow="",document.querySelector(".app-container").style.height="",P(`/files?projectId=${c}`)}),document.getElementById("btn-terms").addEventListener("click",()=>P(`/terms?projectId=${c}`)),document.getElementById("btn-sort").addEventListener("click",()=>{h==="none"?h="asc":h==="asc"?h="desc":h="none",H()}),s.querySelectorAll(".stage-tab").forEach(n=>{n.addEventListener("click",()=>{P(`/translate?projectId=${c}&fileId=${y}&stage=${n.dataset.stage}`)})})}function R(n){if(n<0||n>=g.length)return;d=n;const b=g[n];document.querySelectorAll(".string-item").forEach(l=>{l.classList.remove("active"),l.style.background="transparent"});const i=s.querySelector(`.string-item[data-idx="${n}"]`);i&&(i.classList.add("active"),i.style.background="var(--bg-surface-hover)",i.scrollIntoView({behavior:"smooth",block:"nearest"})),document.getElementById("text-original").innerHTML=N(b.original,f),document.getElementById("text-translation").value=b.translation||"",z(document.getElementById("text-translation"));const o=A.searchTM(c,b.original);o&&!document.getElementById("text-translation").value&&(document.getElementById("text-translation").value=o,z(document.getElementById("text-translation")));const $=document.getElementById("ai-candidates-panel");$&&($.style.display="none");const S=document.getElementById("ai-candidates-list");S&&(S.innerHTML="");const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e&&(e.style.display="none"),t&&(t.value=""),T=[];const r=document.getElementById("rag-ref-panel"),a=document.getElementById("rag-ref-list"),m=document.getElementById("rag-ref-chevron");r&&(r.style.display="none"),a&&(a.style.display="none"),m&&(m.style.transform="rotate(0deg)");const I=b.stage===2,E=document.getElementById("text-translation"),v=document.getElementById("btn-submit"),u=document.getElementById("btn-ai-translate"),_=document.getElementById("btn-tm-match"),w=document.getElementById("btn-toggle-candidates");I?(E.disabled=!0,E.style.background="var(--bg-surface)",E.placeholder="当前词条已审核通过，已锁定，禁止修改",v.disabled=!0,v.innerHTML='<i class="fas fa-lock"></i> 词条已审核，禁止修改',v.style.background="var(--bg-surface)",v.style.borderColor="var(--border-color)",v.style.color="var(--text-secondary)",[u,_,w,document.getElementById("btn-ai-suggest")].forEach(l=>{l&&(l.disabled=!0,l.style.opacity="0.5",l.style.cursor="not-allowed")})):(E.disabled=!1,E.style.background="var(--bg-color)",E.placeholder="",v.disabled=!1,v.innerHTML="提交至服务器并保存 TM 记录 (下一条)",v.style.background="",v.style.borderColor="",v.style.color="",[u,_,w,document.getElementById("btn-ai-suggest")].forEach(l=>{l&&(l.disabled=!1,l.style.opacity="1",l.style.cursor="pointer")}))}function D(n=""){const b=document.getElementById("inline-term-list");if(!b)return;const i=f.filter(o=>(o.term||"").toLowerCase().includes(n.toLowerCase())||(o.translation||"").toLowerCase().includes(n.toLowerCase()));b.innerHTML=i.map(o=>`
      <div class="glass-panel" style="padding: 0.6rem; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-weight: 600; color: var(--text-color);">${L(o.term)}</span>
          ${o.caseSensitive?'<span style="font-size: 0.7rem; color: var(--warning-color); border: 1px solid var(--warning-color); padding: 0 4px; border-radius: 3px;">大小写</span>':""}
        </div>
        <div style="color: var(--accent-color); font-weight: 500;">${L(o.translation)}</div>
        ${o.variants&&o.variants.length?`<div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8;">变体: ${L(o.variants.join(", "))}</div>`:""}
      </div>
    `).join("")||'<div style="text-align:center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">未找到相关术语</div>'}function z(n){n&&(n.style.height="auto",n.style.height=n.scrollHeight+"px")}function G(){const n=document.getElementById("text-translation");n.addEventListener("input",()=>z(n)),window.addEventListener("resize",()=>z(n)),D(),document.getElementById("inline-term-search").addEventListener("input",e=>{D(e.target.value)}),document.getElementById("btn-add-term-toggle").addEventListener("click",()=>{const e=document.getElementById("inline-term-add");e.style.display=e.style.display==="none"?"block":"none"}),document.getElementById("btn-inline-add-term").addEventListener("click",async()=>{const e=document.getElementById("inline-term-ori").value.trim(),t=document.getElementById("inline-term-tran").value.trim();if(!e||!t){const{showToast:a}=await M(async()=>{const{showToast:m}=await import("./toast-_A8NGhfi.js");return{showToast:m}},[]);a("原文和译文不能为空","warning");return}const r=document.getElementById("btn-inline-add-term");r.disabled=!0,r.innerText="提交中...";try{const a=document.getElementById("inline-term-vars").value.trim(),m=a?a.split(/[|,\n]+/).map(u=>u.trim()).filter(Boolean):[],I={term:e,translation:t,type:parseInt(document.getElementById("inline-term-type").value),caseSensitive:document.getElementById("inline-term-cs").checked,variants:m,description:""},{paraTranzApi:E}=await M(async()=>{const{paraTranzApi:u}=await import("./paratranz-B8WEvIb5.js");return{paraTranzApi:u}},__vite__mapDeps([0,1]));await E.createTerm(c,I),f.unshift(I);const{showToast:v}=await M(async()=>{const{showToast:u}=await import("./toast-_A8NGhfi.js");return{showToast:u}},[]);v("术语创建成功","success"),document.getElementById("inline-term-ori").value="",document.getElementById("inline-term-tran").value="",document.getElementById("inline-term-vars").value="",document.getElementById("inline-term-add").style.display="none",D(document.getElementById("inline-term-search").value),d!==-1&&R(d)}catch(a){const{showToast:m}=await M(async()=>{const{showToast:I}=await import("./toast-_A8NGhfi.js");return{showToast:I}},[]);m("创建失败: "+a.message,"error")}finally{r.disabled=!1,r.innerText="确定添加"}}),document.getElementById("btn-tm-match").addEventListener("click",()=>{if(d===-1)return;const e=g[d],t=A.searchTM(c,e.original);t?(n.value=t,z(n),k("完成记忆回显","success")):k("记忆库无匹配内容","warning")});let b="overwrite",i=[];document.getElementById("btn-close-candidates").addEventListener("click",()=>{document.getElementById("ai-candidates-panel").style.display="none"}),document.querySelectorAll(".ai-mode-btn").forEach(e=>{e.addEventListener("click",()=>{b=e.dataset.mode,document.querySelectorAll(".ai-mode-btn").forEach(t=>{t.style.background="transparent",t.style.color="var(--text-secondary)"}),e.style.background="var(--accent-color)",e.style.color="#fff"})}),document.getElementById("btn-show-prev").addEventListener("click",()=>{const e=document.getElementById("ai-prev-list");e.style.display=e.style.display==="none"?"flex":"none"});function o(e,t){e.innerHTML=t.map((r,a)=>`
        <div class="ai-card" data-ci="${a}" style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
          <span style="color: var(--accent-color); font-weight:600;">#${a+1}</span> ${L(r)}
        </div>
      `).join(""),e.querySelectorAll(".ai-card").forEach((r,a)=>{r.addEventListener("click",()=>{b==="append"?n.value+=(n.value?`
`:"")+t[a]:n.value=t[a],z(n),e.querySelectorAll(".ai-card").forEach(m=>{m.style.borderColor="var(--border-color)",m.style.background="transparent"}),r.style.borderColor="var(--accent-color)",r.style.background="rgba(99, 102, 241, 0.1)",k(`已${b==="append"?"追加":"选择"}版本 #${a+1}`,"success"),document.getElementById("ai-candidates-panel").style.display="none"})})}document.getElementById("btn-toggle-candidates").addEventListener("click",()=>{const e=document.getElementById("ai-candidates-panel");if(document.getElementById("ai-candidates-list").innerHTML.trim()===""){k("当前没有候选文本，请先执行 AI 翻译","warning");return}e.style.display=e.style.display==="none"?"flex":"none"}),document.getElementById("rag-ref-header").addEventListener("click",e=>{if(e.target.id==="btn-close-rag")return;const t=document.getElementById("rag-ref-list"),r=document.getElementById("rag-ref-chevron"),a=t.style.display==="none";t.style.display=a?"flex":"none",r.style.transform=a?"rotate(180deg)":"rotate(0deg)"}),document.getElementById("btn-close-rag").addEventListener("click",()=>{document.getElementById("rag-ref-panel").style.display="none"});async function $(){if(d===-1)return!1;const e=g[d];if(!A.getSettings().embeddingEnabled)return k("未开启向量化模型，无法检索","warning"),!1;const r=document.getElementById("btn-get-rag");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> 检索中...');try{const{RAG:a}=await M(async()=>{const{RAG:I}=await import("./rag-DauMPrO4.js");return{RAG:I}},__vite__mapDeps([2,3,4,1,5])),m=await a.retrieveReferences(c,e.original,{fileId:y});if(T=m,m.length>0){const I=document.getElementById("rag-ref-panel"),E=document.getElementById("rag-ref-list"),v=document.getElementById("rag-ref-count");return v.innerText=`(${m.length})`,E.innerHTML=m.map((u,_)=>`<div style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-color); margin-top: 0.4rem;">
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.3rem; display: flex; justify-content: space-between;">
                <span>相似度: ${(u.score*100).toFixed(1)}%</span>
                <span>${u.fileName}</span>
              </div>
              <div style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 0.4rem; color: var(--text-secondary);"><strong>原:</strong> ${L(u.original)}</div>
              <div style="font-size: 0.85rem; line-height: 1.4; color: var(--success-color);"><strong>译:</strong> ${L(u.translation)}</div>
            </div>`).join(""),I.style.display="block",E.style.display="none",document.getElementById("rag-ref-chevron").style.transform="rotate(0deg)",!0}else return k("未找到高相关历史参考","info"),!1}catch(a){return k("RAG 检索失败: "+a.message,"error"),!1}finally{r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-search"></i> 检索参考')}}document.getElementById("btn-get-rag").addEventListener("click",$);async function S(e=null){if(d===-1)return;const t=g[d],r=document.getElementById("btn-ai-translate"),a=document.getElementById("ai-candidates-panel"),m=document.getElementById("ai-candidates-list"),I=document.getElementById("btn-show-prev"),E=document.getElementById("ai-prev-items");A.getSettings().embeddingEnabled&&T.length===0&&await $(),r.disabled=!0,r.innerText=e?"获取建议修改中...":"AI 翻译中...";const u=document.getElementById("text-translation"),_=f.filter(w=>{const l=V(w);return l?l.test(t.original):!1});try{const w=await F.translateSingle({original:t.original,terms:_,suggestion:e,references:T});let l=[];const j=[...w.matchAll(/【(.*?)】/gs)];j.length>0?l=j.map(B=>B[1].trim()).filter(B=>B.length>0&&!/^译文\\d*$/.test(B)&&!/^版本\\d*$/.test(B)&&!/^选项\\d*$/.test(B)):w.includes("\\n")?l=w.split("\\n").filter(B=>B.trim().length>0).map(B=>B.replace(/^[-*0-9.]+\\s*/,"").trim()):l=[w.trim()],l.length===0&&(l=[w]),l.length<=1?(u.value=l[0]||w,z(u)):(m.querySelectorAll(".ai-card").length>0&&(i=Array.from(m.querySelectorAll(".ai-card")).map(B=>B.textContent.replace(/^#\\d+\\s*/,"").trim()),o(E,i),I.style.display="inline-block"),document.getElementById("ai-prev-list").style.display="none",o(m,l),a.style.display="flex")}catch(w){k(w.message,"error")}finally{r.disabled=!1,r.innerHTML='<i class="fas fa-robot"></i> AI 执行翻译'}}document.getElementById("btn-ai-translate").addEventListener("click",()=>S(null)),document.getElementById("btn-ai-suggest").addEventListener("click",()=>{if(d===-1)return;const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e.style.display==="none"?(e.style.display="block",t.focus()):(e.style.display="none",t.value="")}),document.getElementById("btn-submit-suggest").addEventListener("click",()=>{const t=document.getElementById("input-ai-suggest").value.trim();if(!t)return k("修改建议不能为空","warning");S(t)}),document.getElementById("input-ai-suggest").addEventListener("keydown",e=>{e.key==="Enter"&&document.getElementById("btn-submit-suggest").click()}),document.getElementById("btn-submit").addEventListener("click",async()=>{if(d===-1)return;const e=g[d],t=n.value.trim();if(!t)return k("翻译不能为空","error");const r=document.getElementById("btn-submit");r.disabled=!0;try{await q.updateString(c,e.id,t,1),A.saveTM(c,e.original,t),g[d].stage=1,g[d].translation=t,g[d].updatedAt=new Date().toISOString(),k("保存成功","success"),p(),R(d+1)}catch(a){k(a.message,"error")}finally{r.disabled=!1}})}H()}function N(s,c){if(!c||c.length===0)return L(s);let y=L(s);return[...c].sort((f,x)=>(x.term||"").length-(f.term||"").length).forEach(f=>{const x=V(f);x&&(y=y.replace(x,`<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${L(f.translation||"")}">$&</span>`))}),y}function L(s){return(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function O(s){return s.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}function V(s){if(!s||!s.term)return null;const c=[s.term];Array.isArray(s.variants)&&c.push(...s.variants);const y=c.map(h=>O(h)),g=y.length>1?`(${y.join("|")})`:y[0],f=/^\w/.test(s.term)?"\\b":"",x=/\w$/.test(s.term)?"\\b":"",d=s.caseSensitive?"g":"gi";return new RegExp(f+g+x,d)}export{X as render};
