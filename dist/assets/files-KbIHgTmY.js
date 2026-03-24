const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rag-nCOkno2-.js","assets/index-CR5PaB1c.js","assets/index-DF5UtTsd.css","assets/storage-gCDr8-fQ.js"])))=>i.map(i=>d[i]);
import{n as g,_ as u}from"./index-CR5PaB1c.js";import{paraTranzApi as x}from"./paratranz-CmxxXTVm.js";import"./storage-gCDr8-fQ.js";async function T(o,b){const c=b.get("projectId");if(!c){o.innerHTML='<div class="glass-panel">缺少项目 ID 参数。</div>';return}o.innerHTML='<div style="text-align:center; padding: 2rem;">加载文件列表中...</div>';try{let y=function(){const e=p.filter(n=>n.isDone).length,d=p.length-e;o.innerHTML=`
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2>文件列表 (Project ID: ${c})</h2>
          <div>
            <button id="btn-sync-rag" class="btn" style="margin-right: 0.5rem;" title="从该项目拉取最新已翻/通过词条"><i class="fas fa-sync-alt"></i> 同步语料库</button>
            <button id="btn-back" class="btn">返回项目</button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button class="btn filter-btn ${l==="all"?"btn-primary":""}" data-filter="all">全部 (${p.length})</button>
          <button class="btn filter-btn ${l==="todo"?"btn-primary":""}" data-filter="todo">未完成 (${d})</button>
          <button class="btn filter-btn ${l==="done"?"btn-primary":""}" data-filter="done">已完成 (${e})</button>
        </div>

        <div id="file-list-container"></div>
      `,document.getElementById("btn-back").addEventListener("click",()=>g("/projects")),o.querySelectorAll(".filter-btn").forEach(n=>{n.addEventListener("click",()=>{l=n.dataset.filter,y()})});const t=document.getElementById("btn-sync-rag");t&&t.addEventListener("click",async()=>{const{Storage:n}=await u(async()=>{const{Storage:r}=await import("./storage-gCDr8-fQ.js");return{Storage:r}},[]);if(!n.getSettings().embeddingEnabled){const{showToast:r}=await u(async()=>{const{showToast:s}=await import("./toast-_A8NGhfi.js");return{showToast:s}},[]);r("请先在配置页开启向量化模型","warning");return}t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> 同步中...';try{const{RAG:r}=await u(async()=>{const{RAG:i}=await import("./rag-nCOkno2-.js");return{RAG:i}},__vite__mapDeps([0,1,2,3])),{showToast:s}=await u(async()=>{const{showToast:i}=await import("./toast-_A8NGhfi.js");return{showToast:i}},[]);await r.syncCorpus(c,(i,m)=>{s(m,"info")}),s("全项目语料库同步完成！","success")}catch(r){const{showToast:s}=await u(async()=>{const{showToast:i}=await import("./toast-_A8NGhfi.js");return{showToast:i}},[]);s("同步失败: "+r.message,"error")}finally{t.disabled=!1,t.innerHTML='<i class="fas fa-sync-alt"></i> 同步语料库'}}),f()},f=function(){const e=document.getElementById("file-list-container"),d=p.filter(t=>l==="done"?t.isDone:l==="todo"?!t.isDone:!0);if(d.length===0){e.innerHTML='<div class="glass-panel" style="text-align: center; color: var(--text-secondary); padding: 2rem;">当前筛选条件下没有文件。</div>';return}e.innerHTML=d.map(t=>`
        <div class="glass-panel file-item" data-index="${t.index}" style="margin-bottom: 0.8rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.8rem; ${t.isDone?"border-left: 4px solid var(--success-color);":""}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <h4 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                ${t.name}
                ${t.isDone?'<span style="font-size: 0.7rem; background: var(--success-color); color: #fff; padding: 1px 6px; border-radius: 10px;">已完成</span>':""}
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; font-size: 0.8rem;">
                <div title="总词条数"><span style="color: var(--text-secondary)">总计:</span> ${t.total}</div>
                <div title="已翻译入库" style="color: var(--accent-color)"><span style="color: var(--text-secondary)">已填:</span> ${t.translated}</div>
                <div title="隐藏/无需翻译" style="color: #888;"><span style="color: var(--text-secondary)">隐藏:</span> ${t.hidden}</div>
                <div title="待处理" style="${t.untranslated>0?"color: var(--danger-color); font-weight: bold;":"color: var(--text-secondary);"}">
                  <span style="color: var(--text-secondary); font-weight: normal;">待办:</span> ${t.untranslated}
                </div>
                <div title="已审核/发布"><span style="color: var(--text-secondary)">审核:</span> ${t.reviewed}</div>
              </div>
            </div>
            <button class="btn ${t.isDone?"":"btn-primary"} btn-sm" style="margin-left: 1rem;">${t.isDone?"查看":"去翻译"}</button>
          </div>
          <div style="width: 100%; height: 6px; background: var(--bg-color); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-color); position: relative;">
            <div style="width: ${t.percent}%; height: 100%; background: ${t.isDone?"var(--success-color)":"var(--accent-color)"}; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `).join(""),e.querySelectorAll(".file-item").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-index"),a=p[n];g(`/translate?projectId=${c}&fileId=${a.id}${a.isDone?"&stage=all":""}`)})})};const v=await x.getFiles(c);if(!v||v.length===0){o.innerHTML='<div class="glass-panel">该项目下没有文件。</div>';return}const p=v.map((e,d)=>{const t=e.total||0,n=e.translated||0,a=e.hidden||0,r=e.reviewed||0,s=Math.max(0,t-n-a),i=n+a,m=t>0?Math.min(100,Math.round(i/t*100)):0,h=i>=t&&t>0;return{...e,index:d,total:t,translated:n,hidden:a,reviewed:r,untranslated:s,finishedCount:i,percent:m,isDone:h}});let l="all";y()}catch(v){o.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${v.message}</div>`}}export{T as render};
