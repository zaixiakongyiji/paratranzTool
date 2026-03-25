import{Storage as a}from"./storage-CDYOJb6j.js";import{showToast as o}from"./toast-_A8NGhfi.js";function p(t){c(t),i()}function c(t){t.innerHTML=`
    <div class="glass-panel" style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>个人知识库 (本地术语)</h2>
        <div style="display: flex; gap: 0.5rem;">
          <button id="btn-import-json" class="btn btn-sm">导入 JSON</button>
          <button id="btn-export-json" class="btn btn-sm">导出 JSON</button>
        </div>
      </div>

      <div class="glass-panel" style="background: rgba(255,255,255,0.03); margin-bottom: 2rem; padding: 1.5rem;">
        <h4 style="margin-bottom: 1rem;">添加新规则/术语</h4>
        <div style="display: grid; grid-template-columns: 1fr 1.5fr auto; gap: 1rem; align-items: end;">
          <div>
            <label style="display:block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">原文/匹配词</label>
            <input type="text" id="new-term-key" placeholder="如: Tear" />
          </div>
          <div>
            <label style="display:block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">译文/规则说明</label>
            <input type="text" id="new-term-val" placeholder="如: 裂化 (西幻风格)" />
          </div>
          <button id="btn-add-local-term" class="btn btn-primary">添加</button>
        </div>
      </div>

      <div id="local-term-list" style="display: flex; flex-direction: column; gap: 0.8rem;">
        <!-- 列表内容 -->
      </div>
    </div>

    <!-- 隐藏的隐藏文件输入 -->
    <input type="file" id="file-import-json" style="display: none;" accept=".json" />
  `,document.getElementById("btn-add-local-term").addEventListener("click",()=>{const n=document.getElementById("new-term-key").value.trim(),e=document.getElementById("new-term-val").value.trim();!n||!e||(a.addLocalTerm(n,e),document.getElementById("new-term-key").value="",document.getElementById("new-term-val").value="",i(),o("已添加到本地知识库","success"))}),document.getElementById("btn-export-json").addEventListener("click",()=>{const n=a.getLocalGlossary(),e=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),r=URL.createObjectURL(e),l=document.createElement("a");l.href=r,l.download=`my_glossary_${new Date().toISOString().slice(0,10)}.json`,l.click(),o("已开始导出","success")}),document.getElementById("btn-import-json").addEventListener("click",()=>{document.getElementById("file-import-json").click()}),document.getElementById("file-import-json").addEventListener("change",n=>{const e=n.target.files[0];if(!e)return;const r=new FileReader;r.onload=l=>{try{const s=JSON.parse(l.target.result);Array.isArray(s)?(a.saveLocalGlossary(s),i(),o("导入成功","success")):o("JSON 格式不正确，应为数组","error")}catch{o("JSON 解析失败","error")}},r.readAsText(e)})}function i(){const t=document.getElementById("local-term-list"),n=a.getLocalGlossary();if(n.length===0){t.innerHTML='<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">本地知识库目前为空</div>';return}t.innerHTML=n.map((e,r)=>`
    <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.2rem; background: rgba(255,255,255,0.02);">
      <div style="display: flex; gap: 1.5rem; flex: 1;">
        <div style="font-weight: 600; color: var(--accent-color); min-width: 100px;">${d(e.term)}</div>
        <div style="color: var(--text-primary);">${d(e.translation)}</div>
      </div>
      <button class="btn-remove-term" data-term="${e.term}" style="background: transparent; border: none; color: var(--danger-color); cursor: pointer; opacity: 0.6;">&times;</button>
    </div>
  `).join(""),t.querySelectorAll(".btn-remove-term").forEach(e=>{e.addEventListener("click",()=>{a.removeLocalTerm(e.dataset.term),i()})})}function d(t){return(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}export{p as render};
