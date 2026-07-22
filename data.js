// 【寻宝人基础数据】
const baseCharData = {
    soso5: { id:'soso5', icon:'🕺', name:'soso5网格', badge: 'badge-soso', badgeTxt: 'soso联动', hp:135, maxHp:135, atk:13, speed:12, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每3回合并发随机舞蹈（闪避舞/暴击舞/回血舞/终极综合舞），自动触发。', ultDesc:'【终结】随时可放！血高于敌→造成血差伤害；血低于敌→恢复血差并强行起舞！' },
    zhouge: { id:'zhouge', icon:'🍔', name:'快餐侠洲歌', badge: 'badge-ff', badgeTxt: '快餐联动', hp:180, maxHp:180, atk:10, speed:8, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每回合随机扣除自己(50%)或敌人(50%)最大生命10%的血。若自残致死→保留1血并反杀造成敌最大生命等量真伤！', ultDesc:'【终结】连扣自己血3次触发→回满血，之后自残效果永久转为只扣敌人血！' },
    mouse: { id:'mouse', icon:'🐭', name:'鼠俊', hp:115, maxHp:115, atk:14, speed:12, crit:0, lifesteal:0, dodge:10, desc:'【天赋】天生10%闪避，攻击造成伤害时附带30%额外吸血。', ultDesc:'【终结】闪避2次触发→窃取敌人20%最大生命值（扣敌血+自回血）' },
    ox: { id:'ox', icon:'🐮', name:'牛俊', hp:165, maxHp:165, atk:10, speed:5, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每次挨打永久增加2%最大生命值的攻击力，越战越勇。', ultDesc:'【终结】挨打4次触发→造成等于已损失生命值的绝地反击真伤！' },
    tiger: { id:'tiger', icon:'🐯', name:'虎俊', hp:135, maxHp:135, atk:18, speed:11, crit:20, lifesteal:0, dodge:0, desc:'【天赋】天生20%暴击，暴击时伤害×2（非普通的1.5倍）。', ultDesc:'【终结】暴击2次触发→爆发400%攻击力的巨额伤害！' },
    rabbit: { id:'rabbit', icon:'🐰', name:'兔俊', hp:105, maxHp:105, atk:12, speed:25, crit:0, lifesteal:0, dodge:0, desc:'【天赋】40%概率连续攻击两次（每回合独立判定）。', ultDesc:'【终结】存活至第4回合触发→瞬间对敌人进行3连击（3次普攻伤害）！' },
    dragon: { id:'dragon', icon:'🐲', name:'龙俊', hp:145, maxHp:145, atk:15, speed:9, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每逢第3回合，攻击力×2.5倍爆发（回合数从战斗开始累计）。', ultDesc:'【终结】存活至第5回合触发→召唤神龙造成500%攻击力的真实伤害！' },
    snake: { id:'snake', icon:'🐍', name:'蛇俊', hp:125, maxHp:125, atk:13, speed:10, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每次攻击给敌人叠加攻击力40%的毒素，每回合毒发造成等量真实伤害。', ultDesc:'【终结】敌人毒发3次触发→引爆毒素造成150点致命真伤！' },
    horse: { id:'horse', icon:'🐴', name:'马俊', hp:125, maxHp:125, atk:15, speed:30, crit:0, lifesteal:0, dodge:0, desc:'【天赋】速度30全场最高，必定抢到先手攻击权。', ultDesc:'【终结】存活至第3回合触发→永久增加20点速度和15点攻击！' },
    sheep: { id:'sheep', icon:'🐑', name:'羊俊', hp:135, maxHp:135, atk:11, speed:8, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每回合自动回复10%最大生命值（反刍）。', ultDesc:'【终结】血量低于40%时触发→最大生命+30，并瞬间回满血！' },
    monkey: { id:'monkey', icon:'🐵', name:'猴俊', hp:110, maxHp:110, atk:14, speed:13, crit:0, lifesteal:0, dodge:0, desc:'【天赋】攻击力极度不稳定，伤害在1~攻击力×2.5之间随机浮动。', ultDesc:'【终结】存活至第3回合触发→随机造成10~500点不可预测的伤害！' },
    rooster: { id:'rooster', icon:'🐔', name:'鸡俊', hp:115, maxHp:115, atk:16, speed:14, crit:0, lifesteal:0, dodge:0, desc:'【天赋】开局第一回合伤害直接×3倍（起床气爆发）。', ultDesc:'【终结】存活至第3回合触发→威慑敌人，永久降低其30%攻击力！' },
    dog: { id:'dog', icon:'🐶', name:'狗俊', hp:155, maxHp:155, atk:12, speed:9, crit:0, lifesteal:0, dodge:0, desc:'【天赋】每次挨打反弹30%伤害为真实伤害给敌人。', ultDesc:'【终结】挨打3次触发→疯狗撕咬造成150伤害并全部吸血回复自身！' },
    pig: { id:'pig', icon:'🐷', name:'猪俊', hp:200, maxHp:200, atk:9, speed:4, crit:0, lifesteal:0, dodge:0, desc:'【天赋】血量低于30%时自动触发一次大回血（恢复50%最大生命，仅一次）。', ultDesc:'【终结】触发被动回血后触发→最大生命+50，额外恢复200血！' },
    erbo: { id:'erbo', icon:'🌊', name:'尔波', hp:125, maxHp:125, atk:13, speed:10, crit:0, lifesteal:0, dodge:0, desc:'【天赋】波纹机制：无波纹时，每受3次伤害随机收集一种波纹（共6种：尔波/水/火/木/金/土）。', ultDesc:'【奥义】有波纹即可释放！无其他限制，释放当前持有的波纹能力。' }
};

// 【敌方图鉴】
const mobTemplates = [
    { id:'m1', icon: '👾', name: '摸鱼小兵', hp: 60, maxHp: 60, atk: 7, speed: 5, desc:'基础属性平庸，练手专用' },
    { id:'m2', icon: '🛹', name: '俊板', hp: 80, maxHp: 80, atk: 12, speed: 10, desc:'攻速较快，容易抢先手' },
    { id:'m3', icon: '🗿', name: '谭巴', hp: 130, maxHp: 130, atk: 5, speed: 3, desc:'超高血量，攻击低下，消耗型' },
    { id:'m4', icon: '🪧', name: '冯板', hp: 70, maxHp: 70, atk: 16, speed: 14, desc:'极高爆发力，脆皮刺客' },
    { id:'m5', icon: '🦇', name: '吸血键盘侠', hp: 45, maxHp: 45, atk: 9, speed: 12, desc:'血少攻高，附带吸血' },
    { id:'m6', icon: '🐢', name: '划水老龟', hp: 95, maxHp: 95, atk: 5, speed: 2, desc:'纯沙包，防御极高' },
    { id:'m7', icon: '🐝', name: '催更狂魔', hp: 35, maxHp: 35, atk: 15, speed: 15, desc:'攻速和伤害极快，但非常脆' },
    { id:'m8', icon: '🐺', name: '内卷野狼', hp: 75, maxHp: 75, atk: 11, speed: 18, desc:'属性均衡且难缠的高速野狼' }
];

// 【特殊道具配置】
const specialItems = [
    { id:'duck_art', name:'鸭俊板板', isUnique:true, icon:'🦆', desc:'唯一神器：全属性飙升！攻击+30, 生命+100, 吸血+15%, 暴击+15%' },
    { id:'ff_15', name:'快餐15分钟', isUnique:true, isFf:true, icon:'🍔', desc:'[快餐侠专属极低掉落] 唯一道具：获取后每回合双方造成伤害强制变为 0 到对方生命上限的随机值！' },
    { id:'s7_ticket', name:'20元门票', isUnique:true, isSoso:true, cost: 20, icon:'🎫', desc:'[soso5专属商店概率刷出] 唯一道具：触发跳舞的被动由3回合减少为2回合一次。', exec: () => { sosoDanceInterval = 2; } }
];

// 【战斗掉落池】
const rewardPool = [
    { id:'r1', isUnique:false, type:'atk', icon:'🗡️', name:'力量涌动', desc:'基础强化: 攻击力+6', exec: () => player.atk+=6 },
    { id:'r2', isUnique:false, type:'maxHp', icon:'🛡️', name:'体质强化', desc:'基础强化: 最大生命+25', exec: () => { player.maxHp+=25; player.hp+=25;} },
    { id:'r3', isUnique:false, type:'heal', icon:'❤️', name:'紧急包扎', desc:'补给: 恢复50%生命', exec: () => player.hp = Math.min(player.maxHp, player.hp + player.maxHp*0.5) },
    { id:'r4', isUnique:false, type:'crit', icon:'💥', name:'弱点识破', desc:'基础强化: 暴击率+10%', exec: () => player.crit+=10 },
    { id:'r5', isUnique:false, type:'dodge', icon:'💨', name:'身轻如燕', desc:'基础强化: 闪避率+5%', exec: () => player.dodge+=5 },
    { id:'r6', isUnique:false, type:'life', icon:'🦇', name:'嗜血狂热', desc:'基础强化: 吸血+8%', exec: () => player.lifesteal+=8 },
    { id:'r_soso', isUnique:true, isSoso:true, icon:'💿', name:'soso5联动道具', desc:'唯一道具：开启奥义时附带触发一次舞蹈效果。', exec: () => hasSosoUltItem=true },
    { id:'r_ff', isUnique:true, isFf:true, icon:'🛣️', name:'富顺街', desc:'唯一道具：下3场遇暴击自己回血，之后每2回合免一次暴击。', exec: () => {hasFushunItem=true; fushunBattles+=3;} }
];

// 【商店道具池】
const shopPool = [
    { id:'s1', isUnique:false, cost: 30, icon:'🍗', name:'烤大腿', desc:'补给: 恢复100%生命', exec: () => player.hp = player.maxHp },
    { id:'s2', isUnique:true, cost: 60, icon:'⚔️', name:'陨铁剑', desc:'唯一装备: 攻击力大幅+15', exec: () => player.atk+=15 },
    { id:'s3', isUnique:true, cost: 50, icon:'👟', name:'疾风鞋', desc:'唯一装备: 速度+15，闪避+5%', exec: () => { player.speed+=15; player.dodge+=5; } },
    { id:'s4', isUnique:true, cost: 75, icon:'🩸', name:'吸血镰刀', desc:'唯一装备: 吸血+15%', exec: () => player.lifesteal+=15 },
    { id:'s5', isUnique:true, cost: 75, icon:'🎯', name:'精准狙击', desc:'唯一装备: 暴击率+20%', exec: () => player.crit+=20 },
    { id:'s6', isUnique:true, cost: 55, icon:'❤️‍🔥', name:'生命护符', desc:'唯一装备: 最大生命大幅+60', exec: () => {player.maxHp+=60; player.hp+=60;} },
    { id:'s_soso', isUnique:true, isSoso:true, cost: 40, icon:'💿', name:'soso5道具', desc:'唯一道具: 开启奥义附带舞蹈', exec: () => hasSosoUltItem=true },
    { id:'s_ff', isUnique:true, isFf:true, cost: 50, icon:'🛣️', name:'富顺街', desc:'唯一道具: 免暴击庇护', exec: () => {hasFushunItem=true; fushunBattles+=3;} }
];

// 【镇镇之力数据】
const zhenZhenData = {
    luck: { id: 'luck', icon: '🍀', name: '运气镇镇', desc: '【条件: 遭遇3次恶劣随机判定】\n本场战斗所有正负效果判定和点数判定绝对有利于你！' },
    crit: { id: 'crit', icon: '🧨', name: '炸炸镇镇', desc: '【条件: 受到一次暴击伤害】\n本场战斗暴击率极大幅提升 50%！' },
    immortal: { id: 'immortal', icon: '👼', name: '永生镇镇', desc: '【条件: 死亡后觉醒并满血复活】\n开启后，本场战斗可额外抵抗一次致死伤害并满血复活！' },
    overload: { id: 'overload', icon: '⚡', name: '超载镇镇', desc: '【条件: 获得一件唯一道具】\n本场战斗基础攻击力与生命上限直接翻倍！' },
    random: { id: 'random', icon: '🎲', name: '随机镇镇', desc: '【条件: 发生任意点数判定】\n随机触发以上其他任意一种镇镇之力！' }
};

// 【尔波·波纹数据】
const rippleData = {
    er: { id:'er', icon:'🌊', name:'尔波纹', color:'#38bdf8', desc:'连续进行10次攻击（每次等于当前攻击力）！' },
    water: { id:'water', icon:'💧', name:'水波纹', color:'#06b6d4', desc:'吸取敌人10%最大生命值（扣敌血+自回血）！' },
    fire: { id:'fire', icon:'🔥', name:'火波纹', color:'#ef4444', desc:'使敌人进入灼烧状态，每回合扣除5%最大生命值（持续至战斗结束）！' },
    wood: { id:'wood', icon:'🌿', name:'木波纹', color:'#10b981', desc:'免疫下一次受到的伤害，并反弹该伤害的10%给敌人！' },
    metal: { id:'metal', icon:'⚜️', name:'金波纹', color:'#f59e0b', desc:'攻击力永久+5！' },
    earth: { id:'earth', icon:'🪨', name:'土波纹', color:'#a16207', desc:'使敌人攻击力下降20%，持续2回合！' }
};