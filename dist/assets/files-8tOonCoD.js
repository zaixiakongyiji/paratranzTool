import{paraTranzApi as x}from"./paratranz-BehdmDyJ.js";import{n as p}from"./index-C_T7Xp4D.js";import"./storage-BQ5PE7ds.js";async function D(n,m){const d=m.get("projectId");if(!d){n.innerHTML='<div class="glass-panel">缺少项目 ID 参数。</div>';return}n.innerHTML='<div style="text-align:center; padding: 2rem;">加载文件列表中...</div>';try{let v=function(){const e=l.filter(t=>t.isDone).length,i=l.length-e;n.innerHTML=`
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2>文件列表 (Project ID: ${d})</h2>
          <button id="btn-back" class="btn">返回项目列表</button>
        </div>

        <!-- 筛选栏 -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button class="btn filter-btn ${r==="all"?"btn-primary":""}" data-filter="all">全部 (${l.length})</button>
          <button class="btn filter-btn ${r==="todo"?"btn-primary":""}" data-filter="todo">未完成 (${i})</button>
          <button class="btn filter-btn ${r==="done"?"btn-primary":""}" data-filter="done">已完成 (${e})</button>
        </div>

        <div id="file-list-container"></div>
      `,document.getElementById("btn-back").addEventListener("click",()=>p("/projects")),n.querySelectorAll(".filter-btn").forEach(t=>{t.addEventListener("click",()=>{r=t.dataset.filter,v()})}),g()},g=function(){const e=document.getElementById("file-list-container"),i=l.filter(t=>r==="done"?t.isDone:r==="todo"?!t.isDone:!0);if(i.length===0){e.innerHTML='<div class="glass-panel" style="text-align: center; color: var(--text-secondary); padding: 2rem;">当前筛选条件下没有文件。</div>';return}e.innerHTML=i.map(t=>`
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
      `).join(""),e.querySelectorAll(".file-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-index"),o=l[s];p(`/translate?projectId=${d}&fileId=${o.id}${o.isDone?"&stage=all":""}`)})})};const a=await x.getFiles(d);if(!a||a.length===0){n.innerHTML='<div class="glass-panel">该项目下没有文件。</div>';return}const l=a.map((e,i)=>{const t=e.total||0,s=e.translated||0,o=e.hidden||0,u=e.reviewed||0,y=Math.max(0,t-s-o),c=s+o,b=t>0?Math.min(100,Math.round(c/t*100)):0,f=c>=t&&t>0;return{...e,index:i,total:t,translated:s,hidden:o,reviewed:u,untranslated:y,finishedCount:c,percent:b,isDone:f}});let r="all";v()}catch(a){n.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${a.message}</div>`}}export{D as render};
