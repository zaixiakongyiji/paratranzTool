import{paraTranzApi as d}from"./paratranz-CWirhJTz.js";import{Storage as i}from"./storage-CDYOJb6j.js";import{n as c}from"./index-B2wNt7Gv.js";import{showToast as s}from"./toast-_A8NGhfi.js";async function v(e){l(e),a()}function l(e){e.innerHTML=`
    <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <h2>我的项目</h2>
      <div style="display: flex; gap: 0.5rem;">
        <input type="number" id="input-add-project-id" placeholder="输入项目 ID (如 1234)" style="width: 200px;" />
        <button id="btn-add-project" class="btn btn-primary">添加项目</button>
      </div>
    </div>
    <div id="project-list-container" class="projects-grid">
      <div style="text-align:center; padding: 2rem; color: var(--text-secondary);">加载中...</div>
    </div>
  `,document.getElementById("btn-add-project").addEventListener("click",async()=>{const o=document.getElementById("input-add-project-id"),t=o.value.trim();if(!t)return;const r=document.getElementById("btn-add-project");r.disabled=!0,r.innerText="验证中...";try{const n=await d.getProject(t);n&&n.id&&(i.addMyProject({id:n.id,name:n.name||`项目 ${n.id}`}),s("项目管理成功","success"),o.value="",a())}catch{s("无法找到该项目，请检查 ID 或 Token 权限","error")}finally{r.disabled=!1,r.innerText="添加项目"}})}function a(){const e=document.getElementById("project-list-container"),o=i.getMyProjects();if(o.length===0){e.innerHTML=`
      <div class="glass-panel text-center" style="grid-column: 1/-1; padding: 3rem;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">暂无项目，请在右上角输入项目 ID 添加。</p>
      </div>
    `;return}e.innerHTML=o.map((t,r)=>`
    <div class="glass-panel project-card" data-id="${t.id}" style="margin-bottom: 1rem; cursor: pointer; transition: transform 0.2s; position: relative;">
      <h3 style="margin-bottom: 0.5rem;">${p(t.name)}</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">ID: ${t.id}</p>
      <button class="btn-remove" data-id="${t.id}" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: var(--danger-color); cursor: pointer; font-size: 1.2rem;">&times;</button>
    </div>
  `).join(""),e.querySelectorAll(".project-card").forEach(t=>{t.addEventListener("mouseenter",()=>t.style.transform="translateY(-2px)"),t.addEventListener("mouseleave",()=>t.style.transform="translateY(0)"),t.addEventListener("click",r=>{if(r.target.classList.contains("btn-remove")){r.stopPropagation(),i.removeMyProject(r.target.getAttribute("data-id")),a();return}const n=t.getAttribute("data-id");c(`/files?projectId=${n}`)})})}function p(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}export{v as render};
