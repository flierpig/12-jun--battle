// --- 全局状态变量 ---
let player = null, enemy = null;
let floor = 1, stage = 1, gold = 0;
let bossPool = [];
let turn = 1, battleTimer = null;
let speedMode = 1; 
let duckJunEncountered = false;
let duckJunDefeatedThisRound = false;
let pDodges = 0, pHitsTaken = 0, pCrits = 0, ePoisonTicks = 0;
let ultUsedThisFloor = false;
let battleActive = false;

// 联动特殊变量
let ownedItems = []; 
let sosoDanceInterval = 3; let hasSosoUltItem = false; let zhougeSelfDmgStreak = 0; let zhougeUltActive = false; 
let fastFood15Active = false; let hasFushunItem = false; let fushunBattles = 0; let fushunPermanent = false; let fushunLastImmuneTurn = -99;

// --- 镇镇之力系统变量 ---
let currentZhenZhen = '';
let zhenZhenUnlocked = false;
let zhenZhenUsedThisFloor = false;
let badRngCount = 0;
let luckZhenZhenActive = false, critZhenZhenActive = false, immortalZhenZhenActive = false, overloadZhenZhenActive = false;
let overloadAtkBonus = 0, overloadHpBonus = 0;

// --- 尔波·波纹系统变量 ---
let currentRipple = null;          // 当前持有的波纹: 'er'|'water'|'fire'|'wood'|'metal'|'earth'|null
let rippleHitsTaken = 0;          // 无波纹时已受伤害次数
let fireBurnActive = false;       // 火波纹灼烧状态
let woodImmuneActive = false;     // 木波纹免疫标志
let earthDebuffTurns = 0;         // 土波纹减攻剩余回合
let earthDebuffAtkSaved = 0;      // 土波纹减攻保存的原始ATK差值

const show = (id) => document.getElementById(id).classList.remove('hidden');
const hide = (id) => document.getElementById(id).classList.add('hidden');

// --- 存档系统 ---
const SAVE_KEY = 'treasure_hunt_save';

function saveGame() {
    if (!player || !battleActive) {
        let saveData = {
            player: JSON.parse(JSON.stringify(player)),
            floor, stage, gold,
            bossPool: [...bossPool],
            duckJunEncountered, ultUsedThisFloor,
            ownedItems: ownedItems.map(i => ({ id: i.id, name: i.name, icon: i.icon, desc: i.desc, isUnique: i.isUnique, isFf: i.isFf, isSoso: i.isSoso })),
            sosoDanceInterval, hasSosoUltItem, zhougeSelfDmgStreak, zhougeUltActive,
            fastFood15Active, hasFushunItem, fushunBattles, fushunPermanent, fushunLastImmuneTurn,
            currentZhenZhen, zhenZhenUnlocked, zhenZhenUsedThisFloor, badRngCount,
            luckZhenZhenActive, critZhenZhenActive, immortalZhenZhenActive, overloadZhenZhenActive,
            overloadAtkBonus, overloadHpBonus,
            currentRipple, rippleHitsTaken, fireBurnActive, woodImmuneActive, earthDebuffTurns, earthDebuffAtkSaved
        };
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)); }
        catch(e) { console.warn('存档失败:', e); }
    }
}

function hasSave() {
    try { return localStorage.getItem(SAVE_KEY) !== null; }
    catch(e) { return false; }
}

function loadGame() {
    try {
        let raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        let data = JSON.parse(raw);
        player = data.player; floor = data.floor; stage = data.stage; gold = data.gold;
        bossPool = data.bossPool; duckJunEncountered = data.duckJunEncountered;
        ultUsedThisFloor = data.ultUsedThisFloor; ownedItems = data.ownedItems || [];
        sosoDanceInterval = data.sosoDanceInterval; hasSosoUltItem = data.hasSosoUltItem;
        zhougeSelfDmgStreak = data.zhougeSelfDmgStreak; zhougeUltActive = data.zhougeUltActive;
        fastFood15Active = data.fastFood15Active; hasFushunItem = data.hasFushunItem;
        fushunBattles = data.fushunBattles; fushunPermanent = data.fushunPermanent;
        fushunLastImmuneTurn = data.fushunLastImmuneTurn;
        currentZhenZhen = data.currentZhenZhen; zhenZhenUnlocked = data.zhenZhenUnlocked;
        zhenZhenUsedThisFloor = data.zhenZhenUsedThisFloor; badRngCount = data.badRngCount || 0;
        luckZhenZhenActive = data.luckZhenZhenActive || false;
        critZhenZhenActive = data.critZhenZhenActive || false;
        immortalZhenZhenActive = data.immortalZhenZhenActive || false;
        overloadZhenZhenActive = data.overloadZhenZhenActive || false;
        overloadAtkBonus = data.overloadAtkBonus || 0; overloadHpBonus = data.overloadHpBonus || 0;
        currentRipple = data.currentRipple || null; rippleHitsTaken = data.rippleHitsTaken || 0;
        fireBurnActive = data.fireBurnActive || false; woodImmuneActive = data.woodImmuneActive || false;
        earthDebuffTurns = data.earthDebuffTurns || 0; earthDebuffAtkSaved = data.earthDebuffAtkSaved || 0;
        return true;
    } catch(e) { console.warn('读档失败:', e); return false; }
}

function deleteSave() {
    try { localStorage.removeItem(SAVE_KEY); }
    catch(e) { console.warn('删除存档失败:', e); }
}

// --- 初始化与图鉴构建 ---
window.onload = () => {
    let continueArea = document.getElementById('continue-area');
    if (hasSave()) {
        continueArea.classList.remove('hidden');
        document.getElementById('btn-continue').onclick = () => {
            if (loadGame()) {
                hide('selection-screen'); show('top-bar');
                let mainTitle = document.getElementById('main-title');
                let subTitle = document.getElementById('sub-title');
                if (mainTitle) mainTitle.classList.add('hidden');
                if (subTitle) subTitle.classList.add('hidden');
                updateTopBar(); prepareEncounter();
            }
        };
        document.getElementById('btn-delete-save').onclick = () => {
            if (confirm('确定要删除存档吗？此操作不可撤销。')) {
                deleteSave(); continueArea.classList.add('hidden');
            }
        };
    } else {
        continueArea.classList.add('hidden');
    }

    const grid = document.getElementById('char-grid');
    for(let key in baseCharData) {
        let c = baseCharData[key];
        let card = document.createElement('div');
        card.className = 'char-card';
        let badgeHtml = c.badge ? `<div class="collab-badge ${c.badge}">${c.badgeTxt}</div>` : '';
        card.innerHTML = `${badgeHtml}<div class="char-icon">${c.icon}</div><div class="char-name">${c.name}</div><div class="char-desc">${c.desc}</div><div class="char-ult">${c.ultDesc}</div>`;
        card.onclick = () => { deleteSave(); initGame(key); };
        grid.appendChild(card);
    }
    buildPokedex();
};

function buildPokedex() {
    // ===== 寻宝人图鉴 =====
    let charDiv = document.getElementById('dex-chars');
    for(let k in baseCharData) {
        let c = baseCharData[k];
        let specialStats = [];
        if(c.crit) specialStats.push(`暴击 ${c.crit}%`);
        if(c.lifesteal) specialStats.push(`吸血 ${c.lifesteal}%`);
        if(c.dodge) specialStats.push(`闪避 ${c.dodge}%`);
        let specialStr = specialStats.length > 0 ? ` | <span style="color:#f472b6;">${specialStats.join(' / ')}</span>` : '';
        let badgeHtml = c.badge ? `<span class="collab-badge ${c.badge}" style="position:static; display:inline-block; margin-left:6px;">${c.badgeTxt}</span>` : '';
        charDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left;">
            <div style="font-size:24px; margin-bottom:6px;">${c.icon} <span class="char-name">${c.name}</span>${badgeHtml}</div>
            <div class="char-desc" style="margin-top:8px; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px;">
                <b>属性:</b> HP ${c.maxHp} | ATK ${c.atk} | 速度 ${c.speed}${specialStr}
            </div>
            <div class="char-desc" style="margin-top:6px; color:#fbbf24;">🎯 <b>天赋:</b> ${c.desc}</div>
            <div class="char-ult" style="color:#c4b5fd;">🌟 <b>终结技:</b> ${c.ultDesc}</div>
        </div>`;
    }

    // ===== 怪物图鉴 =====
    let mobDiv = document.getElementById('dex-mobs');
    
    // 普通怪物
    mobDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--text-main); font-size:16px; font-weight:bold; margin-top:10px; border-bottom:1px solid var(--border); padding-bottom:5px;">📌 普通怪物 (8种)</div>`;
    mobTemplates.forEach(m => {
        mobDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left;">
            <div style="font-size:24px;">${m.icon} <span class="char-name">${m.name}</span></div>
            <div class="char-desc" style="margin-top:8px; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px;">
                <b>属性:</b> HP ${m.maxHp} | ATK ${m.atk} | 速度 ${m.speed}
            </div>
            <div class="char-desc" style="margin-top:6px;">📝 ${m.desc}</div>
        </div>`;
    });

    // 楼层Boss
    mobDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--text-main); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--border); padding-bottom:5px;">👑 楼层Boss</div>`;
    mobDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--ult);">
        <div style="font-size:24px;">👑 <span class="char-name" style="color:var(--ult);">楼层守卫</span></div>
        <div class="char-desc" style="margin-top:8px; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px;">
            <b>出现:</b> 每层第4节点 | <b>属性:</b> 随机未选中的寻宝人，按层数缩放 (HP×1.6, ATK×1.3)
        </div>
        <div class="char-desc" style="margin-top:6px;">📝 守卫拥有对应角色的全部天赋和终结技，是每层最大的挑战</div>
    </div>`;

    // 隐藏Boss
    mobDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--duck); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--duck); padding-bottom:5px;">🦆 隐藏Boss</div>`;
    mobDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--duck); background:linear-gradient(180deg, #164e63, #083344);">
        <div style="font-size:24px;">🦆 <span class="char-name" style="color:var(--duck);">鸭俊</span> <span style="color:#38bdf8;font-size:10px;font-weight:bold;">[隐藏]</span></div>
        <div class="char-desc" style="margin-top:8px; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px;">
            <b>属性:</b> HP 350(基础) | ATK 25 | 速度 20 | 暴击 10% | 吸血 15% | 闪避 10%
        </div>
        <div class="char-desc" style="margin-top:6px; color:var(--duck);">📝 <b>出现条件:</b> 第2层起，每场普通战斗有10%概率遭遇。伤害随回合递增5%/回合。击败后必掉唯一神器「鸭俊板板」</div>
    </div>`;

    // 最终Boss
    mobDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--atk); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--atk); padding-bottom:5px;">👑 最终Boss</div>`;
    mobDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--atk); background:linear-gradient(180deg, #7f1d1d, #450a0a);">
        <div style="font-size:24px;">👑 <span class="char-name" style="color:var(--atk);">俊俊鸡谭</span> <span style="color:#ef4444;font-size:10px;font-weight:bold;">[终级]</span></div>
        <div class="char-desc" style="margin-top:8px; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px;">
            <b>属性:</b> HP 1600 | ATK 75 | 速度 50 | 暴击 15% | 吸血 10% | 闪避 5%
        </div>
        <div class="char-desc" style="margin-top:6px; color:var(--atk);">📝 <b>出现:</b> 第12层第4节点（最终战）。每4回合恢复150HP，伤害随回合递增8%/回合。击败即通关！</div>
    </div>`;

    // ===== 道具/系统图鉴 =====
    let itemDiv = document.getElementById('dex-items');
    
    // 镇镇之力
    itemDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--zhen); font-size:16px; font-weight:bold; margin-top:10px; border-bottom:1px solid var(--zhen); padding-bottom:5px;">🌌 镇镇之力系统 (5种)</div>`;
    for(let k in zhenZhenData) {
        let z = zhenZhenData[k];
        itemDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--zhen);">
            <div style="font-size:20px;">${z.icon} <span class="char-name" style="color:var(--zhen);">${z.name}</span></div>
            <div class="char-desc" style="margin-top:5px; white-space: pre-wrap;">${z.desc}</div>
        </div>`;
    }

    // 尔波波纹系统
    itemDiv.innerHTML += `<div style="grid-column:1/-1; color:#38bdf8; font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid #38bdf8; padding-bottom:5px;">🌊 尔波·波纹系统 (6种) — 无波纹时受击3次随机收集</div>`;
    for(let k in rippleData) {
        let r = rippleData[k];
        itemDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:${r.color};">
            <div style="font-size:20px;">${r.icon} <span class="char-name" style="color:${r.color};">${r.name}</span></div>
            <div class="char-desc" style="margin-top:5px;">${r.desc}</div>
        </div>`;
    }

    // 特殊道具
    itemDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--gold); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--gold); padding-bottom:5px;">✨ 特殊道具 (3种)</div>`;
    specialItems.forEach(i => {
        let tag = '';
        if(i.isSoso) tag = '<span style="color:#ec4899;font-size:10px;font-weight:bold;">[soso联动] </span>';
        if(i.isFf) tag = '<span style="color:#eab308;font-size:10px;font-weight:bold;">[快餐联动] </span>';
        if(!i.isSoso && !i.isFf && i.isUnique) tag = '<span style="color:#38bdf8;font-size:10px;font-weight:bold;">[唯一] </span>';
        itemDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--duck);">
            <div style="font-size:20px;">${i.icon} <span class="char-name">${tag}${i.name}</span></div>
            <div class="char-desc" style="margin-top:5px;">${i.desc}</div>
        </div>`;
    });

    // 战斗掉落
    itemDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--text-main); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--border); padding-bottom:5px;">🎁 战斗掉落道具 (8种)</div>`;
    rewardPool.forEach(i => {
        let tag = i.isUnique ? '<span style="color:#38bdf8;font-size:10px;font-weight:bold;">[唯一] </span>' : '<span style="color:#10b981;font-size:10px;font-weight:bold;">[可重复] </span>';
        if(i.isSoso) tag = '<span style="color:#ec4899;font-size:10px;font-weight:bold;">[soso联动] </span>';
        if(i.isFf) tag = '<span style="color:#eab308;font-size:10px;font-weight:bold;">[快餐联动] </span>';
        itemDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left;">
            <div style="font-size:20px;">${i.icon} <span class="char-name">${tag}${i.name}</span></div>
            <div class="char-desc" style="margin-top:5px;">${i.desc}</div>
        </div>`;
    });

    // 商店道具
    itemDiv.innerHTML += `<div style="grid-column:1/-1; color:var(--gold); font-size:16px; font-weight:bold; margin-top:15px; border-bottom:1px solid var(--gold); padding-bottom:5px;">🏪 商店道具 (8种) — 每层通关后营地购买</div>`;
    shopPool.forEach(i => {
        let tag = i.isUnique ? '<span style="color:#38bdf8;font-size:10px;font-weight:bold;">[唯一] </span>' : '<span style="color:#10b981;font-size:10px;font-weight:bold;">[可重复] </span>';
        if(i.isSoso) tag = '<span style="color:#ec4899;font-size:10px;font-weight:bold;">[soso联动] </span>';
        if(i.isFf) tag = '<span style="color:#eab308;font-size:10px;font-weight:bold;">[快餐联动] </span>';
        itemDiv.innerHTML += `<div class="char-card" style="cursor:default; text-align:left; border-color:var(--gold);">
            <div style="font-size:20px;">${i.icon} <span class="char-name">${tag}${i.name}</span> <span style="color:var(--gold); font-size:12px;">🪙${i.cost}</span></div>
            <div class="char-desc" style="margin-top:5px;">${i.desc}</div>
        </div>`;
    });
}

function openPokedex() { show('modal-pokedex'); }
function closePokedex() { hide('modal-pokedex'); }
function switchDexTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.pokedex-list').forEach(div => div.classList.add('hidden'));
    show(tabId);
    // 高亮当前点击的按钮
    let btns = document.querySelectorAll('.tab-btn');
    let tabMap = { 'dex-chars': 0, 'dex-mobs': 1, 'dex-items': 2 };
    if (tabMap[tabId] !== undefined) btns[tabMap[tabId]].classList.add('active');
}
function openInventory() { 
    show('modal-inventory'); let c = document.getElementById('inv-container'); c.innerHTML = '';
    if(ownedItems.length === 0) { c.innerHTML = '<p style="color:#94a3b8; grid-column: 1/-1;">背包空空如也...</p>'; return; }
    ownedItems.forEach(item => { c.innerHTML += `<div class="inv-item"><div style="font-size:24px;">${item.icon}</div><h4>${item.name}</h4><p>${item.desc}</p></div>`; });
}
function closeInventory() { hide('modal-inventory'); }

// --- 游戏主循环逻辑 ---
function initGame(playerKey) {
    player = JSON.parse(JSON.stringify(baseCharData[playerKey]));
    gold = 10; ultUsedThisFloor = false; duckJunEncountered = false;
    
    // 初始化镇镇之力
    let zzPool = ['luck', 'crit', 'immortal', 'overload', 'random'];
    currentZhenZhen = zzPool[Math.floor(Math.random() * zzPool.length)];
    zhenZhenUnlocked = false; zhenZhenUsedThisFloor = false; badRngCount = 0;
    
    ownedItems = []; sosoDanceInterval = 3; hasSosoUltItem = false; zhougeSelfDmgStreak = 0; zhougeUltActive = false; 
    fastFood15Active = false; hasFushunItem = false; fushunBattles = 0; fushunPermanent = false; fushunLastImmuneTurn = -99;
    currentRipple = null; rippleHitsTaken = 0; fireBurnActive = false; woodImmuneActive = false; earthDebuffTurns = 0; earthDebuffAtkSaved = 0;

    bossPool = Object.keys(baseCharData).filter(k => k !== playerKey);
    bossPool.sort(() => Math.random() - 0.5);
    
    hide('selection-screen'); show('top-bar');
    let mainTitle = document.getElementById('main-title'); let subTitle = document.getElementById('sub-title');
    if(mainTitle) mainTitle.classList.add('hidden'); if(subTitle) subTitle.classList.add('hidden');

    updateTopBar(); prepareEncounter();
}

function updateTopBar() {
    document.getElementById('ui-floor').innerText = `${floor}/12`;
    document.getElementById('ui-stage').innerText = `${stage}/4`;
    document.getElementById('ui-hp').innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
    document.getElementById('ui-atk').innerText = player.atk;
    document.getElementById('ui-gold').innerText = gold;
    document.getElementById('ui-crit').innerText = player.crit;
    document.getElementById('ui-life').innerText = player.lifesteal;
    document.getElementById('ui-dodge').innerText = player.dodge;
}

function prepareEncounter() {
    show('map-screen'); hide('battle-screen'); hide('reward-screen'); hide('shop-screen');
    let scale = 1 + (floor - 1) * 0.5 + (stage * 0.1); duckJunDefeatedThisRound = false;

    if(floor === 12 && stage === 4) {
        document.getElementById('map-title').innerText = "⚠️ 最终寻宝地 ⚠️"; document.getElementById('map-desc').innerText = "终极缝合怪【俊俊鸡谭】守护着最后的宝藏！";
        enemy = { id: 'final', icon: '👑', name: '俊俊鸡谭', hp: 1600, maxHp: 1600, atk: 75, speed: 50, crit: 15, lifesteal: 10, dodge: 5 };
    } else if (stage === 4) {
        let baseBoss = baseCharData[bossPool[floor - 1]];
        document.getElementById('map-title').innerText = "🔥 首领阻击 🔥"; document.getElementById('map-desc').innerText = `本层守卫：${baseBoss.name}！`;
        enemy = JSON.parse(JSON.stringify(baseBoss)); enemy.maxHp = Math.floor(enemy.maxHp * scale * 1.6); enemy.hp = enemy.maxHp; enemy.atk = Math.floor(enemy.atk * scale * 1.3);
    } else {
        if (floor >= 2 && !duckJunEncountered && Math.random() < 0.10) {
            duckJunEncountered = true;
            document.getElementById('map-title').innerText = "🦆 隐藏遭遇 🦆"; document.getElementById('map-title').style.color = "var(--duck)";
            document.getElementById('map-desc').innerHTML = "传说中的梦魇<span style='color:var(--duck); font-weight:bold;'>【鸭俊】</span>出现了！";
            enemy = { id: 'duck', icon: '🦆', name: '鸭俊', hp: 350, maxHp: 350, atk: 25, speed: 20, lifesteal: 15, dodge: 10, crit: 10 };
            enemy.maxHp = Math.floor(enemy.maxHp * scale * 1.3); enemy.hp = enemy.maxHp; enemy.atk = Math.floor(enemy.atk * scale);
        } else {
            let mobTemp = mobTemplates[Math.floor(Math.random() * mobTemplates.length)];
            document.getElementById('map-title').innerText = "⚔️ 遭遇战"; document.getElementById('map-title').style.color = "var(--text-main)"; document.getElementById('map-desc').innerText = `野生的 [${mobTemp.name}] 正在游荡。`;
            enemy = JSON.parse(JSON.stringify(mobTemp)); enemy.id = 'mob';
            enemy.maxHp = Math.floor(enemy.maxHp * scale); enemy.hp = enemy.maxHp; enemy.atk = Math.floor(enemy.atk * scale);
        }
    }
    if(player.id === 'erbo') {
        if(currentRipple) {
            let rd = rippleData[currentRipple];
            document.getElementById('map-ult-status').innerHTML = `<span style="color:${rd.color};">🌊 波纹已收集：${rd.icon} ${rd.name}</span>`;
        } else {
            document.getElementById('map-ult-status').innerText = `🌊 波纹收集进度：${rippleHitsTaken}/3 次受击`;
        }
    } else {
        document.getElementById('map-ult-status').innerText = ultUsedThisFloor ? "⚠️ 终结技本层已耗尽" : "✨ 终结技：准备就绪";
    }
}

function toggleSpeed() { speedMode = speedMode === 1 ? 2 : 1; document.getElementById('speed-btn').innerText = speedMode === 1 ? "⏩ 1倍速" : "⚡ 2倍速"; }

function startCombat() {
    hide('map-screen'); show('battle-screen'); hide('battle-end-btn');
    document.getElementById('log-box').innerHTML = '';
    
    // 确保战斗开始时无残留buff
    endCombatCleanup();

    turn = 1; battleActive = true;
    pDodges = 0; pHitsTaken = 0; pCrits = 0; ePoisonTicks = 0;
    player.poison = 0; enemy.poison = 0; player.pigHealed = false; 
    player.activeDodgeDance = false; player.activeCritDance = false;
    enemy.activeDodgeDance = false; enemy.activeCritDance = false;
    // 重置波纹战斗状态（波纹本身保留）
    rippleHitsTaken = 0; fireBurnActive = false; woodImmuneActive = false;
    earthDebuffTurns = 0; earthDebuffAtkSaved = 0;
    
    if (hasFushunItem && fushunBattles > 0) { fushunBattles--; if (fushunBattles === 0) fushunPermanent = true; }

    updateBattleUI(); checkUltReady(); checkZhenZhenBtn();
    if(enemy.id === 'duck') log(`<span class="log-duck">🦆 【警告】隐藏强敌 鸭俊 散发着恐怖的气息！</span>`);
    else log(`<span class="log-skill">【开战】</span> 寻宝战斗开始！`);
    battleTimer = setTimeout(battleTick, speedMode === 1 ? 1200 : 600);
}

// --- 镇镇之力核心系统 ---
function unlockZhenZhen() {
    zhenZhenUnlocked = true;
    let zzInfo = zhenZhenData[currentZhenZhen];
    log(`<div style="border: 1px solid var(--zhen); padding: 5px; margin: 5px 0; border-radius: 5px; background: rgba(59, 130, 246, 0.1);">
        <span class="log-zhen">🎉 【系统提示】条件达成！</span><br>
        你的专属隐藏能力 <b>${zzInfo.icon} ${zzInfo.name}</b> 已永久觉醒！
    </div>`);
    checkZhenZhenBtn();
}

function trackBadRng() {
    if(currentZhenZhen === 'luck' && !zhenZhenUnlocked) {
        badRngCount++;
        if(badRngCount >= 3) unlockZhenZhen();
    }
}

function checkZhenZhenBtn() {
    let btn = document.getElementById('zhen-btn');
    if (!zhenZhenUnlocked) {
        btn.className = ''; btn.disabled = true; btn.innerText = "❓ 镇镇之力 (隐藏条件未达成)";
    } else if (zhenZhenUsedThisFloor) {
        btn.className = ''; btn.disabled = true; btn.innerText = `⏳ ${zhenZhenData[currentZhenZhen].name} (本层已用)`;
    } else if (battleActive) {
        btn.className = 'zhen-btn-ready'; btn.disabled = false; btn.innerText = `🌌 激活：${zhenZhenData[currentZhenZhen].name} 🌌`;
    } else {
        btn.className = ''; btn.disabled = true; btn.innerText = `🌌 ${zhenZhenData[currentZhenZhen].name} (战斗中可用)`;
    }
}

function castZhenZhen() {
    if(!zhenZhenUnlocked || zhenZhenUsedThisFloor || !battleActive) return;
    zhenZhenUsedThisFloor = true;
    
    let powerId = currentZhenZhen;
    if(powerId === 'random') {
        let others = ['luck', 'crit', 'immortal', 'overload'];
        powerId = others[Math.floor(Math.random() * others.length)];
        log(`<span class="log-zhen">🎲 【随机镇镇】发动！扭蛋摇出了：${zhenZhenData[powerId].name}！</span>`);
    } else {
        log(`<span class="log-zhen">🌌 【${zhenZhenData[powerId].name}】发动！</span>`);
    }

    if(powerId === 'luck') {
        luckZhenZhenActive = true;
        log(`<span class="log-zhen">🍀 命运编织：接下来的每一寸运气，都将站在你这边！</span>`);
    } else if(powerId === 'crit') {
        critZhenZhenActive = true;
        log(`<span class="log-zhen">🧨 炸裂充能：本场战斗暴击率直接拔高 50%！</span>`);
    } else if(powerId === 'immortal') {
        immortalZhenZhenActive = true;
        log(`<span class="log-zhen">👼 不朽庇护：死神本场战斗将拒绝收走你的灵魂一次！</span>`);
    } else if(powerId === 'overload') {
        overloadAtkBonus = player.atk;
        overloadHpBonus = player.maxHp;
        player.atk += overloadAtkBonus;
        player.maxHp += overloadHpBonus;
        player.hp += overloadHpBonus;
        overloadZhenZhenActive = true;
        log(`<span class="log-zhen">⚡ 基因超载：基础攻击与生命上限瞬间翻倍！</span>`);
    }

    checkZhenZhenBtn(); updateBattleUI(); updateTopBar();
}

function endCombatCleanup() {
    if (overloadZhenZhenActive) {
        player.atk -= overloadAtkBonus;
        player.maxHp -= overloadHpBonus;
        player.hp = Math.min(player.hp, player.maxHp);
        overloadZhenZhenActive = false;
    }
    luckZhenZhenActive = false; critZhenZhenActive = false; immortalZhenZhenActive = false;
}

// --- 战斗逻辑 ---
function triggerSosoDance(char) {
    let r = Math.random(); let danceText = ""; let effects = [];
    if(r < 0.05) { effects = ['dodge', 'crit', 'heal']; danceText = "🌟SOSO5终极综合舞🌟"; }
    else if(r < 0.366) { effects = ['dodge']; danceText = "💨闪避舞"; }
    else if(r < 0.683) { effects = ['crit']; danceText = "💥暴击舞"; }
    else { effects = ['heal']; danceText = "❤️回血舞"; }

    log(`<span class="log-collab-soso">🕺 [soso5王联动] ${char.name} 触发了 ${danceText}！</span>`);
    if(effects.includes('dodge')) char.activeDodgeDance = true;
    if(effects.includes('crit')) char.activeCritDance = true;
    if(effects.includes('heal')) { let heal = Math.floor(char.maxHp * 0.2); char.hp = Math.min(char.maxHp, char.hp + heal); }
}

function battleTick() {
    if(!battleActive) return;
    log(`<span class="log-turn">=== 第 ${turn} 回合 ===</span>`);
    let order = player.speed >= enemy.speed ? [player, enemy] : [enemy, player];
    if(!processAction(order[0], order[1])) return;
    if(order[1].hp > 0) { if(!processAction(order[1], order[0])) return; }

    if(player.id === 'soso5' && turn % sosoDanceInterval === 0) triggerSosoDance(player);
    if(enemy.id === 'soso5' && turn % 3 === 0) triggerSosoDance(enemy);
    
    // 火波纹灼烧
    if(fireBurnActive && enemy.hp > 0) {
        let burnDmg = Math.floor(enemy.maxHp * 0.05);
        enemy.hp -= burnDmg;
        log(`🔥【火波纹灼烧】敌人被灼烧，扣除 <span class="log-dmg">${burnDmg}</span> 生命！`);
    }
    // 土波纹减攻倒计时
    if(earthDebuffTurns > 0) {
        earthDebuffTurns--;
        if(earthDebuffTurns === 0) {
            enemy.atk += earthDebuffAtkSaved;
            earthDebuffAtkSaved = 0;
            log(`🪨【土波纹】减攻效果结束，敌人攻击力恢复！`);
        }
    }
    
    turn++; updateBattleUI(); updateTopBar(); checkUltReady();
    if(player.hp > 0 && enemy.hp > 0) battleTimer = setTimeout(battleTick, speedMode === 1 ? 1200 : 600);
}

function processAction(atkChar, defChar) {
    let isPlayerAtk = (atkChar.id === player.id);

    if(atkChar.id === 'zhouge') {
        let ultActive = isPlayerAtk ? zhougeUltActive : false;
        let target = (ultActive || Math.random() < 0.5) ? defChar : atkChar;
        let dmg = Math.floor(target.maxHp * 0.1);
        log(`<span class="log-collab-ff">🍔 [快餐侠联动] 强制扣除 ${target.name} ${dmg}点生命！</span>`);
        if(target === atkChar) {
            if(isPlayerAtk) zhougeSelfDmgStreak++;
            if(target.hp <= dmg) { target.hp = 1; let nuke = target.maxHp; defChar.hp -= nuke; log(`<span class="log-ult">🚨 [快餐侠] 绝境反击！保留1血，造成上限 <span class="log-dmg">${nuke}</span> 真伤！</span>`); } 
            else { target.hp -= dmg; }
        } else { if(isPlayerAtk) zhougeSelfDmgStreak = 0; target.hp -= dmg; }
        if(checkDeath()) return false;
    }

    if(atkChar.poison > 0) { atkChar.hp -= atkChar.poison; if(!isPlayerAtk) ePoisonTicks++; log(`${atkChar.name} 毒发，扣除 <span class="log-dmg">${atkChar.poison}</span> 生命！`); if(checkDeath()) return false; }
    if(atkChar.id === 'sheep') { let heal = Math.floor(atkChar.maxHp * 0.1); atkChar.hp = Math.min(atkChar.maxHp, atkChar.hp + heal); }
    if(atkChar.id === 'pig' && atkChar.hp < atkChar.maxHp * 0.3 && !atkChar.pigHealed) { let heal = Math.floor(atkChar.maxHp * 0.5); atkChar.hp += heal; atkChar.pigHealed = true; checkUltReady(); }
    if(atkChar.id === 'final' && turn % 4 === 0) { atkChar.hp += 150; }

    let damage = atkChar.atk; let attackTimes = 1;
    if(atkChar.id === 'monkey') {
        if(luckZhenZhenActive) { damage = isPlayerAtk ? Math.floor(damage * 2.5) : 1; } 
        else { damage = Math.floor(Math.random() * (damage * 2.5)) + 1; }
    }
    if(atkChar.id === 'tiger' && Math.random() < 0.35) { damage *= 2; if(isPlayerAtk) pCrits++; }
    if(atkChar.id === 'dragon' && turn % 3 === 0) damage = Math.floor(damage * 2.5);
    if(atkChar.id === 'rooster' && turn === 1) damage *= 3;
    if(atkChar.id === 'rabbit' && Math.random() < 0.4) attackTimes = 2;
    if(atkChar.id === 'final') damage = Math.floor(damage * (1 + turn*0.08)); 
    if(atkChar.id === 'duck') damage = Math.floor(damage * (1 + turn*0.05)); 

    // 【快餐15分钟】
    if (fastFood15Active) { 
        if (luckZhenZhenActive) { damage = isPlayerAtk ? defChar.maxHp : 0; }
        else { damage = Math.floor(Math.random() * defChar.maxHp); }
        log(`<span class="log-collab-ff">🍔 [快餐15分钟] 伤害扭曲！真实伤害变异为 ${damage}！</span>`); 
    }

    // 暴击判定
    let isCrit = false;
    if (luckZhenZhenActive) {
        isCrit = isPlayerAtk; // 玩家必暴，敌人不暴
    } else {
        if(atkChar.activeCritDance) { isCrit = true; atkChar.activeCritDance = false; } 
        else if ((atkChar.crit || 0) > 0 && Math.random() * 100 < (atkChar.crit + (isPlayerAtk && critZhenZhenActive ? 50 : 0))) { isCrit = true; }
    }

    if(isCrit && !isPlayerAtk) {
        trackBadRng();
        if(currentZhenZhen === 'crit' && !zhenZhenUnlocked) unlockZhenZhen();
    }

    if(isCrit) {
        if (defChar.id === player.id && hasFushunItem) {
            if (fushunBattles > 0) {
                let healAmount = Math.floor(damage * 1.5); player.hp = Math.min(player.maxHp, player.hp + healAmount);
                log(`<span class="log-collab-ff">🛣️ [富顺街庇护] 吸收暴击打击，反而回血 <span class="log-heal">${healAmount}</span>！</span>`);
                isCrit = false; damage = 0; // 吸收
            } else if (fushunPermanent && (turn - fushunLastImmuneTurn >= 2)) {
                log(`<span class="log-collab-ff">🛣️ [富顺街庇护] 完美免疫了本次暴击爆发！</span>`);
                isCrit = false; fushunLastImmuneTurn = turn; 
            }
        }
        if(isCrit && damage > 0) { damage = Math.floor(damage * 1.5); log(`<span class="log-dmg">💥 暴击！</span>`); if(isPlayerAtk) pCrits++; }
    }

    // 闪避判定
    let isHit = true;
    if (luckZhenZhenActive) {
        isHit = isPlayerAtk; // 玩家必中，敌人必失
    } else {
        if(defChar.activeDodgeDance) { isHit = false; defChar.activeDodgeDance = false; } 
        else { 
            let totalDodge = defChar.dodge || 0; 
            if(defChar.id === 'mouse') totalDodge += 10; 
            if(Math.random() * 100 < totalDodge) { isHit = false; if(!isPlayerAtk) pDodges++; } 
        }
    }

    if(!isHit && isPlayerAtk) { trackBadRng(); }
    
    // 随机镇镇条件触发
    if(currentZhenZhen === 'random' && !zhenZhenUnlocked) unlockZhenZhen();

    for(let i=0; i<attackTimes; i++) {
        if(isHit && damage > 0) {
            // 木波纹：免疫本次伤害并反弹
            if(!isPlayerAtk && defChar.id === 'erbo' && woodImmuneActive) {
                woodImmuneActive = false;
                let reflectDmg = Math.floor(damage * 0.1);
                atkChar.hp -= reflectDmg;
                log(`<span class="log-skill">🌿【木波纹】免疫了 ${damage} 伤害，并反弹 <span class="log-dmg">${reflectDmg}</span> 真伤！</span>`);
                if(checkDeath()) return false;
                continue;
            }
            defChar.hp -= damage; if(!isPlayerAtk) pHitsTaken++; log(`${atkChar.name} 造成 <span class="log-dmg">${damage}</span> 伤害！`);
            // 尔波波纹收集：无波纹时记录受击
            if(!isPlayerAtk && defChar.id === 'erbo' && !currentRipple) {
                rippleHitsTaken++;
                if(rippleHitsTaken >= 3) collectRipple();
            }
            let lifestealPct = atkChar.lifesteal || 0; if(atkChar.id === 'mouse' || atkChar.id === 'final') lifestealPct += 30;
            if(lifestealPct > 0) { let heal = Math.floor(damage * lifestealPct / 100); atkChar.hp = Math.min(atkChar.maxHp, atkChar.hp + heal); }
            if(atkChar.id === 'snake') defChar.poison += Math.floor(atkChar.atk * 0.4);
            if(defChar.id === 'ox') defChar.atk += Math.floor(defChar.maxHp * 0.02);
            if(defChar.id === 'dog') { let ref = Math.floor(damage * 0.3); atkChar.hp -= ref; }
        } else if (!isHit) { log(`${defChar.name} 闪避了攻击！💨`); }
        if(checkDeath()) return false;
    }
    return true;
}

// --- 尔波·波纹收集 ---
function collectRipple() {
    let pool = ['er', 'water', 'fire', 'wood', 'metal', 'earth'];
    currentRipple = pool[Math.floor(Math.random() * pool.length)];
    let rd = rippleData[currentRipple];
    rippleHitsTaken = 0;
    log(`<div style="border: 1px solid ${rd.color}; padding: 5px; margin: 5px 0; border-radius: 5px; background: rgba(0,0,0,0.3);">
        <span style="color:${rd.color}; font-weight:bold;">🌊 【波纹收集】${rd.icon} ${rd.name}！</span><br>
        ${rd.desc}
    </div>`);
    checkUltReady();
}

function checkUltReady() {
    if(!battleActive || ultUsedThisFloor) return;
    let ready = false; let c = player.id;
    if(c === 'erbo') { ready = (currentRipple !== null); } 
    if(c === 'soso5') ready = true; 
    if(c === 'zhouge' && zhougeSelfDmgStreak >= 3) ready = true;
    if(c === 'mouse' && pDodges >= 2) ready = true; if(c === 'ox' && pHitsTaken >= 4) ready = true;
    if(c === 'tiger' && pCrits >= 2) ready = true; if(c === 'rabbit' && turn >= 4) ready = true;
    if(c === 'dragon' && turn >= 5) ready = true; if(c === 'snake' && ePoisonTicks >= 3) ready = true;
    if(c === 'horse' && turn >= 3) ready = true; if(c === 'sheep' && player.hp < player.maxHp * 0.4) ready = true;
    if(c === 'monkey' && turn >= 3) ready = true; if(c === 'rooster' && turn >= 3) ready = true;
    if(c === 'dog' && pHitsTaken >= 3) ready = true; if(c === 'pig' && player.pigHealed) ready = true;

    let btn = document.getElementById('ult-btn');
    if(ready) {
        btn.className = 'ready'; btn.disabled = false;
        if(c === 'erbo') {
            let rd = rippleData[currentRipple];
            btn.innerText = `🌊 释放 ${rd.icon} ${rd.name}`;
        } else {
            btn.innerText = "🔥 释放终结技 🔥";
        }
    } 
    else { btn.className = ''; btn.disabled = true; btn.innerText = "终结技：条件未达成"; }
}

function castUltimate() {
    if(ultUsedThisFloor || !battleActive) return;
    let c = player.id;
    // 尔波：不消耗楼层次数，但消耗波纹
    if(c === 'erbo') {
        if(!currentRipple) return;
        let ripple = currentRipple; currentRipple = null; rippleHitsTaken = 0;
        let rd = rippleData[ripple];
        log(`<span class="log-ult">🌊 ${player.name} 释放了 ${rd.icon} ${rd.name}！</span>`);
        if(ripple === 'er') {
            // 尔波纹：连续10次攻击
            for(let i=0; i<10; i++) {
                enemy.hp -= player.atk;
                log(`  ⚔️ 第${i+1}击：造成 <span class="log-dmg">${player.atk}</span> 伤害！`);
                if(checkDeath()) { updateBattleUI(); updateTopBar(); return; }
            }
        } else if(ripple === 'water') {
            let drain = Math.floor(enemy.maxHp * 0.1);
            enemy.hp -= drain; player.hp = Math.min(player.maxHp, player.hp + drain);
            log(`💧 吸取了 <span class="log-dmg">${drain}</span> 生命！`);
        } else if(ripple === 'fire') {
            fireBurnActive = true;
            log(`🔥 敌人进入灼烧状态！每回合扣除5%最大生命值！`);
        } else if(ripple === 'wood') {
            woodImmuneActive = true;
            log(`🌿 获得木之庇护！免疫下一次受到的伤害并反弹10%！`);
        } else if(ripple === 'metal') {
            player.atk += 5;
            log(`⚜️ 攻击力永久+5！当前攻击力：${player.atk}`);
        } else if(ripple === 'earth') {
            earthDebuffTurns = 2;
            let debuff = Math.floor(enemy.atk * 0.2);
            enemy.atk -= debuff; earthDebuffAtkSaved = debuff;
            log(`🪨 敌人攻击力下降20%（${debuff}点），持续2回合！`);
        }
        updateBattleUI(); updateTopBar(); checkUltReady(); checkDeath();
        return;
    }

    ultUsedThisFloor = true;
    let btn = document.getElementById('ult-btn');
    btn.className = ''; btn.disabled = true; btn.innerText = "终结技本层已耗尽";
    log(`<span class="log-ult">🌟 ${player.name} 释放了终结技！🌟</span>`);
    
    if(c === 'soso5') {
        if(player.hp > enemy.hp) { let diff = player.hp - enemy.hp; enemy.hp -= diff; } 
        else if(player.hp < enemy.hp) { let diff = enemy.hp - player.hp; player.hp = Math.min(player.maxHp, player.hp + diff); triggerSosoDance(player); } 
    }
    else if(c === 'zhouge') { player.hp = player.maxHp; zhougeUltActive = true; }
    else if(c === 'mouse') { let dmg = Math.floor(enemy.maxHp * 0.2); enemy.hp -= dmg; player.hp += dmg; }
    else if(c === 'ox') { let dmg = player.maxHp - player.hp; enemy.hp -= dmg; }
    else if(c === 'tiger') { let dmg = player.atk * 4; enemy.hp -= dmg; }
    else if(c === 'rabbit') { enemy.hp -= player.atk*3; }
    else if(c === 'dragon') { let dmg = player.atk * 5; enemy.hp -= dmg; }
    else if(c === 'snake') { enemy.hp -= 150; }
    else if(c === 'horse') { player.speed += 20; player.atk += 15; }
    else if(c === 'sheep') { player.maxHp += 30; player.hp = player.maxHp; }
    else if(c === 'monkey') { let dmg = Math.floor(Math.random() * 491) + 10; enemy.hp -= dmg; }
    else if(c === 'rooster') { enemy.atk = Math.floor(enemy.atk * 0.7); }
    else if(c === 'dog') { enemy.hp -= 150; player.hp += 150; }
    else if(c === 'pig') { player.maxHp += 50; player.hp += 200; }
    
    if(hasSosoUltItem) { log(`<span class="log-collab-soso">💿 [联动道具] 奥义附带尬舞！</span>`); triggerSosoDance(player); }
    updateBattleUI(); updateTopBar(); checkDeath();
}

function checkDeath() {
    if(player.hp <= 0) {
        if (currentZhenZhen === 'immortal' && !zhenZhenUnlocked) {
            log(`<span class="log-zhen">👼 【永生镇镇】绝境觉醒！你从死亡深渊中满血归来！</span>`);
            player.hp = player.maxHp;
            unlockZhenZhen(); updateBattleUI(); updateTopBar();
            return false;
        }
        if (immortalZhenZhenActive) {
            log(`<span class="log-zhen">👼 【永生镇镇】生效！消耗了不朽庇护，你再次满血重生！</span>`);
            player.hp = player.maxHp;
            immortalZhenZhenActive = false;
            updateBattleUI(); updateTopBar();
            return false;
        }
    }

    if(player.hp <= 0 || enemy.hp <= 0) {
        battleActive = false; clearTimeout(battleTimer);
        endCombatCleanup(); 
        updateBattleUI(); updateTopBar(); checkZhenZhenBtn();

        if(player.hp <= 0) {
            deleteSave();
            setTimeout(() => { hide('battle-screen'); hide('top-bar'); show('game-over-screen'); document.getElementById('end-title').innerHTML = "💀 寻宝失败 💀"; document.getElementById('end-desc').innerHTML = `你倒在了 第 ${floor} 层 节点 ${stage}。`; }, 1000);
        } else {
            log(`🏆 战斗胜利！`); show('battle-end-btn'); document.getElementById('ult-btn').disabled = true;
            if(enemy.id === 'duck') duckJunDefeatedThisRound = true;
            if(floor === 12 && stage === 4) {
                deleteSave();
                setTimeout(() => { hide('battle-screen'); hide('top-bar'); show('game-over-screen'); document.getElementById('end-title').innerHTML = "🎉 寻宝真神 🎉"; document.getElementById('end-desc').innerHTML = `恭喜通关！`; }, 1500);
            }
        }
        return true;
    }
    return false;
}

function updateBattleUI() {
    player.hp = Math.max(0, Math.floor(player.hp)); enemy.hp = Math.max(0, Math.floor(enemy.hp));
    document.getElementById('p-icon').innerText = player.icon;
    document.getElementById('p-hp-bar').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('p-hp-text').innerText = `${player.hp} / ${player.maxHp}`;
    document.getElementById('e-icon').innerText = enemy.icon; document.getElementById('e-name').innerText = enemy.name;
    let eHpPercent = enemy.maxHp > 0 ? (enemy.hp / enemy.maxHp * 100) : 0;
    document.getElementById('e-hp-bar').style.width = eHpPercent + '%';
    document.getElementById('e-hp-text').innerText = `${enemy.hp} / ${enemy.maxHp}`;
}

function log(msg) { let box = document.getElementById('log-box'); box.innerHTML += `<div>${msg}</div>`; box.scrollTop = box.scrollHeight; }

function handleAcquireItem(item) {
    if(item.exec) item.exec();
    if (item.isUnique) { 
        ownedItems.push(item); 
        if(currentZhenZhen === 'overload' && !zhenZhenUnlocked) unlockZhenZhen();
    }
    claimRewardDone();
}

function endCombat() {
    let dropGold = (stage === 4) ? Math.floor(Math.random()*20+40) : Math.floor(Math.random()*15 + 10);
    gold += dropGold; updateTopBar();
    hide('battle-screen'); show('reward-screen');
    let container = document.getElementById('reward-container'); container.innerHTML = '';
    
    if (stage === 4) {
        let fixedBtn = document.createElement('div'); fixedBtn.className = 'choice-btn fixed-heal';
        fixedBtn.innerHTML = `<div class="collab-badge badge-unique" style="background:#10b981;">层数通关补给</div><h3>🍖 豪华大餐</h3><p>固定选项：恢复 100% 生命值！</p>`;
        fixedBtn.onclick = () => { player.hp = player.maxHp; claimRewardDone(); };
        container.appendChild(fixedBtn);
    }

    if (duckJunDefeatedThisRound) {
        document.getElementById('reward-gold-text').innerText = dropGold + " (并爆出了传说宝物！)";
        let btn = document.createElement('div'); btn.className = 'choice-btn duck-reward';
        btn.innerHTML = `<div class="collab-badge badge-unique">唯一神器</div><h3>🦆 鸭俊板板</h3><p style="color:var(--text-light)">全属性飙升！攻击+30, 生命+100, 吸血+15%, 暴击+15%</p>`;
        btn.onclick = () => { handleAcquireItem(specialItems.find(i => i.id === 'duck_art')); };
        container.appendChild(btn);
        return;
    } 
    
    document.getElementById('reward-gold-text').innerText = dropGold;
    
    if (player.id === 'zhouge' && Math.random() < 0.1 && !fastFood15Active) {
        let btn = document.createElement('div'); btn.className = 'choice-btn collab-reward-ff';
        btn.innerHTML = `<div class="collab-badge badge-ff">快餐侠专属极低概率</div><h3>🍔 快餐15分钟</h3><p>唯一道具：获取后每回合双方造成伤害强制变为 0 到对方生命上限！</p>`;
        btn.onclick = () => { fastFood15Active = true; handleAcquireItem(specialItems.find(i => i.id === 'ff_15')); };
        container.appendChild(btn);
        return; 
    }

    let filteredPool = rewardPool.filter(item => { if (item.isUnique && ownedItems.some(owned => owned.id === item.id)) return false; return true; });
    let shuffled = filteredPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.forEach((item) => {
        let btn = document.createElement('div'); 
        btn.className = 'choice-btn ' + (item.isSoso ? 'collab-reward-soso' : (item.isFf ? 'collab-reward-ff' : ''));
        let badge = item.isSoso ? `<div class="collab-badge badge-soso">soso联动</div>` : (item.isFf ? `<div class="collab-badge badge-ff">快餐联动</div>` : '');
        if (item.isUnique && !badge) badge = `<div class="collab-badge badge-unique">唯一道具</div>`;
        btn.innerHTML = `${badge}<h3>${item.icon} ${item.name}</h3><p>${item.desc}</p>`;
        btn.onclick = () => handleAcquireItem(item);
        container.appendChild(btn);
    });
}

function claimRewardDone() {
    updateTopBar();
    if(stage < 4) { stage++; prepareEncounter(); } 
    else { generateShop(); hide('reward-screen'); show('shop-screen'); }
    saveGame();
}

function generateShop() {
    let currentPool = [...shopPool].filter(item => { if (item.isUnique && ownedItems.some(owned => owned.id === item.id)) return false; return true; });
    if(player.id === 'soso5' && sosoDanceInterval > 2 && Math.random() < 0.8) { currentPool.push(specialItems.find(i => i.id === 's7_ticket')); }

    let shuffled = currentPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    let container = document.getElementById('shop-container'); container.innerHTML = '';
    shuffled.forEach((item) => {
        let btn = document.createElement('button');
        btn.className = 'choice-btn shop-item ' + (item.isSoso ? 'collab-reward-soso' : (item.isFf ? 'collab-reward-ff' : ''));
        let badge = item.isSoso ? `<div class="collab-badge badge-soso">soso联动</div>` : (item.isFf ? `<div class="collab-badge badge-ff">快餐联动</div>` : '');
        if (item.isUnique && !badge) badge = `<div class="collab-badge badge-unique">唯一装备</div>`;
        btn.innerHTML = `${badge}<h3>${item.icon} ${item.name} <br><span style="color:var(--gold); font-size:14px;">(🪙 ${item.cost})</span></h3><p>${item.desc}</p>`;
        btn.onclick = () => {
            if(gold < item.cost) return;
            gold -= item.cost;
            if(item.exec) item.exec();
            if(item.isUnique) { 
                ownedItems.push(item);
                if(currentZhenZhen === 'overload' && !zhenZhenUnlocked) unlockZhenZhen();
            }
            btn.disabled = true; btn.style.background = 'rgba(0,0,0,0.5)';
            btn.innerHTML += '<p style="color:var(--atk)">已售罄</p>';
            updateTopBar(); checkShopButtons(); saveGame();
        };
        container.appendChild(btn);
    });
    checkShopButtons();
}

function checkShopButtons() {
    let btns = document.querySelectorAll('.shop-item');
    btns.forEach(btn => {
        let costMatch = btn.innerHTML.match(/\(🪙 (\d+)\)/);
        if(costMatch && gold < parseInt(costMatch[1])) { btn.style.borderColor = '#475569'; btn.style.opacity = '0.6'; }
    });
}

function nextFloor() {
    floor++; stage = 1; ultUsedThisFloor = false; zhenZhenUsedThisFloor = false;
    updateTopBar(); prepareEncounter(); saveGame();
}