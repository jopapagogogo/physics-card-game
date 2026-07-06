/**
 * 物理卡牌对战 — 主UI控制器
 * ES6模块，负责全部界面交互与流程编排
 */
import { GameEngine, shuffleArray } from './engine.js';
import { AIEngine } from './ai.js';
import { QuizSystem } from './quiz.js';
import { CARDS } from './cards.js';
import { DOMAIN_RUNES } from './runes.js';
import { COMBO_TABLE } from './combo_table.js';

class GameUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error('UI container not found: #' + containerId);
    }
    this.engine = null;
    this.ai = null;
    this.quiz = new QuizSystem();
    this.selectedCard = null;
    this.phase = 'start'; // start | quiz | play | discard | ai | gameover
    this.testMode = window.location.search.includes('test'); // 测试模式
    this.quizQuestions = [];
    this.quizAnswers = [];
    this.currentQuestionIndex = 0;
    this.quizTimerSeconds = 15;
    this.quizTimer = null;
    this.playTimer = null;
    this.discardTimer = null;
    this.timerSeconds = 0;
    this.logMessages = [];
    this.lastPlayedCard = null;
    this.mainDomain = null;
    this.subDomain = null;
    this.difficulty = 'normal';
    this.autoPlayTimeout = null;
    this._hoverTooltip = null;
    this._attackTargeting = false;
    this.playZoneSelf = []; // 己方出牌展示区
    this.playZoneAi = [];   // AI出牌展示区
    this.customDeck = null; // 玩家自定义卡组（当前选中的）
    this.savedDecks = {};   // 保存的卡组套装 {名称: {ids:[], main, sub}}
    this._lastHandIds = []; // renderHand 局部更新追踪
    this._loadDecks();      // 从localStorage加载
  }

  /** 从localStorage加载已保存的卡组 */
  _loadDecks() {
    try {
      const raw = localStorage.getItem('physics_saved_decks');
      this.savedDecks = raw ? JSON.parse(raw) : {};
    } catch (e) {
      this.savedDecks = {};
    }
  }

  /** 保存卡组到localStorage */
  _saveDecks() {
    try {
      localStorage.setItem('physics_saved_decks', JSON.stringify(this.savedDecks));
    } catch (e) {
      console.warn('保存卡组失败:', e.message);
    }
  }

  /** 更新开始界面卡组下拉 */
  _updateDeckSelect() {
    const select = document.getElementById('deck-select');
    if (!select) return;
    const names = Object.keys(this.savedDecks);
    select.innerHTML = '<option value="">🃏 使用默认卡组</option>' +
      names.map(n => `<option value="${this._escapeHtml(n)}">${this._escapeHtml(n)}</option>`).join('');
    select.style.display = names.length > 0 ? '' : 'none';
    if (this.customDeckName) {
      select.value = this.customDeckName;
    }
  }

  // ==================== 初始化 ====================

  async init() {
    this.artMap = {};
    await this._loadCardArt();
    this.showStartScreen();
  }

  /** 加载卡牌插画映射 → this.artMap */
  async _loadCardArt() {
    try {
      const resp = await fetch('./approved_cards.json');
      const data = await resp.json();
      const mapping = {};
      for (const key of Object.keys(data)) {
        if (data[key] && typeof data[key] === 'object') {
          Object.assign(mapping, data[key]);
        }
      }
      this.artMap = {};
      for (const [id, file] of Object.entries(mapping)) {
        this.artMap[id] = `art_samples/card_art/${file}`;
      }
      console.log(`[init] 插画映射: ${Object.keys(this.artMap).length} 张`);
    } catch (e) {
      console.warn('[init] 插画加载失败:', e.message);
    }
  }

  // ==================== 开始界面 ====================

  showStartScreen() {
    const domains = [
      { id: '力', name: '力', icon: '💪', color: '#E74C3C', desc: '力学领域' },
      { id: '声', name: '声', icon: '🔊', color: '#3498DB', desc: '声学领域' },
      { id: '光', name: '光', icon: '💡', color: '#F1C40F', desc: '光学领域' },
      { id: '热', name: '热', icon: '🔥', color: '#E67E22', desc: '热学领域' },
      { id: '电', name: '电', icon: '⚡', color: '#9B59B6', desc: '电学领域' }
    ];

    const domainBtn = (d, disabled) => `
      <button class="btn-domain ${disabled ? 'disabled' : ''}" 
              data-domain="${d.id}" 
              ${disabled ? 'disabled' : ''}
              style="--dc:${d.color}">
        <span class="domain-rune">${DOMAIN_RUNES[d.id] ? `<img src="${DOMAIN_RUNES[d.id]}">` : d.icon}</span>
        <span class="domain-label">${d.name}</span>
      </button>
    `;

    this.container.innerHTML = `
      <div class="start-screen">
        <div class="start-left">
          <h1 class="start-title">⚛️ 物理卡牌对战</h1>
          <p class="start-subtitle">选择你的物理领域，用知识战胜对手！</p>
        </div>

        <div class="start-right">
          <div class="start-row">
            <div class="start-col">
              <h2 class="section-title">① 主领域</h2>
              <div id="main-domain-btns" class="domain-grid">
                ${domains.map(d => domainBtn(d, false)).join('')}
              </div>
            </div>
            <div class="start-col">
              <h2 class="section-title">② 副领域</h2>
              <div id="sub-domain-btns" class="domain-grid">
                ${domains.map(d => domainBtn(d, true)).join('')}
              </div>
            </div>
            <div class="start-col">
              <h2 class="section-title">③ 难度</h2>
              <div id="difficulty-btns" class="difficulty-col">
                <button class="btn-diff" data-diff="easy">🥉 启航</button>
                <button class="btn-diff active" data-diff="normal">🥈 砺剑</button>
                <button class="btn-diff" data-diff="hard">🥇 巅峰</button>
              </div>
            </div>
          </div>

          <div class="start-footer">
            <div class="start-actions">
              <select id="deck-select" class="deck-select" style="display:none"><option value="">🃏 使用默认卡组</option></select>
              <button id="btn-deck-builder" class="btn-deck-builder" disabled>🃏 编辑卡组</button>
              <button id="btn-combo-list" class="btn-deck-builder">⚡ Combo列表</button>
              <button id="btn-start-game" class="btn-start" disabled>⚔ 开始战斗</button>
            </div>
            <p id="start-hint" class="start-hint">请先选择主领域和副领域</p>
            <div id="deck-summary" class="deck-summary" style="display:none"></div>
          </div>
        </div>
      </div>
    `;

    this._injectStartStyles();
    this._bindStartEvents(domains);
  }

  /** 注入开始界面专用样式 */
  _injectStartStyles() {
    if (document.getElementById('start-screen-styles')) return;
    const style = document.createElement('style');
    style.id = 'start-screen-styles';
    style.textContent = `
      .start-screen {
        width:100vw; height:100vh;
        background:#0a0a1a;
        background-image:
          radial-gradient(ellipse at 30% 50%, rgba(52,152,219,.05) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 50%, rgba(155,89,182,.05) 0%, transparent 60%);
        display:flex; align-items:center; padding:20px 60px; gap:40px;
        overflow:hidden;
      }
      .start-left { flex-shrink:0; max-width:260px; }
      .start-title { font-size:32px; font-weight:900; color:#fff; margin-bottom:8px; letter-spacing:1px; }
      .start-subtitle { font-size:14px; color:var(--mt); }
      .start-right { flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px; min-width:0; }
      .start-row { display:flex; gap:36px; justify-content:center; }
      .start-col { display:flex; flex-direction:column; align-items:center; gap:8px; }
      .section-title { font-size:16px; font-weight:700; color:var(--mt); text-align:center; letter-spacing:1px; }
      .domain-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
      .btn-domain {
        width:72px; height:72px; display:flex; flex-direction:column; align-items:center;
        justify-content:center; gap:4px; background:rgba(255,255,255,.04);
        border:2px solid rgba(255,255,255,.08); border-radius:10px;
        color:var(--lt); cursor:pointer; transition:all .2s;         font-size:13px;
      }
      .btn-domain:hover:not(.disabled) { border-color:var(--dc); transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.3); }
      .btn-domain.selected { border-color:var(--dc) !important; box-shadow:0 0 20px color-mix(in srgb, var(--dc) 40%, transparent); background:color-mix(in srgb, var(--dc) 15%, rgba(0,0,0,.3)); }
      .btn-domain.disabled { opacity:.25; cursor:not-allowed; filter:grayscale(60%); }
      .btn-domain.disabled.selected { opacity:1 !important; filter:none !important; }
      .domain-rune { width:28px; height:28px; display:flex; align-items:center; justify-content:center; }
      .domain-rune img { width:100%; height:100%; object-fit:contain; }
      .domain-label { font-size:13px; font-weight:700; }
      .difficulty-col { display:flex; flex-direction:column; gap:10px; }
      .btn-diff {
        width:120px; padding:12px 8px; background:rgba(255,255,255,.04); color:var(--mt);
        border:2px solid rgba(255,255,255,.06); border-radius:10px;
        cursor:pointer; font-size:14px; font-weight:700; transition:all .2s; text-align:center;
      }
      .btn-diff:hover { border-color:rgba(255,255,255,.15); }
      .btn-diff.active { border-color:var(--blu); color:#fff; box-shadow:0 0 12px rgba(52,152,219,.2); }
      .start-footer { text-align:center; }
      .start-actions { display:flex; gap:10px; justify-content:center; }
      .btn-start {
        padding:10px 32px; font-size:16px; font-weight:900;
        background:linear-gradient(135deg, var(--scs), #1e8449); color:#fff;
        border:none; border-radius:10px; cursor:pointer; letter-spacing:1px;
        box-shadow:0 4px 20px rgba(46,204,113,.25); transition:all .2s;
      }
      .btn-start:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 24px rgba(46,204,113,.4); }
      .btn-start:disabled { opacity:.35; cursor:not-allowed; }
      .btn-deck-builder {
        padding:10px 20px; font-size:14px; font-weight:700;
        background:rgba(147,51,234,.12); color:#c084fc;
        border:1.5px solid rgba(147,51,234,.3); border-radius:10px;
        cursor:pointer; transition:all .2s;
      }
      .btn-deck-builder:hover:not(:disabled) { background:rgba(147,51,234,.22); }
      .btn-deck-builder:disabled { opacity:.3; cursor:not-allowed; }
      .start-hint { font-size:11px; color:var(--mt); margin-top:6px; }
      .deck-summary { font-size:12px; color:#c084fc; margin-top:6px; }
      .deck-select {
        padding:10px 14px; font-size:14px; font-weight:700;
        background:rgba(147,51,234,.12); color:#c084fc;
        border:1.5px solid rgba(147,51,234,.3); border-radius:10px;
        cursor:pointer; max-width:200px;
      }
      .deck-select option { background:#1a1a2e; color:#ccc; }
    `;
    document.head.appendChild(style);
  }

  /** 绑定开始界面事件 */
  _bindStartEvents(domains) {
    // 主领域选择
    document.querySelectorAll('#main-domain-btns .btn-domain').forEach(btn => {
      btn.addEventListener('click', () => {
        const domain = btn.dataset.domain;
        this.selectMainDomain(domain);
      });
    });

    // 副领域选择
    document.querySelectorAll('#sub-domain-btns .btn-domain').forEach(btn => {
      btn.addEventListener('click', () => {
        const domain = btn.dataset.domain;
        if (btn.disabled) return;
        this.selectSubDomain(domain);
      });
    });

    // 难度选择
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
      });
    });

    // 自定义卡组按钮
    const deckBtn = document.getElementById('btn-deck-builder');
    if (deckBtn) deckBtn.addEventListener('click', () => {
      if (this.mainDomain && this.subDomain) {
        this.showDeckBuilder();
      }
    });

    // Combo列表按钮
    const comboBtn = document.getElementById('btn-combo-list');
    if (comboBtn) comboBtn.addEventListener('click', () => this.showComboList());

    // 卡组下拉选择
    const deckSelect = document.getElementById('deck-select');
    if (deckSelect) deckSelect.addEventListener('change', () => {
      const name = deckSelect.value;
      if (name && this.savedDecks[name]) {
        this.customDeck = [...this.savedDecks[name].ids];
        this.customDeckName = name;
        this._updateStartButton();
      } else {
        this.customDeck = null;
        this.customDeckName = null;
        this._updateStartButton();
      }
    });

    // 开始按钮
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) startBtn.addEventListener('click', () => {
      if (this.mainDomain && this.subDomain) {
        this.startGame();
      }
    });
  }

  selectMainDomain(domain) {
    this.mainDomain = domain;

    // 更新主领域按钮样式
    document.querySelectorAll('#main-domain-btns .btn-domain').forEach(b => {
      b.classList.toggle('selected', b.dataset.domain === domain);
    });

    // 更新副领域按钮（排除已选主领域，启用其余）
    document.querySelectorAll('#sub-domain-btns .btn-domain').forEach(b => {
      if (b.dataset.domain === domain) {
        b.classList.add('disabled');
        b.disabled = true;
      } else {
        b.classList.remove('disabled');
        b.disabled = false;
        if (b.dataset.domain === this.subDomain) {
          b.classList.add('selected');
        }
      }
    });

    this._updateStartButton();
  }

  selectSubDomain(domain) {
    this.subDomain = domain;

    document.querySelectorAll('#sub-domain-btns .btn-domain').forEach(b => {
      b.classList.toggle('selected', b.dataset.domain === domain);
    });

    this._updateStartButton();
  }

  _updateStartButton() {
    const btn = document.getElementById('btn-start-game');
    const btnDeck = document.getElementById('btn-deck-builder');
    const hint = document.getElementById('start-hint');
    if (!btn || !hint) return;

    const ready = !!(this.mainDomain && this.subDomain);
    btn.disabled = !ready;
    if (btnDeck) btnDeck.disabled = !ready;
    
    // 更新卡组下拉
    this._updateDeckSelect();
    
    // 显示自定义卡组摘要
    if (this.customDeck && this.customDeck.length > 0) {
      const deckSummary = document.getElementById('deck-summary');
      if (deckSummary) {
        deckSummary.style.display = 'block';
        deckSummary.innerHTML = '🃏 ' + this._escapeHtml(this.customDeckName || '自定义卡组') + '：' + this.customDeck.length + ' 张';
      }
    }
    
    hint.textContent = ready
      ? `主领域「${this.mainDomain}」+ 副领域「${this.subDomain}」· 难度: ${this._diffLabel(this.difficulty)}`
      : this.mainDomain
        ? '请继续选择副领域'
        : '请先选择主领域和副领域';
  }

  /** 卡组构建器 — 全屏选牌界面 */
  showDeckBuilder() {
    const self = this; // 保存UI实例引用，内部函数this可能丢失
    // 初始化选中卡组
    let selected = new Set(this.customDeck || []);
    const allCards = CARDS;
    let filterDomain = 'all';
    let filterType = 'all';
    let filterRarity = 'all';

    // 构建 UI
    const overlay = document.createElement('div');
    overlay.className = 'deck-builder-overlay';
    overlay.innerHTML = `
      <div class="db-topbar">
        <h2>🃏 卡组构建器</h2>
        <div class="db-count"><span id="db-count">${selected.size}</span>/30 张</div>
        <button id="db-save" class="db-btn-save">✅ 确认卡组（<span id="db-save-count">${selected.size}</span>/30）</button>
        <button id="db-auto" class="db-btn-auto">🤖 快速自动组牌</button>
        <button id="db-clear" class="db-btn-clear">🗑 清空</button>
        <button id="db-cancel" class="db-btn-cancel">← 返回</button>
      </div>
      <div class="db-filters">
        <div class="db-domain-filters">
          <button class="db-domain-btn active" data-domain="all">全部</button>
          <button class="db-domain-btn" data-domain="力" style="--dc:#E74C3C">💪 力</button>
          <button class="db-domain-btn" data-domain="声" style="--dc:#3498DB">🔊 声</button>
          <button class="db-domain-btn" data-domain="光" style="--dc:#F1C40F">💡 光</button>
          <button class="db-domain-btn" data-domain="热" style="--dc:#E67E22">🔥 热</button>
          <button class="db-domain-btn" data-domain="电" style="--dc:#9B59B6">⚡ 电</button>
        </div>
        <select id="db-filter-type"><option value="all">全部类型</option><option value="attack">攻击卡</option><option value="support">辅助卡</option><option value="summon">召唤卡</option><option value="domain">领域卡</option><option value="phase">相变卡</option></select>
        <select id="db-filter-rarity"><option value="all">全部稀有度</option><option value="common">普通</option><option value="rare">稀有</option><option value="epic">史诗</option><option value="legendary">传说</option><option value="mythic">神话</option></select>
        <input id="db-search" type="text" placeholder="🔍 搜索卡牌名称..." class="db-search">
      </div>
      <div class="db-progress">
        <div class="db-progress-bar">
          <div class="db-progress-fill" id="db-progress-fill"></div>
        </div>
        <div class="db-progress-text" id="db-progress-text">0/30 已选</div>
        <div class="db-conditions">
          <span id="db-cond-main">主领域12-18</span>
          <span id="db-cond-sub">副领域6-12</span>
          <span id="db-cond-domain">领域卡≤2</span>
        </div>
      </div>
      <div class="db-main">
        <div class="db-card-list" id="db-card-list"></div>
        <div class="db-deck-panel" id="db-deck-panel">
          <h3>我的卡组</h3>
          <div id="db-selected-list" class="db-selected-list"></div>
          <div class="db-stats" id="db-stats"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const MAX_CARDS = 30;
    const colorMap = { '力':'#E74C3C','声':'#3498DB','光':'#F1C40F','热':'#E67E22','电':'#9B59B6' };

    function getDomainColor(card) {
      const d = Array.isArray(card.domain) ? card.domain[0] : '力';
      return colorMap[d] || '#888';
    }

    // 渲染卡牌列表
    const cardList = overlay.querySelector('#db-card-list');
    function renderCards() {
      const searchText = (overlay.querySelector('#db-search').value || '').toLowerCase();
      let filtered = allCards.filter(c => {
        if (filterType !== 'all' && c.type !== filterType) return false;
        if (filterRarity !== 'all' && c.rarity !== filterRarity) return false;
        if (filterDomain !== 'all') {
          const d = Array.isArray(c.domain) ? c.domain : [c.domain];
          if (!d.includes(filterDomain)) return false;
        }
        if (searchText && !c.name.toLowerCase().includes(searchText)) return false;
        return true;
      });

      cardList.innerHTML = filtered.map(c => {
        const isSelected = selected.has(c.id);
        const domainColor = getDomainColor(c);
        const dmg = c.effect?.dmg != null ? c.effect.dmg : '';
        return `<div class="db-card ${isSelected ? 'selected' : ''}" data-id="${c.id}" style="border-left:3px solid ${domainColor}">
          <span class="db-card-cost">${c.cost || 0}</span>
          <span class="db-card-name" style="color:${domainColor}">${c.name}</span>
          <span class="db-card-type">${c.type === 'attack' ? '攻击' : c.type === 'support' ? '辅助' : c.type === 'summon' ? '召唤' : c.type === 'domain' ? '领域' : c.type === 'phase' ? '相变' : c.type}</span>
          ${dmg ? '<span class="db-card-dmg">⚔' + dmg + '</span>' : ''}
          <span class="db-card-rarity">${c.rarity}</span>
        </div>`;
      }).join('');

      // 绑定点击事件
      cardList.querySelectorAll('.db-card').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          if (selected.has(id)) {
            selected.delete(id);
          } else if (selected.size < MAX_CARDS) {
            selected.add(id);
          }
          renderCards();
          renderDeckPanel();
          updateCount();
        });
      });
    }

    function computeStats() {
      const stats = { mainCount: 0, subCount: 0, domC: 0, totalDmg: 0 };
      for (const id of selected) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        stats.totalDmg += c.effect?.dmg || 0;
        if (c.type === 'domain') stats.domC++;
        const hasMain = this._cardHasDomain(c, this.mainDomain);
        const hasSub = this._cardHasDomain(c, this.subDomain);
        if (hasMain && hasSub) { stats.mainCount++; stats.subCount++; }
        else if (hasMain) stats.mainCount++;
        else if (hasSub) stats.subCount++;
      }
      return stats;
    }

    // 渲染右侧卡组面板
    const selectedList = overlay.querySelector('#db-selected-list');
    function renderDeckPanel() {
      const ids = [...selected];
      selectedList.innerHTML = ids.map((id, idx) => {
        const c = allCards.find(card => card.id === id);
        if (!c) return '';
        const domainColor = getDomainColor(c);
        return `<div class="db-selected-item" style="border-left:3px solid ${domainColor}">
          <span class="db-sel-idx">${idx + 1}</span>
          <span class="db-sel-name" style="color:${domainColor}">${c.name}</span>
          <span class="db-sel-cost">${c.cost || 0}费</span>
          <button class="db-sel-remove" data-id="${c.id}">✕</button>
        </div>`;
      }).join('');

      // 绑定移除按钮
      selectedList.querySelectorAll('.db-sel-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selected.delete(btn.dataset.id);
          renderCards();
          renderDeckPanel();
          updateCount();
        });
      });

      // 统计
      const s = computeStats.call(self);
      const domStats = {};
      for (const id of selected) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        const d = Array.isArray(c.domain) ? c.domain[0] : '力';
        domStats[d] = (domStats[d] || 0) + 1;
      }
      const statHTML = Object.entries(domStats).map(([d, c]) =>
        `<span style="color:${colorMap[d] || '#888'}">${d}×${c}</span>`
      ).join(' ');
      const allValid = s.domC <= 2 && s.mainCount >= 12 && s.mainCount <= 18 && s.subCount >= 6 && s.subCount <= 12 && selected.size === 30;
      const ruleIcon = allValid ? '✅' : '⚠️';
      overlay.querySelector('#db-stats').innerHTML = `${statHTML} | 均伤≈${selected.size > 0 ? Math.round(s.totalDmg / selected.size) : 0}<br>${ruleIcon} 主${s.mainCount}(12-18) 副${s.subCount}(6-12) 领域${s.domC}(≤2) | 30张必须满`;
    }

    function updateCount() {
      const count = selected.size;
      const countEl = overlay.querySelector('#db-count');
      countEl.textContent = count;
      countEl.style.color = count === 30 ? '#4CAF50' : count > 0 ? '#FFA500' : '#f44336';
      const saveCount = overlay.querySelector('#db-save-count');
      if (saveCount) saveCount.textContent = count;
      if (count < 30 && count > 0) {
        overlay.querySelector('#db-save').classList.add('warn');
      } else {
        overlay.querySelector('#db-save').classList.remove('warn');
      }
      // 进度条
      const pct = Math.min(100, (count / 30) * 100);
      const fill = overlay.querySelector('#db-progress-fill');
      if (fill) { fill.style.width = pct + '%'; fill.style.background = pct === 100 ? '#4CAF50' : pct > 50 ? '#FFA500' : '#f44336'; }
      const text = overlay.querySelector('#db-progress-text');
      if (text) { text.textContent = count + '/30 已选'; text.style.color = count === 30 ? '#4CAF50' : count > 0 ? '#FFA500' : '#999'; }
      // 条件指示器
      const s = computeStats.call(self);
      const condMain = overlay.querySelector('#db-cond-main');
      const condSub = overlay.querySelector('#db-cond-sub');
      const condDom = overlay.querySelector('#db-cond-domain');
      if (condMain) { condMain.style.color = s.mainCount >= 12 && s.mainCount <= 18 ? '#4CAF50' : '#f44336'; condMain.textContent = `主${s.mainCount}/12-18`; }
      if (condSub) { condSub.style.color = s.subCount >= 6 && s.subCount <= 12 ? '#4CAF50' : '#f44336'; condSub.textContent = `副${s.subCount}/6-12`; }
      if (condDom) { condDom.style.color = s.domC <= 2 ? '#4CAF50' : '#f44336'; condDom.textContent = `领域${s.domC}/≤2`; }
    }

    // 事件绑定
    overlay.querySelector('#db-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#db-search').addEventListener('input', renderCards);
    overlay.querySelector('#db-filter-type').addEventListener('change', (e) => { filterType = e.target.value; renderCards(); });
    overlay.querySelector('#db-filter-rarity').addEventListener('change', (e) => { filterRarity = e.target.value; renderCards(); });
    // 领域筛选按钮
    overlay.querySelectorAll('.db-domain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.db-domain-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterDomain = btn.dataset.domain;
        renderCards();
      });
    });
    overlay.querySelector('#db-clear').addEventListener('click', () => { selected.clear(); renderCards(); renderDeckPanel(); updateCount(); });

    overlay.querySelector('#db-auto').addEventListener('click', () => {
      // 在已选基础上智能补全到30张，需求驱动：先保最低再随机
      const MAX_C = 30;
      const picked = [];
      const inD = (c, d) => self._cardHasDomain(c, d);
      const inMain = (c) => inD(c, self.mainDomain);
      const inSub = (c) => inD(c, self.subDomain);
      const inBoth = (c) => inMain(c) && inSub(c);
      const inNeither = (c) => !inMain(c) && !inSub(c);

      const curStats = () => {
        const s = computeStats.call(self);
        return {
          main: s.mainCount + picked.filter(x => inMain(x)).length,
          sub: s.subCount + picked.filter(x => inSub(x)).length,
          dom: s.domC + picked.filter(x => x.type === 'domain').length,
          total: selected.size + picked.length
        };
      };

      const pool = shuffleArray(allCards.filter(c => !selected.has(c.id)));

      // 阶段1a：填主领域唯一卡到主≥12
      for (const c of pool) {
        if (curStats().main >= 12 || curStats().total >= MAX_C) break;
        if (!inMain(c) || inSub(c) || c.type === 'domain') continue;
        picked.push(c);
      }

      // 阶段1b：填副领域唯一卡到副≥6
      for (const c of pool) {
        if (curStats().sub >= 6 || curStats().total >= MAX_C) break;
        if (!inSub(c) || inMain(c) || c.type === 'domain') continue;
        picked.push(c);
      }

      // 阶段1c：交叉领域卡补缺口
      if (curStats().main < 12 || curStats().sub < 6) {
        for (const c of pool) {
          if (curStats().total >= MAX_C) break;
          if (curStats().main >= 12 && curStats().sub >= 6) break;
          if (!inBoth(c) || c.type === 'domain' || picked.includes(c)) continue;
          picked.push(c);
        }
      }

      // 阶段1d：优选1-2张领域卡（主/副领域相关）
      if (curStats().dom < 2) {
        const domCards = pool.filter(c => c.type === 'domain' && (inMain(c) || inSub(c)) && !picked.includes(c));
        for (const c of domCards) {
          if (curStats().dom >= 2 || curStats().total >= MAX_C) break;
          picked.push(c);
        }
      }

      // 阶段2：随机约束填充到30
      for (const c of pool) {
        if (curStats().total >= MAX_C) break;
        if (picked.includes(c)) continue;
        const st = curStats();
        if (c.type === 'domain' && st.dom >= 2) continue;
        if (inMain(c) && st.main >= 18) continue;
        if (inSub(c) && st.sub >= 12) continue;
        picked.push(c);
      }

      // 阶段3：中性卡兜底
      if (curStats().total < MAX_C) {
        for (const c of pool) {
          if (curStats().total >= MAX_C) break;
          if (picked.includes(c) || c.type === 'domain') continue;
          if (!inNeither(c)) continue;
          picked.push(c);
        }
      }

      // 阶段4：最终兜底
      if (curStats().total < MAX_C) {
        for (const c of pool) {
          if (curStats().total >= MAX_C) break;
          if (picked.includes(c) || c.type === 'domain') continue;
          picked.push(c);
        }
      }

      for (const c of picked) selected.add(c.id);
      renderCards();
      renderDeckPanel();
      updateCount();
    });

    overlay.querySelector('#db-save').addEventListener('click', () => {
      if (selected.size === 0) {
        alert('请先选择至少1张卡牌，或点击「快速自动组牌」。');
        return;
      }
      if (selected.size < MAX_CARDS) {
        alert('卡组不足30张，请手动补全或点击「快速自动组牌」自动补齐。');
        return;
      }
      
      // 领域验证
      const self = this;
      const ids = [...selected];
      let domainCount = 0;
      let mainCount = 0, subCount = 0, otherCount = 0;
      for (const id of ids) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        if (c.type === 'domain') domainCount++;
        const hasMain = self._cardHasDomain(c, self.mainDomain);
        const hasSub = self._cardHasDomain(c, self.subDomain);
        if (hasMain && hasSub) { mainCount++; subCount++; }
        else if (hasMain) mainCount++;
        else if (hasSub) subCount++;
        else otherCount++;
      }
      
      // 三条约束
      if (mainCount < 12) { alert('主领域「' + self.mainDomain + '」至少需要12张（当前' + mainCount + '张）'); return; }
      if (mainCount > 18) { alert('主领域「' + self.mainDomain + '」最多18张（当前' + mainCount + '张）'); return; }
      if (subCount < 6)  { alert('副领域「' + self.subDomain + '」至少需要6张（当前' + subCount + '张）'); return; }
      if (subCount > 12) { alert('副领域「' + self.subDomain + '」最多12张（当前' + subCount + '张）'); return; }
      if (domainCount > 2) { alert('领域卡最多2张（当前' + domainCount + '张）'); return; }
      
      // 取名保存
      const defaultName = self.mainDomain + '·' + self.subDomain + ' 卡组 ' + (Object.keys(self.savedDecks).length + 1);
      const name = prompt('为这套卡组起个名字：', self.customDeckName || defaultName);
      if (!name) return;
      self.savedDecks[name] = { ids, main: self.mainDomain, sub: self.subDomain };
      self._saveDecks();
      self.customDeck = ids;
      self.customDeckName = name;
      self._updateStartButton();
      overlay.remove();
    });

    // 初始渲染
    renderCards();
    renderDeckPanel();
    updateCount();
  }

  _diffLabel(diff) {
    const map = { easy: '启航', normal: '砺剑', hard: '巅峰' };
    return map[diff] || '普通';
  }

  // ==================== 游戏开始 / 卡组生成 ====================

  startGame() {
    // V30: 首次游戏新手引导（sessionStorage，关标签页重置）
    if (!sessionStorage.getItem('pcg_tutorial_done')) {
      this._showTutorial(() => {
        sessionStorage.setItem('pcg_tutorial_done', '1');
        this._doStartGame();
      });
      return;
    }
    this._doStartGame();
  }

  _doStartGame() {
    const playerDeck = this.customDeck && this.customDeck.length === 30
      ? this.customDeck
      : this.generateDeck(this.mainDomain, this.subDomain);

    // AI使用不同的主领域（优先选择与玩家不同的领域）
    const allDomains = ['力', '声', '光', '热', '电'];
    const remaining = allDomains.filter(d => d !== this.mainDomain);
    const aiMain = remaining[Math.floor(Math.random() * remaining.length)];
    const aiSubCandidates = allDomains.filter(d => d !== aiMain);
    const aiSub = aiSubCandidates[Math.floor(Math.random() * aiSubCandidates.length)];

    const aiDeck = this.generateDeck(aiMain, aiSub);

    // 初始化引擎
    this.engine = new GameEngine(
      playerDeck,
      aiDeck,
      this.mainDomain,
      this.subDomain,
      aiMain,
      aiSub
    );

    // 初始化AI
    this.ai = new AIEngine(this.engine, this.difficulty);

    // 🧪 测试模式：按所选领域过滤+混沌卡，满精神力
    if (this.testMode) {
      this.engine.players[0].hand = this._getTestCards().map(c => ({...c}));
      this.engine.players[0].spirit = 100;
      this.engine.players[1].spirit = 100;
      this.timerSeconds = 999; // 不计时
    }

    // 渲染战斗界面
    this.renderBattleScreen();

    // 注入战斗界面专用样式（如果尚未注入）
    this._injectBattleStyles();

    // 开始玩家第一个回合
    this.startPlayerTurn();
  }

  generateDeck(mainDomain, subDomain) {
    if (!CARDS || !CARDS.length) {
      console.warn('CARDS data is empty, generating fallback deck');
      return [];
    }

    const usedIds = new Set();
    const deck = [];
    const MAX_MAIN = 18, MIN_MAIN = 12, MAX_SUB = 12, MIN_SUB = 6, MAX_DOMAIN = 2, TOTAL = 30;

    const inD = (c, d) => Array.isArray(c.domain) ? c.domain.includes(d) : c.domain === d;
    const inMain = (c) => inD(c, mainDomain);
    const inSub = (c) => inD(c, subDomain);
    const inBoth = (c) => inMain(c) && inSub(c);
    const inNeither = (c) => !inMain(c) && !inSub(c);

    const count = () => {
      let m = 0, s = 0, d = 0;
      for (const c of deck) {
        if (c.type === 'domain') d++;
        if (inMain(c)) m++;
        if (inSub(c)) s++;
      }
      return { main: m, sub: s, dom: d };
    };

    const add = (c) => { deck.push(c); usedIds.add(c.id); };

    // 阶段1：优先填充达到最低要求（主12/副6）
    const needMain = () => Math.max(0, MIN_MAIN - count().main);
    const needSub = () => Math.max(0, MIN_SUB - count().sub);

    // 1a: 主领域唯一卡（只属于主，不属于副）
    const mainOnly = shuffleArray(CARDS.filter(c => inMain(c) && !inSub(c) && c.type !== 'domain'));
    for (const c of mainOnly) {
      if (needMain() <= 0 || deck.length >= TOTAL) break;
      if (usedIds.has(c.id)) continue;
      add(c);
    }

    // 1b: 副领域唯一卡
    const subOnly = shuffleArray(CARDS.filter(c => inSub(c) && !inMain(c) && c.type !== 'domain'));
    for (const c of subOnly) {
      if (needSub() <= 0 || deck.length >= TOTAL) break;
      if (usedIds.has(c.id)) continue;
      add(c);
    }

    // 1c: 交叉领域卡（达到最低后可补任意一方）
    if (needMain() > 0 || needSub() > 0) {
      const crossPool = shuffleArray(CARDS.filter(c => inBoth(c) && c.type !== 'domain'));
      for (const c of crossPool) {
        if (deck.length >= TOTAL) break;
        if (usedIds.has(c.id)) continue;
        if (needMain() > 0 || needSub() > 0) add(c);
      }
    }

    // 1d: 优选1-2张领域卡（主/副领域相关）
    if (count().dom < MAX_DOMAIN) {
      const domPool = shuffleArray(CARDS.filter(c => c.type === 'domain' && (inMain(c) || inSub(c)) && !usedIds.has(c.id)));
      for (const c of domPool) {
        if (count().dom >= MAX_DOMAIN || deck.length >= TOTAL) break;
        add(c);
      }
    }

    // 阶段2：随机约束填充到30
    const rest = shuffleArray(CARDS.filter(c => !usedIds.has(c.id)));
    for (const c of rest) {
      if (deck.length >= TOTAL) break;
      const st = count();
      if (c.type === 'domain' && st.dom >= MAX_DOMAIN) continue;
      if (inMain(c) && st.main >= MAX_MAIN) continue;
      if (inSub(c) && st.sub >= MAX_SUB) continue;
      add(c);
    }

    // 阶段3：中性卡兜底
    if (deck.length < TOTAL) {
      for (const c of rest) {
        if (deck.length >= TOTAL) break;
        if (usedIds.has(c.id) || c.type === 'domain') continue;
        if (inNeither(c)) add(c);
      }
    }

    // 阶段4：最终兜底
    if (deck.length < TOTAL) {
      for (const c of rest) {
        if (deck.length >= TOTAL) break;
        if (usedIds.has(c.id) || c.type === 'domain') continue;
        add(c);
      }
    }

    return deck.slice(0, TOTAL).map(c => c.id);
  }

  /** 检查卡牌是否属于指定领域 */
  _cardHasDomain(card, domain) {
    if (!card.domain) return false;
    if (Array.isArray(card.domain)) return card.domain.includes(domain);
    return card.domain === domain;
  }

  // ==================== 玩家回合 ====================

  startPlayerTurn() {
    if (this.phase === 'gameover') return;

    // 🧪 测试模式：每回合补满+满精神力
    if (this.testMode) {
      this.engine.players[0].hand = this._getTestCards().map(c => ({...c}));
      this.engine.players[0].spirit = 100;
      if (this.playTimer) { clearInterval(this.playTimer); this.playTimer = null; }
    }

    this.engine.startTurn();
    
    // 拉普拉斯妖窥牌排序
    if (this.engine._pendingScry) {
      this._showScryModal().then(() => {
        this._continuePlayerTurn();
      });
      return;
    }
    this._continuePlayerTurn();
  }
  
  _continuePlayerTurn() {
    this.phase = 'quiz';
    this.selectedCard = null;
    this.lastPlayedCard = null;
    this.updateAllDisplay();
    this.showQuizPhase();
  }

  // ==================== 答题阶段 ====================

  showQuizPhase() {
    // 清空上一轮出牌展示（重要：防止卡片累积挤压布局）
    this.playZoneSelf = [];
    this.playZoneAi = [];

    const gs = this.engine.getGameState();
    if (!gs || !gs.players || !gs.players[0]) {
      console.error('Invalid game state in quiz phase');
      return;
    }

    // 生成题目
    this.quizQuestions = this.quiz.generateRound(
      gs.players[0].domain?.main || this.mainDomain,
      gs.players[0].domain?.sub || this.subDomain,
      this.lastPlayedCard
    );

    // 边界处理：如果没有题目，直接跳过答题阶段
    if (!this.quizQuestions || this.quizQuestions.length === 0) {
      this.addLogMessage('本轮无需答题，直接进入出牌阶段');
      this.engine.setQuizResult(0, 0);
      this.phase = 'play';
      this.startPlayPhase();
      return;
    }

    this.quizAnswers = [];
    this.currentQuestionIndex = 0;
    this.quizTimerSeconds = 15;

    this.showQuizOverlay();
    this.showQuestion(0);
    this.startQuizTimer();
  }

  showQuizOverlay() {
    // 移除已有弹窗
    const existing = document.getElementById('quiz-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.className = 'quiz-overlay';
    overlay.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-timer">
          <div id="quiz-timer-fill" class="quiz-timer-fill"></div>
        </div>
        <div class="quiz-progress">
          第 <span id="quiz-qnum">1</span> / ${this.quizQuestions.length} 题
        </div>
        <div id="quiz-question" class="quiz-question"></div>
        <div id="quiz-options" class="quiz-options"></div>
      </div>
    `;
    this.container.appendChild(overlay);
  }

  showQuestion(index) {
    if (index >= this.quizQuestions.length) {
      this.finishQuiz();
      return;
    }

    const q = this.quizQuestions[index];
    const qnumEl = document.getElementById('quiz-qnum');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');

    if (qnumEl) qnumEl.textContent = index + 1;
    if (questionEl) questionEl.textContent = q.question || '';

    // 渲染选项
    const opts = q.options || [];
    let optionsHTML = '';
    opts.forEach((opt, i) => {
      optionsHTML += `<button class="btn quiz-option" data-option="${i}">${this._escapeHtml(opt)}</button>`;
    });
    if (!optionsEl) return;
    optionsEl.innerHTML = optionsHTML;

    // 绑定选项点击
    optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const answerIndex = parseInt(e.target.dataset.option);
        this.handleQuizAnswer(answerIndex);
      });
    });
  }

  handleQuizAnswer(answerIndex) {
    if (this.currentQuestionIndex >= this.quizQuestions.length) return;

    const q = this.quizQuestions[this.currentQuestionIndex];
    const result = this.quiz.checkAnswer(q.id, answerIndex);
    this.quizAnswers.push(result.correct);

    // 显示反馈
    const optionsEl = document.getElementById('quiz-options');
    if (!optionsEl) return;

    const quizCard = document.querySelector('.quiz-card');
    if (quizCard) {
      quizCard.classList.add(result.correct ? 'correct-flash' : 'wrong-flash');
      setTimeout(() => quizCard.classList.remove('correct-flash', 'wrong-flash'), 400);
    }

    const options = optionsEl.querySelectorAll('.quiz-option');
    const correctIdx = q.answer !== undefined ? q.answer : -1;

    options.forEach((opt, i) => {
      opt.disabled = true;
      if (i === answerIndex) {
        opt.classList.add(result.correct ? 'correct' : 'wrong');
      }
      if (i === correctIdx && i !== answerIndex) {
        opt.classList.add('correct');
      }
    });

    // 延迟后下一题或结束
    setTimeout(() => {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < this.quizQuestions.length) {
        this.showQuestion(this.currentQuestionIndex);
      } else {
        this.finishQuiz();
      }
    }, 800);
  }

  finishQuiz() {
    clearInterval(this.quizTimer);
    this.quizTimer = null;

    const total = this.quizQuestions.length || 0;
    const correctCount = this.quizAnswers.filter(a => a).length;
    const bonus = total > 0 ? this.quiz.getQuizBonus(correctCount) : 0;
    const bonusText = bonus > 0 ? `+${Math.round(bonus * 100)}%` : '无增益';
    const messages = ['实验失败', '方向正确', '数据吻合', '实验成功'];
    const resultMsg = total > 0
      ? messages[Math.min(correctCount, 3)] || messages[0]
      : '无需答题';

    // 设置答题结果到引擎
    this.engine.setQuizResult(correctCount, total);

    // 移除弹窗
    const overlay = document.getElementById('quiz-overlay');
    if (overlay) overlay.remove();

    // 显示结果提示
    if (total > 0) {
      this.addLogMessage(`答题结果: ${correctCount}/${total} 正确 — ${resultMsg} | 增益: ${bonusText}`);
    }

    // 进入出牌阶段
    this.phase = 'play';
    this.startPlayPhase();
  }

  startQuizTimer() {
    clearInterval(this.quizTimer);
    const totalSec = 15;
    const startTime = Date.now();
    const totalMs = totalSec * 1000;

    this.quizTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);
      const pct = (remaining / totalMs) * 100;

      const timerFill = document.getElementById('quiz-timer-fill');
      if (timerFill) {
        timerFill.style.width = pct + '%';
        timerFill.style.background = pct < 30 ? '#e74c3c' : pct < 60 ? '#f39c12' : '#3498db';
        timerFill.classList.toggle('urgent', pct < 25);
      }

      if (remaining <= 0) {
        clearInterval(this.quizTimer);
        this.quizTimer = null;

        // 超时自动提交剩余题目（视为答错）
        while (this.currentQuestionIndex < this.quizQuestions.length) {
          this.quizAnswers.push(false);
          this.currentQuestionIndex++;
        }
        this.finishQuiz();
      }
    }, 100);
  }

  // ==================== 出牌阶段 ====================

  startPlayPhase() {
    this.selectedCard = null;
    // playTimerSeconds removed — unused

    const btnEnd = document.getElementById('btn-end-turn');
    if (btnEnd) btnEnd.disabled = false;

    this.updateAllDisplay();
    this.startPlayTimer();

    const spirit = this.engine.getGameState()?.players?.[0]?.spirit;
    this.addLogMessage(
      `出牌阶段开始 (30秒) — 点击手牌出牌 | 精神力: ${Math.floor(spirit || 0)}/100`
    );
  }

  startPlayTimer() {
    clearInterval(this.playTimer);
    this.playTimer = null;
    const totalSec = this.testMode ? 9999 : 45;
    const startTime = Date.now();

    this.playTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalSec * 1000 - elapsed);
      const pct = (remaining / (totalSec * 1000)) * 100;

      const timerBar = document.getElementById('timer-bar');
      if (timerBar) {
        timerBar.style.width = pct + '%';
        timerBar.style.background = remaining < 5000
          ? '#e74c3c'
          : remaining < 10000
            ? '#f39c12'
            : 'linear-gradient(90deg, #3498db, #2ecc71)';
        timerBar.classList.toggle('urgent', remaining < 5000);
      }

      const timerNum = document.getElementById('timer-num');
      if (timerNum) {
        timerNum.textContent = Math.ceil(remaining / 1000) + 's';
        timerNum.style.color = remaining < 5000 ? '#e74c3c' : remaining < 10000 ? '#f39c12' : 'var(--mt)';
        timerNum.classList.toggle('urgent', remaining < 5000);
      }

      if (remaining <= 0) {
        clearInterval(this.playTimer);
        this.playTimer = null;
        this.endPlayerTurn();
      }
    }, 100);
  }

  // ==================== 战斗界面渲染 ====================

  renderBattleScreen() {
    this.container.innerHTML = `
      <div class="p3-grid">
        <!-- ===== 对方 ABC 行 ===== -->
        <div class="abc-row opponent">
          <div class="zone-c">
            <div id="deck-opp" class="deck-stack">
              <span class="deck-icon">🂠</span>
              <span id="deck-opp-count">20</span>
            </div>
          </div>
          <div class="zone-a">
            <div id="opp-hand" class="card-hand opponent-hand"></div>
            <div class="zone-a-upper" id="opponent-area">
              <div id="opp-summons" class="summon-slots"></div>
              <div class="player-info opponent-info">
                <span class="avatar">🤖</span>
                <span class="label">AI对手</span>
                <div class="avatar-stats">
                  <div class="hp-bar"><div id="opp-hp-fill" class="hp-bar-fill"></div><span id="opp-hp-text" class="hp-text">1200/1200</span></div>
                  <div class="spirit-bar"><div id="opp-spirit-fill" class="spirit-bar-fill"></div><span id="opp-spirit-text" class="hp-text">50/100</span></div>
                </div>
                <div class="debuff-indicators" id="opp-debuffs"></div>
                <span id="opp-hand-count" class="hand-counter">🃏5</span>
              </div>
              <div id="opp-summons-r" class="summon-slots"></div>
            </div>
          </div>
          <div class="zone-b">
            <div id="grave-opp" class="grave-stack">
              <span class="grave-icon">💀</span>
              <span id="grave-opp-count">0</span>
            </div>
          </div>
        </div>

        <!-- ===== 对方 D 区 ===== -->
        <div class="d-zone" id="opp-d-zone">
          <div class="d-half opponent-d-half">
            <div id="opp-field" class="card-field opponent-field"></div>
            <div id="opp-play-zone" class="play-zone opponent-play-zone"></div>
          </div>
        </div>

        <!-- ===== 中央分割栏 ===== -->
        <div class="divider-row">
          <button id="log-btn" class="log-btn" title="战斗记录">📜</button>
          <div class="timer-wrap"><div id="timer-bar" class="timer-bar"></div></div>
          <span class="timer-num" id="timer-num">30s</span>
          <button id="btn-end-turn" class="btn btn-end-turn" disabled>结束回合</button>
          <button id="btn-fullscreen" class="btn btn-fullscreen" title="全屏">⛶</button>
        </div>

        <!-- ===== 己方 D 区 ===== -->
        <div class="d-zone" id="self-d-zone">
          <div class="d-half self-d-half">
            <div id="self-field" class="card-field self-field"></div>
            <div id="self-play-zone" class="play-zone self-play-zone"></div>
          </div>
        </div>

        <!-- ===== 己方 ABC 行 ===== -->
        <div class="abc-row self">
          <div class="zone-b">
            <div id="grave-self" class="grave-stack">
              <span class="grave-icon">💀</span>
              <span id="grave-self-count">0</span>
            </div>
          </div>
          <div class="zone-a">
            <div class="zone-a-upper">
              <div id="self-summons" class="summon-slots"></div>
              <div class="player-info self-info">
                <span class="avatar">👤</span>
                <span class="label">你</span>
                <div class="avatar-stats">
                  <div class="hp-bar"><div id="self-hp-fill" class="hp-bar-fill"></div><span id="self-hp-text" class="hp-text">1200/1200</span></div>
                  <div class="spirit-bar"><div id="self-spirit-fill" class="spirit-bar-fill"></div><span id="self-spirit-text" class="hp-text">50/100</span></div>
                </div>
                <div class="debuff-indicators" id="self-debuffs"></div>
                <span id="hand-count" class="hand-counter">🃏5</span>
              </div>
              <div id="self-summons-r" class="summon-slots"></div>
            </div>
            <div id="self-hand" class="card-hand self-hand-main"></div>
          </div>
          <div class="zone-c">
            <div id="deck-self" class="deck-stack">
              <span class="deck-icon">🂠</span>
              <span id="deck-self-count">20</span>
            </div>
          </div>
        </div>

        <!-- 域效果（隐藏） -->
        <div id="domain-zone" style="display:none"></div>

        <!-- 日志（悬浮） -->
        <div id="log-area" class="log-area"></div>
        <div id="log-drawer" class="log-drawer">
          <div class="log-drawer-header"><span>战斗记录</span><span id="log-drawer-close" style="cursor:pointer;font-size:14px;">✕</span></div>
          <div id="log-drawer-body" class="log-drawer-body"></div>
        </div>
      </div>
    `;

    this.updateAllDisplay();
    this.bindBattleEvents();
    this._injectBattleStyles();
    this._spawnBattleParticles();
  }

  /** V30: 新手引导 — 4张引导卡 */
  _showTutorial(onDone) {
    const steps = [
      { title: '欢迎来到物理卡牌对战', body: '用五大领域（力声光热电）的物理知识进行卡牌对战！每张卡都蕴含真实的物理原理。', icon: '⚛️' },
      { title: '回合流程', body: '① 答题获取增益 → ② 出牌攻击/辅助/领域 → ③ 结束回合。精神力不足的卡无法打出。', icon: '🔄' },
      { title: '卡组构建', body: '主界面可自定义卡组：主领域12-18张 + 副领域6-12张 + 最多2张领域卡 = 共30张。', icon: '🃏' },
      { title: 'Combo连击', body: '特定卡牌组合触发Combo效果！仔细阅读卡牌描述中的物理原理，发现隐藏连招。', icon: '✨' }
    ];
    let step = 0;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;flex-direction:column;';
    const render = () => {
      const s = steps[step];
      overlay.innerHTML = `
        <div style="text-align:center;max-width:360px;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;">${s.icon}</div>
          <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">${s.title}</h2>
          <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">${s.body}</p>
          <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
            ${steps.map((_,i) => `<span style="width:8px;height:8px;border-radius:50%;background:${i===step?'#fff':'#555'};"></span>`).join('')}
          </div>
          <button id="tut-next" style="padding:10px 32px;border-radius:8px;background:linear-gradient(135deg,#9b59b6,#3498db);color:#fff;border:none;font-size:14px;cursor:pointer;">${step < steps.length-1 ? '下一步 →' : '开始游戏 ⚔️'}</button>
          <button id="tut-skip" style="background:none;border:none;color:#555;font-size:12px;cursor:pointer;margin-top:12px;">跳过引导</button>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('#tut-next').onclick = () => {
        step++;
        if (step >= steps.length) { overlay.remove(); onDone(); return; }
        render();
      };
      overlay.querySelector('#tut-skip').onclick = () => { overlay.remove(); onDone(); };
    };
    render();
  }

  /** V28: D区漂浮粒子 */
  _spawnBattleParticles() {
    const zones = ['opp-d-zone', 'self-d-zone'];
    const colors = ['rgba(255,255,255,.08)', 'rgba(155,89,182,.08)', 'rgba(52,152,219,.08)', 'rgba(241,196,15,.06)'];
    for (const zId of zones) {
      const zone = document.getElementById(zId);
      if (!zone) continue;
      // 清除旧粒子
      zone.querySelectorAll('.d-zone-particle').forEach(p => p.remove());
      // 生成新粒子
      for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'd-zone-particle';
        const size = 2 + Math.random() * 3;
        const anims = ['particleFloat', 'particleFloat2', 'particleFloat3'];
        p.style.cssText = `
          width:${size}px;height:${size}px;
          left:${5 + Math.random() * 90}%;
          bottom:${Math.random() * 100}%;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          animation:${anims[Math.floor(Math.random() * anims.length)]} ${4 + Math.random() * 6}s ease-in infinite;
          animation-delay:${Math.random() * 5}s;
        `;
        zone.appendChild(p);
      }
    }
  }

  /** 注入战斗界面专有样式 */
  _injectBattleStyles() {
    if (document.getElementById('battle-screen-styles')) {
      document.getElementById('battle-screen-styles').remove();
    }
    const style = document.createElement('style');
    style.id = 'battle-screen-styles';
    style.textContent = `
      /* === P3 网格布局 === */
      .p3-grid{display:flex;flex-direction:column;width:100vw;height:100vh;background:#0a0a1a;color:var(--lt);overflow:hidden}
      /* === ABC 行 === */
      .abc-row{display:flex;flex-shrink:0;background:rgba(255,255,255,.02);overflow:visible}
      .abc-row.opponent{flex-basis:16%;border-bottom:1px solid rgba(255,255,255,.06)}
      .abc-row.self{flex-basis:22%;border-top:1px solid rgba(255,255,255,.06)}
      /* === 各区 === */
      .zone-b{flex-shrink:0;width:60px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(255,255,255,.04)}
      .zone-c{flex-shrink:0;width:60px;display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(255,255,255,.04)}
      .abc-row.opponent .zone-c{border-left:none;border-right:1px solid rgba(255,255,255,.04)}
      .abc-row.opponent .zone-b{border-right:none;border-left:1px solid rgba(255,255,255,.04)}
      .zone-a{flex:1;display:flex;flex-direction:column;min-width:0;overflow:visible}
      .zone-a-upper{display:flex;align-items:center;justify-content:center;padding:2px 8px;gap:4px;flex-shrink:0}
      .summon-slots{display:flex;align-items:center;gap:4px;flex-shrink:0;min-width:0}
      .summon-slots .summon-mini{
        display:flex;flex-direction:column;align-items:center;gap:2px;
        padding:4px 7px;border-radius:7px;min-width:48px;max-width:60px;
        flex-shrink:0;cursor:default;position:relative;overflow:hidden;
        background:linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(0,0,0,.3) 100%);
        border:1.5px solid var(--dc, #9b59b6);
        box-shadow:0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);
        color:#fff;
      }
      .summon-slots .summon-mini::after{
        content:'';position:absolute;inset:0;border-radius:6px;
        background:var(--sc, transparent);pointer-events:none;z-index:0;
      }
      .summon-slots .summon-mini>*{position:relative;z-index:1}
      .summon-slots .summon-mini .sn-icon{font-size:13px;line-height:1}
      .summon-slots .summon-mini .sn-name{font-size:8px;text-align:center;line-height:1.15;font-weight:700;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .summon-slots .summon-mini .sn-hp-bar{width:100%;height:3px;border-radius:2px;background:rgba(0,0,0,.4);overflow:hidden}
      .summon-slots .summon-mini .sn-hp-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#e74c3c,var(--grn));transition:width .3s}
      .summon-slots .summon-mini .sn-hp-text{font-size:6px;color:rgba(255,255,255,.5)}
      .summon-slots .summon-mini.enemy{cursor:pointer}
      .summon-slots .summon-mini.enemy:hover{box-shadow:0 0 14px rgba(231,76,60,.4),inset 0 1px 0 rgba(255,255,255,.06);transform:translateY(-1px)}
      /* === 墓地/牌库 === */
      .grave-stack,.deck-stack{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;background:rgba(0,0,0,.3);border-radius:6px;border:1px solid rgba(255,255,255,.06)}
      .grave-icon,.deck-icon{font-size:16px;opacity:.6}
      .grave-stack span:last-child,.deck-stack span:last-child{font-size:9px;color:var(--mt)}
      /* === D 区 === */
      .d-zone{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:6px 72px;position:relative}
      .d-zone::before{content:'';position:absolute;inset:0;background-image:var(--bg-texture);background-size:180px;opacity:.12;pointer-events:none;z-index:0}
      /* === V28: D区粒子漂浮 === */
      .d-zone-particle{position:absolute;pointer-events:none;z-index:1;border-radius:50%;opacity:0}
      @keyframes particleFloat{0%{opacity:0;transform:translateY(0) scale(0)}10%{opacity:.6}90%{opacity:.2}100%{opacity:0;transform:translateY(-120px) scale(1.2)}}
      @keyframes particleFloat2{0%{opacity:0;transform:translateY(0) scale(0)}15%{opacity:.4}85%{opacity:.15}100%{opacity:0;transform:translateY(-80px) scale(.8)}}
      @keyframes particleFloat3{0%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:.5}80%{opacity:.1}100%{opacity:0;transform:translateY(-100px) scale(1)}}
      .d-half{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;width:100%}
      /* === 中央分隔栏 === */
      .divider-row{flex-shrink:0;display:flex;align-items:center;gap:10px;height:30px;padding:0 16px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}
      .divider-row .timer-wrap{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;display:flex;justify-content:flex-end}
      .divider-row .timer-bar{height:100%;width:100%;background:linear-gradient(90deg,var(--red),var(--ylw));transition:width .1s linear}
      .timer-num{font-size:11px;color:var(--mt);min-width:30px;flex-shrink:0}
      .timer-num.urgent{animation:timerBlink .5s ease-in-out infinite}
      .timer-bar.urgent{animation:timerBarPulse .5s ease-in-out infinite}
      @keyframes timerBlink{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes timerBarPulse{0%,100%{box-shadow:0 0 4px rgba(231,76,60,.3)}50%{box-shadow:0 0 12px rgba(231,76,60,.7)}}
      .divider-row .log-btn{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:var(--mt);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .divider-row .log-btn:hover{color:#fff;border-color:rgba(255,255,255,.2)}
      .divider-row .btn-end-turn{flex-shrink:0;width:auto;padding:3px 10px;border-radius:6px;background:var(--grn);color:#fff;border:none;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}
      .divider-row .btn-end-turn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
      .divider-row .btn-fullscreen{flex-shrink:0;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.08);font-size:12px;cursor:pointer}
      .divider-row .btn-fullscreen:hover{background:rgba(255,255,255,.12);color:#fff}
      /* === avatar-stats === */
      .avatar-stats{display:flex;flex-direction:column;gap:1px;min-width:0;flex-shrink:0}
      /* === player-info === */
      .player-info{display:flex;align-items:center;gap:6px;min-width:0;flex-shrink:0}
      .player-info .avatar{font-size:18px;flex-shrink:0}
      .player-info .label{font-size:10px;font-weight:700;color:var(--mt);flex-shrink:0}
      .abc-row .hp-bar{position:relative;width:70px;height:12px;border-radius:6px;background:linear-gradient(180deg,#1a2a36,#2c3e50);overflow:hidden;flex-shrink:0;border:1px solid rgba(255,255,255,.08)}
      .abc-row .hp-bar::after{content:'';position:absolute;inset:0;border-radius:6px;background:repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(255,255,255,.02) 3px,rgba(255,255,255,.02) 4px);pointer-events:none;z-index:2}
      .abc-row .hp-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,var(--red),var(--grn));transition:width .4s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,.15)}
      .abc-row .spirit-bar{width:48px;height:10px;border-radius:4px;background:linear-gradient(180deg,#0d1a2a,#1a2a40);overflow:hidden;flex-shrink:0;position:relative;border:1px solid rgba(255,255,255,.06)}
      .abc-row .spirit-bar::after{content:'';position:absolute;inset:0;border-radius:4px;background:repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(255,255,255,.03) 2px,rgba(255,255,255,.03) 3px);pointer-events:none;z-index:2}
      .abc-row .spirit-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#3498db,#9b59b6);transition:width .3s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)}
      .hp-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;pointer-events:none;z-index:3;text-shadow:0 0 4px rgba(0,0,0,.8),0 1px 2px rgba(0,0,0,.6)}
      .hand-counter{font-size:9px;color:var(--mt);padding:1px 5px;background:rgba(0,0,0,.2);border-radius:4px;flex-shrink:0}
      /* === 手牌 === */
      .abc-row .card-hand{flex:1;display:flex;flex-direction:row;align-items:center;justify-content:center;padding:0 4px;min-height:0;overflow-x:auto;overflow-y:visible;gap:0}
      .abc-row.opponent .card-hand{min-height:24px;padding:1px 4px}
      .abc-row.self .card-hand{padding:2px 4px 4px}
      .abc-row .card-back{
        background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
        border:1.5px solid rgba(52,152,219,.25);border-radius:6px;
        width:36px;height:48px;flex-shrink:0;cursor:default;
        position:relative;overflow:hidden;
        box-shadow:0 0 8px rgba(52,152,219,.08);
      }
      .abc-row .card-back::after{
        content:'';position:absolute;inset:4px;border-radius:3px;
        border:1px solid rgba(52,152,219,.12);
        background:
          repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(52,152,219,.04) 3px,rgba(52,152,219,.04) 4px);
      }
      .abc-row .card-back::before{
        content:'F=ma';position:absolute;inset:2px;display:flex;align-items:center;justify-content:center;
        font-size:10px;font-weight:900;font-style:italic;opacity:.35;
        color:#3498db;letter-spacing:.5px;
        text-shadow:0 0 4px rgba(52,152,219,.3);
      }
      /* === 场上区 === */
      .d-half .card-field{display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;flex:1;min-width:0;padding:3px 6px;min-height:48px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.01)}
      .d-half .opponent-field{border-color:rgba(231,76,60,.12)}
      .d-half .self-field{border-color:rgba(46,204,113,.12)}
      .d-half .play-zone{width:110px;flex-shrink:0;display:flex;flex-direction:column;padding:3px 6px;border-radius:8px;border:1px dashed transparent;min-height:48px;overflow-y:auto;max-height:100px}
      .d-half .opponent-play-zone{border-color:rgba(231,76,60,.15)}
      .d-half .self-play-zone{border-color:rgba(46,204,113,.15)}
      .d-half .play-zone.has-cards{background:rgba(255,255,255,.02)}
      .d-half .opponent-play-zone.has-cards{border-color:rgba(231,76,60,.3);background:rgba(231,76,60,.04)}
      .d-half .self-play-zone.has-cards{border-color:rgba(46,204,113,.3);background:rgba(46,204,113,.04)}
      .play-zone-label{font-size:9px;font-weight:700;color:rgba(46,204,113,.4);margin-bottom:2px}
      .play-zone-label.opponent{color:rgba(231,76,60,.4)}
      .play-zone-cards{display:flex;flex-wrap:wrap;gap:4px;overflow-x:auto}
      .play-zone-empty{font-size:9px;color:var(--mt);opacity:.4;text-align:center}
      /* === tooltip / mini 卡保留样式 === */
      .card-v3.mini::before,.card-v3.mini::after{display:none!important}
      .card-v3.mini{box-shadow:0 0 4px rgba(0,0,0,.3)!important}
      .card-v3.mini.skin-cyber{box-shadow:0 0 4px var(--dm-glow)!important}
      /* === V29: 动漫皮肤变量体系 === */
      .card-v3.mini.skin-anime{border-radius:10px!important;box-shadow:0 0 6px rgba(255,180,200,.15),0 2px 8px rgba(0,0,0,.3)!important}
      .card-v3.mini.skin-anime .v3-header{background:linear-gradient(135deg,rgba(255,140,180,.15),rgba(180,120,255,.1))}
      .card-v3.mini.skin-anime .v3-art-frame{filter:brightness(1.1) saturate(1.2)}
      .card-v3.mini.skin-anime .v3-badge{background:linear-gradient(135deg,#ff8cb4,#b478ff);color:#fff}
      .card-tooltip .card-v3.skin-anime{box-shadow:0 0 10px rgba(255,180,200,.15)!important}
      /* === V7: 可打出卡牌光亮，不可打出变暗 === */
      .card-v3.mini{opacity:.45;transition:opacity .3s,box-shadow .3s,transform .2s}
      .card-v3.mini.playable{
        opacity:1;
        box-shadow:0 0 10px var(--dg,.rgba(255,255,255,.15))!important;
      }
      .card-v3.mini.playable.domain-force{--dg:rgba(231,76,60,.5)}
      .card-v3.mini.playable.domain-sound{--dg:rgba(52,152,219,.5)}
      .card-v3.mini.playable.domain-light{--dg:rgba(241,196,15,.5)}
      .card-v3.mini.playable.domain-heat{--dg:rgba(230,126,34,.5)}
      .card-v3.mini.playable.domain-elec{--dg:rgba(155,89,182,.5)}
      .card-v3.mini.playable.domain-chaos{--dg:rgba(123,47,190,.5)}
      .card-v3.mini.playable.selected{box-shadow:0 0 18px var(--dg)!important;transform:rotate(var(--rot)) translateY(-6px)}
      .card-v3.mini:hover{opacity:1!important}
      /* === V13: 角色idle呼吸动画 === */
      .player-info .avatar{animation:idleBreathe 3s ease-in-out infinite}
      @keyframes idleBreathe{0%,100%{filter:brightness(1)}50%{filter:brightness(1.2)}}
      /* === V15: 费用不足抖动 === */
      @keyframes shake{0%,100%{transform:translateX(0)}10%,50%,90%{transform:translateX(-4px)}30%,70%{transform:translateX(4px)}}
      @keyframes floatUp{0%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-24px)}}
      /* === Debuff 视觉反馈 === */
      .debuff-indicators{display:flex;align-items:center;gap:3px;flex-shrink:0;min-width:0}
      .debuff-badge{display:inline-flex;align-items:center;gap:1px;font-size:10px;font-weight:700;padding:1px 4px;border-radius:4px;animation:debuffPulse 2s ease-in-out infinite}
      .debuff-badge.burn{background:rgba(231,76,60,.25);color:#e74c3c;border:1px solid rgba(231,76,60,.4);box-shadow:0 0 6px rgba(231,76,60,.2)}
      .debuff-badge.paralysis{background:rgba(155,89,182,.25);color:#c39bdb;border:1px solid rgba(155,89,182,.4);box-shadow:0 0 6px rgba(155,89,182,.2)}
      .debuff-badge.immune{background:rgba(46,204,113,.2);color:#2ecc71;border:1px solid rgba(46,204,113,.35);box-shadow:0 0 4px rgba(46,204,113,.15)}
      .debuff-badge .debuff-icon{font-size:11px;line-height:1}
      .debuff-badge .debuff-count{font-size:10px;line-height:1}
      @keyframes debuffPulse{0%,100%{opacity:.85}50%{opacity:1}}
      /* === tooltip 稀有度样式（保留） === */
      .card-tooltip .card-v3.skin-cyber{box-shadow:0 0 6px rgba(0,0,0,.5)!important}
      .card-tooltip .card-v3{background-clip:border-box!important}
      .card-tooltip{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;width:auto!important;pointer-events:auto!important}
      .card-tooltip::before{display:none!important}
      .card-tooltip .card-v3 .v3-art-frame img{object-fit:cover}
      .card-tooltip .card-v3 .v3-desc-box{flex:1 1 auto;min-height:0;overflow-y:auto!important;padding:6px 12px!important;margin:0 12px 4px!important;line-height:1.45;font-size:.72em!important}
      .card-tooltip .card-v3 .v3-header{flex-shrink:0}
      .card-tooltip .card-v3 .v3-type-ribbon{flex-shrink:0}
      .card-tooltip .card-v3 .v3-divider{flex-shrink:0}
      .card-tooltip .card-v3 .v3-stats{flex-shrink:0;min-height:auto}
      .card-tooltip .card-v3 .v3-badge{position:absolute}
      .card-v3.mini.no-hover-scale:hover{transform:none!important}
      /* === Log / Damage / Combo / Quiz（保留） === */
      .log-area{position:fixed;bottom:16px;right:16px;z-index:250;display:flex;flex-direction:column-reverse;gap:4px;max-width:260px;pointer-events:none}
      .log-message{padding:1px 0;border-bottom:1px solid rgba(255,255,255,.04)}
      .log-card-play{color:#fff;font-weight:700;font-size:12px;border-bottom-color:rgba(255,255,255,.1);padding:2px 0}
      .log-toast{font-size:11px;color:#ccc;animation:fadeIn .2s ease}
      .log-drawer{position:fixed;right:0;top:0;bottom:0;width:280px;z-index:300;background:var(--pnl);border-left:1px solid var(--bd);transform:translateX(100%);transition:transform .3s ease;overflow-y:auto;padding:16px}
      .log-drawer.open{transform:translateX(0)}
      .log-drawer-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;color:var(--lt);font-weight:700}
      .log-drawer-body{font-size:12px;color:var(--mt);line-height:1.6}
      .play-card.small{width:50px;height:62px;margin-left:0;cursor:default;animation:playCardIn .3s ease both;position:relative;display:flex;flex-direction:column;overflow:hidden;background:#1a1a2e;border-radius:6px;border-left:3px solid}
      .play-card .card-cost{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;font-size:8px;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;z-index:2}
      .play-card .card-name{font-size:8px;font-weight:700;padding:18px 2px 2px;text-align:center;line-height:1.1;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .play-card .card-type{font-size:7px;color:var(--mt);text-align:center}
      .summon-hp{position:relative;height:5px;border-radius:3px;background:#444;overflow:hidden;margin-top:2px}
      .summon-hp-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--grn),var(--ylw),var(--red));transition:width .4s ease}
      .summon-card{font-size:10px;padding:3px 5px;border-radius:5px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);min-width:50px;flex-shrink:0}
      .summon-card.enemy{cursor:pointer;border-color:var(--red);border-style:dashed}
      .summon-card.enemy:hover{box-shadow:0 0 8px rgba(231,76,60,.3)}
      .domain-card{padding:4px 8px;border-radius:5px;font-size:10px;font-weight:700;border:2px solid;flex-shrink:0}
      .domain-label{font-size:7px;opacity:.7}
      /* Overlay styles */
      .lightspeed-overlay{position:fixed;inset:0;z-index:220;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center}
      .lightspeed-card{background:var(--pnl);color:var(--lt);border-radius:16px;padding:28px 20px;width:calc(100% - 32px);max-width:420px;position:relative;overflow:hidden;animation:popIn .4s ease}
      .ls-header{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px}
      .ls-header h3{font-size:18px;font-weight:900;color:#F1C40F;margin:0}
      .ls-icon{font-size:18px}
      .ls-desc{text-align:center;font-size:12px;color:var(--mt);margin-bottom:12px}
      .ls-timer{text-align:center;font-size:13px;color:var(--lt);margin-bottom:12px}
      .ls-timer span{font-weight:700;color:#F1C40F}
      .ls-cards{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;max-height:200px;overflow-y:auto}
      .ls-card-choice{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.04);border-radius:8px;border-left:3px solid #F1C40F;cursor:pointer;transition:all .2s}
      .ls-card-choice:hover{background:rgba(241,196,15,.1);transform:translateX(4px)}
      .btn-outline-ls{width:100%;padding:12px;border:1px solid rgba(255,255,255,.15);border-radius:8px;background:rgba(255,255,255,.04);color:var(--mt);font-size:14px;font-weight:600;cursor:pointer}
      .btn-outline-ls:hover{background:rgba(255,255,255,.08);color:#fff}
      .gameover-overlay{position:fixed;inset:0;z-index:250;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center}
      .gameover-card{background:var(--pnl);color:var(--lt);border-radius:16px;padding:32px 24px;width:calc(100%-32px);max-width:340px;text-align:center}
      .gameover-card h1{font-size:28px;font-weight:900;margin-bottom:12px}
      .discard-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center}
      .discard-card{background:var(--pnl);color:var(--lt);border-radius:16px;padding:24px;width:calc(100%-32px);max-width:380px}
      .discard-card h3{font-size:15px;text-align:center;margin-bottom:16px}
      .lightSpeed-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;background:rgba(241,196,15,.2);color:#F1C40F;border:1px solid rgba(241,196,15,.3);animation:lsPulse 1.5s ease-in-out infinite;flex-shrink:0}
      .quiz-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;animation:fadeIn .3s ease}
      .quiz-badge.knowledge-reduce{background:rgba(46,204,113,.15);color:#2ecc71;border:1px solid rgba(46,204,113,.3)}
      .quiz-badge.knowledge-penalty{background:rgba(231,76,60,.15);color:#e74c3c;border:1px solid rgba(231,76,60,.3)}
      .quiz-progress{text-align:center;font-size:13px;color:var(--mt);margin-bottom:12px}
      .combo-physics{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0 4px;padding:8px 16px;background:rgba(46,204,113,.08);border-radius:12px;border:1px solid rgba(46,204,113,.2)}
      .physics-from,.physics-to{font-size:22px;font-weight:900;color:#2ecc71;text-shadow:0 0 12px rgba(46,204,113,.5);letter-spacing:1px}
      .physics-arrow{font-size:16px;color:rgba(46,204,113,.6)}
      .combo-effect-text{font-size:14px;color:#bdc3c7;margin-top:4px;text-align:center}
      /* === Animations === */
      @keyframes lsPulse{0%,100%{box-shadow:0 0 4px rgba(241,196,15,.2)}50%{box-shadow:0 0 12px rgba(241,196,15,.5)}}
      @keyframes cardReady{0%,100%{box-shadow:0 0 4px rgba(46,204,113,.3)}50%{box-shadow:0 0 14px rgba(46,204,113,.6)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
      @keyframes playCardIn{from{opacity:0;transform:translateY(-40px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
    `;
    document.head.appendChild(style);
  }

  /** 生成领域战场纹理（SVG data URI） */
  _domainTextureCSS(domain) {
    const patterns = {
      力: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <line x1="0" y1="60" x2="60" y2="0" stroke="#e74c3c" stroke-width=".8" stroke-opacity=".7"/>
        <line x1="30" y1="60" x2="60" y2="30" stroke="#e74c3c" stroke-width=".5" stroke-opacity=".5"/>
        <line x1="0" y1="30" x2="30" y2="0" stroke="#e74c3c" stroke-width=".5" stroke-opacity=".5"/>
        <circle cx="45" cy="15" r="2" fill="none" stroke="#e74c3c" stroke-width=".4" stroke-opacity=".6"/>
      </svg>`,
      声: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40">
        <path d="M0,20 Q10,5 20,20 T40,20 T60,20 T80,20" fill="none" stroke="#3498db" stroke-width=".8" stroke-opacity=".7"/>
        <path d="M40,20 Q50,8 60,20 T80,20" fill="none" stroke="#3498db" stroke-width=".5" stroke-opacity=".45"/>
      </svg>`,
      光: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
        <circle cx="30" cy="30" r="8" fill="none" stroke="#f1c40f" stroke-width=".6" stroke-opacity=".5"/>
        <circle cx="30" cy="30" r="16" fill="none" stroke="#f1c40f" stroke-width=".5" stroke-opacity=".35"/>
        <circle cx="30" cy="30" r="24" fill="none" stroke="#f1c40f" stroke-width=".4" stroke-opacity=".2"/>
        <line x1="30" y1="6" x2="30" y2="0" stroke="#f1c40f" stroke-width=".5" stroke-opacity=".5"/>
        <line x1="30" y1="54" x2="30" y2="60" stroke="#f1c40f" stroke-width=".5" stroke-opacity=".5"/>
        <line x1="6" y1="30" x2="0" y2="30" stroke="#f1c40f" stroke-width=".5" stroke-opacity=".5"/>
        <line x1="54" y1="30" x2="60" y2="30" stroke="#f1c40f" stroke-width=".5" stroke-opacity=".5"/>
      </svg>`,
      热: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40">
        <path d="M0,20 Q5,5 10,20 T20,20 T30,20 T40,20 T50,20 T60,20" fill="none" stroke="#e67e22" stroke-width=".8" stroke-opacity=".7"/>
        <path d="M15,30 Q20,15 25,30 T35,30 T45,30 T55,30" fill="none" stroke="#e67e22" stroke-width=".5" stroke-opacity=".4"/>
      </svg>`,
      电: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40">
        <polyline points="0,20 12,5 16,20 28,5 32,20 44,5 48,20 60,5" fill="none" stroke="#9b59b6" stroke-width=".8" stroke-opacity=".7"/>
        <polyline points="20,35 28,20 32,35 40,20" fill="none" stroke="#9b59b6" stroke-width=".5" stroke-opacity=".4"/>
      </svg>`
    };
    const svg = patterns[domain] || patterns['力'];
    const encoded = btoa(svg);
    return `url("data:image/svg+xml;base64,${encoded}")`;
  }

  /** 更新所有战斗显示 */
  updateAllDisplay() {
    try {
      const gs = this.engine?.getGameState();
      if (!gs || !gs.players) {
        console.warn('[updateAllDisplay] no game state');
        return;
      }

      this._updateHP(gs);
      this._updateSpirit(gs);
      this._updateDebuffs(gs);
      this._updateLightSpeedIndicator();
      this.renderPlayZones();
      this.renderHand();
      this.renderField();
      this._renderSummons();
      this.renderDomainEffects();
      this._updateBattleTexture(gs);
      this._updateCounters(gs);

      // C04 薛定谔的猫结果弹窗
      const c04r = this.engine?._c04LastResult;
      if (c04r) {
        this._showC04Popup(c04r);
        this.engine._c04LastResult = null;
      }
    } catch (e) {
      console.error('[updateAllDisplay] error:', e.message, e.stack);
    }
  }

  /** 更新墓地/牌库计数 */
  _updateCounters(gs) {
    const graveSelf = document.getElementById('grave-self-count');
    const graveOpp = document.getElementById('grave-opp-count');
    if (graveSelf) graveSelf.textContent = gs.players[0].discardSize || '0';
    if (graveOpp) graveOpp.textContent = gs.players[1].discardSize || '0';

    const deckSelf = document.getElementById('deck-self-count');
    const deckOpp = document.getElementById('deck-opp-count');
    if (deckSelf) deckSelf.textContent = gs.players[0].deckSize || '20';
    if (deckOpp) deckOpp.textContent = gs.players[1].deckSize || '20';
  }

  /** 光速传播(S14) 激活状态指示器 */
  _updateLightSpeedIndicator() {
    const selfInfo = document.querySelector('.self-info');
    if (!selfInfo) return;

    // 移除旧指示器
    const existing = selfInfo.querySelector('.lightSpeed-badge');
    if (existing) existing.remove();

    // 检查玩家光速传播是否激活
    if (this.engine?.lightSpeedActive?.[0]) {
      const turns = this.engine.lightSpeedTurns[0] || 0;
      const badge = document.createElement('span');
      badge.className = 'lightSpeed-badge';
      badge.textContent = `⚡ 光速传播 (${turns}回合)`;
      badge.title = '对方回合可打出光系卡（费用+3）';
      selfInfo.appendChild(badge);
    }
  }

  /** 更新双方 Debuff 视觉指示器（灼烧/麻痹/免疫） */
  _updateDebuffs(gs) {
    const selfDebuffs = document.getElementById('self-debuffs');
    const oppDebuffs = document.getElementById('opp-debuffs');
    if (!gs || !gs.players) return;

    for (let i = 0; i < 2; i++) {
      const container = i === 0 ? selfDebuffs : oppDebuffs;
      if (!container) continue;
      const p = gs.players[i];
      const burnPerLayer = p.burnEnhanced ? 36 : 30;
      let html = '';

      // 灼烧层数
      if (p.burnLayers > 0) {
        const tip = `灼烧: 每回合${p.burnLayers}层×${burnPerLayer}=${p.burnLayers * burnPerLayer}伤害`;
        html += `<span class="debuff-badge burn" title="${tip}">
          <img src="${DOMAIN_RUNES['热']}" class="rune-img" style="width:14px;height:14px;"><span class="debuff-count">${p.burnLayers}</span>
        </span>`;
      }

      // 灼烧免疫（比热护盾）
      if (p.burnImmune > 0) {
        html += `<span class="debuff-badge immune" title="比热护盾: 免疫灼烧伤害 ${p.burnImmune}回合">
          <img src="${DOMAIN_RUNES['热']}" class="rune-img" style="width:14px;height:14px;opacity:.6;"><span class="debuff-count">${p.burnImmune}t</span>
        </span>`;
      }

      // 麻痹层数
      if (p.paralysis > 0) {
        const paraCost = p.paralysis * 2;
        html += `<span class="debuff-badge paralysis" title="麻痹: 每卡额外消耗${paraCost}精神力 + 每回合${p.paralysis}×15伤害">
          <img src="${DOMAIN_RUNES['电']}" class="rune-img" style="width:14px;height:14px;"><span class="debuff-count">${p.paralysis}</span>
        </span>`;
      }

      // 精神力减益
      if (p.spiritDebuff < 0) {
        html += `<span class="debuff-badge paralysis" title="精神力恢复减益: ${p.spiritDebuff}/回合">
          <img src="${DOMAIN_RUNES['力']}" class="rune-img" style="width:14px;height:14px;opacity:.5;"><span class="debuff-count">${p.spiritDebuff}</span>
        </span>`;
      }

      container.innerHTML = html;
    }
  }

  _updateHP(gs) {
    const selfHpFill = document.getElementById('self-hp-fill');
    const selfHpText = document.getElementById('self-hp-text');
    const oppHpFill = document.getElementById('opp-hp-fill');
    const oppHpText = document.getElementById('opp-hp-text');

    if (selfHpFill && gs.players[0]) {
      const selfHp = Math.max(0, gs.players[0].hp);
      const selfMax = gs.players[0].maxHp || 1200;
      selfHpFill.style.width = Math.max(0, Math.min(100, (selfHp / selfMax) * 100)) + '%';
    }
    if (selfHpText && gs.players[0]) {
      selfHpText.textContent = Math.floor(gs.players[0].hp) + '/' + (gs.players[0].maxHp || 1200);
    }

    if (oppHpFill && gs.players[1]) {
      const oppHp = Math.max(0, gs.players[1].hp);
      const oppMax = gs.players[1].maxHp || 1200;
      oppHpFill.style.width = Math.max(0, Math.min(100, (oppHp / oppMax) * 100)) + '%';
    }
    if (oppHpText && gs.players[1]) {
      oppHpText.textContent = Math.floor(gs.players[1].hp) + '/' + (gs.players[1].maxHp || 1200);
    }
  }

  _updateSpirit(gs) {
    const selfSpiritFill = document.getElementById('self-spirit-fill');
    const selfSpiritText = document.getElementById('self-spirit-text');
    const oppSpiritFill = document.getElementById('opp-spirit-fill');
    const oppSpiritText = document.getElementById('opp-spirit-text');
    const handCount = document.getElementById('hand-count');

    if (selfSpiritFill && gs.players[0]) {
      const sp = Math.min(100, Math.max(0, Math.floor(gs.players[0].spirit || 0)));
      selfSpiritFill.style.width = sp + '%';
    }
    if (selfSpiritText && gs.players[0]) {
      selfSpiritText.textContent = Math.floor(gs.players[0].spirit || 0) + '/100';
    }

    if (oppSpiritFill && gs.players[1]) {
      const sp = Math.min(100, Math.max(0, Math.floor(gs.players[1].spirit || 0)));
      oppSpiritFill.style.width = sp + '%';
    }
    if (oppSpiritText && gs.players[1]) {
      oppSpiritText.textContent = Math.floor(gs.players[1].spirit || 0) + '/100';
    }

    if (handCount && gs.players[0]) {
      handCount.textContent = '🃏 ' + (gs.players[0].hand?.length || 0);
    }
  }

  /** 构建单张卡牌的 DOM 元素 */
  _buildCardElement(card, index, totalCards, isPlayable, isSelected) {
    const totalAngle = Math.min(totalCards * 3.5, 40);
    const startAngle = -(totalAngle / 2);
    const rot = totalCards > 1 ? startAngle + (totalAngle / (totalCards - 1)) * index : 0;
    const artUrl = this.artMap[card.id] || '';
    const typeLabel = this.getTypeLabel(card.type);
    const domains = Array.isArray(card.domain) ? card.domain : [card.domain];
    const runeHtml = domains.map(d => DOMAIN_RUNES[d] ? `<img src="${DOMAIN_RUNES[d]}" class="rune-img">` : (d === '混沌' ? '🌌' : '⚛')).join('');
    const descRaw = String(card.description || '').substring(0, 30);
    const hasDesc = descRaw.length > 0;

    const el = document.createElement('div');
    el.className = `card-v3 mini ${this._domainClass(card.domain)} rarity-${card.rarity} skin-cyber ${isPlayable ? 'playable' : ''} ${isSelected ? 'selected' : ''}`;
    el.setAttribute('data-card-id', card.id);
    el.style.cssText = `--rot:${rot}deg;transform:rotate(var(--rot));transform-origin:bottom center;transition:all .2s ease;flex-shrink:0;`;
    el.innerHTML = `
      <div class="v3-header">
        <div class="v3-cost">${card.cost ?? '-'}</div>
        <div class="v3-name">${this._escapeHtml(card.name)}</div>
        <div class="v3-rune">${runeHtml}</div>
      </div>
      <div class="v3-type-ribbon"><span class="v3-type-pip ${card.type}">${typeLabel}</span></div>
      <div class="v3-art-frame">${artUrl ? `<img src="${this._escapeAttr(artUrl)}" alt="">` : ''}<div class="v3-art-corner tl"></div><div class="v3-art-corner tr"></div><div class="v3-art-corner bl"></div><div class="v3-art-corner br"></div></div>
      <div class="v3-divider"><span class="line"></span><span class="gem"></span><span class="line"></span></div>
      <div class="v3-stats">${card.effect?.dmg ? `<span class="v3-stat-num">${card.effect.dmg}</span><span class="v3-stat-unit">伤害</span>` : ''}</div>
      <div class="v3-desc-box">${hasDesc ? this._escapeHtml(descRaw) : '&nbsp;'}</div>

    `;
    return el;
  }

  /** 更新卡牌元素的可变状态（不重建DOM） */
  _updateCardState(el, isPlayable, isSelected, rot) {
    el.style.setProperty('--rot', rot + 'deg');
    el.classList.toggle('playable', isPlayable);
    el.classList.toggle('selected', isSelected);
  }

  renderHand() {
    try {
    const selfHand = document.getElementById('self-hand');
    const oppHand = document.getElementById('opp-hand');
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) {
      console.warn('[renderHand] no state');
      return;
    }
    // 己方手牌 —— 局部更新
    const cards = (gs.players[0].hand || []);
    if (selfHand) {
      const totalCards = cards.length;

      if (totalCards === 0) {
        if (!selfHand.querySelector('.empty-state')) {
          selfHand.innerHTML = '<div class="empty-state"><span class="empty-icon">🃏</span>暂无手牌</div>';
          this._lastHandIds = [];
        }
      } else {
        const emptyState = selfHand.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // 🧪 测试模式：平铺滚动，扇形禁用
        const totalAngle = this.testMode ? 0 : Math.min(totalCards * 3.5, 40);
        const startAngle = -(totalAngle / 2);

        const existingMap = new Map();
        const existingEls = selfHand.querySelectorAll('[data-card-id]');
        for (const el of existingEls) {
          existingMap.set(el.getAttribute('data-card-id'), el);
        }

        for (let i = 0; i < totalCards; i++) {
          const card = cards[i];
          const cpResult = this.phase === 'play' && (this.engine.canPlayQuery || this.engine.canPlay)
            ? (this.engine.canPlayQuery || this.engine.canPlay).call(this.engine, 0, card)
            : { can: false };
          const isPlayable = cpResult.can;
          const isSelected = this.selectedCard && this.selectedCard.id === card.id;
          const rot = totalCards > 1 ? startAngle + (totalAngle / (totalCards - 1)) * i : 0;

          let el = existingMap.get(card.id);
          if (el) {
            this._updateCardState(el, isPlayable, isSelected, rot);
            existingMap.delete(card.id);
          } else {
            el = this._buildCardElement(card, i, totalCards, isPlayable, isSelected);
            selfHand.appendChild(el);
          }
        }

        for (const [, staleEl] of existingMap) {
          staleEl.remove();
        }
        this._lastHandIds = cards.map(c => c.id);

        // 🧪 测试模式手牌样式
        if (this.testMode) {
          selfHand.classList.add('test-mode-hand');
          selfHand.style.flexWrap = 'wrap';
          selfHand.style.justifyContent = 'flex-start';
          selfHand.style.alignItems = 'flex-start';
          selfHand.style.maxHeight = '30vh';
          selfHand.style.overflowY = 'auto';
          selfHand.style.overflowX = 'hidden';
          selfHand.style.gap = '4px';
          selfHand.style.padding = '8px';
          selfHand.style.scrollbarWidth = 'thin';
        }
      }
    }

    // 对方手牌（卡背）—— 仅数量变化时更新
    if (oppHand) {
      const count = (gs.players[1].hand || []).length;
      const currentBacks = oppHand.querySelectorAll('.card-back').length;
      if (currentBacks !== count) {
        oppHand.innerHTML = Array.from({ length: count }, () =>
          '<div class="card card-back"></div>'
        ).join('');
      }
    }
    // 更新手牌计数
    const oppCnt = document.getElementById('opp-hand-count');
    if (oppCnt) oppCnt.textContent = '🃏' + (gs.players[1].hand || []).length;
    const selfCnt = document.getElementById('hand-count');
    if (selfCnt) selfCnt.textContent = '🃏' + cards.length;
    } catch(e) {
      console.error('[renderHand] error:', e.message);
    }
  }

  /** 渲染出牌展示区 */
  renderPlayZones() {
    const selfZone = document.getElementById('self-play-zone');
    const oppZone = document.getElementById('opp-play-zone');

    // 己方出牌区
    if (selfZone) {
      let html = '<div class="play-zone-label">本轮出牌</div>';
      if (this.playZoneSelf.length > 0) {
        selfZone.classList.add('has-cards');
        html += '<div class="play-zone-cards">';
        for (const card of this.playZoneSelf) {
          const style = this.getDomainStyle(card.domain);
          const typeClass = `card-type-${card.type}`;
          html += `
            <div class="card play-card small ${typeClass}" style="border-left-color:${style.color}" data-card-id="${this._escapeAttr(card.id)}">
              <span class="card-cost" style="background:${style.bg}">${card.cost ?? '?'}</span>
              <span class="card-name">${this._escapeHtml(card.name)}</span>
              <span class="card-type">${this.getTypeLabel(card.type)}</span>
            </div>
          `;
        }
        html += '</div>';
      } else {
        selfZone.classList.remove('has-cards');
        html += '<div class="play-zone-empty">暂无出牌</div>';
      }
      selfZone.innerHTML = html;
    }

    // AI出牌区
    if (oppZone) {
      let html = '<div class="play-zone-label opponent">AI本轮出牌</div>';
      if (this.playZoneAi.length > 0) {
        oppZone.classList.add('has-cards');
        html += '<div class="play-zone-cards">';
        for (const card of this.playZoneAi) {
          const style = this.getDomainStyle(card.domain);
          const typeClass = `card-type-${card.type}`;
          html += `
            <div class="card play-card small ${typeClass}" style="border-left-color:${style.color}" data-card-id="${this._escapeAttr(card.id)}">
              <span class="card-cost" style="background:${style.bg}">${card.cost ?? '?'}</span>
              <span class="card-name">${this._escapeHtml(card.name)}</span>
              <span class="card-type">${this.getTypeLabel(card.type)}</span>
            </div>
          `;
        }
        html += '</div>';
      } else {
        oppZone.classList.remove('has-cards');
        html += '<div class="play-zone-empty">暂无出牌</div>';
      }
      oppZone.innerHTML = html;
    }
  }

  renderField() {
    const selfField = document.getElementById('self-field');
    const oppField = document.getElementById('opp-field');
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) return;

    // 己方场上
    if (selfField) {
      let html = '';
      // 领域卡 — 完整卡面+插画
      if (gs.players[0].fieldDomain) {
        const d = gs.players[0].fieldDomain;
        const cardData = this.engine?.getCardById?.(d.cardId);
        if (cardData) {
          html += this._buildFieldCardHTML(cardData, d.turns, 'domain');
        }
      }
      // 召唤物 → 已移至 A 区 zone-a-upper 渲染
      // 驻场辅助卡 — 完整卡面+插画
      const selfSupports = gs.players[0].fieldSupports || [];
      for (const sup of selfSupports) {
        const cardData = sup.card || this.engine?.getCardById?.(sup.id);
        if (cardData) {
          html += this._buildFieldCardHTML(cardData, sup.turns, 'support');
        }
      }
      selfField.innerHTML = html || '<div class="empty-state"><span class="empty-icon">🏟️</span>场上暂无卡牌</div>';
    }

    // 对方场上
    if (oppField) {
      let html = '';
      if (gs.players[1].fieldDomain) {
        const d = gs.players[1].fieldDomain;
        const cardData = this.engine?.getCardById?.(d.cardId);
        if (cardData) {
          html += this._buildFieldCardHTML(cardData, d.turns, 'domain');
        }
      }
      // 召唤物 → 已移至 A 区 zone-a-upper 渲染
      // 驻场辅助卡 — 完整卡面+插画
      const oppSupports = gs.players[1].fieldSupports || [];
      for (const sup of oppSupports) {
        const cardData = sup.card || this.engine?.getCardById?.(sup.id);
        if (cardData) {
          html += this._buildFieldCardHTML(cardData, sup.turns, 'support');
        }
      }
      oppField.innerHTML = html || '<div class="empty-state"><span class="empty-icon">🏟️</span>对方场上暂无卡牌</div>';
    }
  }

  /** 构建场上驻场卡HTML（完整卡面+插画） */
  _buildFieldCardHTML(cardData, turns, typeLabel) {
    const style = this.getDomainStyle(cardData.domain);
    const artUrl = this.artMap[cardData.id] || '';
    const typeText = typeLabel === 'domain' ? '领域' : '辅助';
    const cardClass = typeLabel === 'domain' ? 'domain-card' : 'support-card';
    return `
      <div class="field-card-v3 ${cardClass}" data-card-id="${this._escapeAttr(cardData.id)}" style="display:flex;flex-direction:column;width:96px;flex-shrink:0;border-radius:6px;overflow:hidden;border:2px solid ${style.color};background:#1a1a2e;box-shadow:0 0 10px ${style.bg};">
        <div style="height:72px;background:${style.bg};display:flex;align-items:center;justify-content:center;overflow:hidden;">
          ${artUrl ? `<img src="${this._escapeAttr(artUrl)}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:28px;opacity:.2;">⚛</span>`}
        </div>
        <div style="padding:3px 5px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55px;">${this._escapeHtml(cardData.name)}</span>
          <span style="font-size:9px;color:${style.color};font-weight:700;">${cardData.cost ?? '?'}费</span>
        </div>
        <div style="padding:0 5px 3px;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:8px;color:${style.color};background:${style.bg};padding:1px 4px;border-radius:3px;">${typeText}</span>
          <span style="font-size:8px;color:#888;">${turns}回合</span>
        </div>
      </div>`;
  }

  /** 在 A 区渲染召唤物（头像左右两侧） */
  _renderSummons() {
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) return;
    const domainIcons = { 力: '💪', 声: '🔊', 光: '✨', 热: '🔥', 电: '⚡' };
    const domainColors = { 力: '#E74C3C', 声: '#3498DB', 光: '#F1C40F', 热: '#E67E22', 电: '#9B59B6' };
    const summonHTML = (s, isEnemy) => {
      const hpPct = Math.max(0, Math.min(100, (s.hp / (s.maxHp || 300)) * 100));
      const dc = domainColors[s.domain] || '#9b59b6';
      return `<div class="summon-mini${isEnemy ? ' enemy' : ''}" data-summon-id="${this._escapeAttr(s.id)}" style="--dc:${dc}88;--sc:${dc}1a">
        <span class="sn-icon">${domainIcons[s.domain] || '🃏'}</span>
        <span class="sn-name">${this._escapeHtml(s.name)}</span>
        <div class="sn-hp-bar"><div class="sn-hp-fill" style="width:${hpPct}%"></div></div>
        <span class="sn-hp-text">${s.hp}/${s.maxHp || '?'}</span>
      </div>`;
    };

    // 己方召唤物
    const selfL = document.getElementById('self-summons');
    const selfR = document.getElementById('self-summons-r');
    if (selfL && selfR) {
      const summons = gs.players[0].fieldSummons || [];
      const mid = Math.ceil(summons.length / 2);
      selfL.innerHTML = summons.slice(0, mid).map(s => summonHTML(s, false)).join('');
      selfR.innerHTML = summons.slice(mid).map(s => summonHTML(s, false)).join('');
    }

    // 对方召唤物
    const oppL = document.getElementById('opp-summons');
    const oppR = document.getElementById('opp-summons-r');
    if (oppL && oppR) {
      const summons = gs.players[1].fieldSummons || [];
      const mid = Math.ceil(summons.length / 2);
      oppL.innerHTML = summons.slice(0, mid).map(s => summonHTML(s, true)).join('');
      oppR.innerHTML = summons.slice(mid).map(s => summonHTML(s, true)).join('');
    }
  }

  renderDomainEffects() {
    const zone = document.getElementById('domain-zone');
    if (!zone) return;

    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) {
      zone.innerHTML = '';
      return;
    }

    let html = '<div class="domain-effects-row">';
    if (gs.players[1].fieldDomain) {
      const style = this.getDomainStyle(gs.players[1].fieldDomain.domain);
      html += `<span class="domain-badge opp" style="background:${style.bg}">AI领域: ${this._escapeHtml(gs.players[1].fieldDomain.name)}</span>`;
    }
    if (gs.players[0].fieldDomain) {
      const style = this.getDomainStyle(gs.players[0].fieldDomain.domain);
      html += `<span class="domain-badge self" style="background:${style.bg}">己方领域: ${this._escapeHtml(gs.players[0].fieldDomain.name)}</span>`;
    }
    html += '</div>';
    zone.innerHTML = html;
  }

  /** 根据场上领域卡更新战场底纹（各D区独立） */
  _updateBattleTexture(gs) {
    const oppZone = document.getElementById('opp-d-zone');
    const selfZone = document.getElementById('self-d-zone');

    if (oppZone) {
      const oppDomain = gs?.players?.[1]?.fieldDomain?.domain;
      oppZone.style.setProperty('--bg-texture', oppDomain ? this._domainTextureCSS(oppDomain) : 'none');
    }
    if (selfZone) {
      const selfDomain = gs?.players?.[0]?.fieldDomain?.domain;
      selfZone.style.setProperty('--bg-texture', selfDomain ? this._domainTextureCSS(selfDomain) : 'none');
    }

    // 🧪 驻场卡 buff 进度指示器
    this._renderBuffIndicators();
  }

  // ==================== 事件绑定 ====================

  bindBattleEvents() {
    // 结束回合按钮
    const btnEnd = document.getElementById('btn-end-turn');
    if (btnEnd) {
      btnEnd.addEventListener('click', () => {
        if (this.phase !== 'play') return; // 防重入守卫
        btnEnd.disabled = true;
        this.endPlayerTurn();
      });
    }

    // 全屏按钮
    const btnFS = document.getElementById('btn-fullscreen');
    if (btnFS) {
      btnFS.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen();
        }
      });
    }

    // 中央分隔栏日志按钮
    const logBtn = document.getElementById('log-btn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        const ld = document.getElementById('log-drawer');
        if (ld) ld.classList.toggle('open');
      });
    }

    // 战斗记录抽屉关闭按钮
    const logDrawer = document.getElementById('log-drawer');
    const logDrawerClose = document.getElementById('log-drawer-close');
    if (logDrawer && logDrawerClose) {
      logDrawerClose.addEventListener('click', () => {
        logDrawer.classList.remove('open');
      });
    }

    // 己方手牌点击（事件代理）
    const selfHand = document.getElementById('self-hand');
    if (selfHand) {
      selfHand.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card-v3, .card');
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        if (cardId) this.handleCardSelect(cardId);
      });
    }

    // 对方 A 区召唤物点击（攻击目标选择 / 放大查看）
    const opponentArea = document.getElementById('opponent-area');
    if (opponentArea) {
      opponentArea.addEventListener('click', (e) => {
        const mini = e.target.closest('.summon-mini.enemy');
        if (!mini) return;
        const summonId = mini.dataset.summonId;
        const gs = this.engine?.getGameState();
        if (!gs || !summonId) return;

        // 攻击目标选择模式
        if (this.selectedCard && this.selectedCard.type === 'attack') {
          const idx = (gs.players[1].fieldSummons || []).findIndex(s => s.id === summonId);
          if (idx >= 0) {
            this.playSelectedCard('summon_' + idx);
          }
          return;
        }

        // 放大查看
        const summon = (gs.players[1].fieldSummons || []).find(s => s.id === summonId);
        if (summon) {
          const cardData = this.engine?.getCardById?.(summon.id) || summon.card;
          if (cardData) {
            if (summon.hp !== undefined) { cardData.hp = summon.hp; cardData.maxHp = summon.maxHp || 300; }
            cardData._fromHand = false; cardData.type = 'summon'; cardData.cost = cardData.cost || '-';
            this._showCardDetail(cardData);
          }
        }
      });
    }

    // 对方召唤物点击（选择攻击目标 / 放大查看）- 保留 D 区兼容
    const oppField = document.getElementById('opp-field');
    if (oppField) {
      oppField.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.summon-card.enemy, .support-card, .domain-card');
        if (!cardEl) return;

        // 攻击目标选择模式
        if (this.selectedCard && this.selectedCard.type === 'attack') {
          if (cardEl.classList.contains('summon-card')) {
            const summonIndex = cardEl.dataset.summonIndex;
            const target = summonIndex !== undefined ? 'summon_' + summonIndex : 'player';
            this.playSelectedCard(target);
            return;
          }
        }

        // 非攻击模式：放大查看驻场卡
        const gs = this.engine?.getGameState();
        if (!gs) return;

        if (cardEl.classList.contains('summon-card')) {
          const idx = parseInt(cardEl.dataset.summonIndex);
          const summon = (gs.players[1].fieldSummons || [])[idx];
          if (summon) {
            const cardData = this.engine?.getCardById?.(summon.id) || summon.card;
            if (cardData) {
              if (summon.hp !== undefined) {
                cardData._fromHand = false;
                cardData.hp = summon.hp;
                cardData.maxHp = summon.maxHp || 300;
              }
              this._showCardDetail(cardData);
            }
          }
        } else if (cardEl.classList.contains('support-card')) {
          const cardId = cardEl.dataset.cardId;
          const supports = gs.players[1].fieldSupports || [];
          const sup = supports.find(s => s.id === cardId || s.card?.id === cardId);
          if (sup) {
            const cardData = sup.card || this.engine?.getCardById?.(sup.id);
            if (cardData) {
              cardData._fromHand = false;
              cardData.turns = sup.turns;
              this._showCardDetail(cardData);
            }
          }
        } else if (cardEl.classList.contains('domain-card')) {
          if (gs.players[1].fieldDomain) {
            const domainCard = this.engine?.getCardById?.(gs.players[1].fieldDomain.cardId);
            if (domainCard) {
              domainCard._fromHand = false;
              this._showCardDetail(domainCard);
            }
          }
        }
      });
    }

    // 对方玩家区域点击（攻击对方玩家本体 / 放大查看对方信息）
    const oppArea = document.getElementById('opponent-area');
    if (oppArea) {
      oppArea.addEventListener('click', (e) => {
        // 攻击目标选择模式：点击玩家区域攻击玩家
        if (this.selectedCard && this.selectedCard.type === 'attack') {
          if (e.target.closest('.summon-mini')) return;
          if (e.target.closest('.card-hand')) return;
          this.playSelectedCard('player');
          return;
        }

        // 常规模式：无需操作（对方玩家信息已在界面展示）
      });
    }

    // 己方场地点击（放大查看）
    const selfField = document.getElementById('self-field');
    if (selfField) {
      selfField.addEventListener('click', (e) => {
        if (this.selectedCard && this.selectedCard.type === 'attack') return; // 攻击选择时不响应

        const cardEl = e.target.closest('.summon-card, .support-card, .domain-card');
        if (!cardEl) return;

        const gs = this.engine?.getGameState();
        if (!gs) return;

        if (cardEl.classList.contains('summon-card')) {
          const summonId = cardEl.dataset.summonId;
          const summon = (gs.players[0].fieldSummons || []).find(s => s.id === summonId);
          if (summon) {
            const cardData = this.engine?.getCardById?.(summon.id) || summon.card;
            if (cardData) {
              cardData._fromHand = false;
              if (summon.hp !== undefined) {
                cardData.hp = summon.hp;
                cardData.maxHp = summon.maxHp;
              }
              cardData.turns = summon.turns;
              this._showCardDetail(cardData);
            }
          }
        } else if (cardEl.classList.contains('support-card')) {
          const nameEl = cardEl.querySelector('.v3-name, .card-name');
          if (nameEl) {
            const supports = gs.players[0].fieldSupports || [];
            const sup = supports.find(s => (s.card && s.card.name === nameEl.textContent.trim()) || s.name === nameEl.textContent.trim());
            if (sup) {
              const cardData = sup.card || this.engine?.getCardById?.(sup.id);
              if (cardData) {
                cardData._fromHand = false;
                cardData.turns = sup.turns;
                this._showCardDetail(cardData);
              }
            }
          }
        } else if (cardEl.classList.contains('domain-card')) {
          if (gs.players[0].fieldDomain) {
            const domainCard = this.engine?.getCardById?.(gs.players[0].fieldDomain.cardId);
            if (domainCard) {
              domainCard._fromHand = false;
              this._showCardDetail(domainCard);
            }
          }
        }
      });
    }

    // 己方召唤物区点击（放大查看）
    const selfSummons = document.getElementById('self-summons');
    if (selfSummons) {
      selfSummons.addEventListener('click', (e) => {
        if (this.selectedCard && this.selectedCard.type === 'attack') return;

        const miniEl = e.target.closest('.summon-mini');
        if (!miniEl) return;

        const summonId = miniEl.dataset.summonId;
        const gs = this.engine?.getGameState();
        if (!gs) return;

        const summon = (gs.players[0].fieldSummons || []).find(s => s.id === summonId);
        if (summon) {
          const cardData = this.engine?.getCardById?.(summon.id) || summon.card;
          if (cardData) {
            cardData._fromHand = false;
            if (summon.hp !== undefined) {
              cardData.hp = summon.hp;
              cardData.maxHp = summon.maxHp;
            }
            cardData.turns = summon.turns;
            this._showCardDetail(cardData);
          }
        }
      });
    }

    // 出牌区点击（查看详情）
    const setupPlayZoneClick = (zoneId) => {
      const zone = document.getElementById(zoneId);
      if (!zone) return;
      zone.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.play-card');
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        if (!cardId) return;
        const cardData = this.engine?.getCardById?.(cardId);
        if (cardData) {
          cardData._fromHand = false;
          this._showCardDetail(cardData);
        }
      });
    };
    setupPlayZoneClick('self-play-zone');
    setupPlayZoneClick('opp-play-zone');

    // ---- 桌面端悬停放大tooltip ----
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      // 使用mouseover/mouseout在game-container上做事件代理
      const gameContainer = this.container;
      let hoverCardEl = null;

      gameContainer.addEventListener('mouseover', (e) => {
        const cardEl = e.target.closest('.card-v3.mini, .card.small');
        if (cardEl === hoverCardEl) return; // 同一张卡不重复触发
        this._hideHoverTooltip();
        hoverCardEl = null;

        if (!cardEl) return;

        const gs = this.engine?.getGameState();
        if (!gs) return;

        let cardData = null;

        // 手牌：通过data-card-id查找
        if (cardEl.closest('#self-hand') && cardEl.dataset.cardId) {
          cardData = (gs.players[0].hand || []).find(c => c.id === cardEl.dataset.cardId);
          if (cardData) cardData._fromHand = true;
        }
        // 对方召唤物：通过data-summon-index
        else if (cardEl.classList.contains('summon-card') && cardEl.closest('#opp-field')) {
          const idx = parseInt(cardEl.dataset.summonIndex);
          const summon = (gs.players[1].fieldSummons || [])[idx];
          if (summon) {
            cardData = this.engine?.getCardById?.(summon.id) || summon.card;
            if (cardData) { cardData.hp = summon.hp; cardData.maxHp = summon.maxHp; cardData.type = 'summon'; cardData.cost = cardData.cost || '-'; }
          }
        }
        // 己方召唤物
        else if (cardEl.classList.contains('summon-card') && cardEl.closest('#self-field')) {
          const summonId = cardEl.dataset.summonId;
          const summon = (gs.players[0].fieldSummons || []).find(s => s.id === summonId);
          if (summon) {
            cardData = this.engine?.getCardById?.(summon.id) || summon.card;
            if (cardData) { cardData.hp = summon.hp; cardData.maxHp = summon.maxHp; cardData.type = 'summon'; cardData.cost = cardData.cost || '-'; cardData.turns = summon.turns; }
          }
        }
        // 驻场辅助卡（双方）
        else if (cardEl.classList.contains('support-card')) {
          const nameEl = cardEl.querySelector('.v3-name, .card-name');
          if (nameEl) {
            const isOpp = !!cardEl.closest('#opp-field');
            const supports = isOpp ? (gs.players[1].fieldSupports || []) : (gs.players[0].fieldSupports || []);
            const sup = supports.find(s => s.card && s.card.name === nameEl.textContent.trim());
            if (sup?.card) {
              cardData = Object.assign({}, sup.card, { turns: sup.turns });
            }
          }
        }
        // 领域卡（双方）
        else if (cardEl.classList.contains('domain-card')) {
          const isOpp = !!cardEl.closest('#opp-field');
          const domain = isOpp ? gs.players[1].fieldDomain : gs.players[0].fieldDomain;
          if (domain?.card?.id) {
            cardData = this.engine?.getCardById?.(domain.card.id);
            if (cardData) cardData.type = 'domain';
          }
        }

        if (cardData) {
          hoverCardEl = cardEl;
          this._showHoverTooltip(cardData, cardEl);
        }
      });

      gameContainer.addEventListener('mouseout', (e) => {
        const cardEl = e.target.closest('.card-v3.mini, .card.small');
        if (cardEl && cardEl === hoverCardEl) {
          // 鼠标移到 tooltip 上时不关闭
          if (e.relatedTarget && (e.relatedTarget.closest('.card-tooltip') || cardEl.contains(e.relatedTarget))) return;
          this._hideHoverTooltip();
          hoverCardEl = null;
        }
      });
    }
  }

  handleCardSelect(cardId) {
    if (this.phase !== 'play') {
      this.addLogMessage('当前不是出牌阶段');
      return;
    }

    // 🧪 测试模式：每次操作前锁定满精神力
    if (this.testMode && this.engine) {
      this.engine.players[0].spirit = 100;
    }

    // 如果在选目标模式，点击任何手牌先取消选目标
    if (this._attackTargeting) {
      this.selectedCard = null;
      this._attackTargeting = false;
      this._clearTargetingVisuals();
      this._clearAutoPlayTimeout();
      this.updateAllDisplay();
      // 继续处理新卡点击
    }

    const gs = this.engine?.getGameState();
    if (!gs) return;

    const card = (gs.players[0].hand || []).find(c => c.id === cardId);
    if (!card) return;

    // 检查是否可打出
    const cpResult = this.engine.canPlay ? this.engine.canPlay(0, card) : { can: false, reason: '未知错误' };
    if (!cpResult.can) {
      // 不可打出 — 卡牌抖动 + 费用闪红 + 原因提示
      const cardEl = document.querySelector(`#self-hand .card-v3[data-card-id="${this._escapeAttr(card.id)}"]`);
      if (cardEl) {
        cardEl.style.animation = 'shake .4s ease';
        setTimeout(() => cardEl.style.animation = '', 400);
        // 费用数字闪红
        const costEl = cardEl.querySelector('.v3-cost');
        if (costEl) {
          costEl.style.color = '#e74c3c';
          costEl.style.textShadow = '0 0 8px rgba(231,76,60,.8)';
          setTimeout(() => { costEl.style.color = ''; costEl.style.textShadow = ''; }, 600);
        }
      }
      // 浮动提示（不弹详情窗）
      this._showFloatingToast(cardEl, cpResult.reason || '无法打出');
      return;
    }

    // 辅助卡/领域卡/召唤卡/相变卡：直接打出（快速流程）
    if (card.type === 'support' || card.type === 'domain' || card.type === 'summon' || card.type === 'phase') {
      this.selectedCard = card;
      this._closeCardDetail();
      this.playSelectedCard('player');
      return;
    }

    // 攻击卡：直接进入选目标模式（想查看详情用悬停tooltip）
    if (card.type === 'attack') {
      this.selectedCard = card;
      this._enterAttackTargeting(card);
    }
  }

  /** 进入攻击目标选择模式（从zoom弹窗的"打出"按钮触发） */
  _enterAttackTargeting(cardData) {
    this._closeCardDetail();
    this.selectedCard = cardData;
    this._attackTargeting = true;

    const gs = this.engine?.getGameState();
    const enemySummons = gs?.players?.[1]?.fieldSummons || [];

    if (enemySummons.length === 0) {
      // 无召唤物 → 直接攻击
      this._attackTargeting = false;
      this.playSelectedCard('player');
      return;
    }

    // 有召唤物 → 显示目标选择
    this.updateAllDisplay();
    this._showTargetingVisuals();
    this.addLogMessage(`🎯 选择「${cardData.name}」的攻击目标`);

    this._clearAutoPlayTimeout();
    this.autoPlayTimeout = setTimeout(() => {
      if (this.selectedCard === cardData && this.phase === 'play' && this._attackTargeting) {
        this.addLogMessage('⏰ 超时未选择，自动攻击对方玩家');
        this._clearTargetingVisuals();
        this._attackTargeting = false;
        this.playSelectedCard('player');
      }
    }, 5000);
  }

  playSelectedCard(target) {
    if (!this.selectedCard || this.phase !== 'play') return;
    const card = this.selectedCard;

    // 清除目标选择视觉
    this._attackTargeting = false;
    this._clearTargetingVisuals();
    if (!this.engine) return;

    this._clearAutoPlayTimeout();

    // 动画准备：保存手牌元素引用（在引擎移除前获取DOM位置）
    const cardEl = document.querySelector(`#self-hand .card-v3[data-card-id="${this._escapeAttr(card.id)}"], #self-hand .card[data-card-id="${this._escapeAttr(card.id)}"]`);
    const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;

    const result = this.engine.playCard(0, this.selectedCard.id, target);
    if (!result || !result.success) {
      this.addLogMessage('出牌失败: ' + (result?.msg || '未知错误'));
      this.selectedCard = null;
      this.updateAllDisplay();
      return;
    }

    // 记录打出的卡
    this.lastPlayedCard = this.selectedCard.id;

    // 添加到出牌展示区
    this.playZoneSelf.push({
      id: this.selectedCard.id,
      name: this.selectedCard.name,
      type: this.selectedCard.type,
      domain: this.selectedCard.domain,
      cost: this.selectedCard.cost
    });

    // 先刷新UI使play zone DOM就绪
    this.updateAllDisplay();

    // 知识减费/加费视觉反馈
    this._showQuizCostFeedback();

    // 卡牌飞行动画（手牌→出牌区）
    if (cardRect) {
      const playZoneEl = document.querySelector('#self-play-zone .play-card:last-child');
      if (playZoneEl) {
        const targetRect = playZoneEl.getBoundingClientRect();
        this._animateCardFly(card, cardRect, targetRect);
      }
    }

    // 显示效果日志 & 视觉特效
    if (result.effects && Array.isArray(result.effects)) {
      // 卡牌打出标题
      const domainLabel = Array.isArray(card.domain) ? card.domain.join('/') : card.domain;
      const typeEmoji = { attack: '⚔️', support: '✨', domain: '🏛️', summon: '👾', phase: '🌀' }[card.type] || '🃏';
      this.addLogMessage(`${typeEmoji} [你] ${card.name}（${domainLabel}·${this.getTypeLabel(card.type)}）`, 'log-card-play');
      const msgs = this._formatEffects(result.effects);
      for (const msg of msgs) {
        this.addLogMessage('  ' + msg);
      }
      // 伤害/治疗数字弹出
      this._processEffectAnimations(result.effects, card.type);
    }

    // Combo 触发特效
    if (this.engine.pendingCombo && this.engine.pendingCombo[0]) {
      const combo = this.engine.pendingCombo[0];
      this._showComboEffect(combo.type, combo.msg);
    }

    // S13多普勒探测等自窥牌库效果
    if (this.engine._pendingScry && this.engine._pendingScry.targetPlayerIdx === 0) {
      this._showScryModal();
    }

    // S21凸透成像选择
    if (this.engine._pendingConvexLens) {
      this._showConvexLensChoice();
    }

    // S09频率调节选择
    if (this.engine._pendingFrequencyChoice) {
      this._showFrequencyChoice();
    }

    // S29静电吸附弃牌选择
    if (this.engine._pendingDiscardChoice) {
      this._showDiscardChoice();
    }

    // S18 X射线透视 — 选择弃对方手牌
    if (this.engine._pendingDiscardOpponent) {
      this._showDiscardOpponentChoice();
    }

    this.selectedCard = null;

    // 检查游戏是否结束
    if (this.engine.isGameOver && this.engine.isGameOver()) {
      setTimeout(() => this.showGameOver(), 600);
    }
  }

  /** 卡牌飞行动画（手牌→出牌区） */
  _animateCardFly(card, sourceRect, targetRect) {
    const clone = document.createElement('div');
    clone.className = 'card play-card small card-fly-clone';
    clone.style.cssText = `
      left:${sourceRect.left}px; top:${sourceRect.top}px;
      width:${sourceRect.width}px; height:${sourceRect.height}px;
      border-left-color:${this.getDomainStyle(card.domain).color};
    `;

    // 构建微缩卡牌内容
    const style = this.getDomainStyle(card.domain);
    clone.innerHTML = `
      <span class="card-cost" style="background:${style.bg}">${card.cost ?? '?'}</span>
      <span class="card-name">${this._escapeHtml(card.name)}</span>
      <span class="card-type">${this.getTypeLabel(card.type)}</span>
    `;

    document.body.appendChild(clone);

    // 攻击卡弧线飞行
    if (card.type === 'attack') {
      clone.classList.add('attack');
      const dx = targetRect.left - sourceRect.left;
      const dy = targetRect.top - sourceRect.top;
      const midX = sourceRect.left + dx * 0.6 + (Math.random() - 0.5) * 60;
      const midY = Math.min(sourceRect.top, targetRect.top) - 80;
      clone.style.transform = `translate(${midX - sourceRect.left}px, ${midY - sourceRect.top}px) scale(1.3)`;
      clone.style.opacity = '0.85';
      // 两段动画模拟弧线
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transitionDelay = '0.2s';
          clone.style.transform = `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px) scale(${targetRect.width / sourceRect.width})`;
          clone.style.opacity = '1';
        });
      });
    } else {
      // 辅助/领域/召唤卡直飞
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clone.style.transform = `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px) scale(${targetRect.width / sourceRect.width})`;
          clone.style.opacity = '1';
        });
      });
    }

    // 动画结束移除 + 命中粒子
    const flyDuration = card.type === 'attack' ? 650 : 450;
    setTimeout(() => {
      // 攻击卡命中时爆发粒子
      if (card.type === 'attack') {
        const destX = targetRect.left + targetRect.width / 2;
        const destY = targetRect.top + targetRect.height / 2;
        this._spawnParticles(destX, destY, ['#ff4444', '#ff6b35', '#ffaa00', '#ffffff'], 10, 50);
      }
      clone.style.opacity = '0';
      setTimeout(() => clone.remove(), 200);
    }, flyDuration);
  }

  /** 处理效果动画（伤害数字弹出） */
  _processEffectAnimations(effects, cardType) {
    for (const eff of (effects || [])) {
      if (!eff || typeof eff !== 'object') continue;

      let value = null, type = 'dmg';
      if (eff.type === 'damage' && eff.target === 'player') {
        value = eff.value;
        type = (eff.value > 100) ? 'crit' : 'dmg';
      } else if (eff.type === 'heal' || eff.type === 'combo_heal_hp') {
        value = eff.value;
        type = 'heal';
      } else if (eff.type === 'summon_damage') {
        value = eff.value;
        type = 'dmg';
      } else if (eff.type === 'combo_extra_dmg' || eff.type === 'combo_force_dmg' || eff.type === 'combo_ignore_block') {
        value = eff.value;
        type = 'combo-dmg';
      }
      // 0伤害不显示（但特殊情况如combo 0伤害也要显示）
      if (value === null || (value === 0 && type === 'dmg')) continue;

      // 目标位置：对方玩家区域
      const targetEl = document.getElementById('opponent-area');
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
        const y = rect.top + rect.height / 2;
        this._showDamageNumber(value, x, y, type);
        // V15: 命中冲击特效
        if (type !== 'heal') {
          this._showHitImpact(targetEl, value);
        }
      }
    }
  }

  /** 显示单个伤害/治疗数字 */
  _showDamageNumber(value, x, y, type = 'dmg') {
    const el = document.createElement('div');
    el.className = `damage-pop ${type}`;
    el.textContent = (type === 'heal' ? '+' : '-') + Math.abs(Math.floor(value));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);

    // 动画结束后移除
    setTimeout(() => el.remove(), 1200);
  }

  /** V15: 命中视觉反馈——闪烁+震动+粒子 */
  _showHitImpact(targetEl, damage) {
    if (!targetEl) return;

    // 闪烁
    targetEl.classList.add('hit-flash');
    setTimeout(() => targetEl.classList.remove('hit-flash'), 500);

    // 大伤害震动
    if (damage >= 30) {
      targetEl.classList.add('hit-shake');
      setTimeout(() => targetEl.classList.remove('hit-shake'), 500);
    }

    // 粒子爆发
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    this._spawnParticles(cx, cy, ['#ff4444', '#ff6b35', '#ffaa00', '#ff2266', '#ffdd44'], 8, 40);
  }

  /** 粒子爆发工具方法 */
  _spawnParticles(cx, cy, colors, count = 8, radius = 40) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'impact-particle';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = radius * (0.5 + Math.random() * 0.5);
      particle.style.cssText = `
        left:${cx}px; top:${cy}px;
        width:${3 + Math.random() * 5}px;
        height:${3 + Math.random() * 5}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --px:${Math.cos(angle) * dist}px;
        --py:${Math.sin(angle) * dist}px;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  }

  /** 显示 Combo 触发特效 — 物理原理突出展示 */
  _showComboEffect(comboType, comboMsg) {
    // 屏幕闪烁背景
    const flashBg = document.createElement('div');
    flashBg.className = 'combo-screen-flash';
    document.body.appendChild(flashBg);
    setTimeout(() => flashBg.remove(), 700);

    // 解析物理概念
    const parts = this._parseComboMsg(comboMsg);

    // Combo 文字
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-flash';
    comboEl.innerHTML = `
      <div class="combo-name">⚡ COMBO 触发</div>
      <div class="combo-physics">
        <span class="physics-from">${this._escapeHtml(parts.from)}</span>
        <span class="physics-arrow">${this._escapeHtml(parts.arrow)}</span>
        <span class="physics-to">${this._escapeHtml(parts.to)}</span>
      </div>
      <div class="combo-effect-text">${this._escapeHtml(parts.effect)}</div>
    `;
    document.body.appendChild(comboEl);
    setTimeout(() => comboEl.remove(), 2200);
  }

  /** 解析 Combo msg 中物理概念和效果 */
  _parseComboMsg(msg) {
    if (!msg) return { from: '', arrow: '→', to: '', effect: '' };
    // 格式: "概念A→概念B：效果描述" 或 "概念A↔概念B：效果描述" 或 "概念Avs概念B：效果描述"
    const effectSplit = msg.split('：');
    const effect = effectSplit.length > 1 ? effectSplit.slice(1).join('：') : '';
    const physicsPart = effectSplit[0] || '';

    // 检测分隔符
    let arrow = '→';
    let parts = [];
    if (physicsPart.includes('→')) {
      arrow = '→';
      parts = physicsPart.split('→');
    } else if (physicsPart.includes('↔')) {
      arrow = '↔';
      parts = physicsPart.split('↔');
    } else if (physicsPart.includes('vs')) {
      arrow = 'vs';
      parts = physicsPart.split('vs');
    }

    return {
      from: parts[0] || '',
      arrow: arrow,
      to: parts[1] || '',
      effect: effect
    };
  }

  /** 显示回合切换过渡动画 */
  _showTurnTransition(text, className) {
    const el = document.createElement('div');
    el.className = `turn-transition ${className}`;
    el.innerHTML = `<div class="turn-banner">${text}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /** AI卡牌飞行动画（从对手手牌→AI出牌区） */
  _animateAICardFly(aiCard) {
    if (!aiCard) return;
    const oppHandEl = document.getElementById('opp-hand');
    const playZoneEl = document.querySelector('#opp-play-zone .play-card:last-child');
    if (!oppHandEl || !playZoneEl) return;

    const srcRect = oppHandEl.getBoundingClientRect();
    const tgtRect = playZoneEl.getBoundingClientRect();

    const clone = document.createElement('div');
    clone.className = 'card play-card small card-fly-clone';
    const style = this.getDomainStyle(aiCard.domain);
    clone.style.cssText = `
      left:${srcRect.left + srcRect.width / 2}px;
      top:${srcRect.top + srcRect.height / 2}px;
      width:50px; height:62px;
      border-left-color:${style.color};
    `;
    clone.innerHTML = `
      <span class="card-cost" style="background:${style.bg}">${aiCard.cost ?? '?'}</span>
      <span class="card-name">${this._escapeHtml(aiCard.name)}</span>
      <span class="card-type">${this.getTypeLabel(aiCard.type)}</span>
    `;
    document.body.appendChild(clone);

    const dx = tgtRect.left + tgtRect.width / 2 - (srcRect.left + srcRect.width / 2);
    const dy = tgtRect.top + tgtRect.height / 2 - (srcRect.top + srcRect.height / 2);

    const midX = dx * 0.5 + (Math.random() - 0.5) * 30;
    const midY = dy * 0.3 - 40;
    clone.style.transform = `translate(${midX}px, ${midY}px) scale(1.15)`;
    clone.style.opacity = '0.7';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.transitionDelay = '0.15s';
        clone.style.transform = `translate(${dx}px, ${dy}px) scale(${tgtRect.width / 50})`;
        clone.style.opacity = '1';
      });
    });

    setTimeout(() => {
      clone.style.opacity = '0';
      setTimeout(() => clone.remove(), 200);
    }, 550);
  }

  /** AI攻击特效：伤害数字弹出（对己方造成伤害） */
  _processAIEffectAnimations(effects) {
    for (const eff of (effects || [])) {
      if (!eff || typeof eff !== 'object') continue;

      let value = null, type = 'dmg';
      if (eff.type === 'damage' && eff.target === 'player') {
        value = eff.value;
        type = (eff.value > 100) ? 'crit' : 'dmg';
      } else if (eff.type === 'heal' || eff.type === 'combo_heal_hp') {
        value = eff.value;
        type = 'heal';
      } else if (eff.type === 'combo_extra_dmg' || eff.type === 'combo_force_dmg' || eff.type === 'combo_ignore_block') {
        value = eff.value;
        type = 'combo-dmg';
      }
      if (value === null || (value === 0 && type === 'dmg')) continue;

      // 目标位置：己方玩家区域
      const selfInfo = document.querySelector('.self-info');
      if (selfInfo) {
        const rect = selfInfo.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
        const y = rect.top + rect.height / 2;
        this._showDamageNumber(value, x, y, type);
      }
    }
  }

  /** 知识减费/加费视觉反馈 — 在手牌区显示提示徽章 */
  _showQuizCostFeedback() {
    if (!this.engine) return;
    // 检查最近的引擎日志是否包含知识减费/加费
    const recentLogs = (this.engine.log || []).slice(-5);
    let hasReduce = false, hasPenalty = false;
    for (const l of recentLogs) {
      if (l.msg && l.msg.includes('[知识减费]')) hasReduce = true;
      if (l.msg && l.msg.includes('[知识惩罚]')) hasPenalty = true;
    }
    if (!hasReduce && !hasPenalty) return;

    const selfHand = document.getElementById('self-hand');
    if (!selfHand) return;

    // 移除旧反馈
    const existing = selfHand.querySelector('.quiz-cost-feedback');
    if (existing) existing.remove();

    const badge = document.createElement('div');
    badge.className = 'quiz-cost-feedback';
    if (hasReduce && hasPenalty) {
      badge.innerHTML = '<span class="quiz-badge knowledge-reduce">📚 知识减费 -1</span><span class="quiz-badge knowledge-penalty">⚠️ 答错加费</span>';
    } else if (hasReduce) {
      badge.innerHTML = '<span class="quiz-badge knowledge-reduce">📚 知识减费 -1</span>';
    } else if (hasPenalty) {
      badge.innerHTML = '<span class="quiz-badge knowledge-penalty">⚠️ 答错加费</span>';
    }
    badge.style.cssText = 'display:flex;gap:6px;justify-content:center;padding:4px 0;animation:fadeIn .3s ease';
    selfHand.appendChild(badge);

    // 2秒后自动移除
    setTimeout(() => {
      if (badge.parentNode) badge.remove();
    }, 2500);
  }

  _clearAutoPlayTimeout() {
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout);
      this.autoPlayTimeout = null;
    }
  }

  endPlayerTurn() {
    try {
    this._clearAutoPlayTimeout();
    clearInterval(this.playTimer);
    this.playTimer = null;
    this.selectedCard = null;
    this.phase = 'settle';

    // 检查游戏是否结束
    if (this.engine.isGameOver && this.engine.isGameOver()) {
      this.showGameOver();
      return;
    }

    this.finishPlayerTurn();
    } catch (err) {
      console.error('[endPlayerTurn] error:', err.message);
      this.updateAllDisplay();
    }
  }

  showDiscardScreen() {
    clearInterval(this.discardTimer);
    // 清理残留的旧弃牌弹窗
    document.querySelectorAll('.discard-overlay').forEach(el => el.remove());
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players[0].hand) return;

    const toDiscard = gs.players[0].hand.length - 7;
    if (toDiscard <= 0) {
      this._afterPlayerDiscard();
      return;
    }

    // 弃牌倒计时8秒
    let discardSeconds = 12;

    const overlay = document.createElement('div');
    overlay.className = 'discard-overlay';
    overlay.innerHTML = `
      <div class="discard-card">
        <h3>手牌超过7张，请选择 <span style="color:#e74c3c;font-size:20px;">${toDiscard}</span> 张弃掉</h3>
        <div class="discard-timer">剩余 <span id="discard-countdown">${discardSeconds}</span> 秒（超时自动弃牌）</div>
        <div id="discard-options"></div>
        <button id="btn-discard-confirm" class="btn btn-primary" disabled>确认弃牌（需选 ${toDiscard} 张）</button>
      </div>
    `;
    this.container.appendChild(overlay);

    let selectedForDiscard = [];

    // 渲染弃牌选项
    const discardOptions = document.getElementById('discard-options');
    if (discardOptions) {
      discardOptions.innerHTML = gs.players[0].hand.map((c, i) => {
        const style = this.getDomainStyle(c.domain);
        return `
          <div class="discard-choice" data-index="${i}" style="border-color:${style.color}">
            <span class="card-name">${this._escapeHtml(c.name)}</span>
            <span class="card-cost" style="background:${style.bg}">${c.cost ?? '?'}</span>
          </div>
        `;
      }).join('');

      discardOptions.querySelectorAll('.discard-choice').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          if (selectedForDiscard.includes(idx)) {
            selectedForDiscard = selectedForDiscard.filter(i => i !== idx);
            el.classList.remove('selected');
          } else if (selectedForDiscard.length < toDiscard) {
            selectedForDiscard.push(idx);
            el.classList.add('selected');
          }
          const confirmBtn = document.getElementById('btn-discard-confirm');
          if (confirmBtn) {
            const remaining = toDiscard - selectedForDiscard.length;
            confirmBtn.disabled = remaining > 0;
            confirmBtn.textContent = remaining > 0
              ? `确认弃牌（还需选 ${remaining} 张）`
              : '确认弃牌 ✓';
          }
        });
      });
    }

    // 确认按钮
    document.getElementById('btn-discard-confirm')?.addEventListener('click', () => {
      if (selectedForDiscard.length !== toDiscard) return;
      clearInterval(this.discardTimer);
      if (this.engine.discardPhase) {
        this.engine.discardPhase(selectedForDiscard);
      }
      overlay.remove();
      this._afterPlayerDiscard();
    });

    // 倒计时（用时间戳，后台标签页不漂移）
    const countdownEl = document.getElementById('discard-countdown');
    const discardDeadline = Date.now() + discardSeconds * 1000;
    this.discardTimer = setInterval(() => {
      const remaining = Math.ceil((discardDeadline - Date.now()) / 1000);
      if (countdownEl) countdownEl.textContent = remaining;
      if (remaining <= 2 && countdownEl) {
        countdownEl.style.color = '#e74c3c';
        countdownEl.style.fontWeight = '900';
      }
      if (remaining <= 0) {
        clearInterval(this.discardTimer);
        // 超时：自动随机弃牌
        const allIndices = gs.players[0].hand.map((_, i) => i);
        const shuffled = shuffleArray(allIndices);
        const autoDiscard = shuffled.slice(0, toDiscard);
        if (this.engine.discardPhase) {
          this.engine.discardPhase(autoDiscard);
        }
        this.addLogMessage('弃牌超时，已自动随机弃 ' + toDiscard + ' 张');
        overlay.remove();
        this._afterPlayerDiscard();
      }
    }, 1000);
  }

  finishPlayerTurn() {
    // 玩家回合：执行结算和弃牌
    if (this.engine.settlePhase) {
      this.engine.settlePhase();
    }
    const gs = this.engine.getGameState();
    if (gs && gs.players[0].hand.length > 7) {
      this.showDiscardScreen();
      return; // 弃牌完成后 _afterDiscardContinue 会继续
    }
    this._afterPlayerDiscard();
  }

  _afterPlayerDiscard() {
    // 引擎切换回合（endTurn只切换currentPlayer，不调startTurn）
    if (this.engine.endTurn) {
      this.engine.endTurn();
    }
    // 启动AI回合
    if (this.engine.startTurn) {
      this.engine.startTurn();
    }
    this.phase = 'ai';
    this.selectedCard = null;
    this.addLogMessage('═══ AI 回合 ═══');
    this.updateAllDisplay();
    // 回合切换过渡动画
    this._showTurnTransition('对手回合', 'opponent');
    setTimeout(() => this.runAITurn(), 500);
  }

  // ==================== AI 回合 ====================

  async runAITurn() {
    const btnEnd = document.getElementById('btn-end-turn');
    if (btnEnd) btnEnd.disabled = true;

    if (!this.ai) {
      this.addLogMessage('AI初始化失败');
      this._afterAITurn();
      return;
    }

    // 全局超时守卫：AI回合最多30秒，超时强制结束
    const TURN_TIMEOUT = 30000;
    let turnTimedOut = false;
    let turnEnded = false;
    const timeoutId = setTimeout(() => {
      if (turnEnded) return;
      turnTimedOut = true;
      console.warn('[AI] 回合超时，强制结束');
      this.addLogMessage('⚠️ AI思考超时，自动跳过');
      this._afterAITurn();
    }, TURN_TIMEOUT);

    try {
      this.addLogMessage('AI正在思考...');

      // AI自动处理拉普拉斯妖窥牌
      this._autoScryAI();

      // ─── AI 阶段 1: 答题 ───
      const quiz = this.ai.simulateQuiz();
      this.engine.setQuizResult(quiz.correct, quiz.total);
      if (turnTimedOut || (this.engine.isGameOver && this.engine.isGameOver())) {
        clearTimeout(timeoutId);
        if (!turnTimedOut) { this.showGameOver(); this.phase = 'gameover'; }
        return;
      }

      // ─── AI 阶段 2: 逐张出牌 ───
      const self = this.engine.players[1];
      if (!self.turnBlocked) {
        this.ai.pendingDecisions = null;

        const delay = this.ai.getThinkDelay();
        await this.ai._sleep(delay);
        if (turnTimedOut) { clearTimeout(timeoutId); return; }

        let aiCardCount = 0;
        while (!this.engine.isGameOver || !this.engine.isGameOver() && !turnTimedOut && aiCardCount < 50) {
          // 获取AI下一张牌决策
          const decision = this.ai.getNextPlayDecision();
          if (!decision) break;
          aiCardCount++;

          // AI 出牌 & 即时结算卡牌效果
          const _aiResult = this.engine.playCard(this.ai.aiIdx, decision.cardId, decision.target || 'player');
          if (!_aiResult || !_aiResult.success) {
            // 出牌失败（如费用不足、目标无效），跳过这张继续
            continue;
          }

          // 添加到AI出牌展示区
          const aiCard = this.engine.getCardById(decision.cardId);
          if (aiCard) {
            this.playZoneAi.push({
              id: aiCard.id, name: aiCard.name, type: aiCard.type,
              domain: aiCard.domain, cost: aiCard.cost
            });
          }

          this.updateAllDisplay();

          // AI卡牌飞行动画（从对手手牌→AI出牌区）
          this._animateAICardFly(aiCard);

          // AI攻击特效 + 日志
          if (_aiResult && _aiResult.effects && Array.isArray(_aiResult.effects)) {
            const domainLabel = Array.isArray(aiCard.domain) ? aiCard.domain.join('/') : aiCard.domain;
            const typeEmoji = { attack: '⚔️', support: '✨', domain: '🏛️', summon: '👾', phase: '🌀' }[aiCard.type] || '🃏';
            this.addLogMessage(`${typeEmoji} [AI] ${aiCard.name}（${domainLabel}·${this.getTypeLabel(aiCard.type)}）`, 'log-card-play');
            const _aiMsgs = this._formatEffects(_aiResult.effects);
            for (const _am of _aiMsgs) {
              this.addLogMessage('  ' + _am);
            }
            this._processAIEffectAnimations(_aiResult.effects);
          }
          // AI Combo特效
          if (this.engine.pendingCombo && this.engine.pendingCombo[1]) {
            const _aiCombo = this.engine.pendingCombo[1];
            this._showComboEffect(_aiCombo.type, _aiCombo.msg + ' (AI)');
          }

          // 短暂延迟让玩家看到AI出牌效果
          await this.ai._sleep(600 + Math.random() * 400);

          if (this.engine.isGameOver && this.engine.isGameOver()) {
            this.showGameOver();
            this.phase = 'gameover';
            return;
          }

          // ─── 光速传播反制窗口（每张AI牌后） ───
          if (this.engine.lightSpeedActive && this.engine.lightSpeedActive[0]) {
            const interrupted = await this.showLightSpeedInterrupt();
            if (this.engine.isGameOver && this.engine.isGameOver()) {
              this.showGameOver();
              this.phase = 'gameover';
              return;
            }
            // 如果玩家出牌反制了，重置AI决策队列以适应新状态
            if (interrupted) {
              this.ai.resetPlayDecisions();
            }
          }

          // 牌间短延迟
          await this.ai._sleep(200 + Math.random() * 300);
        }
      }

      // ─── AI 阶段 3: 结算 ───
      if (!this.engine.isGameOver || !this.engine.isGameOver()) {
        this.engine.settlePhase();
      }

      // ─── AI 阶段 4: 弃牌 ───
      if (!this.engine.isGameOver || !this.engine.isGameOver()) {
        this.ai._handleDiscard();
      }

      // ─── AI 阶段 5: 结束回合 ───
      if (!this.engine.isGameOver || !this.engine.isGameOver()) {
        this.engine.endTurn();
      }

      this.updateAllDisplay();

      // 检查游戏结束
      if (this.engine.isGameOver && this.engine.isGameOver()) {
        clearTimeout(timeoutId);
        this.showGameOver();
        this.phase = 'gameover';
        return;
      }
    } catch (err) {
      console.error('AI turn error:', err);
      this.addLogMessage('AI回合出错: ' + err.message);
      // 异常时尝试安全地结束回合
      try {
        if (!this.engine.isGameOver || !this.engine.isGameOver()) {
          this.engine.settlePhase();
          this.ai._handleDiscard();
          this.engine.endTurn();
        }
      } catch (e2) { /* 忽略二次错误 */ }
    }

    clearTimeout(timeoutId);
    turnEnded = true;
    this._afterAITurn();
  }

  /** AI自动处理拉普拉斯妖窥牌：按伤害降序排列 */
  _autoScryAI() {
    if (!this.engine._pendingScry) return;
    const scry = this.engine._pendingScry;
    const ordered = [...scry.cards].sort((a, b) => b.dmg - a.dmg);
    this.engine.scryReorderTarget(ordered.map(c => c.id));
  }

  /** 玩家侧拉普拉斯妖窥牌排序弹窗 */
  async _showScryModal() {
    if (!this.engine._pendingScry) return false;
    const scry = this.engine._pendingScry;
    const isSelf = scry.targetPlayerIdx === 0;
    const title = isSelf ? '🔮 窥牌排序（己方牌库）' : '🔮 拉普拉斯妖 · 窥牌排序';
    const hint = isSelf ? '拖拽调整己方牌库顶部' : '拖拽调整对方牌库顶部';
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'scry-overlay';
      overlay.innerHTML = `<div class="scry-dialog"><h2>${title}</h2><p class="scry-hint">${hint} ${scry.cards.length} 张牌的顺序，然后点击确认</p><ul class="scry-list" id="scry-list"></ul><div class="scry-btns"><button class="scry-auto" id="scry-auto-dmg">⚔️ 伤害降序</button><button class="scry-confirm" id="scry-confirm">✅ 确认排序</button></div></div>`;
      document.body.appendChild(overlay);
      const list = overlay.querySelector('#scry-list');
      let order = [...scry.cards];
      function renderList() {
        list.innerHTML = '';
        order.forEach((card, idx) => {
          const li = document.createElement('li');
          li.className = 'scry-item';
          li.draggable = true;
          li.dataset.idx = idx;
          li.innerHTML = '<span class="scry-handle">☰</span><span class="scry-order">' + (idx + 1) + '</span><span class="scry-name">' + card.name + '</span><span class="scry-dmg">' + (card.dmg > 0 ? '⚔' + card.dmg : '') + '</span>';
          li.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', idx.toString()); li.classList.add('dragging'); });
          li.addEventListener('dragend', () => li.classList.remove('dragging'));
          li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('drag-over'); });
          li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
          li.addEventListener('drop', (e) => {
            e.preventDefault(); li.classList.remove('drag-over');
            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            if (fromIdx !== idx) { const [moved] = order.splice(fromIdx, 1); order.splice(idx, 0, moved); renderList(); }
          });
          list.appendChild(li);
        });
      }
      renderList();
      overlay.querySelector('#scry-confirm').addEventListener('click', () => {
        this.engine.scryReorderTarget(order.map(c => c.id));
        overlay.remove(); resolve(true);
      });
      overlay.querySelector('#scry-auto-dmg').addEventListener('click', () => { order.sort((a, b) => b.dmg - a.dmg); renderList(); });

      // 30秒超时自动确认当前排序
      const timeout = setTimeout(() => {
        if (document.body.contains(overlay)) {
          this.engine.scryReorderTarget(order.map(c => c.id));
          overlay.remove();
          resolve(false);
        }
      }, 30000);
      overlay.querySelector('#scry-confirm').addEventListener('click', () => { clearTimeout(timeout); });
    });
  }

  /** S21凸透成像：实像/虚像选择弹窗 */
  _showConvexLensChoice() {
    if (!this.engine._pendingConvexLens) return;
    const { lastCard } = this.engine._pendingConvexLens;
    const healAmt = Math.floor((lastCard.damage || 0) * 1.5);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;max-width:320px;text-align:center;">
      <h3 style="color:#fff;margin:0 0 8px;">🔍 凸透成像</h3>
      <p style="color:#aaa;font-size:13px;margin:0 0 16px;">对手上回合: ${lastCard.card?.name||'未知'} (${lastCard.damage||0}伤害)</p>
      <div style="display:flex;gap:12px;">
        <button id="cvx-real" style="flex:1;padding:12px;border-radius:8px;background:linear-gradient(135deg,#2ecc71,#27ae60);color:#fff;border:none;font-size:13px;cursor:pointer;">💚 实像<br><small>恢复${healAmt}HP</small></button>
        <button id="cvx-virtual" style="flex:1;padding:12px;border-radius:8px;background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;border:none;font-size:13px;cursor:pointer;">⚔️ 虚像<br><small>复制卡牌·120%伤害</small></button>
      </div></div>`;
    document.body.appendChild(overlay);
    const done = (choice) => {
      overlay.remove();
      const result = this.engine.convexLensApply(choice);
      if (result) {
        const label = choice === 'real' ? '实像' : '虚像';
        this.addLogMessage('🔍 凸透成像·' + label);
        const msgs = this._formatEffects([result]);
        for (const m of msgs) this.addLogMessage('  ' + m);
        if (choice === 'virtual') this.addLogMessage('  🃏 对手卡牌效果已复制');
      }
      this.updateAllDisplay();
    };
    overlay.querySelector('#cvx-real').onclick = () => done('real');
    overlay.querySelector('#cvx-virtual').onclick = () => done('virtual');
  }

  /** S09频率调节：升高/降低选择弹窗 */
  _showFrequencyChoice() {
    if (!this.engine._pendingFrequencyChoice) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;max-width:360px;text-align:center;">
      <h3 style="color:#fff;margin:0 0 8px;">🎵 频率调节</h3>
      <div style="display:flex;gap:12px;">
        <button id="freq-high" style="flex:1;padding:12px;border-radius:8px;background:linear-gradient(135deg,#3498db,#2980b9);color:#fff;border:none;font-size:13px;cursor:pointer;">🔊 升高<br><small>下张声系卡+20伤害</small></button>
        <button id="freq-low" style="flex:1;padding:12px;border-radius:8px;background:linear-gradient(135deg,#8e44ad,#6c3483);color:#fff;border:none;font-size:13px;cursor:pointer;">🔉 降低<br><small>本回合声系+5<br>次声震荡+2回合</small></button>
      </div></div>`;
    document.body.appendChild(overlay);
    const done = (choice) => {
      overlay.remove();
      const result = this.engine.frequencyApply(choice);
      if (result) {
        this.addLogMessage('🎵 ' + result.msg);
      }
      this.updateAllDisplay();
    };
    overlay.querySelector('#freq-high').onclick = () => done('high');
    overlay.querySelector('#freq-low').onclick = () => done('low');
  }

  /** S29 静电吸附：点击手牌选择弃置 */
  _showDiscardChoice() {
    const self = this;
    // 半透明遮罩提示
    const overlay = document.createElement('div');
    overlay.id = 'discard-hint';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:450;background:rgba(0,0,0,.5);color:#fff;text-align:center;padding:8px;font-size:13px;';
    overlay.textContent = '⚡ 静电吸附 — 点击手牌选择要弃置的卡';
    document.body.appendChild(overlay);
    // 拦截手牌点击 — 改为弃牌
    this._discardClickHandler = (e) => {
      const cardEl = e.target.closest('.card-v3, .card');
      if (!cardEl) return;
      const cardId = cardEl.dataset.cardId;
      if (!cardId) return;
      e.stopPropagation();
      e.preventDefault();
      // 在手牌中找到这张卡的索引
      const gs = self.engine.getGameState();
      const idx = gs.players[0].hand.findIndex(c => c.id === cardId);
      if (idx < 0) return;
      // 清理
      overlay.remove();
      if (self._discardClickHandler) {
        document.getElementById('self-hand')?.removeEventListener('click', self._discardClickHandler, true);
        self._discardClickHandler = null;
      }
      const result = self.engine.resolveDiscardChoice(idx);
      if (result) {
        self.addLogMessage('⚡ ' + result.msg);
      }
      self.updateAllDisplay();
    };
    document.getElementById('self-hand')?.addEventListener('click', this._discardClickHandler, true);
  }

  /** S18 X射线透视 — 选择弃对方1张手牌 */
  _showDiscardOpponentChoice() {
    const gs = this.engine.getGameState();
    const oppHand = gs.players[1].hand || [];
    if (oppHand.length === 0) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;max-width:360px;text-align:center;">
      <h3 style="color:#fff;margin:0 0 12px;">👁 X射线透视 — 选择弃置对方1张手牌</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
        ${oppHand.map((c, i) => `<button data-idx="${i}" style="padding:8px 14px;border-radius:8px;background:#2a2a3e;color:#fff;border:1px solid rgba(255,255,255,.15);font-size:12px;cursor:pointer;">${this._escapeHtml(c.name)} (${c.cost}费)</button>`).join('')}
      </div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        overlay.remove();
        const result = this.engine.resolveDiscardOpponent(idx);
        if (result) { this.addLogMessage('👁 ' + result.msg); }
        this.updateAllDisplay();
      };
    });
  }

  /** S06弹性储能 / A05重力势能 — 进度指示器 */
  _renderBuffIndicators() {
    const gs = this.engine?.getGameState();
    if (!gs) return;
    const debuffBox = document.getElementById('self-debuffs');
    if (!debuffBox) return;
    // S06
    const s06 = gs.players[0].fieldSupports?.find(f => f.card?.id === 'S06');
    const maxStore = s06?.card?.effect?.maxStore || 300;
    const stored = this.engine?.energyStore?.[0]?.stored || 0;
    if (s06 && stored > 0) {
      const pct = Math.min(100, (stored / maxStore) * 100);
      const h = `<span id="s06-bar" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#f39c12;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px;margin:1px;white-space:nowrap;">🌀${stored}/${maxStore}<span style="width:24px;height:4px;background:#333;border-radius:2px;display:inline-block;vertical-align:middle;"><span style="display:block;width:${pct}%;height:100%;background:#f39c12;border-radius:2px;"></span></span></span>`;
      let el = debuffBox.querySelector('#s06-bar'); if (el) el.outerHTML = h; else debuffBox.insertAdjacentHTML('beforeend', h);
    } else { debuffBox.querySelector('#s06-bar')?.remove(); }
    // A05
    const a05 = gs.players[0].fieldSupports?.find(f => f.card?.id === 'A05');
    const height = this.engine?.hightBonus?.[0] || 0;
    const track = this.engine?.hightAtkTrack?.[0] || 0;
    if (a05) {
      const h = `<span id="a05-bar" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#3498db;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px;margin:1px;white-space:nowrap;">📏高${height} ⏳${track}/4</span>`;
      let el = debuffBox.querySelector('#a05-bar'); if (el) el.outerHTML = h; else debuffBox.insertAdjacentHTML('beforeend', h);
    } else { debuffBox.querySelector('#a05-bar')?.remove(); }
    // C10 贝尔 — 每回合窥牌结果
    const bellSpied = this.engine?._bellSpiedCard;
    if (bellSpied) {
      // 如果是对象（完整卡牌），显示卡名并添加点击预览
      const name = typeof bellSpied === 'object' ? bellSpied.name : bellSpied;
      const h = `<span id="bell-bar" class="bell-clickable" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#16a085;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px;margin:1px;white-space:nowrap;cursor:pointer;">📞窥「${name}」</span>`;
      let el = debuffBox.querySelector('#bell-bar'); if (el) el.outerHTML = h; else debuffBox.insertAdjacentHTML('beforeend', h);
      // 点击弹出完整卡牌预览
      setTimeout(() => {
        const bellEl = debuffBox.querySelector('#bell-bar.bell-clickable');
        if (bellEl && typeof bellSpied === 'object') {
          bellEl.onclick = () => {
            const cardData = { ...bellSpied, _fromHand: false };
            this._showCardDetail(cardData);
          };
        }
      }, 50);
    } else { debuffBox.querySelector('#bell-bar')?.remove(); }
  }

  /** C04 薛定谔的猫 — 结果弹窗 */
  _showC04Popup(result) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease;pointer-events:none;';
    const icon = result.type === 'damage' ? '💥' : result.type === 'heal' ? '💚' : '🔮';
    const msg = result.type === 'damage' ? `造成 ${result.value} 点伤害！` : result.type === 'heal' ? `恢复 ${result.value} 点HP！` : `恢复 ${result.value} 精神力！`;
    overlay.innerHTML = `<div style="text-align:center;animation:popIn .5s ease;">
      <div style="font-size:64px;">${icon}</div>
      <h2 style="color:#fff;font-size:22px;margin:8px 0;">🐱 薛定谔的猫</h2>
      <p style="color:#ddd;font-size:16px;">${msg}</p></div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);
  }

  /** ⚡ Combo列表弹窗 — 按领域分组展示 */
  showComboList() {
    const entries = Object.entries(COMBO_TABLE);
    const domainGroups = { '力':[], '声':[], '光':[], '热':[], '电':[], '跨领域':[], '召唤':[] };
    for (const [key, combo] of entries) {
      // 判断分组
      let group = '召唤';
      const prefix = key.charAt(0);
      if (prefix === 'C') group = '召唤';
      else {
        const idMap = { A:0, S:0, D:0, T:0 };
        const ids = key.match(/[ASTDC]\d+/g) || [];
        const domains = ids.map(id => {
          const c = CARDS.find(cc => cc.id === id);
          return c?.domain?.[0] || '混沌';
        });
        if (domains.every(d => d === domains[0])) group = domains[0];
        else group = '跨领域';
      }
      if (!domainGroups[group]) group = '跨领域';
      const parsed = this._parseComboMsg(combo.msg);
      domainGroups[group].push({ key, combo, parsed });
    }
    // 按领域顺序输出
    const order = ['力','声','光','热','电','跨界','召唤','跨领域'];
    let html = '<div style="max-height:70vh;overflow-y:auto;padding:10px;">';
    html += '<h2 style="color:#fff;text-align:center;margin:0 0 16px;">⚡ Combo 组合列表（共'+entries.length+'条）</h2>';
    for (const g of order) {
      const items = domainGroups[g];
      if (!items || items.length === 0) continue;
      html += `<h3 style="color:#f39c12;margin:12px 0 6px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:4px;">${g}领域 (${items.length})</h3>`;
      for (const item of items) {
        html += `<div style="font-size:11px;color:#aaa;margin:3px 0;padding:4px 8px;background:rgba(255,255,255,.03);border-radius:4px;">
          <span style="color:#fff;font-weight:700;">${this._getCardName(item.parsed.from)}</span>
          <span style="color:#f39c12;"> ${item.parsed.arrow} </span>
          <span style="color:#fff;font-weight:700;">${this._getCardName(item.parsed.to)}</span>
          <span style="color:#888;"> — ${item.parsed.effect}</span></div>`;
      }
    }
    html += '</div>';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#1a1a2e;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px;max-width:480px;width:90vw;">${html}
      <button id="combo-close" style="display:block;margin:16px auto 0;padding:8px 24px;border-radius:8px;background:#333;color:#fff;border:none;cursor:pointer;font-size:13px;">✕ 关闭</button></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#combo-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }
  _getCardName(id) {
    const c = CARDS.find(cc => cc.id === id);
    return c ? c.name : id;
  }

  /** 🧪 获取测试模式卡牌列表 — 按主副领域+混沌筛选 */
  _getTestCards() {
    const VALID = ['力','声','光','热','电'];
    const domains = [this.mainDomain, this.subDomain].filter(d => d && VALID.includes(d));
    console.log('[测试] mainDomain:', this.mainDomain, 'subDomain:', this.subDomain, '→ domains:', domains);
    if (domains.length === 0) {
      console.log('[测试] 领域为空，返回全部', CARDS.length, '张');
      return [...CARDS];
    }
    const set = new Set(domains);
    const result = CARDS.filter(c => {
      if (!Array.isArray(c.domain) || c.domain.length === 0) return true;
      return c.domain.some(d => set.has(d) || d === '混沌');
    });
    console.log('[测试] 筛选结果:', result.length, '张, IDs:', result.map(c=>c.id).join(','));
    return result;
  }

  /**
   * 光速传播(S14) —— AI回合中断弹窗
   * 玩家在AI回合中可打出1张光系卡（费用+3）
   * 8秒倒计时，超时自动跳过
   */
  async showLightSpeedInterrupt() {
    const gs = this.engine.getGameState();
    const playerHand = gs.players[0].hand || [];

    // 筛选手牌中可打出的光系卡
    const playable = [];
    for (const card of playerHand) {
      if (!card.domain || !card.domain.includes('光')) continue;
      // 检查在对方回合能否打出 + 精神力是否足够
      const canAfford = this.engine.canAfford(0, card);
      const canPlayCheck = (this.engine.canPlayQuery || this.engine.canPlay).call(this.engine, 0, card);
      if (canAfford && canPlayCheck.can) {
        playable.push(card);
      }
    }

    // 无可打出光系卡则直接跳过
    if (playable.length === 0) return false;

    this.addLogMessage('[光速传播] 可在AI回合打出一张光系卡（费用+3）');

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'lightspeed-overlay';

      let timerSec = 8;
      let resolved = false;
      let timer = null;

      const doResolve = (played = false) => {
        if (resolved) return;
        resolved = true;
        if (timer) clearInterval(timer);
        overlay.remove();
        resolve(played);
      };

      // 构建弹窗HTML
      let cardsHTML = '';
      playable.forEach((c, i) => {
        const style = this.getDomainStyle(c.domain);
        const totalCost = (c.cost || 0) + 3; // 光速传播+3费用
        cardsHTML += `
          <div class="ls-card-choice" data-card-id="${this._escapeAttr(c.id)}"
               style="border-left-color:${style.color}; animation-delay:${i * 0.06}s">
            <span class="card-cost" style="background:${style.bg}">${c.cost}+3</span>
            <div class="ls-card-info">
              <span class="card-name">${this._escapeHtml(c.name)}</span>
              <span class="card-type">${this.getTypeLabel(c.type)} · 实际消耗${totalCost}</span>
            </div>
          </div>
        `;
      });

      overlay.innerHTML = `
        <div class="lightspeed-card">
          <div class="lightspeed-glow"></div>
          <div class="ls-header">
            <span class="ls-icon">⚡</span>
            <h3>光速传播</h3>
            <span class="ls-icon">⚡</span>
          </div>
          <p class="ls-desc">在AI回合中打出一张光系卡（费用+3）</p>
          <div class="ls-timer">剩余 <span id="ls-countdown">${timerSec}</span> 秒</div>
          <div class="ls-cards">${cardsHTML}</div>
          <button id="btn-ls-skip" class="btn btn-outline-ls">跳过</button>
        </div>
      `;
      this.container.appendChild(overlay);

      // 绑定卡牌点击
      const cardChoices = overlay.querySelectorAll('.ls-card-choice');
      cardChoices.forEach(el => {
        el.addEventListener('click', () => {
          const cardId = el.dataset.cardId;
          const card = playable.find(c => c.id === cardId);
          if (!card) return;

          // 打出卡牌（通过playInOpponentTurn，自动处理+3费用和回合限制）
          const _lsCardEl = document.querySelector(`#self-hand .card-v3[data-card-id="${this._escapeAttr(card.id)}"]`);
          const _lsCardRect = _lsCardEl ? _lsCardEl.getBoundingClientRect() : null;
          const result = this.engine.playInOpponentTurn(0, card.id, 'player');
          if (result && result.success) {
            this.addLogMessage(`[光速传播] 在AI回合打出「${card.name}」（费用+3）`);
            // 添加到出牌展示区
            this.playZoneSelf.push({
              id: card.id, name: card.name, type: card.type,
              domain: card.domain, cost: card.cost
            });
            this.updateAllDisplay();

            // 卡牌飞行动画
            if (_lsCardRect) {
              const _lsPlayZoneEl = document.querySelector('#self-play-zone .play-card:last-child');
              if (_lsPlayZoneEl) {
                this._animateCardFly(card, _lsCardRect, _lsPlayZoneEl.getBoundingClientRect());
              }
            }
            // 显示效果
            if (result.effects) {
              this._processEffectAnimations(result.effects, card.type);
            }
          } else {
            this.addLogMessage(`[光速传播] 出牌失败: ${result?.msg || '未知原因'}`);
          }

          doResolve(true);
        });
      });

      // 跳过按钮
      const skipBtn = overlay.querySelector('#btn-ls-skip');
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          this.addLogMessage('[光速传播] 跳过，不在AI回合出牌');
          doResolve();
        });
      }

      // 倒计时
      const countdownEl = overlay.querySelector('#ls-countdown');
      timer = setInterval(() => {
        timerSec--;
        if (countdownEl) {
          countdownEl.textContent = timerSec;
          if (timerSec <= 2) {
            countdownEl.style.color = '#e74c3c';
            countdownEl.style.fontWeight = '900';
          }
        }
        if (timerSec <= 0) {
          this.addLogMessage('[光速传播] 超时自动跳过');
          doResolve();
        }
      }, 1000);
    });
  }

  _afterAITurn() {
    if (this.phase === 'gameover') return;

    // 启动玩家回合（抽牌、处理灼烧/麻痹/领域衰减/精神恢复）
    if (this.engine.startTurn) {
      this.engine.startTurn();
    }

    this.addLogMessage('═══ 你的回合 ═══');
    this.phase = 'quiz';
    this.updateAllDisplay();
    // 回合切换过渡动画
    this._showTurnTransition('你的回合', 'your');
    setTimeout(() => this.showQuizPhase(), 500);
  }

  // ==================== 游戏结束 ====================

  showGameOver() {
    this.phase = 'gameover';
    this._clearAutoPlayTimeout();
    clearInterval(this.playTimer);
    clearInterval(this.quizTimer);
    clearInterval(this.discardTimer);
    this.playTimer = null;
    this.quizTimer = null;
    this.discardTimer = null;
    this.selectedCard = null;

    const gs = this.engine?.getGameState();
    const playerHp = gs?.players?.[0]?.hp ?? 0;
    const aiHp = gs?.players?.[1]?.hp ?? 0;

    // 判定胜者
    let isWin = false;
    let resultTitle = '';
    let resultSub = '';
    let resultIcon = '';

    if (playerHp <= 0 && aiHp <= 0) {
      resultTitle = '平局';
      resultSub = '双方同时倒下！';
      resultIcon = '🤝';
    } else if (aiHp <= 0) {
      isWin = true;
      resultTitle = '胜利！';
      resultSub = '你打败了AI对手！';
      resultIcon = '🏆';
    } else {
      resultTitle = '失败';
      resultSub = 'AI打败了你，继续努力！';
      resultIcon = '💔';
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
      <div class="game-over-panel">
        <div class="result-icon">${resultIcon}</div>
        <div class="result-title" style="color:${isWin ? 'var(--scs)' : 'var(--red)'}">${resultTitle}</div>
        <div class="result-subtitle">${resultSub}</div>
        <p style="margin-top:8px;">你的剩余HP: ${Math.max(0, Math.floor(playerHp))}</p>
        <p>AI剩余HP: ${Math.max(0, Math.floor(aiHp))}</p>
        <div class="result-actions">
          <button class="btn btn-primary" onclick="location.reload()" style="width:100%;">再来一局</button>
        </div>
      </div>
    `;
    this.container.appendChild(overlay);
  }

  // ==================== 日志 ====================

  addLogMessage(msg, cssClass = '') {
    if (!msg) return;

    // 1. Toast 气泡
    const toast = document.createElement('div');
    toast.className = `log-toast ${cssClass}`;
    toast.textContent = msg;
    const logArea = document.getElementById('log-area');
    if (logArea) {
      logArea.appendChild(toast);
      // 4秒后移除
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 4000);
      // 最多保留5个气泡
      while (logArea.children.length > 5) {
        logArea.firstChild?.remove();
      }
    }

    // 2. 历史抽屉
    const drawerBody = document.getElementById('log-drawer-body');
    if (drawerBody) {
      const entry = document.createElement('div');
      entry.className = `log-entry ${cssClass}`;
      entry.textContent = msg;
      drawerBody.appendChild(entry);
      drawerBody.scrollTop = drawerBody.scrollHeight;
      // 最多保留200条
      while (drawerBody.children.length > 200) {
        drawerBody.firstChild?.remove();
      }
    }
  }

  // ==================== 工具方法 ====================

  getDomainStyle(domain) {
    if (!domain) return { color: '#999', bg: '#999' };
    const d = Array.isArray(domain) ? domain[0] : domain;
    const styles = {
      '力': { color: '#E74C3C', bg: 'rgba(231,76,60,.25)' },
      '声': { color: '#3498DB', bg: 'rgba(52,152,219,.25)' },
      '光': { color: '#F1C40F', bg: 'rgba(241,196,15,.2)' },
      '热': { color: '#E67E22', bg: 'rgba(230,126,34,.25)' },
      '电': { color: '#9B59B6', bg: 'rgba(155,89,182,.25)' }
    };
    return styles[d] || { color: '#999', bg: '#999' };
  }

  /** V3 领域 class：domain-force/domain-sound/... */
  _domainClass(domain) {
    if (!domain) return 'domain-force';
    const d = Array.isArray(domain) ? domain[0] : domain;
    const map = { '力':'domain-force','声':'domain-sound','光':'domain-light','热':'domain-heat','电':'domain-elec','混沌':'domain-chaos' };
    return map[d] || 'domain-force';
  }

  /** 浮动提示（不阻断操作，自动消失） */
  _showFloatingToast(anchorEl, msg) {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const toast = document.createElement('div');
    toast.className = 'floating-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed;z-index:999;pointer-events:none;
      left:${rect.left + rect.width/2}px;top:${rect.top - 28}px;
      transform:translate(-50%,0);
      background:rgba(231,76,60,.9);color:#fff;font-size:11px;font-weight:700;
      padding:4px 10px;border-radius:6px;white-space:nowrap;
      box-shadow:0 4px 16px rgba(231,76,60,.4);
      animation:floatUp .8s ease-out forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 800);
  }

  getTypeLabel(type) {
    const labels = {
      attack: '攻击',
      support: '辅助',
      domain: '领域',
      summon: '召唤',
      phase: '相变'
    };
    return labels[type] || type || '未知';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** HTML转义（防止XSS） */
  _escapeHtml(str) {
    if (!str) return '';
    if (typeof str !== 'string') {
      str = String(str);
    }
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** 属性值转义 */
  _escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- 鼠标悬停tooltip（桌面端） ----

  /** 构建卡牌tooltip内容 */
  _getCardTooltipHTML(cardData) {
    const domainLabel = this.getDomainLabel(cardData.domain);
    const typeLabel = this.getTypeLabel(cardData.type);
    const emoji = { attack:'⚔️', support:'✨', domain:'🏛️', summon:'👾', phase:'🌀' }[cardData.type] || '🃏';

    const artUrl = this.artMap[cardData.id] || '';
    const emojiMap = { '力':'💪', '声':'🔊', '光':'💡', '热':'🔥', '电':'⚡' };
    const domains = Array.isArray(cardData.domain) ? cardData.domain : [cardData.domain];
    const runeHtml = domains.map(d => DOMAIN_RUNES[d] ? `<img src="${DOMAIN_RUNES[d]}" class="rune-img">` : (d === '混沌' ? '🌌' : '⚛')).join('');
    const descRaw = String(cardData.description || '暂无描述');
    const principleIdx = descRaw.indexOf('原理：');
    const summary = principleIdx > 0 ? descRaw.substring(0, principleIdx) : descRaw;
    const principle = principleIdx > 0 ? descRaw.substring(principleIdx + 3) : null;
    const formula = cardData.formula && cardData.formula !== '-' ? cardData.formula : null;
    const hasHp = cardData.hp !== undefined;
    return `
      <div class="card-v3 ${this._domainClass(cardData.domain)} rarity-${cardData.rarity || 'common'} skin-cyber" style="width:320px;height:460px;display:flex;flex-direction:column;overflow:hidden;">
        <div class="v3-header">
          <div class="v3-cost">${cardData.cost ?? '-'}</div>
          <div class="v3-name">${this._escapeHtml(cardData.name)}</div>
          <div class="v3-rune">${runeHtml}</div>
        </div>
        <div class="v3-type-ribbon"><span class="v3-type-pip ${cardData.type}">${typeLabel}</span></div>
        <div class="v3-art-frame" style="height:270px;flex-shrink:0;">${artUrl ? `<img src="${this._escapeAttr(artUrl)}" alt="">` : `<span style="font-size:28px;opacity:.1;">⚛</span>`}<div class="v3-art-corner tl"></div><div class="v3-art-corner tr"></div><div class="v3-art-corner bl"></div><div class="v3-art-corner br"></div></div>
        <div class="v3-divider"><span class="line"></span><span class="gem"></span><span class="line"></span></div>
        <div class="v3-stats">${cardData.effect?.dmg ? `<span class="v3-stat-num">${cardData.effect.dmg}</span><span class="v3-stat-unit">伤害</span>` : ''}${hasHp ? `<div class="v3-hp">❤ ${cardData.hp}/${cardData.maxHp}</div>` : ''}</div>
        <div class="v3-desc-box"><div>${this._escapeHtml(summary)}</div>${principle ? `<span class="principle">${this._escapeHtml(principle)}</span>` : ''}</div>

      </div>
    `;
  }

  /** 显示悬停tooltip */
  _showHoverTooltip(cardData, cardEl) {
    this._hideHoverTooltip();
    if (!cardData || !cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'card-tooltip';
    tooltip.innerHTML = this._getCardTooltipHTML(cardData);

    // 检测是否为支持hover的桌面端
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.body.appendChild(tooltip);

    // 定位：手牌卡上方展开，水平居中
    const tooltipH = tooltip.offsetHeight || 400;
    let top = rect.top - tooltipH - 8;
    let left = rect.left + rect.width / 2 - 160; // 320/2

    // 边界修正
    tooltip.style.maxWidth = '320px';
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '999';
    if (top < 4) top = 4;
    if (top + tooltipH > window.innerHeight - 4) top = window.innerHeight - tooltipH - 4;
    if (left < 4) left = 4;
    if (left + 320 > window.innerWidth - 4) left = window.innerWidth - 324;

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';

    this._hoverTooltip = tooltip;
  }

  /** 隐藏悬停tooltip */
  _hideHoverTooltip() {
    if (this._hoverTooltip) {
      this._hoverTooltip.remove();
      this._hoverTooltip = null;
    }
  }

  /** 格式化效果对象为可读字符串 */
  _formatEffects(effects) {
    const msgs = [];
    for (const eff of effects) {
      if (typeof eff === 'string') { msgs.push(eff); continue; }
      if (!eff || typeof eff !== 'object') { msgs.push(String(eff)); continue; }
      switch (eff.type) {
        // damage效果
        case 'damage': msgs.push(`💥 造成 ${eff.value} 点伤害`); break;
        case 'summon_damage': msgs.push(`💥 召唤物受到 ${eff.value} 点伤害`); break;
        case 'summon_destroyed': msgs.push(`💀 召唤物「${eff.name}」被消灭`); break;
        // burn效果
        case 'burn': msgs.push(`🔥 附加 ${eff.layers} 层灼烧`); break;
        case 'burn_start':
          if (eff.total > 0) msgs.push(`🔥 回合开始灼烧: ${eff.layers}层×${eff.dmg} = ${eff.total}伤害`);
          break;
        case 'burn_enhanced_update': msgs.push(`🔥 灼烧增强: ${eff.perDmg}点/层`); break;
        case 'temperature_rise': msgs.push(`🌡 ${eff.msg || '灼烧伤害提升至36/层（持续3回合）'}`); break;
        case 'burn_immune': msgs.push(`🛡 比热护盾: 免疫灼烧 ${eff.turns} 回合`); break;
        // paralysis效果
        case 'paralysis': msgs.push(`⚡ 附加 ${eff.layers} 层麻痹`); break;
        case 'paralysis_start':
          if (eff.total > 0) msgs.push(`⚡ 回合开始麻痹: ${eff.layers}层×${eff.dmg} = ${eff.total}伤害`);
          break;
        // health/spirit
        case 'heal': msgs.push(`💚 恢复 ${eff.value} 点HP`); break;
        case 'spirit_restore': msgs.push(`🔮 恢复 ${eff.value} 精神力`); break;
        case 'energy_conserve': msgs.push(`🔄 能量守恒: 转化 ${eff.spiritGain} 精神力`); break;
        case 'steal_spirit': msgs.push(`👻 偷取 ${eff.value} 精神力`); break;
        case 'spirit_debuff': msgs.push(`📉 对方精神力恢复 ${eff.value}`); break;
        case 'spirit_halve': msgs.push(`📉 ${eff.msg || '对方下回合精神力恢复减半'}`); break;
        // phase cards
        case 'critical_break': msgs.push(`⚠️ ${eff.msg || '临界突破！本回合所有攻击伤害翻倍'}`); break;
        case 'entropy_reverse': msgs.push(`🔄 熵逆转: HP互换 (你:${eff.playerHp} AI:${eff.aiHp})`); break;
        // special effects
        case 'light_speed': msgs.push(`⚡ 光速传播激活: ${eff.turns}回合内对方回合可出光系卡`); break;
        case 'mirage': msgs.push(`🌫 海市蜃楼: 对方 ${eff.turns} 回合内攻击命中下降`); break;
        case 'mirage_deflect': msgs.push(`🌫 海市蜃楼偏转！攻击伤害归零`); break;
        case 'sound_speed_buff': msgs.push(`🔊 声速激增: 下次声系攻击+${eff.value}`); break;
        case 'mirror_echo': msgs.push(`🔊 镜面回声: 本回合声系/光系攻击+10`); break;
        case 'spectrum': msgs.push(`🌈 光谱叠加: 每种领域+10伤害, 共+${eff.bonus}`); break;
        case 'polarize': msgs.push(`🔮 ${eff.msg || '对方下回合只能出一种类型的卡'}`); break;
        case 'shadow_bind': msgs.push(`🌑 ${eff.msg || '对方下2回合不能出辅助卡'}`); break;
        case 'mirror_maze': msgs.push(`🪞 ${eff.msg || '镜面迷宫: 对方3次出牌有35%概率失败'}`); break;
        case 'short_circuit': msgs.push(`⚡ 短路开关: 牺牲电辅助卡，本回合电攻+20`); break;
        case 'high_voltage': msgs.push(`⚡ 高压击穿: 电攻无视20点防御，持续3回合`); break;
        case 'multi_discharge': msgs.push(`⚡ 多路放电: 本回合所有电攻费用-2`); break;
        case 'noise': msgs.push(`📢 ${eff.msg || '对方下回合每出卡+5费'}`); break;
        case 'heat_engine': msgs.push(`🔥 热机驱动: 消耗2层灼烧恢复${eff.spiritRestore}精神力`); break;
        case 'latent_heat': msgs.push(`🔥 潜热释放: 消耗2层灼烧恢复${eff.heal}HP并清除负面状态`); break;
        case 'freeze_lock': msgs.push(`❄ ${eff.msg || '对方下回合被凝固封锁'}`); break;
        case 'extra_cost': msgs.push(`💰 对方下回合每出卡额外消耗${eff.value}精神力`); break;
        case 'convex_real': msgs.push(`🔍 凸透成像·实像: 恢复 ${eff.heal} HP`); break;
        case 'convex_virtual': msgs.push(`🔍 凸透成像·虚像: 造成 ${eff.dmg} 伤害（额外消耗${eff.extraCost}精神力）`); break;
        // misc
        case 'clear_debuff': msgs.push(`✨ ${eff.msg || '清除了负面状态'}`); break;
        case 'view_hand': 
          msgs.push(`👁 查看对方手牌: ${eff.cards || (eff.count === 'all' ? '全部' : eff.count + '张')}`);
          break;
        case 'discard_opponent': msgs.push(`🗑 弃置对方${eff.count}张手牌`); break;
        case 'need_discard': msgs.push(`🗑 ${eff.msg || '需先弃1张手牌'}`); break;
        case 'draw': msgs.push(`🃏 额外抽${eff.count}张牌`); break;
        case 'defense': msgs.push(`🛡 获得${eff.value}点防御`); break;
        case 'domain': msgs.push(`🏛️ 领域「${eff.name}」已激活`); break;
        case 'summon': msgs.push(`👾 召唤「${eff.name}」(${eff.hp}HP)`); break;
        case 'summon_bonus': msgs.push(`✨ ${eff.msg || `${eff.name}+${eff.value}`}`); break;
        case 'zeno_halve': msgs.push(`🐢 芝诺龟：伤害减半！`); break;
        case 'dodge': msgs.push(`🌀 惠更斯：闪避成功！`); break;
        case 'c04_damage': msgs.push(`🐱 薛定谔的猫：💥造成100伤害！`); break;
        case 'c04_heal': msgs.push(`🐱 薛定谔的猫：💚恢复100HP！`); break;
        default: msgs.push(eff.msg || eff.name || JSON.stringify(eff)); break;
      }
    }
    return msgs;
  }

  /** 清除攻击目标选择视觉 */
  _clearTargetingVisuals() {
    // 移除浮层提示
    document.querySelectorAll('.targeting-overlay').forEach(el => el.remove());
    // 移除区域标记
    const oppArea = document.getElementById('opponent-area');
    if (oppArea) {
      oppArea.classList.remove('targeting-area', 'targetable-player');
    }
    // 移除召唤物高亮
    document.querySelectorAll('.targetable-summon').forEach(el => {
      el.classList.remove('targetable-summon');
    });
    // 移除漂浮指示器
    document.querySelectorAll('.target-indicator').forEach(el => el.remove());
    // 关闭卡牌放大弹窗（含清理监听器）
    this._closeCardDetail();
  }

  /** 关闭卡牌放大弹窗（不触发取消选择） */
  _closeCardDetail() {
    if (this._zoomOutsideHandler) {
      document.removeEventListener('click', this._zoomOutsideHandler, true);
      this._zoomOutsideHandler = null;
    }
    const overlays = document.querySelectorAll('.card-zoom-overlay');
    overlays.forEach(el => {
      el.style.transition = 'opacity .15s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 150);
    });
    this._hideHoverTooltip();
  }

  /** 卡牌放大查看弹窗（手牌 / 驻场卡 / 召唤物均可） */
  _showCardDetail(cardData) {
    if (!cardData) return;

    // 移除之前的弹窗和监听器
    this._closeCardDetail();

    const style = this.getDomainStyle(cardData.domain);
    const typeLabel = this.getTypeLabel(cardData.type);
    const isHandCard = cardData._fromHand === true;
    const isAttackCard = cardData.type === 'attack';

    // 检查是否可打出
    let canPlayIt = false;
    if (isHandCard && isAttackCard && this.phase === 'play') {
      const cpResult = this.engine.canPlay ? this.engine.canPlay(0, cardData) : { can: false };
      canPlayIt = cpResult.can;
    }

    // 分割描述：效果 vs 原理
    const descRaw = String(cardData.description || '暂无描述');
    const principleIdx = descRaw.indexOf('原理：');
    const summary = principleIdx > 0
      ? descRaw.substring(0, principleIdx).replace(/。/g, '。<br>')
      : descRaw.replace(/。/g, '。<br>');
    const principle = principleIdx > 0
      ? descRaw.substring(principleIdx + 3).replace(/。/g, '')
      : null;
    const formula = cardData.formula && cardData.formula !== '-'
      ? cardData.formula : null;

    const overlay = document.createElement('div');
    overlay.className = 'card-zoom-overlay';

    const hpText = cardData.hp !== undefined
      ? `❤️ ${cardData.hp}/${cardData.maxHp}` : '';

    const emojiMap2 = { '力':'💪', '声':'🔊', '光':'💡', '热':'🔥', '电':'⚡' };
    const domains2 = Array.isArray(cardData.domain) ? cardData.domain : [cardData.domain];
    const runeHtml = domains2.map(d => DOMAIN_RUNES[d] ? `<img src="${DOMAIN_RUNES[d]}" class="rune-img">` : (d === '混沌' ? '🌌' : '⚛')).join('');
    const artUrl = this.artMap[cardData.id] || '';
    const hasHp = cardData.hp !== undefined;

    overlay.innerHTML = `
      <div class="card-v3 ${this._domainClass(cardData.domain)} rarity-${cardData.rarity || 'common'} skin-cyber" style="width:300px; max-height:90vh; overflow-y:auto; margin:auto;">
        <div class="v3-header">
          <div class="v3-cost">${cardData.cost ?? '-'}</div>
          <div class="v3-name">${this._escapeHtml(cardData.name)}</div>
          <div class="v3-rune">${runeHtml}</div>
        </div>
        <div class="v3-type-ribbon"><span class="v3-type-pip ${cardData.type}">${typeLabel}</span></div>
        <div class="v3-art-frame" style="height:250px;">${artUrl ? `<img src="${this._escapeAttr(artUrl)}" alt="">` : `<span style="font-size:36px;opacity:.1;">⚛</span>`}<div class="v3-art-corner tl"></div><div class="v3-art-corner tr"></div><div class="v3-art-corner bl"></div><div class="v3-art-corner br"></div></div>
        <div class="v3-divider"><span class="line"></span><span class="gem"></span><span class="line"></span></div>
        <div class="v3-stats">${cardData.effect?.dmg ? `<span class="v3-stat-num">${cardData.effect.dmg}</span><span class="v3-stat-unit">伤害</span>` : ''}${hasHp ? `<div class="v3-hp">❤ ${cardData.hp}/${cardData.maxHp}</div>` : ''}</div>
        <div class="v3-desc-box" style="max-height:200px;overflow-y:auto;"><div>${summary}</div>${principle ? `<span class="principle">${principle}</span>` : ''}</div>

        <div style="padding:10px;display:flex;gap:8px;border-top:1px solid rgba(255,255,255,.08);">
          <button class="btn btn-close" id="btn-zoom-close" style="flex:1;font-size:13px;padding:10px;border-radius:8px;background:#333;color:#eee;border:none;cursor:pointer;">✕ 关闭</button>
          ${canPlayIt ? `<button class="btn btn-play" id="btn-zoom-play" style="flex:1;font-size:13px;padding:10px;border-radius:8px;background:${style.color};color:#fff;border:none;cursor:pointer;">⚔️ 打出此卡</button>` : ''}
        </div>
      </div>
    `;

    this.container.appendChild(overlay);

    // 关闭按钮
    overlay.querySelector('#btn-zoom-close')?.addEventListener('click', () => {
      this._closeCardDetail();
    });

    // 打出按钮 → 进入攻击选目标模式
    overlay.querySelector('#btn-zoom-play')?.addEventListener('click', () => {
      this._enterAttackTargeting(cardData);
    });

    // 点击空白关闭
    const closeOnOutsideClick = (e) => {
      if (overlay && overlay.contains(e.target)) return;
      this._closeCardDetail();
    };
    this._zoomOutsideHandler = closeOnOutsideClick;
    setTimeout(() => {
      document.addEventListener('click', closeOnOutsideClick, true);
    }, 100);

    return overlay;
  }

  /** 攻击目标选择：显示视觉提示 */
  _showTargetingVisuals() {
    // toast浮层
    let toast = document.querySelector('.targeting-overlay');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'targeting-overlay';
      toast.innerHTML = '<div class="targeting-toast">🎯 点击选择攻击目标（召唤物 / 对方玩家）</div>';
      document.body.appendChild(toast);
    }

    // 对方玩家区域高亮
    const oppArea = document.getElementById('opponent-area');
    if (oppArea) {
      oppArea.classList.add('targeting-area', 'targetable-player');
      // 在玩家头像上加指示器
      const avatar = oppArea.querySelector('.avatar');
      if (avatar && !avatar.querySelector('.target-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'target-indicator';
        indicator.textContent = '🎯';
        avatar.appendChild(indicator);
      }
    }

    // 对方召唤物高亮
    const oppSummons = document.getElementById('opp-summons');
    const summons = oppSummons?.querySelectorAll('.summon-mini.enemy');
    if (summons) {
      summons.forEach(s => s.classList.add('targetable-summon'));
    }
  }

  /** 获取领域中文名 */
  getDomainLabel(domain) {
    if (!domain) return '未知';
    const d = Array.isArray(domain) ? domain[0] : domain;
    const labels = { '力': '力', '声': '声', '光': '光', '热': '热', '电': '电' };
    return labels[d] || d;
  }
}

export { GameUI };

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const container = document.getElementById('game-container');
    if (!container) {
      console.warn('GameUI: #game-container not found, UI not started');
      return;
    }
    const ui = new GameUI('game-container');
    await ui.init();

    // 挂载到window方便调试
    window.__gameUI = ui;
  } catch (err) {
    console.error('GameUI initialization failed:', err);
  }
});
