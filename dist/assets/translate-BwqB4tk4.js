const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rag-DZFIhZUU.js","assets/index-B2wNt7Gv.js","assets/index-DF5UtTsd.css","assets/storage-CDYOJb6j.js"])))=>i.map(i=>d[i]);
import{n as R,_ as j}from"./index-B2wNt7Gv.js";import{paraTranzApi as q}from"./paratranz-CWirhJTz.js";import{AIClient as D}from"./ai-C8C5Ab_V.js";import{Storage as L}from"./storage-CDYOJb6j.js";import{showToast as b}from"./toast-_A8NGhfi.js";async function K(m,d){const f=d.get("projectId"),a=d.get("fileId");if(!f||!a){m.innerHTML='<div class="glass-panel text-center">缺少 projectId 或 fileId</div>';return}const E=d.get("stage")||"0";m.innerHTML='<div style="text-align:center; padding: 2rem;">加载词条数据中...</div>';try{let[w,o]=await Promise.all([q.getTerms(f).catch(()=>[]),q.getStrings(f,a,E==="all"?null:E)]);const v=L.getLocalGlossary(),h=new Map;w.forEach(x=>h.set(x.term,x.translation)),v.forEach(x=>h.set(x.term,x.translation));const M=Array.from(h.entries()).map(([x,S])=>({term:x,translation:S}));o=o||[],_(m,f,a,o,M,E)}catch(w){m.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${w.message}</div>`}}function _(m,d,f,a,E,w){let o=-1,v="none",h=[];function M(){m.innerHTML=`
      <div style="display: flex; height: calc(100vh - 120px); gap: 1.5rem;">
        <div class="glass-panel" style="width: 320px; display: flex; flex-direction: column;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${v==="none"?"":v==="asc"?"↑":"↓"}
              </button>
              <button id="btn-terms" class="btn btn-sm" title="查看术语表">📖</button>
              <button id="btn-back" class="btn btn-sm">返回</button>
            </div>
          </div>
  
          <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; margin-bottom: 1rem;">
            <button class="stage-tab ${w==="0"?"active":""}" data-stage="0" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">未翻</button>
            <button class="stage-tab ${w==="1"?"active":""}" data-stage="1" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">已翻</button>
            <button class="stage-tab ${w==="all"?"active":""}" data-stage="all" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">全部</button>
          </div>
  
          <div id="string-list" style="flex: 1; overflow-y: auto; padding-right: 0.5rem;"></div>
        </div>

        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column;">
          <h3 style="margin-bottom: 1rem;">工作台</h3>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
            <div style="flex: 1; display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">原文</label>
              <div id="text-original" style="flex: 1; background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); overflow-y: auto; font-size: 1.1rem; line-height: 1.6; white-space: pre-wrap;"></div>
            </div>
            
            <div style="display: flex; gap: 0.8rem;">
              <button id="btn-ai-translate" class="btn btn-primary" style="flex: 1"><i class="fas fa-robot"></i> AI 执行翻译</button>
              <button id="btn-get-rag" class="btn" style="white-space: nowrap;" title="手动从本地语料库检索参考"><i class="fas fa-search"></i> 检索参考</button>
              <button id="btn-tm-match" class="btn" style="white-space: nowrap;"><i class="fas fa-database"></i> 记忆库</button>
              <button id="btn-toggle-candidates" class="btn" style="padding: 0 0.8rem;" title="展开/收起 AI 候选面板"><i class="fas fa-layer-group"></i> 已有候选</button>
              <button id="btn-ai-suggest" class="btn" style="padding: 0 0.8rem;" title="提供修改建议重新生成"><i class="fas fa-comment-dots"></i> 修改建议</button>
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
    `,S(),x(),a.length>0&&H(0)}function x(){const l=document.getElementById("string-list");if(a.length===0){l.innerHTML='<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">当前状态下暂无词条</div>';return}let p=[...a].map((n,u)=>({...n,originalIndex:u}));v==="asc"?p.sort((n,u)=>new Date(n.updatedAt||0)-new Date(u.updatedAt||0)):v==="desc"&&p.sort((n,u)=>new Date(u.updatedAt||0)-new Date(n.updatedAt||0)),l.innerHTML=p.map(n=>{const u=n.stage===1;return`
        <div class="string-item" data-idx="${n.originalIndex}" style="padding: 0.8rem; border-bottom: 1px solid var(--border-color); cursor: pointer; border-radius: 4px; ${u?"opacity: 0.6":""}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${n.id}</span>
            ${u?'<span style="color: var(--success-color); font-size: 0.7rem;">✔</span>':""}
          </div>
          <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${u?"text-decoration: line-through;":""}">${z(n.original)}</div>
          ${n.updatedAt?`<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(n.updatedAt).toLocaleString()}</div>`:""}
        </div>
      `}).join(""),l.querySelectorAll(".string-item").forEach(n=>{n.addEventListener("click",()=>H(parseInt(n.dataset.idx)))})}function S(){document.getElementById("btn-back").addEventListener("click",()=>R(`/files?projectId=${d}`)),document.getElementById("btn-terms").addEventListener("click",()=>R(`/terms?projectId=${d}`)),document.getElementById("btn-sort").addEventListener("click",()=>{v==="none"?v="asc":v==="asc"?v="desc":v="none",M()}),m.querySelectorAll(".stage-tab").forEach(l=>{l.addEventListener("click",()=>{R(`/translate?projectId=${d}&fileId=${f}&stage=${l.dataset.stage}`)})}),P()}function H(l){if(l<0||l>=a.length)return;o=l;const p=a[l];document.querySelectorAll(".string-item").forEach(s=>{s.classList.remove("active"),s.style.background="transparent"});const n=m.querySelector(`.string-item[data-idx="${l}"]`);n&&(n.classList.add("active"),n.style.background="var(--bg-surface-hover)",n.scrollIntoView({behavior:"smooth",block:"nearest"})),document.getElementById("text-original").innerHTML=G(p.original,E),document.getElementById("text-translation").value=p.translation||"";const u=L.searchTM(d,p.original);u&&!document.getElementById("text-translation").value&&(document.getElementById("text-translation").value=u);const A=document.getElementById("ai-candidates-panel");A&&(A.style.display="none");const $=document.getElementById("ai-candidates-list");$&&($.innerHTML="");const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e&&(e.style.display="none"),t&&(t.value=""),h=[];const r=document.getElementById("rag-ref-panel");r&&(r.style.display="none");const c=p.stage===2,i=document.getElementById("text-translation"),g=document.getElementById("btn-submit"),B=document.getElementById("btn-ai-translate"),I=document.getElementById("btn-tm-match"),T=document.getElementById("btn-toggle-candidates");c?(i.disabled=!0,i.style.background="var(--bg-surface)",i.placeholder="当前词条已审核通过，已锁定，禁止修改",g.disabled=!0,g.innerHTML='<i class="fas fa-lock"></i> 词条已审核，禁止修改',g.style.background="var(--bg-surface)",g.style.borderColor="var(--border-color)",g.style.color="var(--text-secondary)",[B,I,T,document.getElementById("btn-ai-suggest")].forEach(s=>{s&&(s.disabled=!0,s.style.opacity="0.5",s.style.cursor="not-allowed")})):(i.disabled=!1,i.style.background="var(--bg-color)",i.placeholder="",g.disabled=!1,g.innerHTML="提交至服务器并保存 TM 记录 (下一条)",g.style.background="",g.style.borderColor="",g.style.color="",[B,I,T,document.getElementById("btn-ai-suggest")].forEach(s=>{s&&(s.disabled=!1,s.style.opacity="1",s.style.cursor="pointer")}))}function P(){const l=document.getElementById("text-translation");document.getElementById("btn-tm-match").addEventListener("click",()=>{if(o===-1)return;const e=a[o],t=L.searchTM(d,e.original);t?(l.value=t,b("完成记忆回显","success")):b("记忆库无匹配内容","warning")});let p="overwrite",n=[];document.getElementById("btn-close-candidates").addEventListener("click",()=>{document.getElementById("ai-candidates-panel").style.display="none"}),document.querySelectorAll(".ai-mode-btn").forEach(e=>{e.addEventListener("click",()=>{p=e.dataset.mode,document.querySelectorAll(".ai-mode-btn").forEach(t=>{t.style.background="transparent",t.style.color="var(--text-secondary)"}),e.style.background="var(--accent-color)",e.style.color="#fff"})}),document.getElementById("btn-show-prev").addEventListener("click",()=>{const e=document.getElementById("ai-prev-list");e.style.display=e.style.display==="none"?"block":"none"});function u(e,t){e.innerHTML=t.map((r,c)=>`
        <div class="ai-card" data-ci="${c}" style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
          <span style="color: var(--accent-color); font-weight:600;">#${c+1}</span> ${z(r)}
        </div>
      `).join(""),e.querySelectorAll(".ai-card").forEach((r,c)=>{r.addEventListener("click",()=>{p==="append"?l.value+=(l.value?`
`:"")+t[c]:l.value=t[c],e.querySelectorAll(".ai-card").forEach(i=>{i.style.borderColor="var(--border-color)",i.style.background="transparent"}),r.style.borderColor="var(--accent-color)",r.style.background="rgba(99, 102, 241, 0.1)",b(`已${p==="append"?"追加":"选择"}版本 #${c+1}`,"success"),document.getElementById("ai-candidates-panel").style.display="none"})})}document.getElementById("btn-toggle-candidates").addEventListener("click",()=>{const e=document.getElementById("ai-candidates-panel");if(document.getElementById("ai-candidates-list").innerHTML.trim()===""){b("当前没有候选文本，请先执行 AI 翻译","warning");return}e.style.display=e.style.display==="none"?"block":"none"}),document.getElementById("btn-close-rag").addEventListener("click",()=>{document.getElementById("rag-ref-panel").style.display="none"});async function A(){if(o===-1)return!1;const e=a[o];if(!L.getSettings().embeddingEnabled)return b("未开启向量化模型，无法检索","warning"),!1;const r=document.getElementById("btn-get-rag");r&&(r.disabled=!0,r.innerHTML='<i class="fas fa-spinner fa-spin"></i> 检索中...');try{const{RAG:c}=await j(async()=>{const{RAG:g}=await import("./rag-DZFIhZUU.js");return{RAG:g}},__vite__mapDeps([0,1,2,3])),i=await c.retrieveReferences(d,e.original,{fileId:f});if(h=i,i.length>0){const g=document.getElementById("rag-ref-list"),B=document.getElementById("rag-ref-panel");return g.innerHTML=i.map((I,T)=>`<div style="padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color);">
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.2rem;">相似度: ${(I.score*100).toFixed(1)}% | ${I.fileName}</div>
              <div style="font-size: 0.8rem;"><strong>原:</strong> ${I.original.substring(0,80)}...</div>
              <div style="font-size: 0.8rem; color: var(--success-color);"><strong>译:</strong> ${I.translation.substring(0,80)}...</div>
            </div>`).join(""),B.style.display="block",!0}else return b("未找到高相关历史参考","info"),!1}catch(c){return b("RAG 检索失败: "+c.message,"error"),!1}finally{r&&(r.disabled=!1,r.innerHTML='<i class="fas fa-search"></i> 检索参考')}}document.getElementById("btn-get-rag").addEventListener("click",A);async function $(e=null){if(o===-1)return;const t=a[o],r=document.getElementById("btn-ai-translate"),c=document.getElementById("ai-candidates-panel"),i=document.getElementById("ai-candidates-list"),g=document.getElementById("btn-show-prev"),B=document.getElementById("ai-prev-items");L.getSettings().embeddingEnabled&&h.length===0&&await A(),r.disabled=!0,r.innerText=e?"获取建议修改中...":"AI 翻译中...";const T=document.getElementById("text-translation");try{const s=await D.translateSingle({original:t.original,terms:E,suggestion:e,references:h});let k=[];const C=[...s.matchAll(/【(.*?)】/gs)];C.length>0?k=C.map(y=>y[1].trim()).filter(y=>y.length>0&&!/^译文\\d*$/.test(y)&&!/^版本\\d*$/.test(y)&&!/^选项\\d*$/.test(y)):s.includes("\\n")?k=s.split("\\n").filter(y=>y.trim().length>0).map(y=>y.replace(/^[-*0-9.]+\\s*/,"").trim()):k=[s.trim()],k.length===0&&(k=[s]),k.length<=1?T.value=k[0]||s:(i.querySelectorAll(".ai-card").length>0&&(n=Array.from(i.querySelectorAll(".ai-card")).map(y=>y.textContent.replace(/^#\\d+\\s*/,"").trim()),u(B,n),g.style.display="inline-block"),document.getElementById("ai-prev-list").style.display="none",u(i,k),c.style.display="block")}catch(s){b(s.message,"error")}finally{r.disabled=!1,r.innerHTML='<i class="fas fa-robot"></i> AI 执行翻译'}}document.getElementById("btn-ai-translate").addEventListener("click",()=>$(null)),document.getElementById("btn-ai-suggest").addEventListener("click",()=>{if(o===-1)return;const e=document.getElementById("ai-suggest-panel"),t=document.getElementById("input-ai-suggest");e.style.display==="none"?(e.style.display="block",t.focus()):(e.style.display="none",t.value="")}),document.getElementById("btn-submit-suggest").addEventListener("click",()=>{const t=document.getElementById("input-ai-suggest").value.trim();if(!t)return b("修改建议不能为空","warning");$(t)}),document.getElementById("input-ai-suggest").addEventListener("keydown",e=>{e.key==="Enter"&&document.getElementById("btn-submit-suggest").click()}),document.getElementById("btn-submit").addEventListener("click",async()=>{if(o===-1)return;const e=a[o],t=l.value.trim();if(!t)return b("翻译不能为空","error");const r=document.getElementById("btn-submit");r.disabled=!0;try{await q.updateString(d,e.id,t,1),L.saveTM(d,e.original,t),a[o].stage=1,a[o].translation=t,a[o].updatedAt=new Date().toISOString(),b("保存成功","success"),x(),H(o+1)}catch(c){b(c.message,"error")}finally{r.disabled=!1}})}M()}function G(m,d){if(!d||d.length===0)return z(m);let f=z(m);return d.forEach(a=>{if(!a.term)return;const E=new RegExp(F(a.term),"gi");f=f.replace(E,`<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${z(a.translation||"")}">${a.term}</span>`)}),f}function z(m){return(m||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function F(m){return m.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}export{K as render};
