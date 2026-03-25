import{paraTranzApi as i}from"./paratranz-B8WEvIb5.js";import"./storage-CDYOJb6j.js";async function p(t,n){const r=n.get("projectId");if(!r){t.innerHTML='<div class="glass-panel">要求指定 projectId 参数方可获取术语。</div>';return}t.innerHTML='<div style="text-align:center; padding: 2rem;">加载术语表中...</div>';try{const e=await i.getTerms(r),l=Array.isArray(e)?e:e.results||[];if(l.length===0){t.innerHTML='<div class="glass-panel">当前项目暂无术语</div>';return}const d=l.map(a=>`
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.8rem;">${s(a.term)}</td>
          <td style="padding: 0.8rem;">${s(a.translation)}</td>
          <td style="padding: 0.8rem; color: var(--text-secondary);">${s(a.pos||"")}</td>
        </tr>
      `).join("");t.innerHTML=`
      <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>术语管理 (项目 ${r})</h2>
        <button id="btn-back" class="btn">返回词条浏览</button>
      </div>
      <div class="glass-panel" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: var(--bg-surface-hover);">
              <th style="padding: 0.8rem;">原文 (Term)</th>
              <th style="padding: 0.8rem;">译文 (Translation)</th>
              <th style="padding: 0.8rem;">词性 (POS)</th>
            </tr>
          </thead>
          <tbody>
            ${d}
          </tbody>
        </table>
      </div>
    `,document.getElementById("btn-back").addEventListener("click",()=>{window.history.back()})}catch(e){t.innerHTML=`<div class="glass-panel" style="color: var(--danger-color)">加载数据失败: ${e.message}</div>`}}function s(t){return(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}export{p as render};
