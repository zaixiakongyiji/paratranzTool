const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rag-B_M9H2v_.js","assets/index-DCt6G-sU.js","assets/index-DF5UtTsd.css","assets/storage-D0vRnQMA.js"])))=>i.map(i=>d[i]);
import{n as j,_ as R}from"./index-DCt6G-sU.js";import{paraTranzApi as _}from"./paratranz-DQKCRvjE.js";import{S as L}from"./storage-D0vRnQMA.js";import{s as x}from"./toast-BNFNXAUb.js";const D={async getModels({baseUrl:d,apiKey:l,apiFormat:y}){if(!l)throw new Error("请输入 API Key 以获取模型");if(!d)throw new Error("请输入 Base URL");const s=d.endsWith("/")?d.slice(0,-1):d;if(y==="gemini"){const u=`${s}/models?key=${l}`,a=await fetch(u);if(!a.ok){const g=await a.text();throw new Error(`Gemini 获取失败: ${a.status} - ${g}`)}return((await a.json()).models||[]).map(g=>({id:g.name.replace("models/",""),name:g.displayName||g.name.replace("models/","")}))}else{const u=`${s}/models`,a=await fetch(u,{method:"GET",headers:{Authorization:`Bearer ${l}`}});if(!a.ok){const g=await a.text();throw new Error(`获取失败: ${a.status} - ${g}`)}return(await a.json()).data||[]}},async translateSingle({original:d,terms:l=[],systemPrompt:y,suggestion:s,references:u}){const a=L.getSettings();if(!a.aiApiKey)throw new Error("未配置 AI API Key，请前往设置页修改。");const c=a.aiBaseUrl.endsWith("/")?a.aiBaseUrl.slice(0,-1):a.aiBaseUrl,g=a.aiApiFormat==="gemini";let w="";l&&l.length>0&&(w=`

请严格遵守以下游戏术语翻译:
`+l.map(b=>`- "${b.term}" 翻译为 "${b.translation}"`).join(`
`));let B="";u&&u.length>0&&(B=`

以下是该项目中相似内容的历史翻译参考，请保持风格一致：
`+u.map((b,o)=>`${o+1}. "${b.original.substring(0,150)}" → "${b.translation.substring(0,150)}"`).join(`
`));const f=(y||a.aiPrompt||"你是一个专业翻译。")+w+B,z=s?`

用户对这句原文的翻译提出了特别的修改建议/要求，请在这次重新翻译中严格遵循：
【用户建议】：${s}`:"",T=`请将以下文本翻译成中文，提供4种不同风格的翻译版本。每一版翻译的结果必须直接用中文方括号【】包裹。
绝对不要添加“译文1”、“版本1”等任何多余的说明性文字，也不要在【】外附加任何文本。【】内必须且只能是翻译后的纯文本。格式示例：
【这是第一种风格的翻译结果...】
【这是第二种风格的翻译结果...】
【这是第三种风格的翻译结果...】
【这是第四种风格的翻译结果...】

原文：${d}${z}`;try{if(g){const b=a.aiModel||"gemini-1.5-pro",o=`${c}/models/${b}:generateContent?key=${a.aiApiKey}`,n=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:T}]}],systemInstruction:{parts:[{text:f}]},generationConfig:{temperature:.7}})});if(!n.ok){const m=await n.text();throw new Error(`Gemini 请求失败: ${n.status} - ${m}`)}const e=await n.json();if(e.candidates&&e.candidates[0]&&e.candidates[0].content&&e.candidates[0].content.parts[0])return e.candidates[0].content.parts[0].text.trim();throw new Error("Gemini API 响应解析失败")}else{const b=`${c}/chat/completions`,o=[{role:"system",content:f},{role:"user",content:T}],n=await fetch(b,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a.aiApiKey}`},body:JSON.stringify({model:a.aiModel||"gpt-3.5-turbo",messages:o,temperature:.7})});if(!n.ok){const m=await n.text();throw new Error(`AI 请求失败: ${n.status} - ${m}`)}return(await n.json()).choices[0].message.content.trim()}}catch(b){throw console.error("AI Translation Error:",b),b}}};async function Q(d,l){const y=l.get("projectId"),s=l.get("fileId");if(!y||!s){d.innerHTML='<div class="glass-panel text-center">缺少 projectId 或 fileId</div>';return}const u=l.get("stage")||"0";d.innerHTML='<div style="text-align:center; padding: 2rem;">加载词条数据中...</div>';try{let[a,c]=await Promise.all([_.getTerms(y).catch(()=>[]),_.getStrings(y,s,u==="all"?null:u)]);const g=L.getLocalGlossary(),w=new Map;a.forEach(f=>w.set(f.term,f.translation)),g.forEach(f=>w.set(f.term,f.translation));const B=Array.from(w.entries()).map(([f,z])=>({term:f,translation:z}));c=c||[],O(d,y,s,c,B,u)}catch(a){d.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${a.message}</div>`}}function O(d,l,y,s,u,a){let c=-1,g="none",w=[];function B(){d.innerHTML=`
      <div style="display: flex; height: calc(100vh - 120px); gap: 1.5rem;">
        <div class="glass-panel" style="width: 320px; display: flex; flex-direction: column;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sync-rag" class="btn btn-sm" title="同步语料库"><i class="fas fa-sync-alt"></i></button>
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${g==="none"?"":g==="asc"?"↑":"↓"}
              </button>
              <button id="btn-terms" class="btn btn-sm" title="查看术语表">📖</button>
              <button id="btn-back" class="btn btn-sm">返回</button>
            </div>
          </div>
  
          <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; margin-bottom: 1rem;">
            <button class="stage-tab ${a==="0"?"active":""}" data-stage="0" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">未翻</button>
            <button class="stage-tab ${a==="1"?"active":""}" data-stage="1" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">已翻</button>
            <button class="stage-tab ${a==="all"?"active":""}" data-stage="all" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">全部</button>
          </div>
  
          <div id="string-list" style="flex: 1; overflow-y: auto; padding-right: 0.5rem;"></div>
        </div>

        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column;">
          <h3 style="margin-bottom: 1rem;">工作台</h3>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
            <div style="flex: 1; display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">原文</label>
              <div id="text-original" style="flex: 1; background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); overflow-y: auto; font-size: 1.1rem; line-height: 1.6;"></div>
            </div>
            
            <div style="display: flex; gap: 0.8rem;">
              <button id="btn-ai-translate" class="btn btn-primary" style="flex: 1"><i class="fas fa-robot"></i> AI 执行翻译</button>
              <button id="btn-ai-suggest" class="btn" style="padding: 0 0.8rem;" title="提供修改建议重新生成"><i class="fas fa-comment-dots"></i> 修改建议</button>
              <button id="btn-toggle-candidates" class="btn" style="padding: 0 0.8rem;" title="展开/收起 AI 候选面板"><i class="fas fa-layer-group"></i> 已有候选</button>
              <button id="btn-tm-match" class="btn" style="flex: 1"><i class="fas fa-database"></i> 重新匹配 TM</button>
            </div>
            
            <div id="ai-suggest-panel" style="display: none; margin-top: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface);">
              <label style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">给 AI 提供修改建议</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="input-ai-suggest" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-color);" placeholder="输入希望调整的方向或注意点..." />
                <button id="btn-submit-suggest" class="btn btn-primary" style="white-space: nowrap;"><i class="fas fa-paper-plane"></i> 重新生成</button>
              </div>
            </div>

            <div id="ai-candidates-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
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
              <div id="ai-candidates-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
              <div id="ai-prev-list" style="display: none; margin-top: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
                <label style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.3rem; display: block;">上一轮候选:</label>
                <div id="ai-prev-items" style="display: flex; flex-direction: column; gap: 0.3rem;"></div>
              </div>
            </div>

            <div id="rag-ref-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface); margin-bottom: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600;"><i class="fas fa-project-diagram"></i> RAG 参考翻译</label>
                <button id="btn-close-rag" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1rem;">&times;</button>
              </div>
              <div id="rag-ref-list" style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; max-height: 150px; overflow-y: auto;"></div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">译文 (支持手动编辑)</label>
              <textarea id="text-translation" style="flex: 1; resize: none; font-size: 1.1rem; line-height: 1.6; padding: 1rem;"></textarea>
            </div>
          </div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
            <button id="btn-submit" class="btn btn-primary" style="padding: 0.6rem 2rem; font-size: 1rem;">提交至服务器并保存 TM 记录 (下一条)</button>
          </div>
        </div>
      </div>
    `,z(),f(),s.length>0&&T(0)}function f(){const o=document.getElementById("string-list");if(s.length===0){o.innerHTML='<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">当前状态下暂无词条</div>';return}let n=[...s].map((e,m)=>({...e,originalIndex:m}));g==="asc"?n.sort((e,m)=>new Date(e.updatedAt||0)-new Date(m.updatedAt||0)):g==="desc"&&n.sort((e,m)=>new Date(m.updatedAt||0)-new Date(e.updatedAt||0)),o.innerHTML=n.map(e=>{const m=e.stage===1;return`
        <div class="string-item" data-idx="${e.originalIndex}" style="padding: 0.8rem; border-bottom: 1px solid var(--border-color); cursor: pointer; border-radius: 4px; ${m?"opacity: 0.6":""}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${e.id}</span>
            ${m?'<span style="color: var(--success-color); font-size: 0.7rem;">✔</span>':""}
          </div>
          <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${m?"text-decoration: line-through;":""}">${P(e.original)}</div>
          ${e.updatedAt?`<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(e.updatedAt).toLocaleString()}</div>`:""}
        </div>
      `}).join(""),o.querySelectorAll(".string-item").forEach(e=>{e.addEventListener("click",()=>T(parseInt(e.dataset.idx)))})}function z(){document.getElementById("btn-back").addEventListener("click",()=>j(`/files?projectId=${l}`)),document.getElementById("btn-terms").addEventListener("click",()=>j(`/terms?projectId=${l}`)),document.getElementById("btn-sort").addEventListener("click",()=>{g==="none"?g="asc":g==="asc"?g="desc":g="none",B()}),d.querySelectorAll(".stage-tab").forEach(o=>{o.addEventListener("click",()=>{j(`/translate?projectId=${l}&fileId=${y}&stage=${o.dataset.stage}`)})}),document.getElementById("btn-sync-rag").addEventListener("click",async()=>{if(!L.getSettings().embeddingEnabled){x("请先在设置页开启向量化模型并配置 API","warning");return}const n=document.getElementById("btn-sync-rag");n.disabled=!0,n.innerHTML='<i class="fas fa-spinner fa-spin"></i>';try{const{RAG:e}=await R(async()=>{const{RAG:m}=await import("./rag-B_M9H2v_.js");return{RAG:m}},__vite__mapDeps([0,1,2,3]));await e.syncCorpus(l,(m,$)=>{x($,"info")}),x("语料库同步完成！","success")}catch(e){x("同步失败: "+e.message,"error")}finally{n.disabled=!1,n.innerHTML='<i class="fas fa-sync-alt"></i>'}}),b()}function T(o){if(o<0||o>=s.length)return;c=o;const n=s[o];document.querySelectorAll(".string-item").forEach(r=>{r.classList.remove("active"),r.style.background="transparent"});const e=d.querySelector(`.string-item[data-idx="${o}"]`);e&&(e.classList.add("active"),e.style.background="var(--bg-surface-hover)",e.scrollIntoView({behavior:"smooth",block:"nearest"})),document.getElementById("text-original").innerHTML=N(n.original,u),document.getElementById("text-translation").value=n.translation||"";const m=L.searchTM(l,n.original);m&&!document.getElementById("text-translation").value&&(document.getElementById("text-translation").value=m);const $=document.getElementById("ai-candidates-panel");$&&($.style.display="none");const t=document.getElementById("ai-candidates-list");t&&(t.innerHTML="");const i=document.getElementById("ai-suggest-panel"),p=document.getElementById("input-ai-suggest");i&&(i.style.display="none"),p&&(p.value=""),w=[];const v=document.getElementById("rag-ref-panel");v&&(v.style.display="none"),L.getSettings().embeddingEnabled&&n.original&&R(()=>import("./rag-B_M9H2v_.js"),__vite__mapDeps([0,1,2,3])).then(async({RAG:r})=>{try{const M=await r.retrieveReferences(l,n.original,{fileId:y});if(c===o&&M.length>0){w=M;const G=document.getElementById("rag-ref-list"),q=document.getElementById("rag-ref-panel");G.innerHTML=M.map((H,F)=>`<div style="padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color);">
                <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.2rem;">相似度: ${(H.score*100).toFixed(1)}% | ${H.fileName}</div>
                <div style="font-size: 0.8rem;"><strong>原:</strong> ${H.original.substring(0,80)}...</div>
                <div style="font-size: 0.8rem; color: var(--success-color);"><strong>译:</strong> ${H.translation.substring(0,80)}...</div>
              </div>`).join(""),q.style.display="block"}}catch(M){console.warn("RAG 检索失败:",M)}});const C=n.stage===2,k=document.getElementById("text-translation"),h=document.getElementById("btn-submit"),E=document.getElementById("btn-ai-translate"),I=document.getElementById("btn-tm-match"),S=document.getElementById("btn-toggle-candidates");C?(k.disabled=!0,k.style.background="var(--bg-surface)",k.placeholder="当前词条已审核通过，已锁定，禁止修改",h.disabled=!0,h.innerHTML='<i class="fas fa-lock"></i> 词条已审核，禁止修改',h.style.background="var(--bg-surface)",h.style.borderColor="var(--border-color)",h.style.color="var(--text-secondary)",[E,I,S,document.getElementById("btn-ai-suggest")].forEach(r=>{r&&(r.disabled=!0,r.style.opacity="0.5",r.style.cursor="not-allowed")})):(k.disabled=!1,k.style.background="var(--bg-color)",k.placeholder="",h.disabled=!1,h.innerHTML="提交至服务器并保存 TM 记录 (下一条)",h.style.background="",h.style.borderColor="",h.style.color="",[E,I,S,document.getElementById("btn-ai-suggest")].forEach(r=>{r&&(r.disabled=!1,r.style.opacity="1",r.style.cursor="pointer")}))}function b(){const o=document.getElementById("text-translation");document.getElementById("btn-tm-match").addEventListener("click",()=>{if(c===-1)return;const t=s[c],i=L.searchTM(l,t.original);i?(o.value=i,x("完成记忆回显","success")):x("记忆库无匹配内容","warning")});let n="overwrite",e=[];document.getElementById("btn-close-candidates").addEventListener("click",()=>{document.getElementById("ai-candidates-panel").style.display="none"}),document.querySelectorAll(".ai-mode-btn").forEach(t=>{t.addEventListener("click",()=>{n=t.dataset.mode,document.querySelectorAll(".ai-mode-btn").forEach(i=>{i.style.background="transparent",i.style.color="var(--text-secondary)"}),t.style.background="var(--accent-color)",t.style.color="#fff"})}),document.getElementById("btn-show-prev").addEventListener("click",()=>{const t=document.getElementById("ai-prev-list");t.style.display=t.style.display==="none"?"block":"none"});function m(t,i){t.innerHTML=i.map((p,v)=>`
        <div class="ai-card" data-ci="${v}" style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
          <span style="color: var(--accent-color); font-weight:600;">#${v+1}</span> ${P(p)}
        </div>
      `).join(""),t.querySelectorAll(".ai-card").forEach((p,v)=>{p.addEventListener("click",()=>{n==="append"?o.value+=(o.value?`
`:"")+i[v]:o.value=i[v],t.querySelectorAll(".ai-card").forEach(A=>{A.style.borderColor="var(--border-color)",A.style.background="transparent"}),p.style.borderColor="var(--accent-color)",p.style.background="rgba(99, 102, 241, 0.1)",x(`已${n==="append"?"追加":"选择"}版本 #${v+1}`,"success"),document.getElementById("ai-candidates-panel").style.display="none"})})}document.getElementById("btn-toggle-candidates").addEventListener("click",()=>{const t=document.getElementById("ai-candidates-panel");if(document.getElementById("ai-candidates-list").innerHTML.trim()===""){x("当前没有候选文本，请先执行 AI 翻译","warning");return}t.style.display=t.style.display==="none"?"block":"none"}),document.getElementById("btn-close-rag").addEventListener("click",()=>{document.getElementById("rag-ref-panel").style.display="none"});async function $(t=null){if(c===-1)return;const i=s[c],p=document.getElementById("btn-ai-translate"),v=document.getElementById("ai-candidates-panel"),A=document.getElementById("ai-candidates-list"),C=document.getElementById("btn-show-prev"),k=document.getElementById("ai-prev-items");p.disabled=!0,p.innerText=t?"获取建议修改中...":"AI 翻译中...";const h=document.getElementById("text-translation");try{const E=await D.translateSingle({original:i.original,terms:u,suggestion:t,references:w});let I=[];const S=[...E.matchAll(/【(.*?)】/gs)];S.length>0?I=S.map(r=>r[1].trim()).filter(r=>r.length>0&&!/^译文\\d*$/.test(r)&&!/^版本\\d*$/.test(r)&&!/^选项\\d*$/.test(r)):E.includes("\\n")?I=E.split("\\n").filter(r=>r.trim().length>0).map(r=>r.replace(/^[-*0-9.]+\\s*/,"").trim()):I=[E.trim()],I.length===0&&(I=[E]),I.length<=1?h.value=I[0]||E:(A.querySelectorAll(".ai-card").length>0&&(e=Array.from(A.querySelectorAll(".ai-card")).map(r=>r.textContent.replace(/^#\\d+\\s*/,"").trim()),m(k,e),C.style.display="inline-block"),document.getElementById("ai-prev-list").style.display="none",m(A,I),v.style.display="block")}catch(E){x(E.message,"error")}finally{p.disabled=!1,p.innerHTML='<i class="fas fa-robot"></i> AI 执行翻译'}}document.getElementById("btn-ai-translate").addEventListener("click",()=>$(null)),document.getElementById("btn-ai-suggest").addEventListener("click",()=>{if(c===-1)return;const t=document.getElementById("ai-suggest-panel"),i=document.getElementById("input-ai-suggest");t.style.display==="none"?(t.style.display="block",i.focus()):(t.style.display="none",i.value="")}),document.getElementById("btn-submit-suggest").addEventListener("click",()=>{const i=document.getElementById("input-ai-suggest").value.trim();if(!i)return x("修改建议不能为空","warning");$(i)}),document.getElementById("input-ai-suggest").addEventListener("keydown",t=>{t.key==="Enter"&&document.getElementById("btn-submit-suggest").click()}),document.getElementById("btn-submit").addEventListener("click",async()=>{if(c===-1)return;const t=s[c],i=o.value.trim();if(!i)return x("翻译不能为空","error");const p=document.getElementById("btn-submit");p.disabled=!0;try{await _.updateString(l,t.id,i,1),L.saveTM(l,t.original,i),s[c].stage=1,s[c].translation=i,s[c].updatedAt=new Date().toISOString(),x("保存成功","success"),f(),T(c+1)}catch(v){x(v.message,"error")}finally{p.disabled=!1}})}B()}function N(d,l){if(!l||l.length===0)return P(d);let y=P(d);return l.forEach(s=>{if(!s.term)return;const u=new RegExp(W(s.term),"gi");y=y.replace(u,`<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${P(s.translation||"")}">${s.term}</span>`)}),y}function P(d){return(d||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function W(d){return d.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}export{Q as render};
