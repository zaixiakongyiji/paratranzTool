const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rag-D5hdskZO.js","assets/index-brdRQtiN.js","assets/index-DHAYdvpI.css","assets/storage-CDYOJb6j.js","assets/vectorStore-Bdrxp0IF.js"])))=>i.map(i=>d[i]);
import{n as b,_ as p}from"./index-brdRQtiN.js";import{paraTranzApi as h}from"./paratranz-B8WEvIb5.js";import"./storage-CDYOJb6j.js";async function D(c,w){const f=w.get("projectId");if(!f){c.innerHTML='<div class="glass-panel">缺少项目 ID 参数。</div>';return}c.innerHTML='<div style="text-align:center; padding: 2rem;">加载项目与文件列表中...</div>';try{let u=function(){c.innerHTML=`
        <div style="max-width: 1000px; margin: 0 auto; display: flex; gap: 1.5rem; align-items: flex-start;">
          <!-- 左侧 TODO 侧边栏 (固定宽度，跟随滚动) -->
          <div class="glass-panel" style="width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.8rem; padding: 1rem; position: sticky; top: 1rem;">
            <div style="font-weight: 600; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">TODO 概览</div>
            <div class="nav-item active" style="padding: 0.6rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; background: var(--accent-color); color: white;">
              <i class="fas fa-file-alt"></i> 文件列表
            </div>
            <div class="nav-item" style="padding: 0.6rem; border-radius: 6px; cursor: not-allowed; display: flex; align-items: center; gap: 0.6rem; opacity: 0.5;">
              <i class="fas fa-chart-pie"></i> 统计 (待办)
            </div>
            <div class="nav-item" style="padding: 0.6rem; border-radius: 6px; cursor: not-allowed; display: flex; align-items: center; gap: 0.6rem; opacity: 0.5;">
              <i class="fas fa-history"></i> 历史 (待办)
            </div>
          </div>

          <!-- 右侧主内容 (主容器自然滚动) -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                <button id="btn-back-header" class="btn btn-sm" title="返回项目列表" style="padding: 0.4rem 0.6rem;"><i class="fas fa-arrow-left"></i> 返回</button>
                <h2 style="font-size: 1.1rem; margin: 0;">${y.name||"未知项目"} <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: normal;">(ID: ${f})</span></h2>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button id="btn-sync-rag" class="btn btn-sm" title="同步语料库"><i class="fas fa-sync-alt"></i> 同步</button>
                <button id="btn-clear-rag" class="btn btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" title="清空语料库"><i class="fas fa-trash-alt"></i> 清空</button>
              </div>
            </div>

            <!-- 筛选栏 -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-shrink: 0;">
              <button class="btn btn-sm filter-btn ${m==="all"?"btn-primary":""}" data-filter="all">全部</button>
              <button class="btn btn-sm filter-btn ${m==="todo"?"btn-primary":""}" data-filter="todo">待处理</button>
              <button class="btn btn-sm filter-btn ${m==="done"?"btn-primary":""}" data-filter="done">已完成</button>
            </div>

            <div id="file-list-content" style="display: flex; flex-direction: column; gap: 0.6rem; padding-bottom: 2rem;">
              ${_.map((t,s)=>{const e=t.files.filter(a=>m==="done"?a.isDone:m==="todo"?!a.isDone:!0);return e.length===0?"":`
                <div class="folder-group glass-panel" style="padding: 0; border: 1px solid var(--border-color); overflow: hidden; border-radius: 8px;">
                  <div class="folder-header" style="padding: 0.6rem 1rem; cursor: pointer; display: flex; align-items: center; background: rgba(255,255,255,0.02); hover: background: rgba(255,255,255,0.04);">
                    <i class="fas fa-chevron-right folder-arrow" style="margin-right: 0.6rem; transition: transform 0.2s; font-size: 0.75rem; color: var(--text-secondary); ${m!=="all"?"transform: rotate(90deg);":""}"></i>
                    <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${t.name} <span style="font-weight: normal; font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.4rem;">${e.length}</span></div>
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                      <div class="mini-progress" style="width: 50px; height: 3px; background: var(--bg-color); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${t.percent}%; height: 100%; background: var(--accent-color);"></div>
                      </div>
                      <span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 30px; text-align: right;">${t.percent}%</span>
                    </div>
                  </div>
                  <!-- 面板内部独立滚动，并限制最大高度，防止撑开外层导致排版挤压 -->
                  <div class="folder-content" style="display: ${m!=="all"?"block":"none"}; max-height: 400px; overflow-y: auto; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.05);">
                    ${e.map(a=>`
                      <div class="file-row" data-id="${a.id}" style="padding: 0.5rem 1rem 0.5rem 2.4rem; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; cursor: pointer; position: relative;">
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="far fa-file-code" style="color: var(--text-secondary); font-size: 0.75rem;"></i>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a.name.split("/").pop()}</span>
                            ${a.isDone?'<i class="fas fa-check-circle" style="color: var(--success-color); font-size: 0.75rem;"></i>':""}
                          </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-left: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
                          <div style="min-width: 70px; text-align: right;">${a.translated}/${a.total}</div>
                          <button class="btn btn-sm btn-action" style="padding: 1px 6px; font-size: 0.7rem; min-width: 44px;">${a.isDone?"查看":"翻译"}</button>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `}).join("")}
            </div>
          </div>
        </div>
      `;const r=()=>b("/projects"),d=document.getElementById("btn-back");d&&d.addEventListener("click",r);const n=document.getElementById("btn-back-header");n&&n.addEventListener("click",r),c.querySelectorAll(".filter-btn").forEach(t=>{t.addEventListener("click",()=>{m=t.dataset.filter,u()})}),c.querySelectorAll(".folder-header").forEach(t=>{t.addEventListener("click",()=>{const s=t.nextElementSibling,e=t.querySelector(".folder-arrow"),a=s.style.display==="none";s.style.display=a?"block":"none",e.style.transform=a?"rotate(90deg)":"rotate(0deg)"})}),c.querySelectorAll(".file-row").forEach(t=>{t.addEventListener("click",s=>{const e=t.dataset.id,a=t.querySelector(".fa-check-circle")!==null;b(`/translate?projectId=${f}&fileId=${e}${a?"&stage=all":""}`)})});const i=document.getElementById("btn-sync-rag");i&&i.addEventListener("click",async()=>{const{Storage:t}=await p(async()=>{const{Storage:e}=await import("./storage-CDYOJb6j.js");return{Storage:e}},[]);if(!t.getSettings().embeddingEnabled){const{showToast:e}=await p(async()=>{const{showToast:a}=await import("./toast-_A8NGhfi.js");return{showToast:a}},[]);e("请先在配置页开启向量化模型","warning");return}i.disabled=!0,i.innerHTML='<i class="fas fa-spinner fa-spin"></i> 同步中...';try{const{RAG:e}=await p(async()=>{const{RAG:o}=await import("./rag-D5hdskZO.js");return{RAG:o}},__vite__mapDeps([0,1,2,3,4])),{showToast:a}=await p(async()=>{const{showToast:o}=await import("./toast-_A8NGhfi.js");return{showToast:o}},[]);await e.syncCorpus(f,(o,E)=>{a(E,o==="warning"||o==="error"?o:"info")}),a("项目语料库同步流程结束","success")}catch(e){const{showToast:a}=await p(async()=>{const{showToast:o}=await import("./toast-_A8NGhfi.js");return{showToast:o}},[]);a("同步失败: "+e.message,"error")}finally{i.disabled=!1,i.innerHTML='<i class="fas fa-sync-alt"></i> 同步'}});const l=document.getElementById("btn-clear-rag");l&&l.addEventListener("click",async()=>{if(confirm("确定要清空该项目所有的本地语料缓存以及远端 Qdrant 向量数据吗？")){l.disabled=!0,l.innerHTML='<i class="fas fa-spinner fa-spin"></i>...';try{const{VectorStore:t}=await p(async()=>{const{VectorStore:e}=await import("./vectorStore-Bdrxp0IF.js");return{VectorStore:e}},__vite__mapDeps([4,1,2,3]));await t.deleteProjectData(f);const{showToast:s}=await p(async()=>{const{showToast:e}=await import("./toast-_A8NGhfi.js");return{showToast:e}},[]);s("语料数据已成功清空！","success")}catch(t){const{showToast:s}=await p(async()=>{const{showToast:e}=await import("./toast-_A8NGhfi.js");return{showToast:e}},[]);s("清空失败: "+t.message,"error")}finally{l.disabled=!1,l.innerHTML='<i class="fas fa-trash-alt"></i> 清空'}}})};const[y,v]=await Promise.all([h.getProject(f).catch(()=>({name:"未知项目"})),h.getFiles(f)]);if(!v||v.length===0){c.innerHTML='<div class="glass-panel">该项目下没有文件。</div>';return}const x=v.map((r,d)=>{const n=r.total||0,i=r.translated||0,l=r.hidden||0,t=r.reviewed||0,s=Math.max(0,n-i-l),e=i+l,a=n>0?Math.min(100,Math.round(e/n*100)):0,o=e>=n&&n>0;return{...r,index:d,total:n,translated:i,hidden:l,reviewed:t,untranslated:s,finishedCount:e,percent:a,isDone:o}}),g=new Map;x.forEach(r=>{const d=r.name.split("/"),n=d.length>1?d.slice(0,-1).join("/")+"/":"/";g.has(n)||g.set(n,{name:n,files:[],total:0,translated:0,hidden:0,reviewed:0,percent:0});const i=g.get(n);i.files.push(r),i.total+=r.total,i.translated+=r.translated,i.hidden+=r.hidden,i.reviewed+=r.reviewed}),g.forEach(r=>{const d=r.translated+r.hidden;r.percent=r.total>0?Math.min(100,Math.round(d/r.total*100)):0});const _=Array.from(g.values());let m="all";u()}catch(y){c.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${y.message}</div>`}}export{D as render};
