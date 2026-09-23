(() => {
  const SITE_PASSWORD = 'MVY2027';
  const MANAGEMENT_PASSWORD = 'ABCgang';
  const path = (location.pathname || '').toLowerCase();
  const file = path.split('/').pop();
  const managementFiles = new Set(['management.html','rentals.html','house-standards.html','property-management.html']);
  const isManagement = path.startsWith('/management') || managementFiles.has(file);

  const SITE_KEY = 'vvp_site_preview_auth';
  const MGMT_KEY = 'vvp_management_preview_auth';

  function has(key){ return sessionStorage.getItem(key) === '1'; }
  function set(key){ sessionStorage.setItem(key,'1'); }

  function stage(){
    if(!has(SITE_KEY)) return 'site';
    if(isManagement && !has(MGMT_KEY)) return 'management';
    return null;
  }

  function makeGate(){
    const gate = document.createElement('div');
    gate.id = 'client-auth-gate';
    gate.className = 'client-auth-gate';
    gate.innerHTML = `
      <div class="client-auth-card">
        <div class="kicker" id="client-auth-kicker">Private Preview</div>
        <h1 id="client-auth-title">Vineyard Vista Properties</h1>
        <p id="client-auth-copy">This working website is password protected while Vineyard Vista is being developed with its partners.</p>
        <form id="client-auth-form">
          <label for="client-auth-password">Password</label>
          <input id="client-auth-password" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required>
          <label class="client-show-row"><input id="client-show-password" type="checkbox"> <span>Show password</span></label>
          <button type="submit">Continue</button>
          <div id="client-auth-error" class="access-error" aria-live="polite"></div>
        </form>
      </div>`;
    document.body.appendChild(gate);

    const input = gate.querySelector('#client-auth-password');
    const show = gate.querySelector('#client-show-password');
    show.addEventListener('change', () => {
      input.type = show.checked ? 'text' : 'password';
      input.focus();
    });

    gate.querySelector('#client-auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const current = stage();
      const expected = current === 'management' ? MANAGEMENT_PASSWORD : SITE_PASSWORD;
      const error = gate.querySelector('#client-auth-error');
      if(input.value.trim() !== expected){
        error.textContent = 'Incorrect password.';
        input.focus();
        input.select();
        return;
      }
      if(current === 'management') set(MGMT_KEY); else set(SITE_KEY);
      input.value = '';
      error.textContent = '';
      renderStage();
    });

    function renderStage(){
      const current = stage();
      if(!current){
        gate.remove();
        document.documentElement.classList.remove('auth-locked');
        return;
      }
      document.documentElement.classList.add('auth-locked');
      const mgmt = current === 'management';
      gate.querySelector('#client-auth-kicker').textContent = mgmt ? 'Management' : 'Private Preview';
      gate.querySelector('#client-auth-title').textContent = mgmt ? 'Management' : 'Vineyard Vista Properties';
      gate.querySelector('#client-auth-copy').textContent = mgmt
        ? 'Enter the separate Management password to continue.'
        : 'This working website is password protected while Vineyard Vista is being developed with its partners.';
      input.focus();
    }

    renderStage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(stage()) makeGate();

    document.querySelectorAll('a[href*="/api/logout"]').forEach(a => {
      a.addEventListener('click', () => {
        sessionStorage.removeItem(SITE_KEY);
        sessionStorage.removeItem(MGMT_KEY);
      });
    });
  });
})();