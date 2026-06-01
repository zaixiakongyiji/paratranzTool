export function initRouter() {
  const logo = document.getElementById('logo');
  if (logo) {
    logo.addEventListener('click', () => {
      navigate('/projects');
    });
  }

  // 初始导航
  const handleHashChange = () => navigate(location.hash.slice(1) || '/settings', true);
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

export function navigate(path, fromHashChange = false) {
  // Only update location.hash if the target hash is different from the current one
  if (location.hash.slice(1) !== path && !fromHashChange) {
    location.hash = path;
    return; // Let the hashchange listener handle the subsequent rendering
  }

  const [pathname, queryString] = path.split('?');
  const query = new URLSearchParams(queryString || '');
  
  // 切换页面时，默认清理翻译模式的样式锁定
  document.body.classList.remove('translate-mode');
  
  const routerView = document.getElementById('router-view');
  routerView.innerHTML = `<div style="text-align:center; padding: 2rem;">加载中...</div>`;
  
  const routes = {
    '/projects': { render: (c, q) => import('./pages/projects.js').then(m => m.render(c, q)) },
    '/files': { render: (c, q) => import('./pages/files.js').then(m => m.render(c, q)) },
    '/translate': { render: (c, q) => import('./pages/translate.js').then(m => m.render(c, q)) },
    '/terms': { render: (c, q) => import('./pages/terms.js').then(m => m.render(c, q)) },
    '/glossary': { render: (c, q) => import('./pages/glossary.js').then(m => m.render(c, q)) },
    '/settings': { render: (c, q) => import('./pages/settings.js').then(m => m.render(c, q)) }
  };

  const route = routes[pathname];
  if (route) {
    route.render(routerView, query);
  } else {
    routerView.innerHTML = `<h2>404</h2><p>未找到页面: ${path}</p>`;
  }
}
