let currentState = {
  currentDate: null,
  selectedMenuId: '5', // Default selected view (Saju/Fortune)
  menus: [],
  profile: null,
  dates: [],
  editingMenuId: null
};

// DOM elements
const el = {
  sidebarMenuList: document.getElementById('sidebarMenuList'),
  sajuProfileBtn: document.getElementById('sajuProfileBtn'),
  addMenuBtn: document.getElementById('addMenuBtn'),
  mobileToggleBtn: document.getElementById('mobileToggleBtn'),
  mobileCloseBtn: document.getElementById('mobileCloseBtn'),
  appSidebar: document.getElementById('appSidebar'),
  welcomeUser: document.getElementById('welcomeUser'),
  crawlNowBtn: document.getElementById('crawlNowBtn'),
  calendarTimeline: document.getElementById('calendarTimeline'),
  dashboardView: document.getElementById('dashboardView'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingText: document.getElementById('loadingText'),
  toastContainer: document.getElementById('toastContainer'),
  
  // Modals
  profileModal: document.getElementById('profileModal'),
  closeProfileModal: document.getElementById('closeProfileModal'),
  cancelProfileModal: document.getElementById('cancelProfileModal'),
  profileForm: document.getElementById('profileForm'),
  menuModal: document.getElementById('menuModal'),
  closeMenuModal: document.getElementById('closeMenuModal'),
  cancelMenuModal: document.getElementById('cancelMenuModal'),
  menuForm: document.getElementById('menuForm'),
  
  // Saju View Elements
  sajuEmptyState: document.getElementById('sajuEmptyState'),
  sajuRegisterBtn: document.getElementById('sajuRegisterBtn'),
  sajuContent: document.getElementById('sajuContent'),
  daeunNum: document.getElementById('daeun-num'),
  daeunListContainer: document.getElementById('daeunListContainer'),
  
  // Fortune Tab Elements
  fortuneTabs: document.querySelectorAll('.fortune-tab'),
  fortunePanels: document.querySelectorAll('.fortune-tab-panel'),
  
  // Containers
  newsListContainer: document.getElementById('newsListContainer'),
  stocksGridContainer: document.getElementById('stocksGridContainer'),
  coinsGridContainer: document.getElementById('coinsGridContainer')
};

// --- INITIALIZE APPLICATION ---
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  
  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const menuParam = urlParams.get('menu');
  if (menuParam) {
    currentState.selectedMenuId = menuParam;
  }
  const dateParam = urlParams.get('date');
  if (dateParam) {
    currentState.currentDate = dateParam;
  }
  if (urlParams.get('share') === '1') {
    document.body.classList.add('shared-mode');
  }

  await loadProfile();
  await loadMenus();
  await loadDates();
  
  // Find Saju/Fortune menu ID dynamically or fallback to '5' if no menuParam
  let targetMenuId = currentState.selectedMenuId;
  if (!menuParam) {
    const sajuMenu = currentState.menus.find(m => m.type === 'fortune' || m.type === 'saju');
    targetMenuId = sajuMenu ? String(sajuMenu.id) : '5';
  }
  await selectMenu(targetMenuId);
});

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Mobile navigation
  el.mobileToggleBtn.addEventListener('click', () => el.appSidebar.classList.add('active'));
  el.mobileCloseBtn.addEventListener('click', () => el.appSidebar.classList.remove('active'));
  
  // Desktop sidebar toggle
  const desktopToggleBtn = document.getElementById('desktopToggleBtn');
  const appMain = document.querySelector('.app-main');
  
  if (desktopToggleBtn) {
    desktopToggleBtn.addEventListener('click', () => {
      el.appSidebar.classList.toggle('collapsed');
      if (appMain) appMain.classList.toggle('expanded');
      localStorage.setItem('sidebar_collapsed', el.appSidebar.classList.contains('collapsed'));
    });
    
    // Restore state
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
      el.appSidebar.classList.add('collapsed');
      if (appMain) appMain.classList.add('expanded');
    }
  }
  
  // Modals open
  el.sajuProfileBtn.addEventListener('click', () => openModal(el.profileModal));
  el.sajuRegisterBtn.addEventListener('click', () => openModal(el.profileModal));
  el.addMenuBtn.addEventListener('click', () => {
    currentState.editingMenuId = null;
    document.getElementById('menuForm').reset();
    el.menuModal.querySelector('h3').innerHTML = '<i class="fa-solid fa-circle-plus text-blue"></i> 새 뉴스 카테고리 추가';
    el.menuModal.querySelector('.btn-submit').textContent = '추가하기';
    openModal(el.menuModal);
  });
  
  // Modals close
  el.closeProfileModal.addEventListener('click', () => closeModal(el.profileModal));
  el.cancelProfileModal.addEventListener('click', () => closeModal(el.profileModal));
  el.closeMenuModal.addEventListener('click', () => closeModal(el.menuModal));
  el.cancelMenuModal.addEventListener('click', () => closeModal(el.menuModal));
  
  // Form submissions
  el.profileForm.addEventListener('submit', handleProfileSubmit);
  el.menuForm.addEventListener('submit', handleMenuSubmit);
  
  // Fortune tabs
  el.fortuneTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      el.fortuneTabs.forEach(t => t.classList.remove('active'));
      el.fortunePanels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPanel = document.getElementById(`fortune-${tab.dataset.tab}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
  
  // Crawl button trigger
  el.crawlNowBtn.addEventListener('click', triggerRealtimeCrawl);
  
  // Share button
  const shareViewBtn = document.getElementById('shareViewBtn');
  if (shareViewBtn) {
    shareViewBtn.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('menu', currentState.selectedMenuId);
      if (currentState.currentDate) {
        url.searchParams.set('date', currentState.currentDate);
      }
      url.searchParams.set('share', '1');
      navigator.clipboard.writeText(url.toString())
        .then(() => showToast('공유용 링크가 클립보드에 복사되었습니다!', 'success'))
        .catch(() => showToast('링크 복사에 실패했습니다.', 'error'));
    });
  }
}

// --- UTILITIES: TOASTS & MODALS ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> <span>${message}</span>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function showLoading(text) {
  el.loadingText.textContent = text;
  el.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  el.loadingOverlay.classList.add('hidden');
}

// --- API ACTIONS: GET / POST / DELETE ---

// Load Profile
async function loadProfile() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (data.profile) {
      currentState.profile = data.profile;
      el.welcomeUser.textContent = `안녕하세요, ${data.profile.name}님! 🌟`;
      
      // Populate profile form values for editing later
      document.getElementById('profileName').value = data.profile.name;
      document.getElementById('profileDate').value = data.profile.birth_date;
      document.getElementById('profileTime').value = data.profile.birth_time;
      document.getElementById('profileCalendar').value = data.profile.calendar_type;
      document.getElementById('profileGender').value = data.profile.gender;
      document.getElementById('profileApiKey').value = localStorage.getItem('GEMINI_API_KEY') || '';
    } else {
      currentState.profile = null;
      el.welcomeUser.textContent = '안녕하세요! 🌟';
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

// Save Profile
async function handleProfileSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value;
  const birth_date = document.getElementById('profileDate').value;
  const birth_time = document.getElementById('profileTime').value;
  const calendar_type = document.getElementById('profileCalendar').value;
  const gender = document.getElementById('profileGender').value;
  const apiKey = document.getElementById('profileApiKey').value.trim();
  
  if (apiKey) {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
  }
  
  showLoading('사주 프로필을 저장하는 중...');
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, birth_date, birth_time, calendar_type, gender })
    });
    
    const result = await response.json();
    if (result.success) {
      showToast('프로필이 성공적으로 저장되었습니다.', 'success');
      closeModal(el.profileModal);
      await loadProfile();
      await selectMenu(currentState.selectedMenuId); // Reload Saju panels
    } else {
      showToast(result.error || '프로필 저장 실패', 'error');
    }
  } catch (err) {
    showToast('네트워크 오류가 발생했습니다.', 'error');
  } finally {
    hideLoading();
  }
}

// Load Side Menus
async function loadMenus() {
  try {
    const res = await fetch('/api/menu');
    const data = await res.json();
    currentState.menus = data.menus;
    renderSidebar();
  } catch (err) {
    console.error('Error loading menus:', err);
  }
}

// Render Sidebar Menus
function renderSidebar() {
  el.sidebarMenuList.innerHTML = '';
  
  currentState.menus.forEach(menu => {
    const li = document.createElement('li');
    li.id = `menu-item-${menu.id}`;
    if (currentState.selectedMenuId === String(menu.id)) {
      li.className = 'active';
    }
    
    // Choose icon based on type / title
    let iconClass = menu.config && menu.config.icon ? menu.config.icon : 'fa-regular fa-newspaper';
    if (!menu.config || !menu.config.icon) {
      if (menu.type === 'fortune' || menu.type === 'saju') iconClass = 'fa-solid fa-yin-yang text-gold';
      else if (menu.type === 'stock_watchlist' || menu.type === 'stocks') iconClass = 'fa-solid fa-chart-line text-success';
      else if (menu.type === 'coin_watchlist' || menu.type === 'coins') iconClass = 'fa-solid fa-coins text-gold';
      else if (menu.title.includes('시사')) iconClass = 'fa-solid fa-graduation-cap text-blue';
    }
    
    const a = document.createElement('div');
    a.className = 'menu-item-link';
    a.innerHTML = `
      <div class="menu-text-wrap">
        <i class="${iconClass}"></i>
        <span>${menu.title}</span>
      </div>
      ${!menu.is_default ? `
        <div class="menu-actions">
          <button class="menu-edit-btn" data-id="${menu.id}" title="카테고리 수정"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="menu-delete-btn" data-id="${menu.id}" title="카테고리 삭제"><i class="fa-regular fa-trash-can"></i></button>
        </div>` : ''}
    `;
    
    // Clicking menu triggers view selection
    a.addEventListener('click', (e) => {
      // Avoid triggering click if deleting or editing
      if (e.target.closest('.menu-actions')) return;
      selectMenu(String(menu.id));
    });
    
    // Edit action
    const editBtn = a.querySelector('.menu-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentState.editingMenuId = menu.id;
        document.getElementById('menuTitle').value = menu.title;
        if (menu.config) {
          document.getElementById('menuQuery').value = menu.config.feed_url || '';
          if (menu.config.icon) document.getElementById('menuIcon').value = menu.config.icon;
        }
        
        el.menuModal.querySelector('h3').innerHTML = '<i class="fa-solid fa-pen-to-square text-blue"></i> 뉴스 카테고리 수정';
        el.menuModal.querySelector('.btn-submit').textContent = '수정하기';
        openModal(el.menuModal);
      });
    }
    
    // Delete action
    const deleteBtn = a.querySelector('.menu-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`'${menu.title}' 카테고리를 삭제하시겠습니까?`)) {
          showLoading('카테고리를 삭제하는 중...');
          try {
            const deleteRes = await fetch(`/api/menu?id=${menu.id}`, { method: 'DELETE' });
            const result = await deleteRes.json();
            if (result.success) {
              showToast('카테고리가 삭제되었습니다.', 'success');
              if (currentState.selectedMenuId === String(menu.id)) {
                currentState.selectedMenuId = '5'; // Fallback to saju default
              }
              await loadMenus();
              await selectMenu(currentState.selectedMenuId);
            }
          } catch (err) {
            showToast('삭제 중 오류가 발생했습니다.', 'error');
          } finally {
            hideLoading();
          }
        }
      });
    }
    
    li.appendChild(a);
    el.sidebarMenuList.appendChild(li);
  });
}

// Add Custom Category Menu
async function handleMenuSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('menuTitle').value;
  const query = document.getElementById('menuQuery').value;
  const icon = document.getElementById('menuIcon').value;
  
  const isEditing = !!currentState.editingMenuId;
  const url = '/api/menu';
  const method = isEditing ? 'PUT' : 'POST';
  const body = {
    title,
    type: 'rss_news',
    config: { feed_url: query, icon }
  };
  
  if (isEditing) {
    body.id = currentState.editingMenuId;
  }
  
  showLoading(isEditing ? '카테고리를 수정하는 중...' : '새 뉴스를 분석하고 채널을 추가하는 중...');
  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    if (result.success) {
      showToast(isEditing ? '카테고리가 수정되었습니다.' : `'${title}' 카테고리가 추가되었습니다. 크롤러가 갱신됩니다.`, 'success');
      closeModal(el.menuModal);
      
      // Auto run crawl only if new category
      if (!isEditing) {
        await triggerCrawlRequestSilent();
      }
      await loadMenus();
      if (!isEditing) await loadDates();
      
      // Find the menu's ID and select it
      const updatedMenu = currentState.menus.find(m => m.title === title);
      if (updatedMenu) {
        await selectMenu(String(updatedMenu.id));
      }
    } else {
      showToast(result.error || '저장 실패', 'error');
    }
  } catch (err) {
    showToast('네트워크 오류가 발생했습니다.', 'error');
  } finally {
    hideLoading();
  }
}

// Load Dates List (Horizontal timeline calendar)
async function loadDates() {
  try {
    const res = await fetch('/api/data?dates_only=true');
    const data = await res.json();
    currentState.dates = data.dates;
    
    if (currentState.dates.length > 0) {
      // Default to the latest date if not set
      if (!currentState.currentDate) {
        currentState.currentDate = currentState.dates[0];
      }
    } else {
      // Fallback: today's date KST
      const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
      currentState.currentDate = nowKST.toISOString().split("T")[0];
      currentState.dates = [currentState.currentDate];
    }
    
    renderTimeline();
  } catch (err) {
    console.error('Error loading dates:', err);
  }
}

// Render Timeline Days
function renderTimeline() {
  el.calendarTimeline.innerHTML = '';
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  currentState.dates.forEach(dateStr => {
    const dayDate = new Date(dateStr);
    const dayOfWeek = weekDays[dayDate.getDay()];
    const dayNum = dateStr.split('-')[2];
    const monthNum = dateStr.split('-')[1];
    
    const dayEl = document.createElement('div');
    dayEl.className = `timeline-day ${currentState.currentDate === dateStr ? 'active' : ''}`;
    dayEl.innerHTML = `
      <span class="day-week">${dayOfWeek}</span>
      <span class="day-num">${dayNum}</span>
      <span class="day-month">${monthNum}월</span>
    `;
    
    dayEl.addEventListener('click', async () => {
      currentState.currentDate = dateStr;
      
      // Update UI active timeline state
      const days = el.calendarTimeline.querySelectorAll('.timeline-day');
      days.forEach(d => d.classList.remove('active'));
      dayEl.classList.add('active');
      
      // Reload current tab content
      await selectMenu(currentState.selectedMenuId);
    });
    
    el.calendarTimeline.appendChild(dayEl);
  });
}

// --- CRAWLER RUNNER API ---
async function triggerRealtimeCrawl() {
  el.crawlNowBtn.disabled = true;
  const icon = el.crawlNowBtn.querySelector('i');
  icon.classList.add('spin');
  showLoading('실시간 뉴스와 실시간 주식/코인 시세 정보를 분석하는 중...');
  
  try {
    const res = await fetch('/api/crawl', { method: 'POST' });
    const result = await res.json();
    if (result.success) {
      showToast(`오늘(${result.date})자 핵심 데이터 크롤링이 완료되었습니다.`, 'success');
      await loadDates();
      currentState.currentDate = result.date;
      await selectMenu(currentState.selectedMenuId);
    } else {
      showToast(result.error || '크롤링 실패', 'error');
    }
  } catch (err) {
    showToast('크롤러 동작 중 오류가 발생했습니다.', 'error');
  } finally {
    icon.classList.remove('spin');
    el.crawlNowBtn.disabled = false;
    hideLoading();
  }
}

async function triggerCrawlRequestSilent() {
  try {
    await fetch('/api/crawl', { method: 'POST' });
  } catch (err) {
    console.error('Silent crawl trigger failed:', err);
  }
}

// --- SWITCH PANELS VIEW ---
async function selectMenu(menuId) {
  currentState.selectedMenuId = String(menuId);
  
  // Update URL silently
  const url = new URL(window.location.href);
  url.searchParams.set('menu', menuId);
  window.history.replaceState({}, '', url);
  
  // Highlight active menu in sidebar list
  const listItems = el.sidebarMenuList.querySelectorAll('li');
  listItems.forEach(li => {
    if (li.id === `menu-item-${menuId}`) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
  
  // Hide active sidebar on mobile when choice is made
  el.appSidebar.classList.remove('active');
  
  // Hide all panels first
  const panels = el.dashboardView.querySelectorAll('.view-panel');
  panels.forEach(p => p.classList.remove('active'));
  
  // Identify type of chosen menu
  const activeMenu = currentState.menus.find(m => String(m.id) === menuId);
  if (!activeMenu) return;
  
  showLoading('데이터를 불러오는 중...');
  
  if (activeMenu.type === 'fortune' || activeMenu.type === 'saju') {
    document.getElementById('view-saju').classList.add('active');
    showLoading('AI 명리학자가 사주 원국을 바탕으로 오늘의 운세를 꼼꼼히 분석 중입니다...');
    await loadSajuView();
  } else if (activeMenu.type === 'stock_watchlist' || activeMenu.type === 'stocks') {
    document.getElementById('view-stocks').classList.add('active');
    await loadFinancialView('stocks');
  } else if (activeMenu.type === 'coin_watchlist' || activeMenu.type === 'coins') {
    document.getElementById('view-coins').classList.add('active');
    await loadFinancialView('coins');
  } else if (activeMenu.type === 'rss_news') {
    document.getElementById('view-news').classList.add('active');
    await loadNewsView(activeMenu.title);
  }
  
  hideLoading();
}

// --- PANEL 1: LOAD SAJU VIEW ---
async function loadSajuView() {
  if (!currentState.profile) {
    el.sajuEmptyState.classList.remove('hidden');
    el.sajuContent.classList.add('hidden');
    return;
  }
  
  el.sajuEmptyState.classList.add('hidden');
  el.sajuContent.classList.remove('hidden');
  
  try {
    // Fetch fortunes for selected calendar date
    const dateQuery = currentState.currentDate ? `?date=${currentState.currentDate}` : '';
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const headers = apiKey ? { 'X-Gemini-Key': apiKey } : {};
    
    const res = await fetch(`/api/fortune${dateQuery}`, { headers });
    const data = await res.json();
    
    if (data.profile_required) {
      el.sajuEmptyState.classList.remove('hidden');
      el.sajuContent.classList.add('hidden');
      return;
    }
    
    // 1. Render Four Pillars (사주 원국)
    const p = data.saju.pillars;
    
    renderPillarCard('hour', p.hour);
    renderPillarCard('day', p.day);
    renderPillarCard('month', p.month);
    renderPillarCard('year', p.year);
    
    // 2. Render Daeun
    el.daeunNum.textContent = data.saju.daeunNumber;
    renderDaeunList(data.saju.daeunList, data.saju.daeunNumber);
    
    // 3. Render Fortunes text and scores
    renderFortunePanel('daily', data.daily);
    renderFortunePanel('weekly', data.weekly);
    renderFortunePanel('monthly', data.monthly);
  } catch (err) {
    console.error('Error loading Saju view:', err);
    showToast('운세를 분석하는 도중 오류가 발생했습니다.', 'error');
  }
}

function renderPillarCard(type, pillar) {
  const stemCard = document.getElementById(`${type}-day-stem`) || document.getElementById(`${type}-stem`);
  const branchCard = document.getElementById(`${type}-day-branch`) || document.getElementById(`${type}-branch`);
  const jiganganEl = document.getElementById(`${type}-jigangan`);
  const unseongEl = document.getElementById(`${type}-unseong`);
  
  // Set Stem Card content
  stemCard.querySelector('.hanja').textContent = pillar.stem.hanja;
  stemCard.querySelector('.korean').textContent = pillar.stem.name;
  stemCard.querySelector('.sipsin').textContent = pillar.sipsinStem;
  stemCard.className = `stem-card el-${pillar.stem.element}`;
  
  // Set Branch Card content
  branchCard.querySelector('.hanja').textContent = pillar.branch.hanja;
  branchCard.querySelector('.korean').textContent = pillar.branch.name;
  branchCard.querySelector('.sipsin').textContent = pillar.sipsinBranch;
  branchCard.className = `branch-card el-${pillar.branch.element}`;
  
  // Jigangan & Unseong
  jiganganEl.textContent = `지장간: ${pillar.jigangan}`;
  unseongEl.textContent = pillar.unseong;
}

function renderDaeunList(daeunList, activeDaeunNum) {
  el.daeunListContainer.innerHTML = '';
  
  // Determine current active Daeun based on age (rough estimate or profile age)
  const parts = currentState.profile.birth_date.split('-');
  const birthYear = parseInt(parts[0]);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear + 1; // Korean age estimation
  
  daeunList.forEach(d => {
    const daeunItem = document.createElement('div');
    // Mark as active if current age falls in this 10-year range
    const isActive = currentAge >= d.age && currentAge < d.age + 10;
    
    daeunItem.className = `daeun-item ${isActive ? 'active' : ''}`;
    daeunItem.innerHTML = `
      <span class="daeun-age">
        ${isActive ? '<span class="active-label">진행중</span>' : ''}
        ${d.age}세 대운
      </span>
      <div class="daeun-chars">
        <span class="daeun-char el-${d.stem.element}">${d.stem.hanja} (${d.stem.name})</span>
        <span class="daeun-char el-${d.branch.element}">${d.branch.hanja} (${d.branch.name})</span>
      </div>
      <div class="daeun-sipsins">
        <span>${d.sipsinStem}</span>
        <span>${d.sipsinBranch}</span>
      </div>
    `;
    el.daeunListContainer.appendChild(daeunItem);
  });
}

function renderFortunePanel(type, fortune) {
  document.getElementById(`${type}-fortune-title`).textContent = fortune.title;
  document.getElementById(`${type}-fortune-badge`).textContent = fortune.relation;
  
  let contentHtml = '';
  if (typeof fortune.content === 'string') {
    contentHtml = fortune.content.replace(/\n/g, '<br>');
  } else if (typeof fortune.content === 'object') {
    contentHtml = `
      <strong>[총평]</strong> ${fortune.content.general}<br><br>
      <strong>[재물]</strong> ${fortune.content.wealth}<br><br>
      <strong>[애정]</strong> ${fortune.content.love}<br><br>
      <strong>[건강]</strong> ${fortune.content.health}
    `;
  }
  
  document.getElementById(`${type}-fortune-content`).innerHTML = contentHtml;
  
  // Render star ratings
  renderStars(`${type}-score-wealth`, fortune.scores.wealth);
  renderStars(`${type}-score-love`, fortune.scores.love);
  renderStars(`${type}-score-health`, fortune.scores.health);
}

function renderStars(containerId, score) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    if (i <= score) {
      star.className = 'fa-solid fa-star';
    } else {
      star.className = 'fa-regular fa-star';
    }
    container.appendChild(star);
  }
}

// --- PANEL 2: NEWS VIEW ---
async function loadNewsView(categoryTitle) {
  el.newsListContainer.innerHTML = '';
  
  try {
    const dateQuery = currentState.currentDate ? `&date=${currentState.currentDate}` : '';
    const res = await fetch(`/api/data?date=${currentState.currentDate}`);
    const data = await res.json();
    
    const filteredNews = data.news.filter(n => n.category === categoryTitle);
    
    if (filteredNews.length === 0) {
      el.newsListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap"><i class="fa-regular fa-newspaper"></i></div>
          <h3>저장된 뉴스가 없습니다</h3>
          <p>오늘 날짜에 저장된 '${categoryTitle}' 뉴스가 없습니다. 실시간 크롤링 갱신을 통해 뉴스를 업데이트해 보세요!</p>
        </div>
      `;
      return;
    }
    
    filteredNews.forEach(item => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.innerHTML = `
        <div class="news-card-header">
          <span class="news-source">${item.source}</span>
          <span class="news-time">${item.date}</span>
        </div>
        <h3 class="news-card-title"><a href="${item.link}" target="_blank">${item.title}</a></h3>
        <p class="news-card-desc">${item.summary || '상세 보기 요약 내용이 없습니다.'}</p>
        <div class="news-card-footer">
          <a href="${item.link}" target="_blank" class="news-read-btn">
            <span>원문 기사 보기</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;
      el.newsListContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading news view:', err);
    showToast('뉴스를 불러오는 동안 요류가 발생했습니다.', 'error');
  }
}

// --- PANEL 3 & 4: FINANCIALS (STOCKS / COINS) VIEW ---
async function loadFinancialView(type) {
  const container = type === 'stocks' ? el.stocksGridContainer : el.coinsGridContainer;
  container.innerHTML = '';
  
  try {
    const dateQuery = currentState.currentDate ? `&date=${currentState.currentDate}` : '';
    const res = await fetch(`/api/data?date=${currentState.currentDate}`);
    const data = await res.json();
    
    const items = type === 'stocks' ? data.stocks : data.coins;
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: span 2;">
          <div class="empty-icon-wrap"><i class="fa-solid fa-chart-line"></i></div>
          <h3>저장된 분석 지표가 없습니다</h3>
          <p>오늘 날짜에 저장된 금융 시세 분석 데이터가 없습니다. 실시간 크롤링 갱신을 실행해 주세요.</p>
        </div>
      `;
      return;
    }
    
    items.forEach(item => {
      const isUp = item.change_pct >= 0;
      const trendClass = isUp ? 'up-trend' : 'down-trend';
      const trendIcon = isUp ? 'fa-caret-up' : 'fa-caret-down';
      
      const card = document.createElement('div');
      card.className = 'fin-card';
      
      // Render layout with computed sparkline SVG graph
      const sparklineSvg = drawSparkline(item.chart_data, item.recommendation);
      
      card.innerHTML = `
        <div class="fin-card-header">
          <div class="fin-name-wrap">
            <span class="fin-name">${item.name}</span>
            <span class="fin-symbol">${type === 'stocks' ? item.ticker : item.symbol}</span>
          </div>
          <span class="fin-rec-badge rec-${item.recommendation}">${item.recommendation}</span>
        </div>
        
        <div class="fin-prices">
          <span class="fin-price">${formatPrice(item.price, type)}</span>
          <span class="fin-change ${trendClass}">
            <i class="fa-solid ${trendIcon}"></i>
            ${item.change_pct.toFixed(2)}% (${formatValue(item.change_val, type)})
          </span>
        </div>
        
        <!-- Sparkline chart -->
        <div class="chart-container">
          ${sparklineSvg}
        </div>
        
        <div class="fin-analysis">
          <div class="analysis-metrics">
            <div class="metric-item">RSI(14): <span>${item.rsi !== null ? item.rsi.toFixed(1) : '-'}</span></div>
            <div class="metric-item">추천: <span class="trendClass">${item.recommendation}</span></div>
          </div>
          <div class="analysis-reason">${item.reason}</div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(`Error loading ${type} view:`, err);
    showToast('금융 시세 지표를 불러오는 도중 오류가 발생했습니다.', 'error');
  }
}

function formatPrice(val, type) {
  if (type === 'coins') {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  } else {
    // Stock is USD if Apple/MSFT/NVDA/TSLA
    if (isNaN(val)) return val;
    // Check if US Stock based on decimal size or common names
    return val > 5000 ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val) : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
}

function formatValue(val, type) {
  return val >= 0 ? `+${val.toLocaleString()}` : `${val.toLocaleString()}`;
}

// Dynamic SVG Sparkline Graph Builder
function drawSparkline(chartData, recommendation) {
  if (!chartData || chartData.length === 0) {
    return `<div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.75rem;">시세 이력이 없습니다.</div>`;
  }
  
  const prices = chartData.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  
  const width = 400;
  const height = 80;
  
  const points = chartData.map((d, index) => {
    const x = (index / (chartData.length - 1)) * width;
    // Invert coordinate systems for SVG canvas
    const y = height - ((d.price - min) / range) * (height - 15) - 5;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  const areaData = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  
  let trendClass = 'hold';
  if (recommendation === 'BUY') trendClass = 'up';
  else if (recommendation === 'SELL') trendClass = 'down';
  
  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" preserveAspectRatio="none">
      <path d="${areaData}" class="chart-area ${trendClass}"></path>
      <path d="${pathData}" class="chart-line ${trendClass}"></path>
    </svg>
  `;
}
