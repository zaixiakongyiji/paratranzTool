const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rag-DauMPrO4.js","assets/index-LDMxwuiV.js","assets/index-DHAYdvpI.css","assets/storage-CDYOJb6j.js","assets/vectorStore-BwS8jpvf.js"])))=>i.map(i=>d[i]);
import{n as g,_ as d}from"./index-LDMxwuiV.js";import{paraTranzApi as x}from"./paratranz-B8WEvIb5.js";import"./storage-CDYOJb6j.js";async function L(o,u){const c=u.get("projectId");if(!c){o.innerHTML='<div class="glass-panel">缺少项目 ID 参数。</div>';return}o.innerHTML='<div style="text-align:center; padding: 2rem;">加载文件列表中...</div>';try{let v=function(){o.innerHTML=`
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
            <div style="margin-top: 1.5rem; padding-top: 0.8rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-secondary);">
              <button id="btn-back" class="btn btn-sm" style="width: 100%;">返回项目</button>
            </div>
          </div>

          <!-- 右侧主内容 (主容器自然滚动) -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-shrink: 0;">
              <h2 style="font-size: 1.1rem; margin: 0;">文件管理 (ID: ${c})</h2>
              <div style="display: flex; gap: 0.5rem;">
                <button id="btn-sync-rag" class="btn btn-sm" title="同步语料库"><i class="fas fa-sync-alt"></i> 同步</button>
                <button id="btn-clear-rag" class="btn btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" title="清空语料库"><i class="fas fa-trash-alt"></i> 清空</button>
              </div>
            </div>

            <!-- 筛选栏 -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-shrink: 0;">
              <button class="btn btn-sm filter-btn ${l==="all"?"btn-primary":""}" data-filter="all">全部</button>
              <button class="btn btn-sm filter-btn ${l==="todo"?"btn-primary":""}" data-filter="todo">待处理</button>
              <button class="btn btn-sm filter-btn ${l==="done"?"btn-primary":""}" data-filter="done">已完成</button>
            </div>

            <div id="file-list-content" style="display: flex; flex-direction: column; gap: 0.6rem; padding-bottom: 2rem;">
              ${h.map((e,a)=>{const r=e.files.filter(i=>l==="done"?i.isDone:l==="todo"?!i.isDone:!0);return r.length===0?"":`
                <div class="folder-group glass-panel" style="padding: 0; border: 1px solid var(--border-color); overflow: hidden; border-radius: 8px;">
                  <div class="folder-header" style="padding: 0.6rem 1rem; cursor: pointer; display: flex; align-items: center; background: rgba(255,255,255,0.02); hover: background: rgba(255,255,255,0.04);">
                    <i class="fas fa-chevron-right folder-arrow" style="margin-right: 0.6rem; transition: transform 0.2s; font-size: 0.75rem; color: var(--text-secondary); ${l!=="all"?"transform: rotate(90deg);":""}"></i>
                    <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${e.name} <span style="font-weight: normal; font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.4rem;">${r.length}</span></div>
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                      <div class="mini-progress" style="width: 50px; height: 3px; background: var(--bg-color); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${e.percent}%; height: 100%; background: var(--accent-color);"></div>
                      </div>
                      <span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 30px; text-align: right;">${e.percent}%</span>
                    </div>
                  </div>
                  <!-- 面板内部独立滚动，并限制最大高度，防止撑开外层导致排版挤压 -->
                  <div class="folder-content" style="display: ${l!=="all"?"block":"none"}; max-height: 400px; overflow-y: auto; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.05);">
                    ${r.map(i=>`
                      <div class="file-row" data-id="${i.id}" style="padding: 0.5rem 1rem 0.5rem 2.4rem; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; cursor: pointer; position: relative;">
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="far fa-file-code" style="color: var(--text-secondary); font-size: 0.75rem;"></i>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${i.name.split("/").pop()}</span>
                            ${i.isDone?'<i class="fas fa-check-circle" style="color: var(--success-color); font-size: 0.75rem;"></i>':""}
                          </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-left: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
                          <div style="min-width: 70px; text-align: right;">${i.translated}/${i.total}</div>
                          <button class="btn btn-sm btn-action" style="padding: 1px 6px; font-size: 0.7rem; min-width: 44px;">${i.isDone?"查看":"翻译"}</button>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `}).join("")}
            </div>
          </div>
        </div>
      `,document.getElementById("btn-back").addEventListener("click",()=>{g("/projects")}),o.querySelectorAll(".filter-btn").forEach(e=>{e.addEventListener("click",()=>{l=e.dataset.filter,v()})}),o.querySelectorAll(".folder-header").forEach(e=>{e.addEventListener("click",()=>{const a=e.nextElementSibling,r=e.querySelector(".folder-arrow"),i=a.style.display==="none";a.style.display=i?"block":"none",r.style.transform=i?"rotate(90deg)":"rotate(0deg)"})}),o.querySelectorAll(".file-row").forEach(e=>{e.addEventListener("click",a=>{const r=e.dataset.id,i=e.querySelector(".fa-check-circle")!==null;g(`/translate?projectId=${c}&fileId=${r}${i?"&stage=all":""}`)})});const t=document.getElementById("btn-sync-rag");t&&t.addEventListener("click",async()=>{const{Storage:e}=await d(async()=>{const{Storage:r}=await import("./storage-CDYOJb6j.js");return{Storage:r}},[]);if(!e.getSettings().embeddingEnabled){const{showToast:r}=await d(async()=>{const{showToast:i}=await import("./toast-_A8NGhfi.js");return{showToast:i}},[]);r("请先在配置页开启向量化模型","warning");return}t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> 同步中...';try{const{RAG:r}=await d(async()=>{const{RAG:n}=await import("./rag-DauMPrO4.js");return{RAG:n}},__vite__mapDeps([0,1,2,3,4])),{showToast:i}=await d(async()=>{const{showToast:n}=await import("./toast-_A8NGhfi.js");return{showToast:n}},[]);await r.syncCorpus(c,(n,f)=>{i(f,n==="warning"||n==="error"?n:"info")}),i("项目语料库同步流程结束","success")}catch(r){const{showToast:i}=await d(async()=>{const{showToast:n}=await import("./toast-_A8NGhfi.js");return{showToast:n}},[]);i("同步失败: "+r.message,"error")}finally{t.disabled=!1,t.innerHTML='<i class="fas fa-sync-alt"></i> 同步'}});const s=document.getElementById("btn-clear-rag");s&&s.addEventListener("click",async()=>{if(confirm("确定要清空该项目所有的本地语料缓存以及远端 Qdrant 向量数据吗？")){s.disabled=!0,s.innerHTML='<i class="fas fa-spinner fa-spin"></i>...';try{const{VectorStore:e}=await d(async()=>{const{VectorStore:r}=await import("./vectorStore-BwS8jpvf.js");return{VectorStore:r}},__vite__mapDeps([4,1,2,3]));await e.deleteProjectData(c);const{showToast:a}=await d(async()=>{const{showToast:r}=await import("./toast-_A8NGhfi.js");return{showToast:r}},[]);a("语料数据已成功清空！","success")}catch(e){const{showToast:a}=await d(async()=>{const{showToast:r}=await import("./toast-_A8NGhfi.js");return{showToast:r}},[]);a("清空失败: "+e.message,"error")}finally{s.disabled=!1,s.innerHTML='<i class="fas fa-trash-alt"></i> 清空'}}})};const p=await x.getFiles(c);if(!p||p.length===0){o.innerHTML='<div class="glass-panel">该项目下没有文件。</div>';return}const b=p.map((t,s)=>{const e=t.total||0,a=t.translated||0,r=t.hidden||0,i=t.reviewed||0,n=Math.max(0,e-a-r),f=a+r,y=e>0?Math.min(100,Math.round(f/e*100)):0,w=f>=e&&e>0;return{...t,index:s,total:e,translated:a,hidden:r,reviewed:i,untranslated:n,finishedCount:f,percent:y,isDone:w}}),m=new Map;b.forEach(t=>{const s=t.name.split("/"),e=s.length>1?s.slice(0,-1).join("/")+"/":"/";m.has(e)||m.set(e,{name:e,files:[],total:0,translated:0,hidden:0,reviewed:0,percent:0});const a=m.get(e);a.files.push(t),a.total+=t.total,a.translated+=t.translated,a.hidden+=t.hidden,a.reviewed+=t.reviewed}),m.forEach(t=>{const s=t.translated+t.hidden;t.percent=t.total>0?Math.min(100,Math.round(s/t.total*100)):0});const h=Array.from(m.values());let l="all";v()}catch(p){o.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${p.message}</div>`}}export{L as render};
