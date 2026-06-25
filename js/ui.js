/**
 * 物理卡牌对战 — 主UI控制器
 * ES6模块，负责全部界面交互与流程编排
 */
import { GameEngine } from './engine.js';
import { AIEngine } from './ai.js';
import { QuizSystem } from './quiz.js';
import { CARDS } from './cards.js';
import { DOMAIN_RUNES } from './runes.js';

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
    this.customDeck = null; // 玩家自定义卡组
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

    const domainButtons = domains.map((d, i) => `
      <button class="btn btn-domain domain-${d.id}" 
              data-domain="${d.id}" 
              style="--domain-color:${d.color}; animation-delay:${i * 0.08}s">
        <span class="domain-icon">${d.icon}</span>
        <span class="domain-label">${d.name}</span>
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="start-screen">
        <div class="start-header">
          <h1 class="start-title">
            <span class="title-icon">⚛️</span>
            物理卡牌对战
            <span class="title-icon">⚛️</span>
          </h1>
          <p class="start-subtitle">选择你的物理领域，用知识战胜对手！</p>
        </div>

        <div class="start-section">
          <h2 class="section-title">
            <span class="section-num">①</span> 选择主领域
          </h2>
          <div id="main-domain-btns" class="domain-grid">
            ${domainButtons}
          </div>
        </div>

        <div class="start-section">
          <h2 class="section-title">
            <span class="section-num">②</span> 选择副领域
          </h2>
          <p class="section-hint">选择另一个领域作为辅助</p>
          <div id="sub-domain-btns" class="domain-grid sub-grid">
            ${domains.map((d, i) => `
              <button class="btn btn-domain-sub domain-${d.id}" 
                      data-domain="${d.id}"
                      disabled
                      style="--domain-color:${d.color}; animation-delay:${(i + 5) * 0.06}s">
                <span class="domain-icon">${d.icon}</span>
                <span class="domain-label">${d.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="start-section">
          <h2 class="section-title">
            <span class="section-num">③</span> 选择难度
          </h2>
          <div id="difficulty-btns" class="difficulty-row">
            <button class="btn btn-diff" data-diff="easy">
              <span class="diff-icon">🌱</span>
              <span class="diff-label">简单</span>
            </button>
            <button class="btn btn-diff active" data-diff="normal">
              <span class="diff-icon">🌿</span>
              <span class="diff-label">普通</span>
            </button>
            <button class="btn btn-diff" data-diff="hard">
              <span class="diff-icon">🌳</span>
              <span class="diff-label">困难</span>
            </button>
          </div>
        </div>

        <div class="start-footer">
          <div class="start-actions">
            <button id="btn-deck-builder" class="btn btn-deck-builder" disabled>
              <span>🃏 自定义卡组</span>
            </button>
            <button id="btn-start-game" class="btn btn-start" disabled>
              <span>开始战斗</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
          <p id="start-hint" class="start-hint">请先选择主领域和副领域</p>
          <div id="deck-summary" class="deck-summary" style="display:none"></div>
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
        width:100%; max-width:480px; min-height:100vh; margin:0 auto;
        background:var(--bg);
        background-image:
          radial-gradient(ellipse at 50% 0%, rgba(52,152,219,.06) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 100%, rgba(155,89,182,.05) 0%, transparent 55%);
        padding:24px 16px 40px;
        display:flex; flex-direction:column; gap:24px;
        border-left:1px solid var(--bd); border-right:1px solid var(--bd);
        overflow-y:auto; max-height:100vh;
      }
      .start-header { text-align:center; }
      .start-title {
        font-size:28px; font-weight:900; color:#fff; letter-spacing:3px;
        display:flex; align-items:center; justify-content:center; gap:10px;
        margin-bottom:8px;
      }
      .title-icon { font-size:24px; }
      .start-subtitle { font-size:14px; color:var(--mt); }
      .start-section { animation:slideUp .5s ease both; }
      .section-title {
        font-size:15px; font-weight:700; color:var(--lt); margin-bottom:12px;
        display:flex; align-items:center; gap:8px;
      }
      .section-num {
        width:24px; height:24px; border-radius:50%; background:var(--pnl);
        display:inline-flex; align-items:center; justify-content:center;
        font-size:12px; color:var(--mt);
      }
      .section-hint { font-size:11px; color:var(--mt); margin-bottom:12px; margin-left:32px; }
      .domain-grid {
        display:flex; gap:10px; flex-wrap:wrap; justify-content:center;
      }
      .btn-domain {
        width:calc((100% - 40px) / 5); min-width:54px; aspect-ratio:1;
        flex-direction:column; gap:6px; background:var(--pnl); color:var(--lt);
        border:2px solid transparent; border-radius:var(--r12);
        font-size:12px; padding:8px 4px; transition:all var(--tn);
        animation:popIn .4s cubic-bezier(.175,.885,.32,1.275) both;
      }
      .btn-domain:hover:not(:disabled) {
        transform:translateY(-4px); box-shadow:0 6px 20px rgba(0,0,0,.3);
        border-color:var(--domain-color, #fff);
      }
      .btn-domain.selected {
        border-color:var(--domain-color, #fff) !important;
        box-shadow:0 0 20px var(--domain-color, rgba(255,255,255,.3));
        background:color-mix(in srgb, var(--domain-color, #333) 15%, var(--pnl));
      }
      .btn-domain-sub:disabled {
        opacity:.35; cursor:not-allowed; filter:grayscale(40%);
      }
      .btn-domain-sub.selected {
        opacity:1 !important; filter:none !important;
        border-color:var(--domain-color, #fff) !important;
        box-shadow:0 0 16px var(--domain-color, rgba(255,255,255,.2));
        background:color-mix(in srgb, var(--domain-color, #333) 12%, var(--pnl));
      }
      .domain-icon { font-size:24px; pointer-events:none; }
      .domain-label { font-size:12px; font-weight:700; pointer-events:none; letter-spacing:1px; }
      .difficulty-row { display:flex; gap:12px; justify-content:center; }
      .btn-diff {
        flex:1; max-width:120px; flex-direction:column; gap:4px;
        background:var(--pnl); color:var(--mt); border:2px solid transparent;
        border-radius:var(--r12); padding:12px 8px; font-size:13px;
        transition:all var(--tn);
      }
      .btn-diff:hover { border-color:var(--mt); }
      .btn-diff.active {
        border-color:var(--blu); color:#fff;
        box-shadow:0 0 16px rgba(52,152,219,.25);
      }
      .diff-icon { font-size:22px; pointer-events:none; }
      .diff-label { font-weight:700; pointer-events:none; }
      .start-footer { text-align:center; padding-top:8px; }
      .btn-start {
        width:100%; max-width:280px; min-height:56px; font-size:20px; font-weight:900;
        background:linear-gradient(135deg, var(--scs), #1e8449);
        color:#fff; border-radius:var(--r16); letter-spacing:2px;
        box-shadow:0 4px 24px rgba(46,204,113,.3); transition:all var(--tn);
      }
      .btn-start:hover:not(:disabled) {
        transform:translateY(-2px);
        box-shadow:0 8px 32px rgba(46,204,113,.45);
      }
      .btn-start:disabled { opacity:.4; cursor:not-allowed; }
      .btn-arrow { font-size:18px; margin-left:8px; transition:transform var(--tf); }
      .btn-start:hover:not(:disabled) .btn-arrow { transform:translateX(4px); }
      .start-hint { font-size:12px; color:var(--mt); margin-top:8px; }
      .sub-grid .btn-domain-sub { aspect-ratio:1; }
      .start-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
      .btn-deck-builder {
        padding:12px 20px; font-size:15px; font-weight:700;
        background:rgba(147,51,234,.15); color:#c084fc;
        border:1.5px solid rgba(147,51,234,.35); border-radius:var(--r12);
        cursor:pointer; transition:all .3s;
      }
      .btn-deck-builder:hover:not(:disabled) { background:rgba(147,51,234,.25); }
      .btn-deck-builder:disabled { opacity:.4; cursor:not-allowed; }
      .deck-summary { font-size:13px; color:#c084fc; margin-top:8px; }
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
    document.querySelectorAll('#sub-domain-btns .btn-domain-sub').forEach(btn => {
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
    document.querySelectorAll('#sub-domain-btns .btn-domain-sub').forEach(b => {
      if (b.dataset.domain === domain) {
        b.disabled = true;
        b.classList.add('excluded');
      } else {
        b.disabled = false;
        b.classList.remove('excluded');
        if (b.dataset.domain === this.subDomain) {
          b.classList.add('selected');
        }
      }
    });

    this._updateStartButton();
  }

  selectSubDomain(domain) {
    this.subDomain = domain;

    document.querySelectorAll('#sub-domain-btns .btn-domain-sub').forEach(b => {
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
    
    // 显示自定义卡组摘要
    if (this.customDeck && this.customDeck.length > 0) {
      const deckSummary = document.getElementById('deck-summary');
      if (deckSummary) {
        deckSummary.style.display = 'block';
        deckSummary.innerHTML = '🃏 自定义卡组：' + this.customDeck.length + ' 张（点击自定义卡组可修改）';
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
        <button id="db-save" class="db-btn-save" ${selected.size < 30 ? 'disabled' : ''}>💾 保存卡组</button>
        <button id="db-auto" class="db-btn-auto">🤖 快速自动组牌</button>
        <button id="db-clear" class="db-btn-clear">🗑 清空</button>
        <button id="db-cancel" class="db-btn-cancel">← 返回</button>
      </div>
      <div class="db-filters">
        <select id="db-filter-type"><option value="all">全部类型</option><option value="attack">攻击卡</option><option value="support">辅助卡</option><option value="summon">召唤卡</option><option value="domain">领域卡</option><option value="phase">相变卡</option></select>
        <select id="db-filter-rarity"><option value="all">全部稀有度</option><option value="common">普通</option><option value="rare">稀有</option><option value="epic">史诗</option><option value="legendary">传说</option><option value="mythic">神话</option></select>
        <input id="db-search" type="text" placeholder="🔍 搜索卡牌名称..." class="db-search">
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
      const stats = {};
      let totalDmg = 0;
      for (const id of selected) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        const d = Array.isArray(c.domain) ? c.domain[0] : '力';
        stats[d] = (stats[d] || 0) + 1;
        totalDmg += c.effect?.dmg || 0;
      }
      // 统计数据（类型 + 领域）
      let mainCount = 0, subCount = 0, otherCount = 0;
      let atkC = 0, supC = 0, sumC = 0, domC = 0, phsC = 0;
      for (const id of selected) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        if (c.type === 'attack') atkC++;
        else if (c.type === 'support') supC++;
        else if (c.type === 'summon') sumC++;
        else if (c.type === 'domain') domC++;
        else if (c.type === 'phase') phsC++;
        const hasMain = this._cardHasDomain(c, this.mainDomain);
        const hasSub = this._cardHasDomain(c, this.subDomain);
        if (hasMain && hasSub) { mainCount++; subCount++; }
        else if (hasMain) mainCount++;
        else if (hasSub) subCount++;
        else otherCount++;
      }
      const statHTML = Object.entries(stats).map(([d, c]) =>
        `<span style="color:${colorMap[d] || '#888'}">${d}×${c}</span>`
      ).join(' ');
      const allValid = domC <= 2 && mainCount >= 12 && mainCount <= 18 && subCount >= 6 && subCount <= 12 && selected.size === 30;
      const ruleIcon = allValid ? '✅' : '⚠️';
      overlay.querySelector('#db-stats').innerHTML = `${statHTML} | 均伤≈${selected.size > 0 ? Math.round(totalDmg / selected.size) : 0}<br>${ruleIcon} 主${mainCount}(12-18) 副${subCount}(6-12) 领域${domC}(≤2) | 30张必须满`;
    }

    function updateCount() {
      const count = overlay.querySelector('#db-count');
      count.textContent = selected.size;
      count.style.color = selected.size === 30 ? '#4CAF50' : selected.size > 0 ? '#FFA500' : '#f44336';
      const saveBtn = overlay.querySelector('#db-save');
      saveBtn.disabled = selected.size !== 30;
      saveBtn.textContent = selected.size === 30 ? '💾 保存卡组' : `还需${30 - selected.size}张`;
    }

    // 事件绑定
    overlay.querySelector('#db-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#db-search').addEventListener('input', renderCards);
    overlay.querySelector('#db-filter-type').addEventListener('change', (e) => { filterType = e.target.value; renderCards(); });
    overlay.querySelector('#db-filter-rarity').addEventListener('change', (e) => { filterRarity = e.target.value; renderCards(); });
    overlay.querySelector('#db-clear').addEventListener('click', () => { selected.clear(); renderCards(); renderDeckPanel(); updateCount(); });

    overlay.querySelector('#db-auto').addEventListener('click', () => {
      selected = new Set(this.generateDeck(this.mainDomain, this.subDomain));
      renderCards();
      renderDeckPanel();
      updateCount();
    });

    overlay.querySelector('#db-save').addEventListener('click', () => {
      if (selected.size !== MAX_CARDS) {
        alert('卡组必须恰好30张（当前' + selected.size + '张）');
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
      
      this.customDeck = ids;
      this._updateStartButton();
      overlay.remove();
    });

    // 初始渲染
    renderCards();
    renderDeckPanel();
    updateCount();
  }

  _diffLabel(diff) {
    const map = { easy: '简单', normal: '普通', hard: '困难' };
    return map[diff] || '普通';
  }

  // ==================== 游戏开始 / 卡组生成 ====================

  startGame() {
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

    // 主领域攻击卡（至少8张）
    const mainAttacks = CARDS.filter(c =>
      this._cardHasDomain(c, mainDomain) &&
      c.type === 'attack' &&
      c.rarity === 'common'
    ).slice(0, 8);

    // 副领域攻击卡（至少3张）
    const subAttacks = CARDS.filter(c =>
      this._cardHasDomain(c, subDomain) &&
      !this._cardHasDomain(c, mainDomain) &&
      c.type === 'attack'
    ).slice(0, 3);

    // 交叉领域攻击卡
    const crossAttacks = CARDS.filter(c =>
      this._cardHasDomain(c, mainDomain) &&
      this._cardHasDomain(c, subDomain) &&
      c.type === 'attack'
    ).slice(0, 2);

    // 主领域辅助卡
    const mainSupports = CARDS.filter(c =>
      this._cardHasDomain(c, mainDomain) &&
      (Array.isArray(c.domain) && c.domain.length === 1) &&
      c.type === 'support'
    ).slice(0, 5);

    // 副领域辅助卡
    const subSupports = CARDS.filter(c =>
      this._cardHasDomain(c, subDomain) &&
      !this._cardHasDomain(c, mainDomain) &&
      c.type === 'support'
    ).slice(0, 3);

    // 通用辅助卡
    const universalSupports = CARDS.filter(c =>
      c.type === 'support' &&
      (!c.domain || (Array.isArray(c.domain) && c.domain.length === 0))
    ).slice(0, 2);

    // 领域卡
    const domainCards = CARDS.filter(c =>
      c.type === 'domain' &&
      (this._cardHasDomain(c, mainDomain) || this._cardHasDomain(c, subDomain))
    ).slice(0, 2);

    // 召唤卡
    const summons = CARDS.filter(c =>
      c.type === 'summon' &&
      (this._cardHasDomain(c, mainDomain) || this._cardHasDomain(c, subDomain))
    ).slice(0, 2);

    // 相变卡
    const phaseCards = CARDS.filter(c => c.type === 'phase').slice(0, 1);

    let deck = [
      ...mainAttacks,
      ...subAttacks,
      ...crossAttacks,
      ...mainSupports,
      ...subSupports,
      ...universalSupports,
      ...domainCards,
      ...summons,
      ...phaseCards
    ];

    // 去重（同ID卡最多2张）
    const count = {};
    deck = deck.filter(c => {
      count[c.id] = (count[c.id] || 0) + 1;
      return count[c.id] <= 2;
    });

    // 补足30张
    while (deck.length < 30) {
      const filler = CARDS.find(c =>
        c.type === 'attack' &&
        this._cardHasDomain(c, mainDomain) &&
        !deck.some(d => d.id === c.id)
      );
      if (filler) {
        deck.push(filler);
      } else {
        break;
      }
    }

    // 去重后仍然不足，尝试任意攻击卡
    while (deck.length < 30) {
      const filler = CARDS.find(c =>
        c.type === 'attack' &&
        !deck.some(d => d.id === c.id)
      );
      if (filler) {
        deck.push(filler);
      } else {
        break;
      }
    }

    return deck.slice(0, 30).map(c => c.id);
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
    const bonusText = bonus > 0 ? `+${bonus}%` : '无增益';
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
    this.playTimerSeconds = 30;

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
    const totalSec = 30;
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
      }

      const timerNum = document.getElementById('timer-num');
      if (timerNum) {
        timerNum.textContent = Math.ceil(remaining / 1000) + 's';
        timerNum.style.color = remaining < 5000 ? '#e74c3c' : remaining < 10000 ? '#f39c12' : 'var(--mt)';
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
            <div class="zone-a-upper" id="opponent-area">
              <div id="opp-summons" class="summon-slots"></div>
              <div class="player-info opponent-info">
                <span class="avatar">🤖</span>
                <span class="label">AI对手</span>
                <div class="hp-bar"><div id="opp-hp-fill" class="hp-bar-fill"></div><span id="opp-hp-text" class="hp-text">1200/1200</span></div>
                <div class="spirit-bar"><div id="opp-spirit-fill" class="spirit-bar-fill"></div><span id="opp-spirit-text" class="hp-text">50/100</span></div>
                <span id="opp-hand-count" class="hand-counter">🃏5</span>
              </div>
              <div id="opp-summons-r" class="summon-slots"></div>
            </div>
            <div id="opp-hand" class="card-hand opponent-hand"></div>
          </div>
          <div class="zone-b">
            <div id="grave-opp" class="grave-stack">
              <span class="grave-icon">💀</span>
              <span id="grave-opp-count">0</span>
            </div>
          </div>
        </div>

        <!-- ===== 对方 D 区 ===== -->
        <div class="d-zone">
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
        <div class="d-zone">
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
      .summon-slots{display:flex;align-items:center;gap:3px;flex-shrink:0;min-width:0}
      .summon-slots .summon-mini{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);font-size:8px;font-weight:700;color:#fff;gap:1px;min-width:40px;flex-shrink:0;cursor:default}
      .summon-slots .summon-mini .sn-name{font-size:7px;text-align:center;line-height:1.1}
      .summon-slots .summon-mini .sn-hp{font-size:7px;color:var(--grn)}
      .summon-slots .summon-mini.enemy{cursor:pointer;border-color:rgba(231,76,60,.3)}
      .summon-slots .summon-mini.enemy:hover{box-shadow:0 0 6px rgba(231,76,60,.3)}
      /* === 墓地/牌库 === */
      .grave-stack,.deck-stack{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;background:rgba(0,0,0,.3);border-radius:6px;border:1px solid rgba(255,255,255,.06)}
      .grave-icon,.deck-icon{font-size:16px;opacity:.6}
      .grave-stack span:last-child,.deck-stack span:last-child{font-size:9px;color:var(--mt)}
      /* === D 区 === */
      .d-zone{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:6px 72px}
      .d-half{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;width:100%}
      /* === 中央分隔栏 === */
      .divider-row{flex-shrink:0;display:flex;align-items:center;gap:10px;height:30px;padding:0 16px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}
      .divider-row .timer-wrap{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;display:flex;justify-content:flex-end}
      .divider-row .timer-bar{height:100%;width:100%;background:linear-gradient(90deg,var(--red),var(--ylw));transition:width .1s linear}
      .timer-num{font-size:11px;color:var(--mt);min-width:30px;flex-shrink:0}
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
      .abc-row .hp-bar{position:relative;width:70px;height:12px;border-radius:6px;background:#2c3e50;overflow:hidden;flex-shrink:0}
      .abc-row .hp-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,var(--red),var(--grn));transition:width .4s ease}
      .abc-row .spirit-bar{width:48px;height:5px;border-radius:3px;background:#1a2a40;overflow:hidden;flex-shrink:0;position:relative}
      .abc-row .spirit-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#3498db,#9b59b6);transition:width .3s ease}
      .hp-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;pointer-events:none}
      .hand-counter{font-size:9px;color:var(--mt);padding:1px 5px;background:rgba(0,0,0,.2);border-radius:4px;flex-shrink:0}
      /* === 手牌 === */
      .abc-row .card-hand{flex:1;display:flex;flex-direction:row;align-items:center;justify-content:center;padding:0 4px;min-height:0;overflow-x:auto;overflow-y:visible;gap:0}
      .abc-row.opponent .card-hand{min-height:24px;padding:1px 4px}
      .abc-row.self .card-hand{padding:2px 4px 4px}
      .abc-row .card-back{background:linear-gradient(135deg,#2c3e50,#1a252f);border:1.5px solid #34495e;border-radius:5px;width:36px;height:48px;flex-shrink:0;cursor:default}
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
      .card-tooltip .card-v3::before,.card-tooltip .card-v3::after{display:none!important}
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
      this._updateLightSpeedIndicator();
      this.renderPlayZones();
      this.renderHand();
      this.renderField();
      this._renderSummons();
      this.renderDomainEffects();
      this._updateCounters(gs);
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

  renderHand() {
    try {
    const selfHand = document.getElementById('self-hand');
    const oppHand = document.getElementById('opp-hand');
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) {
      console.warn('[renderHand] no state');
      return;
    }
    // 己方手牌
    const cards = (gs.players[0].hand || []);
    if (selfHand) {
      console.log('[renderHand] cards:', cards.length);
      let html = '';
      if (cards.length === 0) {
        html = '<div class="empty-state"><span class="empty-icon">🃏</span>暂无手牌</div>';
      } else {
        const totalAngle = Math.min(cards.length * 3.5, 40);
        const startAngle = -(totalAngle / 2);
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const cpResult = this.phase === 'play' && this.engine.canPlay
            ? this.engine.canPlay(0, card)
            : { can: false };
          const isPlayable = cpResult.can;
          const isSelected = this.selectedCard && this.selectedCard.id === card.id;
          const rot = cards.length > 1 ? startAngle + (totalAngle / (cards.length - 1)) * i : 0;
          const artUrl = this.artMap[card.id] || '';
          const typeLabel = this.getTypeLabel(card.type);
          const domains = Array.isArray(card.domain) ? card.domain : [card.domain];
          const runeHtml = domains.map(d => DOMAIN_RUNES[d] ? `<img src="${DOMAIN_RUNES[d]}" class="rune-img">` : (d === '混沌' ? '🌌' : '⚛')).join('');
          const descRaw = String(card.description || '').substring(0, 30);
          const hasDesc = descRaw.length > 0;
          html += `
            <div class="card-v3 mini ${this._domainClass(card.domain)} rarity-${card.rarity} skin-cyber ${isPlayable ? 'playable' : ''} ${isSelected ? 'selected' : ''}"
                 data-card-id="${this._escapeAttr(card.id)}"
                 style="--rot:${rot}deg;transform:rotate(var(--rot));transform-origin:bottom center;transition:all .2s ease;flex-shrink:0;">
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
              <span class="v3-badge">赛博</span>
            </div>
          `;
        }
      }
      selfHand.innerHTML = html;
    }

    // 对方手牌（卡背）
    if (oppHand) {
      const count = (gs.players[1].hand || []).length;
      oppHand.innerHTML = Array.from({ length: count }, () =>
        '<div class="card card-back"></div>'
      ).join('');
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
    console.log('[renderPlayZones] selfZone:', selfZone, 'playZoneSelf:', this.playZoneSelf.length, 'playZoneAi:', this.playZoneAi.length);

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
            <div class="card play-card small ${typeClass}" style="border-left-color:${style.color}">
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
            <div class="card play-card small ${typeClass}" style="border-left-color:${style.color}">
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
      // 领域卡
      if (gs.players[0].fieldDomain) {
        const d = gs.players[0].fieldDomain;
        const style = this.getDomainStyle(d.domain);
        html += `
          <div class="domain-card" style="border-color:${style.color}; background:${style.bg}">
            <span class="card-name">${this._escapeHtml(d.name)}</span>
            <span class="domain-label">领域</span>
          </div>
        `;
      }
      // 召唤物 → 已移至 A 区 zone-a-upper 渲染
      // 驻场辅助卡
      const selfSupports = gs.players[0].fieldSupports || [];
      for (const sup of selfSupports) {
        const style = this.getDomainStyle(sup.domain);
        html += `<div class="card support-card small" style="border-left-color:${style.color}"><span class="card-name">${this._escapeHtml(sup.name)}</span><span class="card-type">辅助·${sup.turns}回合</span></div>`;
      }
      selfField.innerHTML = html || '<div class="empty-state"><span class="empty-icon">🏟️</span>场上暂无卡牌</div>';
    }

    // 对方场上
    if (oppField) {
      let html = '';
      if (gs.players[1].fieldDomain) {
        const d = gs.players[1].fieldDomain;
        const style = this.getDomainStyle(d.domain);
        html += `
          <div class="domain-card" style="border-color:${style.color}; background:${style.bg}">
            <span class="card-name">${this._escapeHtml(d.name)}</span>
            <span class="domain-label">领域</span>
          </div>
        `;
      }
      // 召唤物 → 已移至 A 区 zone-a-upper 渲染
      // 驻场辅助卡
      const oppSupports = gs.players[1].fieldSupports || [];
      for (const sup of oppSupports) {
        const style = this.getDomainStyle(sup.domain);
        html += `<div class="card support-card small" style="border-left-color:${style.color}"><span class="card-name">${this._escapeHtml(sup.name)}</span><span class="card-type">辅助·${sup.turns}回合</span></div>`;
      }
      oppField.innerHTML = html || '<div class="empty-state"><span class="empty-icon">🏟️</span>对方场上暂无卡牌</div>';
    }
  }

  /** 在 A 区渲染召唤物（头像左右两侧） */
  _renderSummons() {
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players) return;

    // 己方召唤物
    const selfL = document.getElementById('self-summons');
    const selfR = document.getElementById('self-summons-r');
    if (selfL && selfR) {
      const summons = gs.players[0].fieldSummons || [];
      const mid = Math.ceil(summons.length / 2);
      const left = summons.slice(0, mid);
      const right = summons.slice(mid);
      selfL.innerHTML = left.map(s => `<div class="summon-mini" data-summon-id="${this._escapeAttr(s.id)}"><span class="sn-name">${this._escapeHtml(s.name)}</span><span class="sn-hp">${s.hp}/${s.maxHp}</span></div>`).join('');
      selfR.innerHTML = right.map(s => `<div class="summon-mini" data-summon-id="${this._escapeAttr(s.id)}"><span class="sn-name">${this._escapeHtml(s.name)}</span><span class="sn-hp">${s.hp}/${s.maxHp}</span></div>`).join('');
    }

    // 对方召唤物
    const oppL = document.getElementById('opp-summons');
    const oppR = document.getElementById('opp-summons-r');
    if (oppL && oppR) {
      const summons = gs.players[1].fieldSummons || [];
      const mid = Math.ceil(summons.length / 2);
      const left = summons.slice(0, mid);
      const right = summons.slice(mid);
      oppL.innerHTML = left.map(s => `<div class="summon-mini enemy" data-summon-id="${this._escapeAttr(s.id)}"><span class="sn-name">${this._escapeHtml(s.name)}</span><span class="sn-hp">${s.hp}/${s.maxHp}</span></div>`).join('');
      oppR.innerHTML = right.map(s => `<div class="summon-mini enemy" data-summon-id="${this._escapeAttr(s.id)}"><span class="sn-name">${this._escapeHtml(s.name)}</span><span class="sn-hp">${s.hp}/${s.maxHp}</span></div>`).join('');
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
            if (summon.hp !== undefined) { cardData.hp = summon.hp; cardData.maxHp = summon.maxHp || summon.maxHp; }
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
        const cardEl = e.target.closest('.summon-card.enemy, .support-card');
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
            // 构造完整卡牌数据供放大查看
            const cardData = this.engine?.getCardById?.(summon.id) || summon.card;
            if (cardData) {
              if (summon.hp !== undefined) {
                cardData._fromHand = false;
                cardData.hp = summon.hp;
                cardData.maxHp = summon.maxHp || summon.maxHp;
              }
              this._showCardDetail(cardData);
            }
          }
        } else if (cardEl.classList.contains('support-card')) {
          // 驻场辅助卡：从DOM获取名称匹配
          const nameEl = cardEl.querySelector('.v3-name, .card-name');
          if (nameEl) {
            const supports = gs.players[1].fieldSupports || [];
            const sup = supports.find(s => s.card && s.card.name === nameEl.textContent.trim());
            if (sup?.card) {
              sup.card._fromHand = false;
              sup.card.turns = sup.turns;
              this._showCardDetail(sup.card);
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
            const sup = supports.find(s => s.card && s.card.name === nameEl.textContent.trim());
            if (sup?.card) {
              sup.card._fromHand = false;
              sup.card.turns = sup.turns;
              this._showCardDetail(sup.card);
            }
          }
        } else if (cardEl.classList.contains('domain-card')) {
          const nameEl = cardEl.querySelector('.v3-name, .card-name');
          if (nameEl && gs.players[0].fieldDomain) {
            const domainCard = this.engine?.getCardById?.(gs.players[0].fieldDomain.card?.id);
            if (domainCard) {
              domainCard._fromHand = false;
              this._showCardDetail(domainCard);
            }
          }
        }
      });
    }

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
      // 不可打出 — 显示放大查看
      this._showCardDetail(card);
      return;
    }

    // 辅助卡/领域卡/召唤卡/相变卡：直接打出（快速流程）
    if (card.type === 'support' || card.type === 'domain' || card.type === 'summon' || card.type === 'phase') {
      this.selectedCard = card;
      this._closeCardDetail();
      this.playSelectedCard('player');
      return;
    }

    // 攻击卡：先弹窗查看详情，确认后再选目标
    if (card.type === 'attack') {
      card._fromHand = true;
      this._showCardDetail(card);
      // 注意：此时不设置 selectedCard，也不进入 targeting
      // "打出"按钮触发 _enterAttackTargeting
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
      const msgs = this._formatEffects(result.effects);
      for (const msg of msgs) {
        this.addLogMessage(msg);
      }
      // 伤害/治疗数字弹出
      this._processEffectAnimations(result.effects, card.type);
    }

    // Combo 触发特效
    if (this.engine.pendingCombo && this.engine.pendingCombo[0]) {
      const combo = this.engine.pendingCombo[0];
      this._showComboEffect(combo.type, combo.msg);
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

    // 动画结束移除
    setTimeout(() => {
      clone.style.opacity = '0';
      setTimeout(() => clone.remove(), 200);
    }, card.type === 'attack' ? 650 : 450);
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

    // 半透明遮罩
    const overlay = document.createElement('div');
    overlay.className = 'turn-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 600);

    setTimeout(() => el.remove(), 900);
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
    let discardSeconds = 8;

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
        const shuffled = allIndices.sort(() => Math.random() - 0.5);
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
    // 引擎切换回合（endTurn会自动调用startTurn为AI）
    if (this.engine.endTurn) {
      this.engine.endTurn();
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
        while (!this.engine.gameOver && !turnTimedOut && aiCardCount < 50) {
          // 获取AI下一张牌决策
          const decision = this.ai.getNextPlayDecision();
          if (!decision) break;

          // AI 出牌 & 即时结算卡牌效果
          const _aiResult = this.engine.playCard(this.ai.aiIdx, decision.cardId, decision.target || 'player');

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

          // AI攻击特效：伤害数字弹出（对己方造成伤害时）
          if (_aiResult && _aiResult.effects && Array.isArray(_aiResult.effects)) {
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
      if (!this.engine.gameOver) {
        this.engine.settlePhase();
      }

      // ─── AI 阶段 4: 弃牌 ───
      if (!this.engine.gameOver) {
        this.ai._handleDiscard();
      }

      // ─── AI 阶段 5: 结束回合 ───
      if (!this.engine.gameOver) {
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
        if (!this.engine.gameOver) {
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
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'scry-overlay';
      overlay.innerHTML = '<div class="scry-dialog"><h2>🔮 拉普拉斯妖 · 窥牌排序</h2><p class="scry-hint">拖拽调整对方牌库顶部 ' + scry.cards.length + ' 张牌的顺序，然后点击确认</p><ul class="scry-list" id="scry-list"></ul><div class="scry-btns"><button class="scry-auto" id="scry-auto-dmg">⚔️ 伤害降序</button><button class="scry-confirm" id="scry-confirm">✅ 确认排序</button></div></div>';
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
      const canPlayCheck = this.engine.canPlay(0, card);
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
          const _lsCardEl = document.querySelector(`#self-hand .card[data-card-id="${this._escapeAttr(card.id)}"]`);
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
      <div class="card-v3 ${this._domainClass(cardData.domain)} skin-cyber" style="width:320px;height:460px;display:flex;flex-direction:column;overflow:hidden;">
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
        <span class="v3-badge">赛博朋克</span>
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
        // misc
        case 'clear_debuff': msgs.push(`✨ ${eff.msg || '清除了负面状态'}`); break;
        case 'view_hand': 
          msgs.push(`👁 查看对方${eff.count === 'all' ? '全部' : eff.count + '张'}手牌`);
          break;
        case 'discard_opponent': msgs.push(`🗑 弃置对方${eff.count}张手牌`); break;
        case 'need_discard': msgs.push(`🗑 ${eff.msg || '需先弃1张手牌'}`); break;
        case 'draw': msgs.push(`🃏 额外抽${eff.count}张牌`); break;
        case 'defense': msgs.push(`🛡 获得${eff.value}点防御`); break;
        case 'domain': msgs.push(`🏛️ 领域「${eff.name}」已激活`); break;
        case 'summon': msgs.push(`👾 召唤「${eff.name}」(${eff.hp}HP)`); break;
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
    document.querySelectorAll('.card-zoom-overlay').forEach(el => el.remove());
    this._hideHoverTooltip();
  }

  /** 卡牌放大查看弹窗（手牌 / 驻场卡 / 召唤物均可） */
  _showCardDetail(cardData) {
    if (!cardData) return;

    // 移除之前的弹窗和监听器
    this._closeCardDetail();

    const style = this.getDomainStyle(cardData.domain);
    const domainLabel = this.getDomainLabel ? this.getDomainLabel(cardData.domain)
      : (Array.isArray(cardData.domain) ? cardData.domain.join('/') : cardData.domain);
    const typeLabel = this.getTypeLabel(cardData.type);
    const emoji = { attack:'⚔️', support:'✨', domain:'🏛️', summon:'👾', phase:'🌀' }[cardData.type] || '🃏';
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
      <div class="card-v3 ${this._domainClass(cardData.domain)} skin-cyber" style="width:300px; max-height:90vh; overflow-y:auto; margin:auto;">
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
        <span class="v3-badge">赛博朋克</span>
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
    const oppField = document.getElementById('opp-field');
    const summons = oppField?.querySelectorAll('.summon-card.enemy');
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
