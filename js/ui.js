/**
 * 物理卡牌对战 — 主UI控制器
 * ES6模块，负责全部界面交互与流程编排
 */
import { GameEngine } from './engine.js';
import { AIEngine } from './ai.js';
import { QuizSystem } from './quiz.js';
import { CARDS } from './cards.js';

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

  init() {
    this.showStartScreen();
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
    document.getElementById('btn-deck-builder').addEventListener('click', () => {
      if (this.mainDomain && this.subDomain) {
        this.showDeckBuilder();
      }
    });

    // 开始按钮
    document.getElementById('btn-start-game').addEventListener('click', () => {
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
        <button id="db-save" class="db-btn-save" ${selected.size < 20 ? 'disabled' : ''}>💾 保存卡组</button>
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
    const MIN_CARDS = 22;
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
        const dmg = c.effect?.dmg || '';
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
      const allValid = atkC >= 10 && atkC <= 15 && supC >= 7 && supC <= 12 && sumC <= 2 && domC <= 2 && phsC <= 1 && mainCount >= subCount && mainCount >= otherCount && mainCount + subCount >= Math.ceil(selected.size * 0.6);
      const ruleIcon = allValid ? '✅' : '⚠️';
      overlay.querySelector('#db-stats').innerHTML = `${statHTML} | 均伤≈${selected.size > 0 ? Math.round(totalDmg / selected.size) : 0}<br>${ruleIcon} 主${mainCount}·副${subCount}·其他${otherCount} | 攻击${atkC}(10-15) 辅助${supC}(7-12) 召唤${sumC}(≤2) 领域${domC}(≤2) 相变${phsC}(≤1)`;
    }

    function updateCount() {
      const count = overlay.querySelector('#db-count');
      count.textContent = selected.size;
      count.style.color = selected.size >= MIN_CARDS ? '#4CAF50' : selected.size > 0 ? '#FFA500' : '#f44336';
      const saveBtn = overlay.querySelector('#db-save');
      saveBtn.disabled = selected.size < MIN_CARDS;
      saveBtn.textContent = selected.size >= MIN_CARDS ? '💾 保存卡组' : `还需${MIN_CARDS - selected.size}张`;
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
      if (selected.size < MIN_CARDS) return;
      
      // 领域验证：主领域卡 ≥ 副领域卡，且均≥其他领域
      const self = this;
      const ids = [...selected];
      
      // 类型统计
      let attackCount = 0, supportCount = 0, summonCount = 0, domainCount = 0, phaseCount = 0;
      let mainCount = 0, subCount = 0, otherCount = 0;
      for (const id of ids) {
        const c = allCards.find(card => card.id === id);
        if (!c) continue;
        if (c.type === 'attack') attackCount++;
        else if (c.type === 'support') supportCount++;
        else if (c.type === 'summon') summonCount++;
        else if (c.type === 'domain') domainCount++;
        else if (c.type === 'phase') phaseCount++;
        const hasMain = self._cardHasDomain(c, self.mainDomain);
        const hasSub = self._cardHasDomain(c, self.subDomain);
        if (hasMain && hasSub) { mainCount++; subCount++; }
        else if (hasMain) mainCount++;
        else if (hasSub) subCount++;
        else otherCount++;
      }
      
      // === 组牌规则验证（对齐自动组牌比例）===
      // auto: 13攻(8主+3副+2交) 10辅(5主+3副+2通) 2域 2召 1相 = 26张
      const rules = [
        { check: attackCount >= 10, msg: '攻击卡至少10张（自动组牌13张，当前' + attackCount + '张）' },
        { check: attackCount <= 15, msg: '攻击卡最多15张（当前' + attackCount + '张）' },
        { check: supportCount >= 7, msg: '辅助卡至少7张（自动组牌10张，当前' + supportCount + '张）' },
        { check: supportCount <= 12, msg: '辅助卡最多12张（当前' + supportCount + '张）' },
        { check: summonCount <= 2, msg: '召唤卡最多2张（自动组牌2张，当前' + summonCount + '张）' },
        { check: domainCount <= 2, msg: '领域卡最多2张（自动组牌2张，当前' + domainCount + '张）' },
        { check: phaseCount <= 1, msg: '相变卡最多1张（自动组牌1张，当前' + phaseCount + '张）' },
        { check: mainCount >= subCount, msg: '主领域「' + self.mainDomain + '」(' + mainCount + ')不能少于副领域(' + subCount + ')' },
        { check: mainCount >= otherCount, msg: '主领域卡须最多（主' + mainCount + ' < 其他' + otherCount + '）' },
        { check: mainCount + subCount >= Math.ceil(selected.size * 0.6), msg: '主+副领域需≥60%（当前' + Math.round((mainCount+subCount)/selected.size*100) + '%）' },
      ];
      for (const r of rules) {
        if (!r.check) { alert(r.msg); return; }
      }
      
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
    const playerDeck = this.customDeck && this.customDeck.length >= 22
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
    if (optionsEl) {
      optionsEl.innerHTML = optionsHTML;
    }

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
      <div class="battle-grid">
        <!-- 顶栏：AI信息 -->
        <div class="battle-top" id="opponent-area">
          <div class="player-info opponent-info">
            <span class="avatar">🤖</span>
            <span class="label">AI对手</span>
            <div class="hp-bar">
              <div id="opp-hp-fill" class="hp-bar-fill"></div>
              <span id="opp-hp-text" class="hp-text">1200/1200</span>
            </div>
            <div class="spirit-bar">
              <div id="opp-spirit-fill" class="spirit-bar-fill"></div>
              <span id="opp-spirit-text" class="hp-text" style="font-size:9px;">50/100</span>
            </div>
            <span id="opp-hand-count" class="hand-counter">🃏5</span>
          </div>
        </div>

        <!-- 对方场地行 -->
        <div class="battle-row opponent-row">
          <div id="opp-hand" class="card-hand opponent-hand"></div>
          <div id="opp-field" class="card-field opponent-field"></div>
          <div id="opp-play-zone" class="play-zone opponent-play-zone"></div>
        </div>

        <!-- VS 分隔 -->
        <div class="battle-vs"><span>⚡ VS ⚡</span></div>

        <!-- 己方场地行 -->
        <div class="battle-row self-row">
          <div class="battle-row-spacer"></div>
          <div id="self-field" class="card-field self-field"></div>
          <div id="self-play-zone" class="play-zone self-play-zone"></div>
        </div>

        <!-- 手牌区域（跨列） -->
        <div id="self-hand" class="card-hand self-hand-main"></div>

        <!-- 计时器 + 领域效果 -->
        <div class="timer-container"><div id="timer-bar" class="timer-bar"></div></div>
        <div id="domain-zone" class="domain-effect-zone"></div>

        <!-- 底栏 -->
        <div class="battle-bottom">
          <div class="player-info self-info">
            <span class="avatar">👤</span>
            <span class="label">你</span>
            <div class="hp-bar">
              <div id="self-hp-fill" class="hp-bar-fill"></div>
              <span id="self-hp-text" class="hp-text">1200/1200</span>
            </div>
            <div class="spirit-bar">
              <div id="self-spirit-fill" class="spirit-bar-fill"></div>
              <span id="self-spirit-text" class="hp-text" style="font-size:9px;">50/100</span>
            </div>
            <span id="hand-count" class="hand-counter">🃏5</span>
          </div>
          <button id="btn-end-turn" class="btn btn-end-turn" disabled>结束回合</button>
        </div>

        <!-- 日志（悬浮气泡） -->
        <div id="log-area" class="log-area"></div>
        <div id="log-drawer-toggle" class="log-drawer-toggle" title="战斗记录">📜</div>
        <div id="log-drawer" class="log-drawer">
          <div class="log-drawer-header">
            <span>战斗记录</span>
            <span id="log-drawer-close" style="cursor:pointer;font-size:14px;">✕</span>
          </div>
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
      .battle-grid{display:flex;flex-direction:column;height:100vh;width:100vw;background:#0a0a1a;overflow:hidden;color:var(--lt)}
      .battle-top{flex-shrink:0;display:flex;align-items:center;padding:4px 10px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06)}
      .opponent-row{flex-shrink:0;display:flex;gap:6px;padding:3px 8px}
      .self-row{flex-shrink:0;display:flex;gap:6px;padding:3px 8px}
      .battle-vs{flex-shrink:0;text-align:center;padding:1px 0;font-size:11px;color:rgba(255,255,255,.1)}
      .battle-row-spacer{width:100px;flex-shrink:0}
      .player-info{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap;min-width:0}
      .player-info .avatar{font-size:20px;flex-shrink:0}
      .player-info .label{font-size:11px;font-weight:700;color:var(--lt);flex-shrink:0}
      .hp-bar{position:relative;width:100px;height:16px;border-radius:8px;background:#2c3e50;overflow:hidden;flex-shrink:0}
      .hp-bar-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,var(--red),var(--grn));transition:width .4s ease}
      .hp-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;pointer-events:none}
      .spirit-bar{width:64px;height:6px;border-radius:3px;background:#1a2a40;overflow:hidden;flex-shrink:0;position:relative}
      .spirit-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#3498db,#9b59b6);transition:width .3s ease}
      .hand-counter{font-size:10px;color:var(--mt);padding:2px 6px;background:rgba(0,0,0,.2);border-radius:4px;flex-shrink:0}
      .card-hand{display:flex;flex-direction:row;gap:4px;padding:4px 8px;overflow-x:auto;overflow-y:visible;scrollbar-width:thin;flex-shrink:0;min-height:40px}
      .opponent-hand{min-height:36px;padding:2px 8px}
      .self-hand-main{min-height:100px;justify-content:center;background:linear-gradient(to top,rgba(10,10,26,.95),rgba(10,10,26,.5));box-shadow:0 -4px 20px rgba(0,0,0,.4)}
      .card-hand .card.small{margin-left:0;flex-shrink:0;width:72px;height:90px;font-size:10px;background:#1a1a2e;border-radius:6px;border-left:3px solid;cursor:pointer;position:relative;display:flex;flex-direction:column;overflow:hidden}
      .card-hand .card.small .card-cost{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;color:#fff;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;z-index:2}
      .card-hand .card.small .card-name{font-size:10px;font-weight:700;color:#fff;text-align:center;padding:22px 3px 2px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .card-hand .card.small .card-type{font-size:8px;color:var(--mt);text-align:center;padding:0 3px}
      .card-hand .card.small .card-desc{font-size:7px;color:var(--mt);text-align:center;padding:2px 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .card-hand .card.small.playable{border-color:#2ecc71!important;animation:cardReady 2s ease-in-out infinite}
      .card-hand .card.small.selected{transform:translateY(-8px);z-index:5;box-shadow:0 0 16px rgba(52,152,219,.5)}
      .card-hand .card.small:hover{transform:translateY(-4px);z-index:3}
      .card-back{background:linear-gradient(135deg,#2c3e50,#1a252f);border:1.5px solid #34495e;border-radius:5px;width:40px;height:52px;flex-shrink:0;cursor:default;margin-left:0}
      .card-field{flex:1;display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start;padding:3px 6px;min-height:48px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.01);overflow-x:auto}
      .opponent-field{border-color:rgba(231,76,60,.12)}
      .self-field{border-color:rgba(46,204,113,.12);flex:2}
      .play-zone{width:130px;flex-shrink:0;display:flex;flex-direction:column;padding:3px 6px;border-radius:8px;border:1px dashed transparent;min-height:48px;overflow-y:auto;max-height:120px}
      .opponent-play-zone{border-color:rgba(231,76,60,.15)}
      .self-play-zone{border-color:rgba(46,204,113,.15)}
      .play-zone.has-cards{background:rgba(255,255,255,.02)}
      .opponent-play-zone.has-cards{border-color:rgba(231,76,60,.3);background:rgba(231,76,60,.04)}
      .self-play-zone.has-cards{border-color:rgba(46,204,113,.3);background:rgba(46,204,113,.04)}
      .play-zone-label{font-size:9px;font-weight:700;color:rgba(46,204,113,.4);margin-bottom:2px}
      .play-zone-label.opponent{color:rgba(231,76,60,.4)}
      .play-zone-cards{display:flex;flex-wrap:wrap;gap:4px;overflow-x:auto}
      .play-zone-empty{font-size:9px;color:var(--mt);opacity:.4;text-align:center}
      .play-card.small{width:50px;height:62px;margin-left:0;cursor:default;animation:playCardIn .3s ease both;position:relative;display:flex;flex-direction:column;overflow:hidden;background:#1a1a2e;border-radius:6px;border-left:3px solid}
      .play-card .card-cost{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;font-size:8px;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;z-index:2}
      .play-card .card-name{font-size:8px;font-weight:700;padding:18px 2px 2px;text-align:center;line-height:1.1;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .play-card .card-type{font-size:7px;color:var(--mt);text-align:center}
      .log-area{position:fixed;bottom:16px;right:66px;z-index:250;display:flex;flex-direction:column-reverse;gap:4px;max-width:260px;pointer-events:none}
      .log-message{padding:1px 0;border-bottom:1px solid rgba(255,255,255,.04)}
      .battle-bottom{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:4px 10px;background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06)}
      .btn-end-turn{flex-shrink:0;padding:8px 20px;border-radius:8px;background:var(--grn);color:#fff;border:none;font-size:13px;font-weight:700;cursor:pointer}
      .btn-end-turn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}
      .summon-hp{position:relative;height:5px;border-radius:3px;background:#444;overflow:hidden;margin-top:2px}
      .summon-hp-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--grn),var(--ylw),var(--red));transition:width .4s ease}
      .summon-card{font-size:10px;padding:3px 5px;border-radius:5px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.1);min-width:50px;flex-shrink:0}
      .summon-card.enemy{cursor:pointer;border-color:var(--red);border-style:dashed}
      .summon-card.enemy:hover{box-shadow:0 0 8px rgba(231,76,60,.3)}
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
      .timer-container{flex-shrink:0;height:4px;background:rgba(255,255,255,.06)}
      .timer-bar{height:100%;width:100%;background:linear-gradient(90deg,#3498db,#2ecc71);transition:width .1s linear,background .3s ease}
      @keyframes lsPulse{0%,100%{box-shadow:0 0 4px rgba(241,196,15,.2)}50%{box-shadow:0 0 12px rgba(241,196,15,.5)}}
      @keyframes cardReady{0%,100%{box-shadow:0 0 4px rgba(46,204,113,.3)}50%{box-shadow:0 0 14px rgba(46,204,113,.6)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
      @keyframes playCardIn{from{opacity:0;transform:translateY(-40px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
      .quiz-progress{text-align:center;font-size:13px;color:var(--mt);margin-bottom:12px}
      .domain-card{padding:4px 8px;border-radius:5px;font-size:10px;font-weight:700;border:2px solid;flex-shrink:0}
      .domain-label{font-size:7px;opacity:.7}
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
      this.renderDomainEffects();
    } catch (e) {
      console.error('[updateAllDisplay] error:', e.message, e.stack);
    }
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
    console.log('[renderHand] selfHand element:', selfHand, 'cards:', gs.players[0].hand?.length);

    // 己方手牌
    if (selfHand) {
      const cards = gs.players[0].hand || [];
      let html = '';
      if (cards.length === 0) {
        html = '<div class="empty-state"><span class="empty-icon">🃏</span>暂无手牌</div>';
      } else {
        for (const card of cards) {
          const cpResult = this.phase === 'play' && this.engine.canPlay
            ? this.engine.canPlay(0, card)
            : { can: false };
          const isPlayable = cpResult.can;
          const style = this.getDomainStyle(card.domain);
          const isSelected = this.selectedCard && this.selectedCard.id === card.id;
          const emoji = { attack:'⚔️', support:'✨', domain:'🏛️', summon:'👾', phase:'🌀' }[card.type] || '🃏';
          html += `
            <div class="card small ${isPlayable ? 'playable' : ''} ${isSelected ? 'selected' : ''}"
                 data-card-id="${this._escapeAttr(card.id)}"
                 style="border-left-color:${style.color}; border:3px solid ${isPlayable ? '#2ecc71' : '#555'}; background:#1a1a2e;">
              <span class="card-cost" style="background:${style.bg};top:4px;left:4px;width:20px;height:20px;font-size:10px;">${card.cost ?? '?'}</span>
              <span class="card-name" style="color:#fff;font-size:11px;font-weight:900;padding:26px 2px 2px;line-height:1.1;">${this._escapeHtml(card.name)}</span>
              <span class="card-type" style="font-size:8px;">${emoji} ${this.getTypeLabel(card.type)}</span>
              <span class="card-desc">${this._escapeHtml(String(card.description || '').substring(0, 16))}</span>
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
          html += `
            <div class="card play-card small" style="border-left-color:${style.color}">
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
          html += `
            <div class="card play-card small" style="border-left-color:${style.color}">
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
      // 召唤物
      const summons = gs.players[0].fieldSummons || [];
      for (const s of summons) {
        const hpPct = s.maxHp > 0 ? (s.hp / s.maxHp * 100) : 0;
        html += `
          <div class="card summon-card small" data-summon-id="${this._escapeAttr(s.id)}">
            <span class="card-name">${this._escapeHtml(s.name)}</span>
            <div class="summon-hp">
              <div class="summon-hp-fill" style="width:${hpPct}%"></div>
              <span>${s.hp}/${s.maxHp}</span>
            </div>
          </div>
        `;
      }
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
      const summons = gs.players[1].fieldSummons || [];
      for (let i = 0; i < summons.length; i++) {
        const s = summons[i];
        const hpPct = s.maxHp > 0 ? (s.hp / s.maxHp * 100) : 0;
        html += `
          <div class="card summon-card enemy small"
               data-summon-index="${i}"
               data-summon-id="${this._escapeAttr(s.id)}">
            <span class="card-name">${this._escapeHtml(s.name)}</span>
            <div class="summon-hp">
              <div class="summon-hp-fill" style="width:${hpPct}%"></div>
              <span>${s.hp}/${s.maxHp}</span>
            </div>
          </div>
        `;
      }
      // 驻场辅助卡
      const oppSupports = gs.players[1].fieldSupports || [];
      for (const sup of oppSupports) {
        const style = this.getDomainStyle(sup.domain);
        html += `<div class="card support-card small" style="border-left-color:${style.color}"><span class="card-name">${this._escapeHtml(sup.name)}</span><span class="card-type">辅助·${sup.turns}回合</span></div>`;
      }
      oppField.innerHTML = html || '<div class="empty-state"><span class="empty-icon">🏟️</span>对方场上暂无卡牌</div>';
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
      btnEnd.addEventListener('click', () => this.endPlayerTurn());
    }

    // 战斗记录抽屉toggle
    const logToggle = document.getElementById('log-drawer-toggle');
    const logDrawer = document.getElementById('log-drawer');
    const logDrawerClose = document.getElementById('log-drawer-close');
    if (logToggle && logDrawer) {
      logToggle.addEventListener('click', () => {
        logDrawer.classList.toggle('open');
      });
      logDrawerClose?.addEventListener('click', () => {
        logDrawer.classList.remove('open');
      });
    }

    // 己方手牌点击（事件代理）
    const selfHand = document.getElementById('self-hand');
    if (selfHand) {
      selfHand.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        if (cardId) this.handleCardSelect(cardId);
      });
    }

    // 对方召唤物点击（选择攻击目标 / 放大查看）
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
          const nameEl = cardEl.querySelector('.card-name');
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
          if (e.target.closest('.summon-card')) return;
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
          const nameEl = cardEl.querySelector('.card-name');
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
          const nameEl = cardEl.querySelector('.card-name');
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
        const cardEl = e.target.closest('.card.small');
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
          const nameEl = cardEl.querySelector('.card-name');
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
        const cardEl = e.target.closest('.card.small');
        if (cardEl === hoverCardEl) {
          // 检查鼠标是否真的离开了卡牌（不是移到子元素）
          if (!cardEl.contains(e.relatedTarget)) {
            this._hideHoverTooltip();
            hoverCardEl = null;
          }
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
    console.log('[playSelectedCard] adding to playZoneSelf:', this.selectedCard.name, this.selectedCard.id);
    this.playZoneSelf.push({
      id: this.selectedCard.id,
      name: this.selectedCard.name,
      type: this.selectedCard.type,
      domain: this.selectedCard.domain,
      cost: this.selectedCard.cost
    });

    // 显示效果日志
    if (result.effects && Array.isArray(result.effects)) {
      const msgs = this._formatEffects(result.effects);
      for (const msg of msgs) {
        this.addLogMessage(msg);
      }
    }

    this.selectedCard = null;
    this.updateAllDisplay();

    // 检查游戏是否结束
    if (this.engine.isGameOver && this.engine.isGameOver()) {
      this.showGameOver();
    }
  }

  _clearAutoPlayTimeout() {
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout);
      this.autoPlayTimeout = null;
    }
  }

  endPlayerTurn() {
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
  }

  showDiscardScreen() {
    const gs = this.engine?.getGameState();
    if (!gs || !gs.players[0].hand) return;

    const toDiscard = gs.players[0].hand.length - 5;
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
        <h3>手牌超过5张，请选择 <span style="color:#e74c3c;font-size:20px;">${toDiscard}</span> 张弃掉</h3>
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

    // 倒计时
    const countdownEl = document.getElementById('discard-countdown');
    this.discardTimer = setInterval(() => {
      discardSeconds--;
      if (countdownEl) countdownEl.textContent = discardSeconds;
      if (discardSeconds <= 2 && countdownEl) {
        countdownEl.style.color = '#e74c3c';
        countdownEl.style.fontWeight = '900';
      }
      if (discardSeconds <= 0) {
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
    if (gs && gs.players[0].hand.length > 5) {
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
    this.runAITurn();
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

    try {
      this.addLogMessage('AI正在思考...');

      // AI自动处理拉普拉斯妖窥牌（按伤害降序排列）
      this._autoScryAI();

      // ─── AI 阶段 1: 答题 ───
      const quiz = this.ai.simulateQuiz();
      this.engine.setQuizResult(quiz.correct, quiz.total);
      if (this.engine.isGameOver && this.engine.isGameOver()) {
        this.showGameOver();
        this.phase = 'gameover';
        return;
      }

      // ─── AI 阶段 2: 逐张出牌（含光速传播反制） ───
      const self = this.engine.players[1];
      if (!self.turnBlocked) {
        this.ai.pendingDecisions = null; // 重置决策队列

        const delay = this.ai.getThinkDelay();
        await this.ai._sleep(delay);

        while (!this.engine.gameOver) {
          // 获取AI下一张牌决策
          const decision = this.ai.getNextPlayDecision();
          if (!decision) break;

          // AI 出牌 & 即时结算卡牌效果
          this.engine.playCard(this.ai.aiIdx, decision.cardId, decision.target || 'player');

          // 添加到AI出牌展示区
          const aiCard = this.engine.getCardById(decision.cardId);
          if (aiCard) {
            this.playZoneAi.push({
              id: aiCard.id, name: aiCard.name, type: aiCard.type,
              domain: aiCard.domain, cost: aiCard.cost
            });
          }

          this.updateAllDisplay();

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
          const result = this.engine.playInOpponentTurn(0, card.id, 'player');
          if (result && result.success) {
            this.addLogMessage(`[光速传播] 在AI回合打出「${card.name}」（费用+3）`);
            // 添加到出牌展示区
            this.playZoneSelf.push({
              id: card.id, name: card.name, type: card.type,
              domain: card.domain, cost: card.cost
            });
            this.updateAllDisplay();
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
    this.updateAllDisplay(); // Bug修复：AI回合结束后刷新界面
    this.showQuizPhase();
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
      '力': { color: '#E74C3C', bg: '#E74C3C' },
      '声': { color: '#3498DB', bg: '#3498DB' },
      '光': { color: '#F1C40F', bg: '#F1C40F' },
      '热': { color: '#E67E22', bg: '#E67E22' },
      '电': { color: '#9B59B6', bg: '#9B59B6' }
    };
    return styles[d] || { color: '#999', bg: '#999' };
  }

  /** V3 领域 class：domain-force/domain-sound/... */
  _domainClass(domain) {
    if (!domain) return 'domain-force';
    const d = Array.isArray(domain) ? domain[0] : domain;
    const map = { '力':'domain-force','声':'domain-sound','光':'domain-light','热':'domain-heat','电':'domain-elec' };
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
    const style = this.getDomainStyle(cardData.domain);
    const domainLabel = this.getDomainLabel(cardData.domain);
    const typeLabel = this.getTypeLabel(cardData.type);
    const emoji = { attack:'⚔️', support:'✨', domain:'🏛️', summon:'👾', phase:'🌀' }[cardData.type] || '🃏';
    const hpText = cardData.hp !== undefined
      ? `<span style="color:#e74c3c;">❤️ ${cardData.hp}/${cardData.maxHp}</span>&nbsp;` : '';
    const turnText = cardData.turns ? `<span>⏱ ${cardData.turns}回合</span>` : '';

    return `
      <div class="tt-header">
        <span class="tt-cost" style="background:${style.bg}">${cardData.cost ?? '-'}</span>
        <span class="tt-name" style="color:${style.color}">${this._escapeHtml(cardData.name)}</span>
        ${hpText}
      </div>
      <div class="tt-meta">
        <span>${emoji} ${typeLabel}</span>
        <span style="background:${style.color}; color:#fff;">${domainLabel}</span>
        ${turnText}
      </div>
      <div class="tt-desc">${this._escapeHtml(String(cardData.description || '暂无描述'))}</div>
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

    // 定位：手牌和己方场地在上方显示，对方场地在下方显示
    const isTopArea = cardEl.closest('#opponent-area') || cardEl.closest('.opponent-field') || cardEl.closest('#opp-field');
    const tooltipH = tooltip.offsetHeight;
    const gap = 12;

    let top, left;
    if (isTopArea) {
      // 对方区域 → tooltip在卡片下方
      top = rect.bottom + gap;
      tooltip.classList.add('arrow-down');
    } else {
      // 己方 / 手牌区域 → tooltip在卡片上方
      top = rect.top - tooltipH - gap;
      tooltip.classList.add('arrow-up');
    }

    // 水平居中于卡片
    left = rect.left + rect.width / 2 - 90; // 90 = tooltip宽度180的一半

    // 边界修正
    if (top < 8) top = 8;
    if (top + tooltipH > window.innerHeight - 8) top = window.innerHeight - tooltipH - 8;
    if (left < 8) left = 8;
    if (left + 180 > window.innerWidth - 8) left = window.innerWidth - 188;

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
        case 'temperature_rise': msgs.push(`🌡 灼烧伤害提升至36/层（持续3回合）`); break;
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

    overlay.innerHTML = `
      <div class="card-v3 ${this._domainClass(cardData.domain)} skin-cyber" style="width:280px; min-height:auto; height:auto; display:flex; flex-direction:column; margin:auto;">
        <div class="v3-cost">${cardData.cost ?? '-'}</div>
        <div class="v3-name">${this._escapeHtml(cardData.name)}</div>
        <div class="v3-art" style="height:160px;">
          ${cardData._artUrl ? `<img src="${this._escapeAttr(cardData._artUrl)}" alt="${this._escapeAttr(cardData.name)}">` : `<span style="font-size:36px; opacity:.1;">⚛</span>`}
        </div>
        <div class="v3-type"><span>${emoji} ${typeLabel}</span></div>
        <div class="v3-desc-effect">${summary}</div>
        ${principle ? `<div class="v3-desc-principle"><span class="lbl">原理：</span>${principle}</div>` : ''}
        ${formula ? `<div class="v3-formula">${formula}</div>` : ''}
        ${hpText ? `<div style="padding:2px 8px 4px; font-size:10px; color:#aaa;">${hpText}</div>` : ''}
        <div class="v3-rarity-bar"></div>
        <span class="skin-badge">赛博朋克</span>
        <div style="padding:6px 8px; display:flex; gap:8px; border-top:1px solid rgba(255,255,255,.06);">
          <button class="btn btn-close" id="btn-zoom-close" style="flex:1; font-size:12px; padding:6px;">✕ 关闭</button>
          ${canPlayIt ? `<button class="btn btn-play" id="btn-zoom-play" style="flex:1; font-size:12px; padding:6px;">⚔️ 打出此卡</button>` : ''}
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
      if (dialog && dialog.contains(e.target)) return;
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

document.addEventListener('DOMContentLoaded', () => {
  try {
    const container = document.getElementById('game-container');
    if (!container) {
      console.warn('GameUI: #game-container not found, UI not started');
      return;
    }
    const ui = new GameUI('game-container');
    ui.init();

    // 挂载到window方便调试
    window.__gameUI = ui;
  } catch (err) {
    console.error('GameUI initialization failed:', err);
  }
});
