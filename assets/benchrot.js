/* Benchrot Index — page, charts, profile dialog and video player.
   Charts are hand-written SVG. In video mode every animation is driven by one
   deterministic timeline (seek(ms)), which is also what tools/render_video.js
   uses to render the MP4 frame by frame. */
(function(){
'use strict';

/* ================= data ================= */
var ASOF = '2026-10-11';

var VEND = {
  openai:   {co:'OpenAI', coLogo:'openai', series:'GPT', parent:['OpenAI 基金会','OpenAI Foundation'], color:'#10A37F', logo:'openai', pcv:3,
             chain:['OpenAI Inc.（2015）→ OpenAI LP（2019）→ OpenAI Group PBC（2025）','OpenAI Inc. (2015) → OpenAI LP (2019) → OpenAI Group PBC (2025)']},
  anthropic:{co:'Anthropic', coLogo:'anthropic', series:'Claude', parent:['无（独立运营）','None (independent)'], color:'#D97757', logo:'claude', pcv:1,
             chain:['Anthropic PBC（2021）','Anthropic PBC (2021)']},
  google:   {co:'Google DeepMind', coLogo:'google', series:'Gemini', parent:['Alphabet Inc.','Alphabet Inc.'], color:'#3186FF', grad:true, logo:'gemini', pcv:3,
             chain:['DeepMind（2010）→ Google（2014）→ Alphabet（2015）','DeepMind (2010) → Google (2014) → Alphabet (2015)']},
  xai:      {co:'xAI', coLogo:'grok', series:'Grok', parent:['SpaceX','SpaceX'], color:'#111111', logo:'grok', pcv:3,
             chain:['X.AI Corp.（2023）→ XAI Holdings（2025）→ SpaceX（2026）','X.AI Corp. (2023) → XAI Holdings (2025) → SpaceX (2026)']},
  deepseek: {co:['深度求索 DeepSeek','DeepSeek'], coLogo:'deepseek', series:'DeepSeek', parent:['幻方量化','High-Flyer'], color:'#4D6BFE', logo:'deepseek', pcv:2,
             chain:['幻方量化（2015）→ 深度求索（2023）','High-Flyer (2015) → DeepSeek (2023)']},
  alibaba:  {co:['阿里云','Alibaba Cloud'], coLogo:'alibaba', series:['通义千问 Qwen','Qwen'], parent:['阿里巴巴集团','Alibaba Group'], color:'#FF6A00', logo:'alibaba', pcv:2,
             chain:['阿里巴巴集团（1999）→ 阿里云智能集团（2023）','Alibaba Group (1999) → Alibaba Cloud Intelligence Group (2023)']},
  moonshot: {co:['月之暗面','Moonshot AI'], coLogo:'moonshot', series:'Kimi', parent:['无（独立运营）','None (independent)'], color:'#1783FF', logo:'kimi', pcv:1,
             chain:['月之暗面（2023）','Moonshot AI (2023)']}
};
var VORDER = ['openai','anthropic','google','xai','deepseek','alibaba','moonshot'];
var SERIES_NAME = {openai:'GPT',anthropic:'Claude',google:'Gemini',xai:'Grok',deepseek:'DeepSeek',alibaba:'Qwen',moonshot:'Kimi'};

// USD per 1M tokens, standard list price
var MODELS = [
  {name:'GPT-6 Astra',        v:'openai',    ver:6,   date:'2026-09-03', pin:10,   pout:50},
  {name:'GPT-6 Sol',          v:'openai',    ver:6,   date:'2026-09-22', pin:2,    pout:10},
  {name:'GPT-6 Luna',         v:'openai',    ver:6,   date:'2026-09-22', pin:0.10, pout:0.50},
  {name:'Claude Fable 5.1',   v:'anthropic', ver:5.1, date:'2026-09-01', pin:10,   pout:50},
  {name:'Claude Opus 5.5',    v:'anthropic', ver:5.5, date:'2026-09-22', pin:4,    pout:20},
  {name:'Claude Sonnet 5.5',  v:'anthropic', ver:5.5, date:'2026-09-28', pin:2,    pout:10},
  {name:'Claude Haiku 5.5',   v:'anthropic', ver:5.5, date:'2026-10-07', pin:0.10, pout:0.50, note:'n100k'},
  {name:'Gemini 4 Argon',     v:'google',    ver:4,   date:'2026-09-30', pin:2,    pout:10,   note:'nArgon'},
  {name:'Gemini 3.8 Flash',   v:'google',    ver:3.8, date:'2026-09-02', pin:0.75, pout:3.75, note:'nPromo'},
  {name:'Gemini 3.1 Pro',     v:'google',    ver:3.1, date:'2026-02-19', pin:2,    pout:12,   note:'n200k'},
  {name:'Grok 4.7',           v:'xai',       ver:4.7, date:'2026-09-21', pin:2,    pout:6,    note:'n200k'},
  {name:'DeepSeek V4.1 Flash',v:'deepseek',  ver:4.1, date:'2026-09-10', pin:0.30, pout:1.20, note:'nPeak'},
  {name:'DeepSeek V4 Pro',    v:'deepseek',  ver:4,   date:'2026-04-24', pin:1.32, pout:3.96, note:'nPeak'},
  {name:'Qwen3.8-Max',        v:'alibaba',   ver:3.8, date:'2026-08-03', pin:2,    pout:6},
  {name:'Qwen3.8-Flash',      v:'alibaba',   ver:3.8, date:'2026-08-26', pin:0.15, pout:0.47},
  {name:'Kimi K3',            v:'moonshot',  ver:3,   date:'2026-07-16', pin:3,    pout:15}
];

// highest generally released version per series: [date, version, label]
var HIST = {
  openai:   [['2022-11-30',3.5,'GPT-3.5'],['2023-03-14',4,'GPT-4'],['2025-02-27',4.5,'GPT-4.5'],['2025-08-07',5,'GPT-5'],['2025-11-12',5.1,'GPT-5.1'],['2025-12-11',5.2,'GPT-5.2'],['2026-02-05',5.3,'GPT-5.3-Codex'],['2026-03-05',5.4,'GPT-5.4'],['2026-04-23',5.5,'GPT-5.5'],['2026-07-09',5.6,'GPT-5.6'],['2026-09-03',6,'GPT-6']],
  anthropic:[['2023-03-14',1,'Claude'],['2023-07-11',2,'Claude 2'],['2023-11-21',2.1,'Claude 2.1'],['2024-03-04',3,'Claude 3'],['2024-06-20',3.5,'Claude 3.5 Sonnet'],['2025-02-24',3.7,'Claude 3.7 Sonnet'],['2025-05-22',4,'Claude 4'],['2025-08-05',4.1,'Claude Opus 4.1'],['2025-09-29',4.5,'Claude Sonnet 4.5'],['2026-02-05',4.6,'Claude Opus 4.6'],['2026-04-16',4.7,'Claude Opus 4.7'],['2026-06-30',5,'Claude Sonnet 5'],['2026-09-01',5.1,'Claude Fable 5.1'],['2026-09-22',5.5,'Claude Opus 5.5']],
  google:   [['2023-12-06',1,'Gemini 1.0'],['2024-02-15',1.5,'Gemini 1.5'],['2024-12-11',2,'Gemini 2.0'],['2025-03-25',2.5,'Gemini 2.5'],['2025-11-18',3,'Gemini 3'],['2026-02-19',3.1,'Gemini 3.1 Pro'],['2026-05-19',3.5,'Gemini 3.5'],['2026-07-21',3.6,'Gemini 3.6 Flash'],['2026-09-02',3.8,'Gemini 3.8 Flash'],['2026-09-30',4,'Gemini 4 Argon']],
  xai:      [['2023-11-04',1,'Grok-1'],['2024-03-28',1.5,'Grok-1.5'],['2024-08-13',2,'Grok-2'],['2025-02-17',3,'Grok 3'],['2025-07-09',4,'Grok 4'],['2025-11-17',4.1,'Grok 4.1'],['2026-07-08',4.5,'Grok 4.5'],['2026-08-12',4.6,'Grok 4.6'],['2026-09-21',4.7,'Grok 4.7']],
  deepseek: [['2023-11-29',1,'DeepSeek LLM'],['2024-05-06',2,'DeepSeek-V2'],['2024-09-05',2.5,'DeepSeek-V2.5'],['2024-12-26',3,'DeepSeek-V3'],['2025-08-21',3.1,'DeepSeek-V3.1'],['2025-09-29',3.2,'DeepSeek-V3.2'],['2026-04-24',4,'DeepSeek V4'],['2026-09-10',4.1,'DeepSeek V4.1']],
  alibaba:  [['2023-08-03',1,'Qwen'],['2024-02-05',1.5,'Qwen1.5'],['2024-06-07',2,'Qwen2'],['2024-09-19',2.5,'Qwen2.5'],['2025-04-29',3,'Qwen3'],['2026-02-16',3.5,'Qwen3.5'],['2026-04-16',3.6,'Qwen3.6'],['2026-05-20',3.7,'Qwen3.7'],['2026-08-03',3.8,'Qwen3.8']],
  moonshot: [['2023-10-09',1,'moonshot-v1'],['2025-01-20',1.5,'Kimi k1.5'],['2025-07-11',2,'Kimi K2'],['2026-01-27',2.5,'Kimi K2.5'],['2026-04-20',2.6,'Kimi K2.6'],['2026-07-16',3,'Kimi K3']]
};

/* ================= i18n ================= */
var T = {
  title:['大模型 Benchrot 排行榜','LLM Benchrot Leaderboard'],
  sig:['B站 @史诗级猫头嘤 原创基准测试','An original benchmark by @史诗级猫头嘤 on Bilibili'],
  heroEb:['Benchrot Index · 第 1 期 · 2026 年 10 月','Benchrot Index · Edition 1 · October 2026'],
  lede:['独立评估 7 家厂商的 16 个前沿模型在版本号、命名、母公司架构与定价效率上的表现。六项指标，一个综合指数。','An independent evaluation of 16 frontier models from 7 labs across versioning, nomenclature, corporate structure and pricing efficiency. Six metrics, one composite index.'],
  asof:['数据截至 2026 年 10 月 11 日','Data as of October 11, 2026'],
  nIndex:['综合指数','Index'], nMetrics:['单项指标','Metrics'], nFrontier:['版本号与价格','Version vs Price'], nInfl:['版本通胀','Inflation'], nRadar:['模型画像','Profiles'], nModels:['模型','Models'], nMethod:['方法论','Methodology'],
  video:['视频模式','Video mode'], langBtn:['EN','中文'],
  indexTitle:['Benchrot 综合指数','Benchrot Index'],
  indexSub:['六项指标百分位名次的等权平均（0–100）','Equal-weighted mean of percentile ranks across six metrics (0–100)'],
  higher:['越高越好','Higher is better'], lower:['越低越好','Lower is better'],
  champLab:['Benchrot 综合指数 · 第 1 名','Benchrot Index · Rank 1'],
  openProfile:['查看模型画像 →','View profile →'],
  of100:['/ 100','/ 100'],
  sotf:['State of the fart','State of the fart'],
  verdictT:['总榜结论','Verdict'],
  heatT:['指数构成','Index Composition'],
  heatSub:['各模型在六项指标上的百分位名次（0–100），按综合指数排序','Percentile rank of each model on the six metrics (0–100), sorted by index'],
  idxCol:['指数','Index'],
  metricsH2:['单项指标','Individual metrics'],
  metricsLede:['六项计入综合指数的核心指标，以及三项社区通行的参考基准。所有数值均由公开信息直接计算。','The six metrics that make up the index, plus three community-standard reference benchmarks. All values are computed directly from public information.'],
  inIndex:['计入指数','In index'], refOnly:['参考基准','Reference'],
  frontierH2:['版本号 vs 价格','Version vs Price'],
  frontierLede:['在相同价格下获得更高版本号，是衡量模型经济性的首要标准。','A higher version number at the same price is the primary test of a model’s economics.'],
  scatterT:['版本号 vs 价格','Version Number vs. Price'],
  scatterSub:['版本号 vs. 每百万 tokens 价格（USD，对数刻度）；混合价格按输入:输出 = 3:1 加权','Version number vs. price per 1M tokens (USD, log scale); blended price weights input:output at 3:1'],
  pBl:['混合','Blended'], pIn:['输入','Input'], pOut:['输出','Output'],
  quad:['最具吸引力象限','Most attractive quadrant'], pareto:['帕累托线','Pareto line'],
  xPrice_bl:['混合价格（USD / 1M tokens）','Blended Price (USD per 1M tokens)'], xPrice_pin:['输入价格（USD / 1M tokens）','Input Price (USD per 1M tokens)'], xPrice_pout:['输出价格（USD / 1M tokens）','Output Price (USD per 1M tokens)'],
  yVer:['版本号','Version Number'],
  inflH2:['版本号通胀','Version inflation'],
  inflLede:['自 2022 年底以来，各系列最高版本号持续上行。近 12 个月行业整体通胀有所放缓，但分化加剧。','Top version numbers have risen steadily since late 2022. Industry-wide inflation has cooled over the past 12 months, while dispersion has widened.'],
  trendT:['各系列最高版本号','Highest Version Number by Series'],
  trendSub:['各系列已正式发布的最高版本号，2022 年 11 月至今','Highest released version in each series, November 2022 to date'],
  yoyT:['全行业年度版本通胀率','Industry Annual Version Inflation'],
  yoySub:['各系列最高版本号同比增幅的均值，截至每年 10 月 11 日','Mean year-over-year growth in each series’ top version, measured on October 11'],
  serT:['各系列版本通胀率','Version Inflation by Series'],
  serSub:['最高版本号同比增幅，2025-10-11 → 2026-10-11','Year-over-year growth in the top version, Oct 11, 2025 → Oct 11, 2026'],
  radarH2:['模型画像','Model profiles'],
  radarLede:['每个模型在六项指标上的百分位名次。点击任一模型查看完整画像。','Each model’s percentile rank on the six metrics. Select any model to open its full profile.'],
  modelsH2:['模型一览','Models'],
  modelsLede:['公司、系列与母公司分列。价格为各厂商公布的标准 API 列表价，单位 USD / 百万 tokens。','Company, series and parent listed separately. Prices are standard API list prices published by each provider, in USD per 1M tokens.'],
  vRank:['名次','Rank'], blPrice:['混合价格','Blended price'],
  thRank:['#','#'], thModel:['模型','Model'], thCo:['公司','Company'], thSeries:['系列','Series'], thParent:['母公司','Parent company'], thDate:['发布日期','Released'], thIn:['输入','Input'], thOut:['输出','Output'], thBl:['混合','Blended'], thIdx:['指数','Index'],
  n100k:['≤100K 上下文档位','≤100K context tier'],
  nArgon:['受限预览，首发价','Limited preview, introductory price'],
  nPromo:['促销价，有效期至 2026-12-31','Promotional rate through 2026-12-31'],
  n200k:['≤200K 上下文档位','≤200K context tier'],
  nPeak:['高峰时段标准价','Standard peak-hour rate'],
  methodH2:['方法论','Methodology'],
  foot:['Benchrot Index · 第 1 期 · 数据截至 2026-10-11','Benchrot Index · Edition 1 · Data as of 2026-10-11'],
  fVer:['最高版本号','Highest version'], fVir:['最高版本通胀率','Highest version inflation'], fStraw:['达到草莓线的模型','Models at strawberry parity'], fScrab:['最高 Scrabble 得分','Highest Scrabble score'],
  seriesSuffix:[' 系列',' series'], andN:[' 等 {n} 个模型',' + {n} more'], allOf:[' 全系',' (all)'], noneOf:['16 个模型均未达到 3 个 R','No model reaches 3 R’s'],
  vEbIndex:['综合指数','Composite index'], vEbMetric:['单项指标','Metric'], vEbFrontier:['版本号 vs 价格','Version vs Price'], vEbInfl:['版本通胀','Inflation'], vEbRadar:['模型画像','Profiles'], vEbVerdict:['总榜结论','Verdict'], vEbSpot:['模型画像 · 第 1 名','Profile · Rank 1'],
  vTitleSub:['16 个前沿模型 · 7 家厂商 · 6 项指标 · 1 个综合指数','16 frontier models · 7 labs · 6 metrics · 1 composite index'],
  radarPage:['（{a}/{b}）',' ({a}/{b})'],
  prev:['上一个','Previous'], next:['下一个','Next'],
  pmEb:['模型画像 · 第 {r} 名 / 共 {n} 个','Model profile · Rank {r} of {n}'],
  pctOf:['百分位','percentile'],
  days:[' 天',' d']
};

var METRICS = [
  {k:'ver', idx:true, better:'high', title:['版本号','Version Number'], short:['版本号','Version'],
   desc:['模型官方名称中的版本号','Version number in the official model name']},
  {k:'len', idx:true, better:'high', title:['名称长度','Name Length'], short:['名称长度','Name length'],
   desc:['官方模型名称的字符数，含空格与连字符','Characters in the official model name, including spaces and hyphens']},
  {k:'ip',  idx:true, better:'high', title:['首字母先进度','Initial Precedence'], short:['首字母','Initial'],
   desc:['27 − 名称首字母在拉丁字母表中的序号（A = 26，Z = 1）','27 minus the alphabet position of the name’s first letter (A = 26, Z = 1)']},
  {k:'pcv', idx:true, better:'high', title:['母公司版本号','Parent Company Version'], short:['母公司版本','Parent ver.'],
   desc:['研发主体所在控股链迄今经历的组织形态数','Number of corporate forms in the developer’s ownership chain to date']},
  {k:'vpd', idx:true, better:'high', title:['每美元版本号','Version per Dollar'], short:['每美元版本','Ver / $'],
   desc:['版本号 ÷ 混合价格（USD / 百万 tokens，输入:输出 = 3:1）','Version number ÷ blended price (USD per 1M tokens, input:output = 3:1)']},
  {k:'vir', idx:true, better:'high', title:['版本通胀率','Version Inflation Rate'], short:['通胀率','Inflation'],
   desc:['所属系列最高版本号的同比增幅（2025-10-11 → 2026-10-11）','Year-over-year growth in the series’ top version (2025-10-11 → 2026-10-11)']},
  {k:'straw', idx:false, better:'high', title:['草莓测试','Strawberry Bench'], short:['草莓','Strawberry'],
   desc:['模型名称中字母 R 的个数；参考线为 “strawberry” 中 R 的个数','Number of R’s in the model name; reference line is the number of R’s in “strawberry”'],
   ref:{v:3, label:['“strawberry”（3 个 R）','“strawberry” (3 R’s)']}},
  {k:'scrab', idx:false, better:'high', title:['Scrabble 得分','Scrabble Score'], short:['Scrabble','Scrabble'],
   desc:['模型名称按英文 Scrabble 字母牌计分的总和（数字与符号计 0 分）','Total English Scrabble tile value of the model name (digits and symbols score 0)']},
  {k:'half', idx:false, better:'low', title:['版本半衰期','Version Half-life'], short:['半衰期','Half-life'],
   desc:['所属系列过去 12 个月内相邻两次版本号上调的间隔天数中位数','Median days between consecutive version bumps in the series over the past 12 months']}
];
var IDX = METRICS.filter(function(m){return m.idx;});
var MET = {}; METRICS.forEach(function(m){MET[m.k]=m;});

/* ================= state & helpers ================= */
var LANG = 'en'; // English by default; a viewer's own toggle choice is remembered
try{ var sl = localStorage.getItem('benchrot-lang'); if(sl==='zh'||sl==='en') LANG = sl; }catch(e){}
var QS = new URLSearchParams(location.search);
if(QS.get('lang')==='zh'||QS.get('lang')==='en') LANG=QS.get('lang');
function L(x){ return Array.isArray(x) ? x[LANG==='zh'?0:1] : x; }
function t(k){ return L(T[k]); }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function r1(v){ return Math.round(v*10)/10; }
function f1(v){ return (Math.round(v*10)/10).toFixed(1); }
function clamp(v,a,b){ return v<a?a:v>b?b:v; }
function money(v){ return '$'+(v>=10 ? v.toFixed(0) : v.toFixed(2)); }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function fmtDate(iso){
  var p=iso.split('-'), y=+p[0], m=+p[1], d=+p[2];
  if(LANG==='zh') return y+' 年 '+m+' 月 '+d+' 日';
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]+' '+d+', '+y;
}
function solid(v){ return VEND[v].color; }
function fill(v, dir){ return VEND[v].grad ? 'url(#gem'+(dir||'V')+')' : VEND[v].color; }
function cssFill(v){ return VEND[v].grad ? 'linear-gradient(135deg,#FBBC04 0%,#FF4641 28%,#3186FF 55%,#3186FF 75%,#0EBC5F 100%)' : VEND[v].color; }
function lgCls(key){ return 'lg lg-'+key; }
var EASE={
  out:function(p){ return 1-Math.pow(1-p,3); },
  inout:function(p){ return p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; },
  back:function(p){ var c1=1.5, c3=c1+1; return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2); }
};

// text width estimate (no layout needed, so charts can be built as strings)
function tw(s, fs){
  var w=0; s=String(s);
  for(var i=0;i<s.length;i++){
    var c=s.charCodeAt(i), ch=s[i];
    if(c>0x2e80) w+=1;
    else if(ch===' ') w+=.28;
    else if(ch==='.'||ch===','||ch===':'||ch==='|'||ch==='i'||ch==='l'||ch==='I'||ch==='j'||ch==='’') w+=.27;
    else if(ch==='-'||ch==='('||ch===')'||ch==='/'||ch==='t'||ch==='f'||ch==='r'||ch==='“'||ch==='”') w+=.36;
    else if(ch==='m'||ch==='w'||ch==='M'||ch==='W') w+=.84;
    else if(ch>='A'&&ch<='Z') w+=.66;
    else if(ch>='0'&&ch<='9') w+=.57;
    else if(ch==='%'||ch==='$') w+=.7;
    else w+=.54;
  }
  return w*fs;
}
function niceStep(raw){
  var e=Math.pow(10,Math.floor(Math.log10(raw))), f=raw/e;
  return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e;
}
function ticks(max, n){
  var step=niceStep(max/(n||4)), top=Math.ceil(max/step-1e-9)*step, out=[];
  for(var v=0; v<=top+1e-9; v+=step) out.push(+v.toFixed(6));
  return out;
}
function tickFmt(v){ return Math.abs(v-Math.round(v))<1e-9 ? String(Math.round(v)) : String(+v.toFixed(2)); }

/* ================= computation ================= */
function verAt(s, iso){ var v=null; HIST[s].forEach(function(h){ if(h[0]<=iso) v = v==null ? h[1] : Math.max(v,h[1]); }); return v; }
function yearShift(iso, dy){ return (parseInt(iso.slice(0,4),10)+dy)+iso.slice(4); }
function dnum(iso){ return Date.UTC(+iso.slice(0,4), +iso.slice(5,7)-1, +iso.slice(8,10)); }
var SER_VIR={}, SER_HALF={};
VORDER.forEach(function(s){
  SER_VIR[s] = (verAt(s,ASOF)/verAt(s,yearShift(ASOF,-1))-1)*100;
  // version bumps (dates where the series' top version increased)
  var bumps=[], mx=-1;
  HIST[s].forEach(function(h){ if(h[1]>mx){ bumps.push(h[0]); mx=h[1]; } });
  var start=yearShift(ASOF,-1), anchor=null, win=[];
  bumps.forEach(function(d){ if(d<=start) anchor=d; else if(d<=ASOF) win.push(d); });
  var seq=(anchor?[anchor]:[]).concat(win), gaps=[];
  for(var i=1;i<seq.length;i++) gaps.push((dnum(seq[i])-dnum(seq[i-1]))/864e5);
  gaps.sort(function(a,b){return a-b;});
  var n=gaps.length; SER_HALF[s] = n ? (n%2 ? gaps[(n-1)/2] : (gaps[n/2-1]+gaps[n/2])/2) : 365;
  SER_HALF[s+'_gaps'] = gaps;
});
var SCRABBLE={a:1,b:3,c:3,d:2,e:1,f:4,g:2,h:4,i:1,j:8,k:5,l:1,m:3,n:1,o:1,p:3,q:10,r:1,s:1,t:1,u:1,v:4,w:4,x:8,y:4,z:10};

MODELS.forEach(function(m,i){
  m.i=i; m.slug=slug(m.name);
  m.bl=(3*m.pin+m.pout)/4;
  var low=m.name.toLowerCase();
  m.val={
    ver:m.ver,
    len:m.name.length,
    ip:27-(m.name.toUpperCase().charCodeAt(0)-64),
    pcv:VEND[m.v].pcv,
    vpd:m.ver/m.bl,
    vir:SER_VIR[m.v],
    straw:(low.match(/r/g)||[]).length,
    scrab:low.split('').reduce(function(a,c){ return a+(SCRABBLE[c]||0); },0),
    half:SER_HALF[m.v]
  };
});
(function(){
  var n=MODELS.length;
  METRICS.forEach(function(mt){
    var sgn = mt.better==='low' ? -1 : 1;
    var vals=MODELS.map(function(m){return sgn*m.val[mt.k];});
    MODELS.forEach(function(m){
      var x=sgn*m.val[mt.k], less=0, eq=0;
      vals.forEach(function(y){ if(y<x-1e-12) less++; else if(Math.abs(y-x)<=1e-12) eq++; });
      (m.pct=m.pct||{})[mt.k]=100*(less+(eq-1)/2)/(n-1);
    });
  });
  MODELS.forEach(function(m){ m.idx = IDX.reduce(function(a,mt){return a+m.pct[mt.k];},0)/IDX.length; });
})();
var RANKED = MODELS.slice().sort(function(a,b){ return (b.idx-a.idx) || (b.ver-a.ver) || (b.val.len-a.val.len); });
RANKED.forEach(function(m,i){ m.rank=i+1; });
var TOP = RANKED[0];

function fmtVal(k, v, m){
  switch(k){
    case 'ver': return f1(v);
    case 'len': return String(v);
    case 'ip':  return v+' · '+m.name.charAt(0).toUpperCase();
    case 'pcv': return 'v'+f1(v);
    case 'vpd': return f1(v);
    case 'vir': return '+'+f1(v)+'%';
    case 'straw': case 'scrab': return String(v);
    case 'half': return (Math.round(v*10)/10)+t('days');
    case 'idx': return String(Math.round(v));
  }
  return String(v);
}
function metricTitle(k){ return L(MET[k].title); }
function metricSub(k){ var mt=MET[k]; return L(mt.desc)+' · '+t(mt.better==='low'?'lower':'higher'); }

var YOY = (function(){
  var out=[];
  for(var y=2024; y<=2026; y++){
    var a=y+ASOF.slice(4), b=(y-1)+ASOF.slice(4), s=0, c=0, det=[];
    VORDER.forEach(function(v){ var x=verAt(v,a), p=verAt(v,b); if(x!=null&&p!=null){ var g=(x/p-1)*100; s+=g; c++; det.push([v,g]); } });
    out.push({y:y, v:s/c, n:c, det:det});
  }
  return out;
})();

/* ================= SVG sprite ================= */
var LOGOS = window.BENCHROT_LOGOS || {};
(function(){
  var stops='<stop offset="0" stop-color="#0EBC5F"/><stop offset=".28" stop-color="#3186FF"/><stop offset=".68" stop-color="#3186FF"/><stop offset=".86" stop-color="#FF4641"/><stop offset="1" stop-color="#FBBC04"/>';
  var sym='', css='';
  Object.keys(LOGOS).forEach(function(k){
    sym+='<symbol id="lg-'+k+'" viewBox="0 0 96 96"><image href="'+LOGOS[k]+'" width="96" height="96"/></symbol>';
    css+='.lg-'+k+'{background-image:url('+LOGOS[k]+')}';
  });
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'+
    '<linearGradient id="gemV" x1="0" y1="1" x2="0" y2="0">'+stops+'</linearGradient>'+
    '<linearGradient id="gemH" x1="0" y1="0" x2="1" y2="0">'+stops+'</linearGradient>'+
    '<linearGradient id="gemD" x1="0" y1="1" x2="1" y2="0">'+stops+'</linearGradient>'+sym+'</defs></svg>');
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
})();
function useLogo(key,x,y,s){ return '<use href="#lg-'+key+'" x="'+r1(x)+'" y="'+r1(y)+'" width="'+r1(s)+'" height="'+r1(s)+'"/>'; }
var MARK_SVG='<svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true"><rect x="2" y="11" width="4" height="9" fill="#141413"/><rect x="9" y="6" width="4" height="14" fill="#141413"/><rect x="16" y="2" width="4" height="18" fill="#d97757"/></svg>';
var WM_HTML=MARK_SVG+'<span>Benchrot</span>';
var UID=0;

/* ================= chart primitives ================= */
function rect(x,y,w,h){ return 'M'+r1(x)+','+r1(y)+'h'+r1(w)+'v'+r1(h)+'h'+r1(-w)+'Z'; }
function tipAttr(title, rows){
  var s=esc(title)+'\u001e'+rows.map(function(r){return esc(r[0])+'\u001f'+esc(r[1])+(r[2]?'\u001f'+r[2]:'');}).join('\u001e');
  return ' data-tip="'+s+'"';
}
function svgOpen(w,h,label){ return '<svg viewBox="0 0 '+r1(w)+' '+r1(h)+'" width="'+r1(w)+'" height="'+r1(h)+'" role="img" aria-label="'+esc(label||'')+'">'; }
// the AA-style highlight arrow, tip at (x,y)
function arrow(x,y,len,k,dir){
  var hw=5*k, hh=7*k, sw=2.4*k;
  if(dir==='left') return '<g fill="#141413"><path d="M'+r1(x+hh)+','+r1(y)+'h'+r1(len-hh)+'" stroke="#141413" stroke-width="'+r1(sw)+'"/><path d="M'+r1(x)+','+r1(y)+'l'+r1(hh+1)+','+r1(-hw)+'v'+r1(2*hw)+'z"/></g>';
  return '<g fill="#141413"><path d="M'+r1(x)+','+r1(y-len)+'v'+r1(len-hh)+'" stroke="#141413" stroke-width="'+r1(sw)+'"/><path d="M'+r1(x)+','+r1(y)+'l'+r1(-hw)+','+r1(-hh-1)+'h'+r1(2*hw)+'z"/></g>';
}
function dottedLine(x1,y1,x2,y2,k,col){
  return '<line x1="'+r1(x1)+'" x2="'+r1(x2)+'" y1="'+r1(y1)+'" y2="'+r1(y2)+'" stroke="'+(col||'#d4d2cb')+'" stroke-width="'+r1(Math.max(1,k))+'" stroke-dasharray="'+r1(1*k)+' '+r1(4*k)+'" stroke-linecap="round"/>';
}
function sortItems(items, better){
  return items.slice().sort(function(a,b){ return (better==='low' ? a.v-b.v : b.v-a.v) || (a.i-b.i); });
}
function modelItem(m, k){
  return {name:m.name, logo:VEND[m.v].logo, v:m.val[k], label:fmtVal(k,m.val[k],m), vend:m.v, i:m.i, hl:m===TOP,
    tip:tipAttr(m.name, [[metricTitle(k), fmtVal(k,m.val[k],m)],[t('idxCol'), fmtVal('idx',m.idx)],[t('thCo'), L(VEND[m.v].co)]])};
}
function indexItems(){
  return RANKED.map(function(m){ var it=modelItem(m,'ver'); it.v=m.idx; it.label=fmtVal('idx',m.idx); it.hl=false;
    it.tip=tipAttr(m.name, [[t('idxCol'),f1(m.idx)]].concat(IDX.map(function(mt){return [L(mt.title), fmtVal(mt.k,m.val[mt.k],m)+' · P'+Math.round(m.pct[mt.k])];}))); return it; });
}

/* Vertical columns, Artificial Analysis style: square bars, dotted grid, value on
   top, logo + rotated label underneath, optional arrow, tag and reference line.
   data-s = reveal step (worst first, best last) for the video timeline. */
function colChart(o){
  var k=o.k||1, fs=11.5*k, items=o.keep ? o.items.slice() : sortItems(o.items, o.better), n=items.length;
  var maxV=Math.max.apply(null, items.map(function(i){return i.v;}));
  if(o.ref) maxV=Math.max(maxV, o.ref.v*1.15);
  var tk=ticks(o.max||maxV||1, 4), max=tk[tk.length-1];
  var tf=o.tickFmt||tickFmt;
  var tkW=Math.max.apply(null, tk.map(function(v){return tw(tf(v), fs*.95);}));
  var padL=tkW+12*k, padR=4*k;
  var hasHl=items.some(function(i){return i.hl;});
  var padT=(o.tag?40*k:hasHl?44*k:20*k);
  var slot=(o.w-padL-padR)/n;
  var logoS=Math.min(18*k, slot*.5);
  var rot=o.noRotate?0:52, sn=Math.sin(rot*Math.PI/180);
  var lfs=fs*.98;
  var nameW=Math.max.apply(null, items.map(function(it){return tw(it.name,lfs);}));
  var padB=8*k+(items[0].logo?logoS+8*k:0)+(rot?nameW*sn+lfs:lfs*1.6);
  var ph=Math.max(40, o.h-padT-padB);
  var bw=Math.min(o.bwMax||60*k, slot*.72);
  var s=svgOpen(o.w,o.h,o.label);
  tk.forEach(function(v){
    var y=padT+ph-ph*v/max;
    if(v===0) s+='<line x1="'+r1(padL)+'" x2="'+r1(o.w-padR)+'" y1="'+r1(y)+'" y2="'+r1(y)+'" stroke="#bdbab1" stroke-width="'+r1(Math.max(1,k))+'"/>';
    else s+=dottedLine(padL,y,o.w-padR,y,k);
    s+='<text x="'+r1(padL-10*k)+'" y="'+r1(y+fs*.35)+'" text-anchor="end" font-size="'+r1(fs*.95)+'" fill="#6f6e69">'+tf(v)+'</text>';
  });
  if(o.ref){
    var yr=padT+ph-ph*o.ref.v/max;
    s+='<g class="rv" data-s="0"><line x1="'+r1(padL)+'" x2="'+r1(o.w-padR)+'" y1="'+r1(yr)+'" y2="'+r1(yr)+'" stroke="#555" stroke-width="'+r1(1.3*k)+'" stroke-dasharray="'+r1(5*k)+' '+r1(4*k)+'"/>';
    s+='<text x="'+r1(o.w-padR)+'" y="'+r1(yr-7*k)+'" text-anchor="end" font-size="'+r1(fs)+'" fill="#141413">'+esc(o.ref.label)+'</text></g>';
  }
  items.forEach(function(it,i){
    var cx=padL+slot*i+slot/2, bh=Math.max(ph*it.v/max, it.v>0?1:0), y0=padT+ph;
    var step = o.revealOrder==='ltr' ? i : n-1-i;
    s+='<g class="rv" data-s="'+(step+(o.ref?1:0))+'" data-o="'+i+'"'+(it.tip||'')+'>';
    s+='<rect x="'+r1(padL+slot*i)+'" y="'+r1(padT-10*k)+'" width="'+r1(slot)+'" height="'+r1(ph+padB+10*k)+'" fill="transparent"/>';
    if(bh>0) s+='<path class="grow" d="'+rect(cx-bw/2, y0-bh, bw, bh)+'" fill="'+(it.fill||fill(it.vend,'V'))+'"/>';
    s+='<text x="'+r1(cx)+'" y="'+r1(y0-bh-7*k)+'" text-anchor="middle" font-size="'+r1(fs*1.02)+'" font-weight="500" fill="#141413">'+esc(it.label)+'</text>';
    var ly=y0+8*k;
    if(it.logo){ s+=useLogo(it.logo, cx-logoS/2, ly, logoS); ly+=logoS+8*k; }
    if(rot) s+='<text transform="translate('+r1(cx+lfs*.3)+','+r1(ly)+') rotate(-'+rot+')" text-anchor="end" font-size="'+r1(lfs)+'" fill="#3d3d3a">'+esc(it.name)+'</text>';
    else s+='<text x="'+r1(cx)+'" y="'+r1(ly+lfs*.9)+'" text-anchor="middle" font-size="'+r1(lfs)+'" fill="#3d3d3a">'+esc(it.name)+'</text>';
    s+='</g>';
    if(o.tag && i===0){
      var tfs=fs*.9, tw_=tw(o.tag,tfs)+tfs*2.4, th=tfs*1.8, ty=y0-bh-fs*1.3-8*k-th, tx=Math.max(padL+2*k, cx-tw_/2);
      s+='<g class="rv pop" data-s="'+(n+(o.ref?1:0))+'"><rect x="'+r1(tx)+'" y="'+r1(ty)+'" width="'+r1(tw_)+'" height="'+r1(th)+'" rx="'+r1(th/2)+'" fill="#141413"/>'+
        '<circle cx="'+r1(tx+tfs*1)+'" cy="'+r1(ty+th/2)+'" r="'+r1(tfs*.28)+'" fill="#d97757"/>'+
        '<text x="'+r1(tx+tfs*1.6)+'" y="'+r1(ty+th/2+tfs*.36)+'" font-size="'+r1(tfs)+'" font-weight="500" fill="#fff">'+esc(o.tag)+'</text></g>';
    }
    if(it.hl && !o.tag){
      s+='<g class="rv" data-s="'+(n+(o.ref?1:0))+'">'+arrow(cx, y0-bh-fs*1.25-7*k, 26*k, k)+'</g>';
    }
  });
  return s+'</svg>';
}

/* Horizontal bars (phones and portrait video). */
function barChart(o){
  var k=o.k||1, fs=(o.fs||12)*k, items=o.keep ? o.items.slice() : sortItems(o.items, o.better), n=items.length;
  var rowH=o.rowH||Math.max(fs*2.3, 26*k);
  var logoS=Math.min(17*k*(o.fs?o.fs/12:1), rowH*.62);
  var rankW=o.rank ? tw('16',fs)+fs*.8 : 0;
  var nameW=Math.max.apply(null, items.map(function(it){return tw(it.name,fs);}));
  var labW=rankW+logoS+7*k+nameW+12*k;
  var hasHl=items.some(function(i){return i.hl;});
  var valW=Math.max.apply(null, items.map(function(it){return tw(it.label,fs*1.02);}))+10*k+(hasHl?30*k:0);
  var tagFs=fs*.8, tagW=o.tag ? tw(o.tag,tagFs)+tagFs*2.3 : 0;
  var tagAfter = o.tag && (o.w-labW-valW-tagW-10*k) > o.w*.38;
  var plotW=o.w-labW-valW-(tagAfter?tagW+8*k:0);
  var maxV=Math.max.apply(null, items.map(function(i){return i.v;}));
  if(o.ref) maxV=Math.max(maxV, o.ref.v*1.08);
  var max=o.max||maxV||1;
  var tagMode = !o.tag ? null : tagAfter ? 'after' : (plotW*items[0].v/max > tagW+14*k ? 'inside' : 'below');
  var extra = tagMode==='below' ? tagFs*2.2 : 0;
  var bh=Math.min(20*k, rowH*.58);
  var top=o.padT!=null?o.padT:(o.ref?fs*1.6:2*k);
  var h=top+n*rowH+extra;
  var s=svgOpen(o.w,h,o.label);
  s+='<line x1="'+r1(labW)+'" x2="'+r1(labW)+'" y1="'+r1(top)+'" y2="'+r1(h)+'" stroke="#bdbab1" stroke-width="'+r1(Math.max(1,k))+'"/>';
  if(o.ref){
    var xr=labW+plotW*o.ref.v/max;
    s+='<g class="rv" data-s="0"><line x1="'+r1(xr)+'" x2="'+r1(xr)+'" y1="'+r1(top-2*k)+'" y2="'+r1(h)+'" stroke="#555" stroke-width="'+r1(1.3*k)+'" stroke-dasharray="'+r1(5*k)+' '+r1(4*k)+'"/>';
    s+='<text x="'+r1(xr)+'" y="'+r1(top-6*k)+'" text-anchor="end" font-size="'+r1(fs*.9)+'" fill="#141413">'+esc(o.ref.label)+'</text></g>';
  }
  items.forEach(function(it,i){
    var y=top+i*rowH+(i>0?extra:0), cy=y+rowH/2, w=plotW*it.v/max;
    var step = (o.revealOrder==='ltr' ? i : n-1-i)+(o.ref?1:0);
    s+='<g class="rv" data-s="'+step+'" data-o="'+i+'"'+(it.tip||'')+'>';
    s+='<rect x="0" y="'+r1(y)+'" width="'+r1(o.w)+'" height="'+r1(rowH+(i===0?extra:0))+'" fill="transparent"/>';
    var x=0;
    if(o.rank){ s+='<text x="'+r1(rankW-fs*.7)+'" y="'+r1(cy+fs*.35)+'" text-anchor="end" font-size="'+r1(fs*.92)+'" fill="#8f8d86">'+(i+1)+'</text>'; x=rankW; }
    if(it.logo) s+=useLogo(it.logo, x, cy-logoS/2, logoS);
    s+='<text x="'+r1(x+(it.logo?logoS+7*k:0))+'" y="'+r1(cy+fs*.35)+'" font-size="'+r1(fs)+'" fill="#141413"'+((i===0&&o.rank)||it.hl?' font-weight="600"':'')+'>'+esc(it.name)+'</text>';
    if(w>0) s+='<path class="hgrow" d="'+rect(labW+1, cy-bh/2, Math.max(w,1), bh)+'" fill="'+(it.fill||fill(it.vend,'H'))+'"/>';
    var lw=tw(it.label,fs*1.02);
    s+='<text x="'+r1(labW+w+7*k)+'" y="'+r1(cy+fs*.36)+'" font-size="'+r1(fs*1.02)+'" font-weight="500" fill="#141413">'+esc(it.label)+'</text>';
    if(it.hl && !o.tag) s+=arrow(labW+w+7*k+lw+6*k, cy, 22*k, k*.85, 'left');
    if(o.tag && i===0){
      var tx, inside=false, th=tagFs*1.75;
      if(tagMode==='after'){ tx=labW+w+7*k+lw+10*k; }
      else if(tagMode==='inside'){ tx=labW+w-tagW-5*k; inside=true; }
      else { tx=x+logoS+7*k; cy=y+rowH+extra/2-th*.25; }
      s+='<g class="pop">';
      s+='<rect x="'+r1(tx)+'" y="'+r1(cy-th/2)+'" width="'+r1(tagW)+'" height="'+r1(th)+'" rx="'+r1(th/2)+'" fill="'+(inside?'#ffffff':'#141413')+'"/>';
      s+='<circle cx="'+r1(tx+tagFs*.95)+'" cy="'+r1(cy)+'" r="'+r1(tagFs*.28)+'" fill="#d97757"/>';
      s+='<text x="'+r1(tx+tagFs*1.55)+'" y="'+r1(cy+tagFs*.36)+'" font-size="'+r1(tagFs)+'" font-weight="500" fill="'+(inside?'#141413':'#ffffff')+'">'+esc(o.tag)+'</text>';
      s+='</g>';
    }
    s+='</g>';
  });
  return {svg:s+'</svg>', h:h};
}

/* Scatter: version vs price, AA style (green quadrant, dotted Pareto line). */
function scatterChart(o){
  var k=o.k||1, fs=11.5*k, pk=o.pk||'bl', narrow=o.w<560*k;
  var padL=(narrow?40:58)*k, padR=12*k, padT=16*k, padB=(narrow?44:52)*k;
  var pw=o.w-padL-padR, ph=o.h-padT-padB;
  var xmin=Math.log10(0.1), xmax=Math.log10(50), ymin=2.5, ymax=6.5;
  function X(p){ return padL+pw*(Math.log10(p)-xmin)/(xmax-xmin); }
  function Y(v){ return padT+ph-ph*(v-ymin)/(ymax-ymin); }
  var pts=MODELS.map(function(m){ return {m:m, p:pk==='bl'?m.bl:m[pk], v:m.ver}; });
  var ps=pts.map(function(d){return d.p;}).sort(function(a,b){return a-b;}), vs=pts.map(function(d){return d.v;}).sort(function(a,b){return a-b;});
  var medP=(ps[7]+ps[8])/2, medV=(vs[7]+vs[8])/2;
  var s=svgOpen(o.w,o.h,o.label);
  // quadrants
  s+='<g class="rv" data-s="0"><rect x="'+r1(padL)+'" y="'+r1(padT)+'" width="'+r1(X(medP)-padL)+'" height="'+r1(Y(medV)-padT)+'" fill="#e3f6e1"/>';
  s+='<rect x="'+r1(X(medP))+'" y="'+r1(Y(medV))+'" width="'+r1(padL+pw-X(medP))+'" height="'+r1(padT+ph-Y(medV))+'" fill="#f6f6f4"/></g>';
  // axes
  [3,4,5,6].forEach(function(v){
    s+='<line x1="'+r1(padL-6*k)+'" x2="'+r1(padL)+'" y1="'+r1(Y(v))+'" y2="'+r1(Y(v))+'" stroke="#8f8d86" stroke-width="'+r1(Math.max(1,k))+'"/>';
    s+='<text x="'+r1(padL-10*k)+'" y="'+r1(Y(v)+fs*.35)+'" text-anchor="end" font-size="'+r1(fs*.95)+'" fill="#6f6e69">'+v+'.0</text>';
  });
  var xt = narrow ? [0.1,0.5,1,5,10,50] : [0.1,0.2,0.5,1,2,5,10,20,50];
  xt.forEach(function(p){
    s+='<line x1="'+r1(X(p))+'" x2="'+r1(X(p))+'" y1="'+r1(padT+ph)+'" y2="'+r1(padT+ph+6*k)+'" stroke="#8f8d86" stroke-width="'+r1(Math.max(1,k))+'"/>';
    s+='<text x="'+r1(X(p))+'" y="'+r1(padT+ph+fs*1.7)+'" text-anchor="middle" font-size="'+r1(fs*.95)+'" fill="#6f6e69">$'+(p<1?p.toFixed(1):p)+'</text>';
  });
  s+='<line x1="'+r1(padL)+'" x2="'+r1(padL)+'" y1="'+r1(padT)+'" y2="'+r1(padT+ph)+'" stroke="#bdbab1" stroke-width="'+r1(Math.max(1,k))+'"/>';
  s+='<line x1="'+r1(padL)+'" x2="'+r1(padL+pw)+'" y1="'+r1(padT+ph)+'" y2="'+r1(padT+ph)+'" stroke="#bdbab1" stroke-width="'+r1(Math.max(1,k))+'"/>';
  s+='<text x="'+r1(padL+pw/2)+'" y="'+r1(o.h-4*k)+'" text-anchor="middle" font-size="'+r1(fs*1.05)+'" fill="#141413">'+esc(t('xPrice_'+pk))+'</text>';
  if(!narrow) s+='<text transform="translate('+r1(fs*1.1)+','+r1(padT+ph/2)+') rotate(-90)" text-anchor="middle" font-size="'+r1(fs*1.05)+'" fill="#141413">'+esc(t('yVer'))+'</text>';
  // Pareto line: best version available at or below each price (dotted, revealed through a mask)
  var sorted=pts.slice().sort(function(a,b){return (a.p-b.p)||(b.v-a.v);}), fr=[], best=-1;
  sorted.forEach(function(d){ if(d.v>best+1e-9){ fr.push(d); best=d.v; } });
  var d='M'+r1(X(fr[0].p))+','+r1(padT+ph)+'L'+r1(X(fr[0].p))+','+r1(Y(fr[0].v));
  for(var i=1;i<fr.length;i++) d+='L'+r1(X(fr[i].p))+','+r1(Y(fr[i].v));
  d+='L'+r1(padL+pw)+','+r1(Y(fr[fr.length-1].v));
  var nP=pts.length, mid='pm'+(++UID);
  s+='<mask id="'+mid+'" maskUnits="userSpaceOnUse"><path class="draw" data-s="'+(nP+1)+'" data-dur="900" d="'+d+'" pathLength="1" fill="none" stroke="#fff" stroke-width="'+r1(8*k)+'"/></mask>';
  s+='<path d="'+d+'" mask="url(#'+mid+')" fill="none" stroke="#141413" stroke-width="'+r1(2.2*k)+'" stroke-dasharray="'+r1(.1*k)+' '+r1(5*k)+'" stroke-linecap="round" stroke-linejoin="round"/>';
  // points + greedy label placement
  var R=6.5*k, boxes=pts.map(function(d){ return {x:X(d.p)-R,y:Y(d.v)-R,w:2*R,h:2*R}; });
  var segs=[]; var pp=[[X(fr[0].p),padT+ph],[X(fr[0].p),Y(fr[0].v)]];
  for(i=1;i<fr.length;i++) pp.push([X(fr[i].p),Y(fr[i].v)]);
  pp.push([padL+pw,Y(fr[fr.length-1].v)]);
  for(i=1;i<pp.length;i++){ var ax=Math.min(pp[i-1][0],pp[i][0]), ay=Math.min(pp[i-1][1],pp[i][1]); segs.push({x:ax-3*k,y:ay-3*k,w:Math.abs(pp[i][0]-pp[i-1][0])+6*k,h:Math.abs(pp[i][1]-pp[i-1][1])+6*k}); }
  boxes=boxes.concat(segs);
  function hit(b){ for(var j=0;j<boxes.length;j++){ var c=boxes[j]; if(b.x<c.x+c.w&&b.x+b.w>c.x&&b.y<c.y+c.h&&b.y+b.h>c.y) return true; } return false; }
  var order=pts.slice().sort(function(a,b){return (a.p-b.p)||(b.v-a.v);});
  var lfs=fs*(narrow?.86:.98);
  order.forEach(function(dd,idx){
    var cx=X(dd.p), cy=Y(dd.v), name=dd.m.name;
    if(narrow) name=name.replace(/^Claude /,'').replace(/^DeepSeek /,'DS ');
    var w=tw(name,lfs), h=lfs*1.25;
    var cands=[[cx+R+5*k, cy-h/2],[cx-R-5*k-w, cy-h/2],[cx-w/2, cy-R-4*k-h],[cx-w/2, cy+R+4*k],[cx+R*.6, cy-R-h],[cx+R*.6, cy+R],[cx-R*.6-w, cy-R-h],[cx-R*.6-w, cy+R]];
    var pick=null;
    for(var c=0;c<cands.length;c++){ var b={x:cands[c][0],y:cands[c][1],w:w,h:h}; if(b.x<padL+2||b.x+b.w>o.w-2||b.y<padT||b.y+b.h>padT+ph) continue; if(!hit(b)){ pick=b; break; } }
    if(!pick) pick={x:cx+R+5*k,y:cy-h/2,w:w,h:h};
    boxes.push(pick);
    var m=dd.m;
    s+='<g class="rv" data-s="'+(idx+1)+'"'+tipAttr(m.name,[[t('yVer'),f1(m.ver)],[t('thBl'),money(m.bl)],[t('thIn'),money(m.pin)],[t('thOut'),money(m.pout)]])+'>';
    s+='<circle class="pop" cx="'+r1(cx)+'" cy="'+r1(cy)+'" r="'+r1(R)+'" fill="'+fill(m.v,'D')+'" stroke="#fff" stroke-width="'+r1(1.5*k)+'"/>';
    s+='<text x="'+r1(pick.x)+'" y="'+r1(pick.y+lfs*.95)+'" font-size="'+r1(lfs)+'" fill="#3d3d3a">'+esc(name)+'</text>';
    if(m===TOP) s+=arrow(cx, cy-R-4*k, 26*k, k);
    s+='</g>';
  });
  return s+'</svg>';
}

/* Trend: step lines of the top version per series. */
function trendChart(o){
  var k=o.k||1, fs=11.5*k;
  var x0=dnum('2022-11-01'), x1=dnum(ASOF)+20*864e5;
  var endW=tw('DeepSeek 4.1',fs)+fs*2.2+14*k;
  var padL=28*k, padR=endW, padT=10*k, padB=28*k;
  var pw=o.w-padL-padR, ph=o.h-padT-padB, ymax=6.5;
  function X(d){ return padL+pw*(d-x0)/(x1-x0); }
  function Y(v){ return padT+ph-ph*v/ymax; }
  var s=svgOpen(o.w,o.h,o.label);
  [0,1,2,3,4,5,6].forEach(function(v){
    if(v===0) s+='<line x1="'+r1(padL)+'" x2="'+r1(padL+pw)+'" y1="'+r1(Y(v))+'" y2="'+r1(Y(v))+'" stroke="#bdbab1" stroke-width="'+r1(Math.max(1,k))+'"/>';
    else s+=dottedLine(padL,Y(v),padL+pw,Y(v),k);
    s+='<text x="'+r1(padL-8*k)+'" y="'+r1(Y(v)+fs*.35)+'" text-anchor="end" font-size="'+r1(fs*.95)+'" fill="#6f6e69">'+v+'</text>';
  });
  [2023,2024,2025,2026].forEach(function(y){
    var x=X(Date.UTC(y,0,1));
    s+='<line x1="'+r1(x)+'" x2="'+r1(x)+'" y1="'+r1(padT+ph)+'" y2="'+r1(padT+ph+5*k)+'" stroke="#8f8d86" stroke-width="'+r1(Math.max(1,k))+'"/>';
    s+='<text x="'+r1(x)+'" y="'+r1(padT+ph+fs*1.6)+'" text-anchor="middle" font-size="'+r1(fs*.95)+'" fill="#6f6e69">'+y+'</text>';
  });
  var ends=[], xe=X(dnum(ASOF));
  VORDER.forEach(function(v,si){
    var h=HIST[v], d='', cur=null;
    h.forEach(function(p,j){
      var x=X(dnum(p[0])), y=Y(p[1]);
      if(j===0) d+='M'+r1(x)+','+r1(y); else d+='H'+r1(x)+'V'+r1(y);
      cur=p[1];
    });
    d+='H'+r1(xe);
    s+='<path class="draw rv" data-s="'+si+'" data-o="'+si+'" data-dur="1000" d="'+d+'" pathLength="1" fill="none" stroke="'+(VEND[v].grad?'url(#gemH)':VEND[v].color)+'" stroke-width="'+r1(2.2*k)+'" stroke-linejoin="round" stroke-linecap="round"/>';
    ends.push({v:v, y:Y(cur), ty:Y(cur), val:cur, si:si});
  });
  var gap=fs*1.55; ends.sort(function(a,b){return a.y-b.y;});
  for(var i=1;i<ends.length;i++) if(ends[i].ty<ends[i-1].ty+gap) ends[i].ty=ends[i-1].ty+gap;
  var over=ends[ends.length-1].ty-(padT+ph); if(over>0) ends.forEach(function(e){e.ty-=over;});
  for(i=ends.length-2;i>=0;i--) if(ends[i].ty>ends[i+1].ty-gap) ends[i].ty=ends[i+1].ty-gap;
  var lx=xe+12*k, ls=fs*1.15;
  ends.forEach(function(e){
    s+='<g class="rv" data-s="'+e.si+'" data-dl="700" style="--d:'+(e.si*.08+.5)+'s">';
    s+='<circle cx="'+r1(xe)+'" cy="'+r1(e.y)+'" r="'+r1(4*k)+'" fill="'+(VEND[e.v].grad?'#FBBC04':VEND[e.v].color)+'" stroke="#fff" stroke-width="'+r1(2*k)+'"/>';
    if(Math.abs(e.ty-e.y)>1) s+='<path d="M'+r1(xe+5*k)+','+r1(e.y)+'L'+r1(lx-3*k)+','+r1(e.ty)+'" stroke="#cfccc3" fill="none" stroke-width="'+r1(Math.max(1,k))+'"/>';
    s+=useLogo(VEND[e.v].logo, lx, e.ty-ls/2, ls);
    s+='<text x="'+r1(lx+ls+5*k)+'" y="'+r1(e.ty+fs*.36)+'" font-size="'+r1(fs)+'" fill="#141413">'+SERIES_NAME[e.v]+' <tspan font-weight="600">'+f1(e.val)+'</tspan></text>';
    s+='</g>';
  });
  if(o.interactive){
    s+='<g class="xh" style="display:none"><line y1="'+r1(padT)+'" y2="'+r1(padT+ph)+'" stroke="#141413" stroke-opacity=".35"/></g>';
    s+='<rect class="hitarea" x="'+r1(padL)+'" y="'+r1(padT)+'" width="'+r1(pw)+'" height="'+r1(ph)+'" fill="transparent" data-x0="'+x0+'" data-x1="'+x1+'" data-pl="'+r1(padL)+'" data-pw="'+r1(pw)+'" data-vw="'+r1(o.w)+'"/>';
  }
  return s+'</svg>';
}

/* Radar. The polygon/dots carry their geometry so setRadar() can animate them. */
function radarSvg(m, w, k, opts){
  k=k||1; opts=opts||{};
  var fs=(opts.fs||10)*k, padX=opts.padX!=null?opts.padX:tw(LANG==='zh'?'母公司版本':'Parent ver.',fs)*.62+8*k, padY=fs*1.9;
  var h=opts.h||w;
  var cx=w/2, cy=h/2+fs*.15, R=Math.max(10, Math.min(w/2-padX, h/2-padY));
  var n=IDX.length, s=svgOpen(w,h,m.name);
  function pt(i,r){ var a=-Math.PI/2+i*2*Math.PI/n; return [cx+Math.cos(a)*r, cy+Math.sin(a)*r]; }
  [.25,.5,.75,1].forEach(function(f){
    var d=''; for(var i=0;i<n;i++){ var p=pt(i,R*f); d+=(i?'L':'M')+r1(p[0])+','+r1(p[1]); }
    s+='<path d="'+d+'Z" fill="none" stroke="'+(f===1?'#d9d6cd':'#eceae4')+'" stroke-width="'+r1(Math.max(1,k*.8))+'"/>';
  });
  for(var i=0;i<n;i++){
    var p=pt(i,R); s+='<line x1="'+r1(cx)+'" y1="'+r1(cy)+'" x2="'+r1(p[0])+'" y2="'+r1(p[1])+'" stroke="#eceae4" stroke-width="'+r1(Math.max(1,k*.8))+'"/>';
    var lp=pt(i,R+fs*.8), anchor=Math.abs(lp[0]-cx)<2?'middle':(lp[0]>cx?'start':'end');
    var dy=lp[1]<cy-R*.5?-fs*.15:(lp[1]>cy+R*.5?fs*.85:fs*.35);
    s+='<text x="'+r1(lp[0])+'" y="'+r1(lp[1]+dy)+'" text-anchor="'+anchor+'" font-size="'+r1(fs)+'" fill="#8f8d86">'+esc(L(IDX[i].short))+(opts.values?' <tspan fill="#141413" font-weight="600" class="rvv" data-i="'+i+'"></tspan>':'')+'</text>';
  }
  var vals=IDX.map(function(mt){ return m.pct[mt.k]; });
  var col=fill(m.v,'D'), dot=VEND[m.v].color;
  s+='<g class="rgeo '+(opts.cls||'')+'"'+(opts.attrs||'')+' data-cx="'+r1(cx)+'" data-cy="'+r1(cy)+'" data-r="'+r1(R)+'" data-vals="'+vals.join(',')+'">';
  s+='<path class="rpoly" d="'+radarPath(cx,cy,R,vals,null)+'" fill="'+dot+'" fill-opacity=".14" stroke="'+col+'" stroke-width="'+r1(2*k)+'" stroke-linejoin="round"/>';
  vals.forEach(function(v,i){ var q=radarPt(cx,cy,R,i,v); s+='<circle class="rdot" cx="'+r1(q[0])+'" cy="'+r1(q[1])+'" r="'+r1(2.8*k)+'" fill="'+dot+'" stroke="#fff" stroke-width="'+r1(1.2*k)+'"/>'; });
  s+='</g>';
  return s+'</svg>';
}
function radarPt(cx,cy,R,i,v){ var a=-Math.PI/2+i*2*Math.PI/IDX.length, r=R*Math.max(v,3)/100; return [cx+Math.cos(a)*r, cy+Math.sin(a)*r]; }
function radarPath(cx,cy,R,vals){ var d=''; vals.forEach(function(v,i){ var p=radarPt(cx,cy,R,i,v); d+=(i?'L':'M')+r1(p[0])+','+r1(p[1]); }); return d+'Z'; }
// draw a radar geometry group with the given values (array of 0..100)
function setRadar(g, vals){
  var cx=+g.getAttribute('data-cx'), cy=+g.getAttribute('data-cy'), R=+g.getAttribute('data-r');
  g.querySelector('.rpoly').setAttribute('d', radarPath(cx,cy,R,vals));
  $$('.rdot',g).forEach(function(c,i){ var p=radarPt(cx,cy,R,i,vals[i]); c.setAttribute('cx',r1(p[0])); c.setAttribute('cy',r1(p[1])); });
}
// grow-in values at progress p (0..1) with a per-vertex stagger
function radarGrow(vals, p){
  return vals.map(function(v,i){ var q=clamp((p*1.45-i*.075)/1,0,1); return v*EASE.back(q); });
}

/* ================= page charts ================= */
var PRICE_KEY='bl';
var CHARTS = {
  index:function(el,w){
    if(w<640) return barChart({w:w, items:indexItems(), keep:true, k:1, fs:w<420?11:12, rowH:w<420?28:30, rank:true, tag:t('sotf'), max:100, label:t('indexTitle'), revealOrder:'ltr'}).svg;
    return colChart({w:w, h:Math.max(360,Math.min(440,w*.36)), items:indexItems(), keep:true, k:1, tag:t('sotf'), label:t('indexTitle'), revealOrder:'ltr'});
  },
  metric:function(el,w,key){
    var mt=MET[key], items=MODELS.map(function(m){return modelItem(m,key);}), ref=mt.ref?{v:mt.ref.v,label:L(mt.ref.label)}:null;
    if(w<640) return barChart({w:w, items:items, better:mt.better, ref:ref, k:1, fs:w<420?11:12, rowH:w<420?27:29, label:metricTitle(key), revealOrder:'ltr'}).svg;
    return colChart({w:w, h:Math.max(330,Math.min(420,w*.36)), items:items, better:mt.better, ref:ref, k:1, label:metricTitle(key), revealOrder:'ltr'});
  },
  scatter:function(el,w){ return scatterChart({w:w, h:w<560?Math.max(360,w*1.08):Math.min(600,w*.54), k:1, pk:PRICE_KEY, label:t('scatterT')}); },
  trend:function(el,w){ return trendChart({w:w, h:w<560?300:400, k:1, interactive:true, label:t('trendT')}); },
  yoy:function(el,w){
    var items=YOY.map(function(y,i){ return {name:String(y.y), v:y.v, label:'+'+f1(y.v)+'%', fill:'#3d3d3a', i:i,
      tip:tipAttr(String(y.y), y.det.map(function(d){return [SERIES_NAME[d[0]], '+'+f1(d[1])+'%', cssFill(d[0])];}))}; });
    return colChart({w:w, h:300, items:items, keep:true, k:1, noRotate:true, bwMax:70, label:t('yoyT'), tickFmt:function(v){return v+'%';}, revealOrder:'ltr'});
  },
  series:function(el,w){
    var items=seriesItems();
    if(w<640) return barChart({w:w, items:items, k:1, fs:12, rowH:34, label:t('serT'), revealOrder:'ltr'}).svg;
    return colChart({w:w, h:300, items:items, k:1, noRotate:true, label:t('serT'), tickFmt:function(v){return v+'%';}, revealOrder:'ltr'});
  },
  radar:function(el,w,id){ var m=MODELS[+id]; return radarSvg(m, w, 1, {h:Math.round(w*.86), cls:'rv pop', attrs:' data-s="0"'}); }
};
function seriesItems(){
  return VORDER.map(function(v,i){ return {name:SERIES_NAME[v], logo:VEND[v].logo, vend:v, v:SER_VIR[v], label:'+'+f1(SER_VIR[v])+'%', i:i, hl:v===TOP.v,
    tip:tipAttr(SERIES_NAME[v], [['2025-10-11', f1(verAt(v,yearShift(ASOF,-1)))],[ASOF, f1(verAt(v,ASOF))],[metricTitle('vir'),'+'+f1(SER_VIR[v])+'%']])}; });
}

function revealAll(root){
  var els=$$('.rv',root);
  els.forEach(function(el){
    var o=+el.getAttribute('data-o')||0;
    if(!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(o*18, 400)+'ms');
  });
  $$('.draw',root).forEach(function(el){ if(!el.classList.contains('rv')) el.classList.add('rv'); });
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ $$('.rv',root).forEach(function(el){ el.classList.add('on'); }); }); });
}
function renderChart(el, animate){
  var w=Math.floor(el.clientWidth); if(!w) return;
  var spec=el.getAttribute('data-chart').split(':');
  var fn=CHARTS[spec[0]]; if(!fn) return;
  el.innerHTML=fn(el,w,spec[1]);
  el._w=w;
  if(animate) revealAll(el);
  else { $$('.draw',el).forEach(function(x){ x.classList.add('rv'); }); $$('.rv',el).forEach(function(x){ x.style.setProperty('--d','0s'); x.classList.add('on'); }); }
}

/* ================= page builders ================= */
function applyText(){
  document.documentElement.lang = LANG==='zh' ? 'zh-CN' : 'en';
  document.title = t('title')+' · '+(LANG==='zh'?'LLM Benchrot Leaderboard':'大模型 Benchrot 排行榜');
  $$('[data-t]').forEach(function(el){ el.textContent=t(el.getAttribute('data-t')); });
  $('#langBtn').textContent=t('langBtn');
  $('h1').innerHTML=t('title').split(' ').map(function(w){return '<span class="w">'+esc(w)+'</span>';}).join(' ');
  $$('.wm-slot').forEach(function(el){ el.innerHTML=WM_HTML; });
  $('#scatterLegend').innerHTML='<span><i class="sw" style="background:#e3f6e1"></i>'+esc(t('quad'))+'</span><span><i class="dl"></i>'+esc(t('pareto'))+'</span>';
  $('#trendLegend').innerHTML=VORDER.map(function(v){ return '<span><i class="ln" style="background:'+cssFill(v)+'"></i>'+SERIES_NAME[v]+'</span>'; }).join('');
}
function bestTwo(m){
  return IDX.slice().sort(function(a,b){ return (m.pct[b.k]-m.pct[a.k]) || (IDX.indexOf(a)-IDX.indexOf(b)); }).slice(0,2);
}
function verdictHTML(){
  var b=bestTwo(TOP), s2=RANKED[1], s3=RANKED[2], tag='<span class="sotf"><i></i>State of the fart</span>';
  if(LANG==='zh') return esc(TOP.name)+' 以 '+Math.round(TOP.idx)+' 分位列 Benchrot 综合指数第一，在'+L(b[0].title)+'与'+L(b[1].title)+'两项上领先，成为本期的 '+tag+'。'+esc(s2.name)+' 与 '+esc(s3.name)+' 分列第二、三位。';
  return esc(TOP.name)+' tops the Benchrot Index with a score of '+Math.round(TOP.idx)+', leading on '+L(b[0].title)+' and '+L(b[1].title)+'. It is this edition’s '+tag+'. '+esc(s2.name)+' and '+esc(s3.name)+' place second and third.';
}
function buildChamp(){
  var m=TOP, V=VEND[m.v];
  var h='<div class="lab">'+esc(t('champLab'))+'</div>';
  h+='<div class="who"><i class="'+lgCls(V.logo)+'"></i><div><div class="nm">'+esc(m.name)+'</div><div class="meta">'+esc(L(V.co))+' · '+esc(fmtDate(m.date))+'</div></div></div>';
  h+='<div class="score"><b>'+Math.round(m.idx)+'</b><span>'+t('of100')+'</span><span class="sotf"><i></i>'+t('sotf')+'</span></div>';
  h+='<button class="open" type="button" data-profile="'+m.i+'">'+esc(t('openProfile'))+'</button>';
  $('#champ').innerHTML=h;
}
function namesFor(list){
  if(list.length===1) return list[0].name;
  var pre=list[0].name.split(' ')[0];
  if(list.every(function(m){return m.name.split(' ')[0]===pre;}) && list.length===MODELS.filter(function(m){return m.name.split(' ')[0]===pre;}).length) return pre+t('allOf');
  return list[0].name+t('andN').replace('{n}',list.length-1);
}
function buildTiles(){
  function maxBy(k){ var mx=Math.max.apply(null,MODELS.map(function(m){return m.val[k];})); return {v:mx, list:MODELS.filter(function(m){return Math.abs(m.val[k]-mx)<1e-9;})}; }
  var a=maxBy('ver'), c=maxBy('vir'), d=maxBy('scrab');
  var parity=MODELS.filter(function(m){return m.val.straw>=3;}).length;
  var tiles=[
    [t('fVer'), f1(a.v), a.list[0].v, namesFor(a.list)],
    [t('fVir'), '+'+f1(c.v)+'%', c.list[0].v, SERIES_NAME[c.list[0].v]+t('seriesSuffix')],
    [t('fStraw'), parity+' / '+MODELS.length, null, t('noneOf')],
    [t('fScrab'), String(d.v), d.list[0].v, namesFor(d.list)]
  ];
  $('#tiles').innerHTML=tiles.map(function(x){ return '<div class="tile"><div class="k">'+esc(x[0])+'</div><div class="v">'+esc(x[1])+'</div><div class="w">'+(x[2]?'<i class="'+lgCls(VEND[x[2]].logo)+'"></i>':'')+'<span>'+esc(x[3])+'</span></div></div>'; }).join('');
}
function heatColor(p){
  var a=[250,244,238], b=[176,84,52], f=Math.pow(p/100,.9);
  return 'rgb('+Math.round(a[0]+(b[0]-a[0])*f)+','+Math.round(a[1]+(b[1]-a[1])*f)+','+Math.round(a[2]+(b[2]-a[2])*f)+')';
}
function buildHeat(){
  var h='<table class="heat"><thead><tr><th></th>';
  IDX.forEach(function(mt){ h+='<th>'+esc(L(mt.short))+'</th>'; });
  h+='<th>'+esc(t('idxCol'))+'</th></tr></thead><tbody>';
  RANKED.forEach(function(m,i){
    h+='<tr class="'+(i===0?'r1':'')+'"><td class="m"><span><i class="'+lgCls(VEND[m.v].logo)+'"></i>'+esc(m.name)+'</span></td>';
    IDX.forEach(function(mt){ var p=m.pct[mt.k]; h+='<td class="c" style="background:'+heatColor(p)+';color:'+(p>58?'#fff':'#141413')+'" title="'+esc(L(mt.title)+': '+fmtVal(mt.k,m.val[mt.k],m))+'">'+Math.round(p)+'</td>'; });
    h+='<td class="ix">'+f1(m.idx)+'</td></tr>';
  });
  $('#heat').innerHTML=h+'</tbody></table>';
}
function buildMetricCards(){
  var h='';
  METRICS.forEach(function(mt){
    var leg=mt.ref?'<div class="legend"><span><i class="dsh"></i>'+esc(L(mt.ref.label))+'</span></div>':'';
    h+='<div class="card"><div class="card-h"><div><h3>'+esc(L(mt.title))+'</h3><p>'+esc(metricSub(mt.k))+(mt.idx?'':' · '+esc(t('refOnly')))+'</p></div><span class="wm">'+WM_HTML+'</span></div>'+leg+'<div class="chart" data-chart="metric:'+mt.k+'"></div></div>';
  });
  $('#metricCards').innerHTML=h;
}
function buildRadars(){
  $('#radars').innerHTML=RANKED.map(function(m){
    return '<button type="button" class="rc" data-profile="'+m.i+'" aria-label="'+esc(m.name)+'"><div class="rc-h"><i class="'+lgCls(VEND[m.v].logo)+'"></i><span class="n">'+esc(m.name)+'</span><span class="s">#'+m.rank+' · '+Math.round(m.idx)+'</span></div><div class="chart" data-chart="radar:'+m.i+'"></div><span class="go">↗</span></button>';
  }).join('');
}
var SORT={k:'rank',dir:1};
function buildTable(){
  var cols=[['rank','thRank',true],['name','thModel'],['co','thCo'],['series','thSeries'],['parent','thParent'],['date','thDate'],['pin','thIn',true],['pout','thOut',true],['bl','thBl',true],['idx','thIdx',true]];
  var noteKeys=[]; MODELS.forEach(function(m){ if(m.note && noteKeys.indexOf(m.note)<0) noteKeys.push(m.note); });
  var rows=MODELS.slice().sort(function(a,b){
    var x,y; switch(SORT.k){
      case 'name': x=a.name; y=b.name; break; case 'co': x=L(VEND[a.v].co); y=L(VEND[b.v].co); break;
      case 'series': x=L(VEND[a.v].series); y=L(VEND[b.v].series); break; case 'parent': x=L(VEND[a.v].parent); y=L(VEND[b.v].parent); break;
      case 'date': x=a.date; y=b.date; break; case 'pin': x=a.pin; y=b.pin; break; case 'pout': x=a.pout; y=b.pout; break;
      case 'bl': x=a.bl; y=b.bl; break; case 'idx': x=a.idx; y=b.idx; break; default: x=a.rank; y=b.rank;
    }
    return (x<y?-1:x>y?1:0)*SORT.dir || (a.rank-b.rank);
  });
  var h='<thead><tr>'+cols.map(function(c){ return '<th data-k="'+c[0]+'" class="'+(c[2]?'num':'')+'">'+esc(t(c[1]))+(SORT.k===c[0]?'<span class="ar">'+(SORT.dir>0?'▲':'▼')+'</span>':'')+'</th>'; }).join('')+'</tr></thead><tbody>';
  rows.forEach(function(m){
    var V=VEND[m.v], sup=m.note?'<sup>'+(noteKeys.indexOf(m.note)+1)+'</sup>':'';
    h+='<tr><td class="num">'+m.rank+'</td><td class="m"><button type="button" data-profile="'+m.i+'"><i class="'+lgCls(V.logo)+'"></i>'+esc(m.name)+'</button></td>'+
       '<td class="co"><span><i class="'+lgCls(V.coLogo)+'"></i>'+esc(L(V.co))+'</span></td><td>'+esc(L(V.series))+'</td><td>'+esc(L(V.parent))+'</td>'+
       '<td>'+esc(fmtDate(m.date))+'</td><td class="num">'+money(m.pin)+sup+'</td><td class="num">'+money(m.pout)+'</td><td class="num">'+money(m.bl)+'</td><td class="num"><b>'+f1(m.idx)+'</b></td></tr>';
  });
  $('#mt').innerHTML=h+'</tbody>';
  $('#notes').innerHTML=noteKeys.map(function(nk,i){ return '<li><sup>'+(i+1)+'</sup>'+esc(t(nk))+' — '+esc(MODELS.filter(function(m){return m.note===nk;}).map(function(m){return m.name;}).join(', '))+'</li>'; }).join('');
}
function buildMethod(){
  var zh=LANG==='zh', h='';
  h+='<div class="card"><h4>'+(zh?'评测范围':'Scope')+'</h4><p>'+(zh?
    '截至 2026 年 10 月 11 日，OpenAI、Anthropic、Google DeepMind、xAI、深度求索、阿里云与月之暗面七家厂商当前提供或已公布 API 定价的 16 个旗舰与主力模型。每个模型以官方名称参评，公司、系列与母公司分别记录。':
    'As of October 11, 2026: 16 flagship and mainline models with available or announced API pricing from seven labs — OpenAI, Anthropic, Google DeepMind, xAI, DeepSeek, Alibaba Cloud and Moonshot AI. Each model is evaluated under its official name; company, series and parent are recorded separately.')+'</p>';
  h+='<h4 style="margin-top:18px">'+(zh?'综合指数':'Composite index')+'</h4><p>'+(zh?
    '对六项计入指标，分别计算每个模型在 16 个模型中的百分位名次 <code>P = (低于该值的模型数 + (并列数 − 1) / 2) / 15 × 100</code>，再取等权平均。指数相同时，版本号较高者排名靠前。':
    'For each of the six index metrics, every model receives a percentile rank among the 16 models, <code>P = (models below + (ties − 1) / 2) / 15 × 100</code>. The index is the equal-weighted mean. Ties are broken by the higher version number.')+'</p>';
  h+='<h4 style="margin-top:18px">'+(zh?'参考基准':'Reference benchmarks')+'</h4><p>'+(zh?
    '草莓测试沿用社区通行的 “strawberry 里有几个 R” 评测，将其应用于模型自身的名称；Scrabble 得分采用标准英文字母牌分值；版本半衰期取所属系列近 12 个月版本号上调间隔的中位数。三项均不计入综合指数。':
    'Strawberry Bench adapts the widely used community evaluation “How many R’s are in strawberry?” to each model’s own name. Scrabble Score uses standard English tile values. Version Half-life is the median gap between version bumps in the series over the past 12 months. None of the three enters the composite index.')+'</p>';
  h+='<h4 style="margin-top:18px">'+(zh?'价格':'Pricing')+'</h4><p>'+(zh?
    '采用各厂商公布的标准 API 列表价（USD / 百万 tokens），不含批量、缓存与第三方渠道折扣。混合价格 = (3 × 输入 + 输出) / 4。分档计价的模型取最低上下文档位，分时计价的模型取高峰时段价。':
    'Standard API list prices published by each provider (USD per 1M tokens), excluding batch, caching and third-party discounts. Blended price = (3 × input + output) / 4. Tiered models use the lowest context tier; time-of-day pricing uses the peak rate.')+'</p></div>';
  h+='<div class="card"><h4>'+(zh?'指标定义':'Metric definitions')+'</h4><dl>';
  METRICS.forEach(function(mt){ h+='<div><dt>'+esc(L(mt.title))+(mt.idx?'':' <span style="font-weight:400;color:#8f8d86">· '+esc(t('refOnly'))+'</span>')+'</dt><dd>'+esc(L(mt.desc))+'.</dd></div>'; });
  h+='</dl><h4 style="margin-top:18px">'+(zh?'母公司版本号':'Parent company version')+'</h4><ul>';
  VORDER.forEach(function(v){ h+='<li><b>'+esc(L(VEND[v].co))+'</b> v'+f1(VEND[v].pcv)+(zh?'：':': ')+esc(L(VEND[v].chain))+'</li>'; });
  h+='</ul><h4 style="margin-top:18px">'+(zh?'版本号通胀':'Version inflation')+'</h4><p>'+(zh?
    '在给定日期，各系列的版本号取此前已正式发布的最高版本号；通胀率为两个日期之间的相对增幅。':
    'On any given date, a series’ version is the highest version released up to that date; inflation is the relative change between two dates.')+'</p></div>';
  $('#methodBody').innerHTML=h;
}

/* ================= lazy render ================= */
var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); e.target._seen=true; renderChart(e.target,true); } });
},{rootMargin:'120px 0px'}) : null;
function observeCharts(){
  $$('main .chart').forEach(function(el){
    if(el._seen){ renderChart(el,false); return; }
    if(io) io.observe(el); else { el._seen=true; renderChart(el,false); }
  });
}
function rebuildPage(){
  applyText(); buildChamp(); buildTiles(); buildHeat(); buildMetricCards(); buildRadars(); buildTable(); buildMethod();
  $('#verdict').innerHTML=verdictHTML();
  observeCharts();
  if(PM.open) pmRender(PM.idx, false);
}
var rzT=null, lastW=window.innerWidth;
window.addEventListener('resize', function(){
  clearTimeout(rzT);
  rzT=setTimeout(function(){
    if(VM.open){ fitStage(); rebuildCurrent(); }
    if(Math.abs(window.innerWidth-lastW)<2) return;
    lastW=window.innerWidth;
    $$('main .chart').forEach(function(el){ if(el._seen && Math.floor(el.clientWidth)!==el._w) renderChart(el,false); });
    if(PM.open) pmRender(PM.idx,false);
  },150);
});

/* ================= tooltip ================= */
var tip=$('#tip'), tipOn=null;
function showTip(el, x, y){
  var raw=el.getAttribute('data-tip'); if(!raw) return;
  var parts=raw.split('\u001e'), h='<b>'+parts[0]+'</b>';
  parts.slice(1).forEach(function(r){ var c=r.split('\u001f'); h+='<div class="r"><span>'+(c[2]?'<i style="background:'+c[2]+'"></i>':'')+c[0]+'</span><em>'+c[1]+'</em></div>'; });
  tip.innerHTML=h; tip.classList.add('on'); tipOn=el; moveTip(x,y);
}
function moveTip(x,y){
  var tw_=tip.offsetWidth, th=tip.offsetHeight, vw=window.innerWidth, vh=window.innerHeight;
  var px=x+14, py=y+14; if(px+tw_>vw-8) px=x-tw_-14; if(px<8) px=8; if(py+th>vh-8) py=y-th-14; if(py<8) py=8;
  tip.style.transform='translate('+Math.round(px)+'px,'+Math.round(py)+'px)';
}
function hideTip(){ tip.classList.remove('on'); tipOn=null; }
document.addEventListener('pointerover', function(e){
  if(e.pointerType!=='mouse' || VM.open || PM.open) return;
  var el=e.target.closest && e.target.closest('[data-tip]');
  if(el){ if(el!==tipOn) showTip(el,e.clientX,e.clientY); } else if(tipOn) hideTip();
});
document.addEventListener('pointermove', function(e){ if(tipOn && e.pointerType==='mouse') moveTip(e.clientX,e.clientY); }, {passive:true});
document.addEventListener('pointerdown', function(e){
  if(VM.open || PM.open || e.pointerType==='mouse') return;
  var el=e.target.closest && e.target.closest('[data-tip]');
  if(el) showTip(el,e.clientX,e.clientY); else hideTip();
}, {passive:true});
window.addEventListener('scroll', function(){ if(tipOn) hideTip(); }, {passive:true});
function trendHover(e){
  var r=e.target; if(!r.classList || !r.classList.contains('hitarea')) return;
  var svg=r.ownerSVGElement, bb=svg.getBoundingClientRect(), sc=bb.width/(+r.getAttribute('data-vw'));
  var px=(e.clientX-bb.left)/sc, pl=+r.getAttribute('data-pl'), pw=+r.getAttribute('data-pw');
  var f=clamp((px-pl)/pw,0,1), x0=+r.getAttribute('data-x0'), d=x0+f*(+r.getAttribute('data-x1')-x0);
  var iso=new Date(Math.min(d, dnum(ASOF))).toISOString().slice(0,10);
  var g=svg.querySelector('.xh'); g.style.display=''; var ln=g.querySelector('line'); ln.setAttribute('x1',px); ln.setAttribute('x2',px);
  var rows=VORDER.map(function(v){ return [v, verAt(v,iso)]; }).filter(function(x){return x[1]!=null;}).sort(function(a,b){return b[1]-a[1];});
  r.setAttribute('data-tip', esc(fmtDate(iso))+'\u001e'+rows.map(function(x){return SERIES_NAME[x[0]]+'\u001f'+f1(x[1])+'\u001f'+cssFill(x[0]);}).join('\u001e'));
  showTip(r, e.clientX, e.clientY);
}
document.addEventListener('pointermove', function(e){ if(!VM.open && e.target.classList && e.target.classList.contains('hitarea')) trendHover(e); }, {passive:true});
document.addEventListener('pointerdown', function(e){ if(!VM.open && e.target.classList && e.target.classList.contains('hitarea')) trendHover(e); }, {passive:true});
document.addEventListener('pointerout', function(e){
  if(e.target.classList && e.target.classList.contains('hitarea') && e.pointerType==='mouse'){ var g=e.target.ownerSVGElement.querySelector('.xh'); if(g) g.style.display='none'; hideTip(); }
});

/* ================= page controls ================= */
$('#langBtn').addEventListener('click', function(){
  LANG = LANG==='zh' ? 'en' : 'zh';
  try{ localStorage.setItem('benchrot-lang', LANG); }catch(e){}
  rebuildPage();
});
$('#priceSeg').addEventListener('click', function(e){
  var b=e.target.closest('button'); if(!b) return;
  PRICE_KEY=b.getAttribute('data-p');
  $$('#priceSeg button').forEach(function(x){ x.classList.toggle('on', x===b); });
  var el=$('[data-chart="scatter"]'); el._seen=true; renderChart(el,true);
});
$('#mt').addEventListener('click', function(e){
  var th=e.target.closest('th'); if(!th) return;
  var k=th.getAttribute('data-k');
  if(SORT.k===k) SORT.dir*=-1; else { SORT.k=k; SORT.dir=(k==='rank'||k==='name'||k==='co'||k==='series'||k==='parent'||k==='pin'||k==='pout'||k==='bl')?1:-1; }
  buildTable();
});
document.addEventListener('click', function(e){
  var b=e.target.closest && e.target.closest('[data-profile]');
  if(b && !VM.open){ pmOpen(RANKED.indexOf(MODELS[+b.getAttribute('data-profile')])); }
});

/* ================= profile dialog ================= */
var PM={open:false, idx:0, vals:null, raf:0, shown:null};
var pm=$('#pm');
function pmRows(m, k){
  return IDX.map(function(mt,i){
    var p=m.pct[mt.k];
    return '<div class="pm-row"><span class="k">'+esc(L(mt.title))+'</span><span class="v"><span data-cnt="'+mt.k+'">'+esc(fmtVal(mt.k,m.val[mt.k],m))+'</span><em>P<span class="pv" data-i="'+i+'">'+Math.round(p)+'</span></em></span>'+
      '<span class="tr"><i style="width:'+Math.max(p,2)+'%;background:'+solid(m.v)+'"></i></span></div>';
  }).join('');
}
function pmFacts(m){
  var V=VEND[m.v];
  var f=[[t('thCo'),L(V.co)],[t('thSeries'),L(V.series)],[t('thParent'),L(V.parent)],[t('thDate'),fmtDate(m.date)],[t('thIn')+' / '+t('thOut'),money(m.pin)+' / '+money(m.pout)],[t('blPrice'),money(m.bl)]];
  return f.map(function(x){ return '<div><dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd></div>'; }).join('');
}
function pmRender(idx, animate, fromVals){
  var m=RANKED[idx], V=VEND[m.v];
  PM.idx=idx;
  $('#pmLogo').className=lgCls(V.logo);
  $('#pmEb').textContent=t('pmEb').replace('{r}',m.rank).replace('{n}',MODELS.length);
  $('#pmName').textContent=m.name;
  $('#pmOf').textContent=t('of100');
  $('#pmTag').hidden = m!==TOP;
  $('#pmCnt').textContent=(idx+1)+' / '+RANKED.length;
  $('#pmFacts').innerHTML=pmFacts(m);
  var box=$('#pmRadar'), w=Math.floor(box.clientWidth)||420;
  box.innerHTML=radarSvg(m, w, 1, {h:Math.round(w*.9), fs:12});
  var rows=$('#pmRows'); rows.innerHTML=pmRows(m);
  var g=$('.rgeo',box), target=IDX.map(function(mt){return m.pct[mt.k];});
  var scoreEl=$('#pmScore'), from=fromVals||target.map(function(){return 0;}), fromScore=PM.shown!=null?PM.shown:0;
  cancelAnimationFrame(PM.raf);
  var bars=$$('.tr i',rows);
  if(!animate){ setRadar(g,target); scoreEl.textContent=Math.round(m.idx); PM.vals=target; PM.shown=m.idx; return; }
  bars.forEach(function(b){ b.style.transform='scaleX(0)'; });
  var t0=performance.now(), dur=fromVals?520:760;
  (function step(now){
    var p=clamp((now-t0)/dur,0,1);
    var cur = fromVals ? from.map(function(v,i){ return v+(target[i]-v)*EASE.inout(p); }) : radarGrow(target,p);
    setRadar(g,cur); PM.vals=cur;
    var e=EASE.out(p);
    scoreEl.textContent=Math.round(fromScore+(m.idx-fromScore)*e);
    bars.forEach(function(b,i){ var q=clamp(p*1.6-i*.08,0,1); b.style.transform='scaleX('+EASE.out(q)+')'; });
    if(p<1) PM.raf=requestAnimationFrame(step); else { PM.shown=m.idx; PM.vals=target; }
  })(t0);
}
function pmOpen(idx, noPush){
  hideTip();
  var wasOpen=PM.open;
  PM.open=true; pm.classList.add('open'); pm.setAttribute('aria-hidden','false'); document.body.classList.add('pm-lock');
  if(!wasOpen){ PM.shown=null; requestAnimationFrame(function(){ pm.classList.add('show'); }); }
  pmRender(idx, true, wasOpen?PM.vals:null);
  var h='#profile-'+RANKED[idx].slug;
  if(!noPush && location.hash!==h){ try{ if(wasOpen) history.replaceState({pm:1},'',h); else history.pushState({pm:1},'',h); }catch(e){} }
  if(!wasOpen) setTimeout(function(){ var x=$('.pm-h .x'); if(x) x.focus({preventScroll:true}); }, 60);
}
function pmClose(fromPop){
  if(!PM.open) return;
  PM.open=false; cancelAnimationFrame(PM.raf);
  pm.classList.remove('show');
  setTimeout(function(){ if(!PM.open){ pm.classList.remove('open'); pm.setAttribute('aria-hidden','true'); document.body.classList.remove('pm-lock'); } }, 220);
  if(!fromPop && /^#profile-/.test(location.hash)){ try{ history.back(); }catch(e){} }
}
function pmStep(d){ pmOpen((PM.idx+d+RANKED.length)%RANKED.length); }
pm.addEventListener('click', function(e){ if(e.target.closest('[data-close]')) pmClose(); });
$('#pmPrev').addEventListener('click', function(){ pmStep(-1); });
$('#pmNext').addEventListener('click', function(){ pmStep(1); });
document.addEventListener('keydown', function(e){
  if(!PM.open) return;
  if(e.key==='Escape') pmClose(); else if(e.key==='ArrowLeft') pmStep(-1); else if(e.key==='ArrowRight') pmStep(1);
});
(function(){ // swipe between profiles
  var sx=null, sy=null;
  $('.pm-card').addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse'){ sx=e.clientX; sy=e.clientY; } }, {passive:true});
  $('.pm-card').addEventListener('pointerup', function(e){
    if(sx==null) return; var dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
    if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.4) pmStep(dx<0?1:-1);
  }, {passive:true});
})();
function profileFromHash(){
  var m=/^#profile-(.+)$/.exec(location.hash); if(!m) return -1;
  for(var i=0;i<RANKED.length;i++) if(RANKED[i].slug===m[1]) return i;
  return -1;
}

/* ================= sound ================= */
var SND={ctx:null, out:null, on:true,
  init:function(){
    if(!this.ctx){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return; this.ctx=new C();
      var comp=this.ctx.createDynamicsCompressor(); comp.connect(this.ctx.destination);
      var lp=this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5200; lp.connect(comp);
      this.out=this.ctx.createGain(); this.out.gain.value=.8; this.out.connect(lp); }
    if(this.ctx.state==='suspended') this.ctx.resume();
  },
  tone:function(f, at, dur, g, type, f2){
    if(!this.on||!this.ctx) return;
    var c=this.ctx, t0=c.currentTime+(at||0), o=c.createOscillator(), gn=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur*.9);
    gn.gain.setValueAtTime(0.0001,t0); gn.gain.exponentialRampToValueAtTime(g,t0+.006); gn.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(gn); gn.connect(this.out); o.start(t0); o.stop(t0+dur+.02);
  },
  // keep these recipes in sync with tools/sfx.py
  play:function(type, p){
    p=p||0;
    if(type==='tick'){ var f=520*Math.pow(2,p*12/12); this.tone(f,0,.06,.03,'sine'); }
    else if(type==='pop'){ this.tone(660,0,.12,.035,'sine',880); }
    else if(type==='page'){ this.tone(392,0,.2,.02,'sine',523.25); this.tone(784,.04,.16,.008,'sine'); }
    else if(type==='line'){ var g=220*Math.pow(2,p*2/12); this.tone(g,0,.45,.025,'triangle',g*1.5); }
    else if(type==='chord'){ var s=this; [523.25,659.25,783.99,1046.5].forEach(function(f,i){ s.tone(f,i*.06,1.4,.03,'sine'); }); }
  }
};
try{ if(localStorage.getItem('benchrot-sfx')==='0') SND.on=false; }catch(e){}

/* ================= video mode: one deterministic timeline ================= */
var BPM=108, BAR=4*60000/BPM, PHASE=140;   // music: 108 BPM, first downbeat at 140 ms
var AR={'16:9':{w:1920,h:1080,k:2.0},'9:16':{w:1080,h:1920,k:2.5},'1:1':{w:1080,h:1080,k:2.2}};
var AR_ORDER=['16:9','9:16','1:1'];
var VM={open:false, capture:false, ar:'16:9', slides:[], total:0, t:0, playing:false, idx:-1, cur:null, raf:0, last:0, music:true, barHidden:false, ended:false};
try{ var sa=localStorage.getItem('benchrot-ar'); if(AR[sa]) VM.ar=sa; if(localStorage.getItem('benchrot-music')==='0') VM.music=false; }catch(e){}
var stage=$('#stage'), vm=$('#vm'), vbar=$('#vbar'), bgm=$('#bgm');
var IC={play:'<path d="M7 4.5v15L19.5 12z" fill="currentColor" stroke="none"/>', pause:'<path d="M8 5v14M16 5v14" stroke-width="2.4"/>',
  sndOn:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  sndOff:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'};

function seq(n, start, gap){ var a=[]; for(var i=0;i<n;i++) a.push(start+i*gap); return a; }
// Every slide: length in bars, reveal step times (ms from slide start) and sound cues.
function planSlides(){
  var S=[], per = VM.ar==='16:9' ? 8 : VM.ar==='9:16' ? 6 : 4;
  S.push({type:'title', bars:3});
  S.push({type:'index', bars:4});
  METRICS.forEach(function(mt){ S.push({type:'metric', k:mt.k, bars:2}); });
  S.push({type:'scatter', bars:4});
  S.push({type:'trend', bars:4});
  S.push({type:'series', bars:2});
  var pages=Math.ceil(RANKED.length/per);
  for(var p=0;p<pages;p++) S.push({type:'radar', page:p, pages:pages, per:per, bars: per>=8?3:2});
  S.push({type:'spot', bars:4});
  S.push({type:'verdict', bars:5});
  var t=0;
  S.forEach(function(sd,i){
    sd.start=t; sd.dur=sd.bars*BAR+(i===0?PHASE:0); t+=sd.dur;
    var st=[], fx=[], n;
    switch(sd.type){
      case 'title': st=[200,550,950,1400,1700]; fx=[[200,'pop'],[950,'tick',.4],[1400,'tick',.7]]; break;
      case 'index': n=RANKED.length; st=seq(n-1,450,120); st.push(st[n-2]+520); st.push(st[n-1]+260);
        st.forEach(function(x,i){ if(i<n-1) fx.push([x,'tick',i/(n-1)]); }); fx.push([st[n-1],'chord']); break;
      case 'metric': n=MODELS.length; var off=MET[sd.k].ref?1:0; if(off) st.push(300);
        st=st.concat(seq(n,off?520:320,55)); st.push(st[st.length-1]+260);
        for(var j=off;j<off+n;j+=2) fx.push([st[j],'tick',(j-off)/n]); fx.push([st[st.length-1],'pop']); break;
      case 'scatter': n=MODELS.length; st=[250].concat(seq(n,550,100)); st.push(st[n]+300);
        for(j=1;j<=n;j++) fx.push([st[j],'tick',j/n*.8]); fx.push([st[n+1],'line',3]); break;
      case 'trend': st=seq(VORDER.length,350,420); st.forEach(function(x,i){ fx.push([x,'line',i]); }); break;
      case 'series': st=seq(VORDER.length,320,110); st.forEach(function(x,i){ fx.push([x,'tick',i/7]); }); st.push(st[st.length-1]+260); break;
      case 'radar': n=Math.min(sd.per, RANKED.length-sd.page*sd.per); st=seq(n,320,150); st.forEach(function(x){ fx.push([x,'pop']); }); break;
      case 'spot': st=[200,450,700].concat(seq(IDX.length,900,120)); st.push(st[st.length-1]+250); fx=[[200,'pop'],[450,'line',2]]; for(j=3;j<st.length-1;j++) fx.push([st[j],'tick',(j-3)/6]); break;
      case 'verdict': st=[250,650,1250,1750,2500,2850,3200]; fx=[[250,'pop'],[650,'tick',.3],[1250,'chord'],[2500,'tick',.2],[2850,'tick',.5],[3200,'tick',.9]]; break;
    }
    sd.steps=st; sd.sfx=fx;
  });
  VM.total=t+1200;  // short tail after the verdict
  VM.slides=S;
}
function globalSfx(){ var out=[]; VM.slides.forEach(function(sd){ sd.sfx.forEach(function(f){ out.push([sd.start+f[0], f[1], f[2]||0]); }); }); return out; }

function fitStage(){
  var A=AR[VM.ar], vw=window.innerWidth, vh=window.innerHeight;
  var sc=Math.min(vw/A.w, vh/A.h);
  stage.style.width=A.w+'px'; stage.style.height=A.h+'px';
  stage.style.transform='translate(-50%,-50%) scale('+sc+')';
  stage.style.setProperty('--k', A.k);
}
function shell(eb, title, sub, extra, wm){
  var A=AR[VM.ar];
  var n=VM.slides.length, pg=String(VM.idx+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');
  return '<div class="sl"><div class="sl-h">'+(wm!==false?'<div class="sl-wm">'+WM_HTML+'</div>':'')+'<div class="sl-eb"><span>'+esc(eb)+'</span></div><div class="sl-t">'+esc(title)+'</div>'+(sub?'<div class="sl-s">'+esc(sub)+'</div>':'')+(extra||'')+'</div>'+
    '<div class="sl-c"></div><div class="sl-f"><span class="sig">'+esc(t('sig'))+'</span><span>'+(A.w>A.h?esc(t('foot'))+' · ':'')+pg+'</span></div></div>';
}
function fitBox(content, box){
  var f=1; content.style.setProperty('--f',1);
  var need=function(){ return box===content ? content.scrollHeight>content.clientHeight+1 : content.offsetHeight>box.clientHeight*.9; };
  while(need() && f>.5){ f-=.05; content.style.setProperty('--f',f.toFixed(2)); }
}
function buildSlide(sd){
  var A=AR[VM.ar], k=A.k, portrait=A.h>A.w, c, cw, ch, html;
  switch(sd.type){
    case 'title':{
      var land=A.w>A.h, lg=VORDER.map(function(v){return '<i class="'+lgCls(VEND[v].logo)+'"></i>';}).join('');
      html='<div class="sl ts">'+(land?'<div class="ts-mark"><i class="mk" data-s="2" style="height:48%"></i><i class="mk" data-s="2" data-dl="90" style="height:74%"></i><i class="mk" data-s="2" data-dl="180" style="height:100%"></i></div>':'')+
        '<div class="txtcol" style="'+(land?'':'max-width:none')+'"><div class="sl-eb vs" data-s="0"><span>'+esc(t('heroEb'))+'</span></div>'+
        '<div class="big vs" data-s="0">'+t('title').split(' ').map(function(w){return '<span class="w">'+esc(w)+'</span>';}).join(' ')+'</div>'+
        '<div class="sub vs" data-s="1">'+esc(t('lede'))+'</div>'+
        '<div class="logos vs" data-s="2">'+lg+'</div>'+
        '<div class="chips vs" data-s="3"><span>'+esc(t('vTitleSub'))+'</span><span>'+esc(t('asof'))+'</span></div>'+
        '<div class="sgn vs" data-s="4"><b>'+esc(t('sig'))+'</b></div></div></div>';
      stage.innerHTML=html; fitBox($('.txtcol',stage), $('.sl',stage));
      return;
    }
    case 'verdict':{
      var m=TOP, V=VEND[m.v];
      var pod=RANKED.slice(0,3).map(function(x,i){ return '<div class="vs" data-s="'+(6-i)+'"><span class="r">'+(i+1)+'</span><i class="'+lgCls(VEND[x.v].logo)+'"></i><span class="n">'+esc(x.name)+'</span><span class="v">'+Math.round(x.idx)+'</span></div>'; }).join('');
      html='<div class="sl cs"><div class="sl-h"><div class="sl-wm">'+WM_HTML+'</div><div class="sl-eb"><span>'+esc(t('vEbVerdict'))+'</span></div><div class="sl-t">'+esc(t('verdictT'))+'</div></div>'+
        '<div class="sl-c" style="display:flex;flex-direction:column;justify-content:center;overflow:hidden">'+
        '<div class="who vs" data-s="0"><i class="'+lgCls(V.logo)+'"></i><div class="nm">'+esc(m.name)+'</div></div>'+
        '<div class="sc"><b class="vs cnt" data-s="1" data-count="'+Math.round(m.idx)+'">0</b><span class="vs" data-s="1">'+t('of100')+'</span><span class="sotf vs pop1" data-s="2"><i></i>'+t('sotf')+'</span></div>'+
        '<div class="txt vs" data-s="3">'+verdictHTML()+'</div>'+
        '<div class="podium">'+pod+'</div></div>'+
        '<div class="sl-f"><span class="sig">'+esc(t('sig'))+'</span><span>'+esc(t('foot'))+'</span></div></div>';
      stage.innerHTML=html;
      fitBox($('.sl-c',stage), $('.sl-c',stage));
      return;
    }
    case 'index':{
      stage.innerHTML=shell(t('vEbIndex'), t('indexTitle'), t('indexSub')+' · '+t('higher'));
      c=$('.sl-c',stage); cw=c.clientWidth; ch=c.clientHeight;
      if(portrait) c.innerHTML=barChart({w:cw, items:indexItems(), keep:true, k:k, fs:11.5, rowH:ch/RANKED.length, rank:true, tag:t('sotf'), max:100, padT:0}).svg;
      else c.innerHTML=colChart({w:cw, h:ch, items:indexItems(), keep:true, k:k, tag:t('sotf')});
      return;
    }
    case 'metric':{
      var mt=MET[sd.k], ref=mt.ref?{v:mt.ref.v,label:L(mt.ref.label)}:null;
      var leg=ref?'<div class="sl-legend"><span><i class="dsh"></i>'+esc(L(mt.ref.label))+'</span></div>':'';
      stage.innerHTML=shell(t('vEbMetric')+' · '+(mt.idx?t('inIndex'):t('refOnly')), L(mt.title), metricSub(sd.k), leg);
      c=$('.sl-c',stage); cw=c.clientWidth; ch=c.clientHeight;
      var its=MODELS.map(function(m){ var it=modelItem(m,mt.k); it.tip=''; return it; });
      if(!portrait && (cw/its.length) > 4*11*k) c.innerHTML=colChart({w:cw, h:ch, items:its, better:mt.better, ref:ref, k:k});
      else c.innerHTML=barChart({w:cw, items:its, better:mt.better, ref:ref, k:k, fs:portrait?11.5:11, rowH:(ch-(ref?11.5*k*1.6:0))/its.length, padT:ref?null:0}).svg;
      return;
    }
    case 'scatter':
      stage.innerHTML=shell(t('vEbFrontier'), t('scatterT'), t('scatterSub'), '<div class="sl-legend"><span><i class="sw" style="background:#e3f6e1"></i>'+esc(t('quad'))+'</span><span><i class="dl"></i>'+esc(t('pareto'))+'</span></div>');
      c=$('.sl-c',stage); cw=c.clientWidth; ch=c.clientHeight;
      c.innerHTML=scatterChart({w:cw, h:ch, k:k, pk:'bl'});
      return;
    case 'trend':
      stage.innerHTML=shell(t('vEbInfl'), t('trendT'), t('trendSub'), '<div class="sl-legend">'+VORDER.map(function(v){ return '<span><i class="ln" style="background:'+cssFill(v)+'"></i>'+SERIES_NAME[v]+'</span>'; }).join('')+'</div>');
      c=$('.sl-c',stage); cw=c.clientWidth; ch=c.clientHeight;
      c.innerHTML=trendChart({w:cw, h:ch, k:k});
      return;
    case 'series':{
      stage.innerHTML=shell(t('vEbInfl'), t('serT'), t('serSub')+' · '+t('higher'));
      c=$('.sl-c',stage); cw=c.clientWidth; ch=c.clientHeight;
      var si=seriesItems(); si.forEach(function(x){ x.tip=''; });
      if(portrait) c.innerHTML=barChart({w:cw, items:si, k:k, fs:12, rowH:Math.min(ch/si.length, 60*k), padT:0}).svg;
      else c.innerHTML=colChart({w:cw, h:ch, items:si, k:k, noRotate:true, bwMax:90*k, tickFmt:function(v){return v+'%';}});
      return;
    }
    case 'radar':{
      var list=RANKED.slice(sd.page*sd.per, sd.page*sd.per+sd.per);
      var title=t('radarH2')+(sd.pages>1?t('radarPage').replace('{a}',sd.page+1).replace('{b}',sd.pages):'');
      stage.innerHTML=shell(t('vEbRadar'), title, L(['每个模型在六项指标上的百分位名次','Each model’s percentile rank on the six metrics']));
      c=$('.sl-c',stage);
      var cols = VM.ar==='16:9' ? 4 : 2, rows=Math.ceil(sd.per/cols);
      var g='<div class="sr" style="grid-template-columns:repeat('+cols+',minmax(0,1fr));grid-template-rows:repeat('+rows+',minmax(0,1fr))">';
      list.forEach(function(m,i){ g+='<div class="rc vs" data-s="'+i+'"><div class="rc-h"><i class="'+lgCls(VEND[m.v].logo)+'"></i><span class="n">'+esc(m.name)+'</span><span class="s">#'+m.rank+' · '+Math.round(m.idx)+'</span></div><div class="rb"></div></div>'; });
      c.innerHTML=g+'</div>';
      $$('.rb',c).forEach(function(rb,i){ rb.innerHTML=radarSvg(list[i], rb.clientWidth, k, {h:rb.clientHeight, fs:8.6, cls:'rgrow', attrs:' data-s="'+i+'" data-dl="120"'}); });
      return;
    }
    case 'spot':{
      var mm=TOP, VV=VEND[mm.v];
      stage.innerHTML=shell(t('vEbSpot'), mm.name, L(VV.co)+' · '+L(VV.series)+' · '+fmtDate(mm.date));
      c=$('.sl-c',stage);
      c.innerHTML='<div class="ps'+(portrait?' port':'')+'"><div class="rb vs" data-s="0"></div><div class="side">'+
        '<div class="scr vs" data-s="1"><b class="cnt" data-s="1" data-count="'+Math.round(mm.idx)+'">0</b><span>'+t('of100')+'</span><span class="sotf"><i></i>'+t('sotf')+'</span></div>'+
        '<div class="pm-rows">'+IDX.map(function(mt,i){ var p=mm.pct[mt.k]; return '<div class="pm-row vs" data-s="'+(3+i)+'"><span class="k">'+esc(L(mt.title))+'</span><span class="v">'+esc(fmtVal(mt.k,mm.val[mt.k],mm))+'<em>P'+Math.round(p)+'</em></span><span class="tr"><i class="bar-x" data-s="'+(3+i)+'" style="width:'+Math.max(p,2)+'%;background:'+solid(mm.v)+'"></i></span></div>'; }).join('')+'</div></div></div>';
      var rb=$('.rb',c);
      rb.innerHTML=radarSvg(mm, rb.clientWidth, k, {h:rb.clientHeight, fs:11, cls:'rgrow', attrs:' data-s="2" data-dur="1300"'});
      return;
    }
  }
}

/* --- timeline animation of the current slide --- */
function collectAnims(root, steps){
  var A=[];
  function at(el){ var s=+el.getAttribute('data-s'); return (steps[s]!=null?steps[s]:(steps.length?steps[steps.length-1]:0))+(+el.getAttribute('data-dl')||0); }
  $$('[data-s]',root).forEach(function(el){
    var t0=at(el), cl=el.classList;
    if(cl.contains('rgrow')){ A.push({el:el,t0:t0,d:+el.getAttribute('data-dur')||900,k:'radar',vals:el.getAttribute('data-vals').split(',').map(Number)}); return; }
    if(cl.contains('cnt')) A.push({el:el,t0:t0,d:700,k:'count',v:+el.getAttribute('data-count')});
    if(cl.contains('mk')) { A.push({el:el,t0:t0,d:650,k:'growY'}); return; }
    if(cl.contains('bar-x')) { A.push({el:el,t0:t0,d:500,k:'growX'}); return; }
    if(cl.contains('vs')) A.push({el:el,t0:t0,d:420,k:'rise'});
    else if(cl.contains('rv')) A.push({el:el,t0:t0,d:200,k:'fade'});
    if(cl.contains('draw')) A.push({el:el,t0:t0,d:+el.getAttribute('data-dur')||800,k:'draw'});
    if(cl.contains('pop')||cl.contains('pop1')) A.push({el:el,t0:t0,d:380,k:'pop'});
    $$('.grow,.hgrow,.pop',el).forEach(function(ch){
      A.push({el:ch,t0:t0,d:ch.classList.contains('pop')?380:430,k:ch.classList.contains('grow')?'growY':ch.classList.contains('hgrow')?'growX':'pop'});
    });
  });
  return A;
}
function applyAnims(A, lt, k){
  for(var i=0;i<A.length;i++){
    var a=A[i], p=clamp((lt-a.t0)/a.d,0,1);
    if(a.p===p) continue; a.p=p;
    var s=a.el.style;
    switch(a.k){
      case 'fade': s.opacity=p; break;
      case 'rise': s.opacity=p; s.transform='translateY('+r1((1-EASE.out(p))*10*k)+'px)'; break;
      case 'growY': s.transform='scaleY('+EASE.out(p)+')'; s.transformOrigin='50% 100%'; s.transformBox='fill-box'; break;
      case 'growX': s.transform='scaleX('+EASE.out(p)+')'; s.transformOrigin='0 50%'; s.transformBox='fill-box'; break;
      case 'pop': s.transform='scale('+(.4+.6*EASE.back(p))+')'; s.transformOrigin='50% 50%'; s.transformBox='fill-box'; if(p===0) s.opacity=0; else if(!a.el.classList.contains('rv')&&!a.el.closest('.rv')) s.opacity=Math.min(1,p*3); break;
      case 'draw': s.strokeDashoffset=1-EASE.inout(p); s.strokeDasharray='1'; break;
      case 'count': a.el.textContent=Math.round(a.v*EASE.out(p)); break;
      case 'radar': s.opacity=p>0?1:0; setRadar(a.el, radarGrow(a.vals,p)); break;
    }
  }
}
function slideAt(t){ var S=VM.slides; for(var i=S.length-1;i>=0;i--) if(t>=S[i].start) return i; return 0; }
function ensureSlide(i){
  if(VM.idx===i && VM.cur) return;
  VM.idx=i;
  var sd=VM.slides[i];
  buildSlide(sd);
  var root=stage.firstElementChild;
  VM.cur={sd:sd, root:root, anims:collectAnims(root, sd.steps)};
  updateBar();
}
function rebuildCurrent(){ if(!VM.open) return; VM.cur=null; var i=VM.idx; VM.idx=-1; ensureSlide(i<0?0:i); applyTime(VM.t); }
function applyTime(t){
  VM.t=t;
  var i=slideAt(Math.min(t, VM.total-1));
  ensureSlide(i);
  var sd=VM.cur.sd, lt=t-sd.start, k=AR[VM.ar].k;
  VM.cur.root.style.opacity = i===0 ? 1 : clamp(lt/220,0,1);
  applyAnims(VM.cur.anims, lt, k);
  // fade to white at the very end
  var tail=VM.total-t; stage.style.opacity = tail<600 ? clamp(tail/600,0,1)+'' : '';
  if(!VM.capture) $('#vprog').style.width=(clamp(t/VM.total,0,1)*100)+'%';
}

/* --- live playback (music is the master clock when it is playing) --- */
var SFX_LIST=[];
function musicOn(){ return VM.music && !VM.capture && !!bgm; }
function syncMusic(){
  if(!musicOn()) { if(bgm && !bgm.paused) bgm.pause(); return; }
  if(VM.playing){ try{ if(Math.abs(bgm.currentTime*1000-VM.t)>120) bgm.currentTime=VM.t/1000; }catch(e){} var p=bgm.play(); if(p&&p.catch) p.catch(function(){}); }
  else bgm.pause();
}
function loop(now){
  if(!VM.open) return;
  if(VM.playing){
    var prev=VM.t, t=prev+Math.min(now-VM.last, 100);
    // the visuals own the clock; the music follows it
    if(musicOn() && !bgm.paused && bgm.readyState>=2 && Math.abs(bgm.currentTime*1000-t)>200){ try{ bgm.currentTime=t/1000; }catch(e){} }
    if(t>=VM.total){ t=VM.total; VM.playing=false; VM.ended=true; if(bgm) bgm.pause(); updateBar(); }
    if(SND.on) for(var i=0;i<SFX_LIST.length;i++){ var f=SFX_LIST[i]; if(f[0]>prev && f[0]<=t) SND.play(f[1],f[2]); }
    if(bgm && musicOn()) bgm.volume = clamp((VM.total-t)/2500,0,1)*.9;
    applyTime(t);
  }
  VM.last=now;
  VM.raf=requestAnimationFrame(loop);
}
function seekLive(t){ VM.t=t; applyTime(t); syncMusic(); }
function go(i){
  i=clamp(i,0,VM.slides.length-1);
  var sd=VM.slides[i];
  VM.ended=false;
  if(VM.playing){ seekLive(sd.start); if(SND.on) SND.play('page'); }
  else seekLive(sd.start+sd.dur-1);   // paused: show the slide fully revealed
}
function setPlaying(p){
  if(p && (VM.ended || VM.t>=VM.total)){ VM.ended=false; VM.t=0; }
  VM.playing=p; VM.last=performance.now();
  if(p) SND.init();
  syncMusic(); updateBar();
}
function updateBar(){
  if(VM.capture) return;
  $('#vPlayIc').innerHTML=VM.playing?IC.pause:IC.play;
  $('#vSndIc').innerHTML=SND.on?IC.sndOn:IC.sndOff;
  $('#vMus').classList.toggle('off', !VM.music);
  $('#vAr').textContent=VM.ar;
  $('#vCnt').textContent=(VM.idx+1)+' / '+VM.slides.length;
}
function setBarHidden(h){ VM.barHidden=h; vbar.classList.toggle('hid',h); }
function openVM(opts){
  opts=opts||{};
  VM.open=true; VM.capture=!!opts.capture; hideTip(); if(PM.open) pmClose(true);
  vm.classList.add('open'); vm.classList.toggle('capture', VM.capture); vm.setAttribute('aria-hidden','false'); document.body.classList.add('vm-open');
  planSlides(); SFX_LIST=globalSfx(); fitStage();
  VM.idx=-1; VM.cur=null; VM.t=0; VM.ended=false;
  if(VM.capture){ VM.playing=false; applyTime(0); return; }
  SND.init();
  if(bgm && VM.music){ bgm.preload='auto'; try{ bgm.load(); }catch(e){} }
  setBarHidden(false); applyTime(0); setPlaying(true);
  cancelAnimationFrame(VM.raf); VM.last=performance.now(); VM.raf=requestAnimationFrame(loop);
  if(opts.push!==false){ try{ history.pushState({vm:1},'',location.pathname+location.search+'#video'); }catch(e){} }
}
function closeVM(fromPop){
  if(!VM.open) return;
  VM.open=false; VM.playing=false; cancelAnimationFrame(VM.raf);
  if(bgm) bgm.pause();
  vm.classList.remove('open'); vm.setAttribute('aria-hidden','true'); document.body.classList.remove('vm-open');
  stage.innerHTML=''; VM.cur=null; VM.idx=-1;
  if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){});
  if(!fromPop && location.hash==='#video'){ try{ history.back(); }catch(e){} }
}
window.addEventListener('popstate', function(){
  if(VM.open && location.hash!=='#video') closeVM(true);
  var pi=profileFromHash();
  if(pi>=0) pmOpen(pi,true); else if(PM.open) pmClose(true);
});
$('#vmBtn').addEventListener('click', function(){ openVM(); });
$('#vPrev').addEventListener('click', function(e){ e.stopPropagation(); go(VM.idx-1); });
$('#vNext').addEventListener('click', function(e){ e.stopPropagation(); go(VM.idx+1); });
$('#vPlay').addEventListener('click', function(e){ e.stopPropagation(); setPlaying(!VM.playing); });
$('#vAr').addEventListener('click', function(e){
  e.stopPropagation();
  var type=VM.slides[VM.idx].type;
  VM.ar=AR_ORDER[(AR_ORDER.indexOf(VM.ar)+1)%AR_ORDER.length];
  try{ localStorage.setItem('benchrot-ar',VM.ar); }catch(e2){}
  planSlides(); SFX_LIST=globalSfx(); fitStage(); VM.idx=-1; VM.cur=null;
  var ni=0; VM.slides.some(function(s,i){ if(s.type===type){ ni=i; return true; } return false; });
  go(ni);
});
$('#vSnd').addEventListener('click', function(e){
  e.stopPropagation(); SND.on=!SND.on; if(SND.on){ SND.init(); SND.play('pop'); }
  try{ localStorage.setItem('benchrot-sfx', SND.on?'1':'0'); }catch(e2){}
  updateBar();
});
$('#vMus').addEventListener('click', function(e){
  e.stopPropagation(); VM.music=!VM.music;
  try{ localStorage.setItem('benchrot-music', VM.music?'1':'0'); }catch(e2){}
  syncMusic(); updateBar();
});
var fsOK=!!(document.documentElement.requestFullscreen);
if(!fsOK) $('#vFs').style.display='none';
$('#vFs').addEventListener('click', function(e){
  e.stopPropagation();
  if(document.fullscreenElement) document.exitFullscreen().catch(function(){});
  else vm.requestFullscreen().catch(function(){});
});
document.addEventListener('fullscreenchange', function(){ if(VM.open) setTimeout(function(){ fitStage(); rebuildCurrent(); },60); });
$('#vHide').addEventListener('click', function(e){ e.stopPropagation(); setBarHidden(true); });
$('#vExit').addEventListener('click', function(e){ e.stopPropagation(); closeVM(); });
vbar.addEventListener('pointerdown', function(e){ e.stopPropagation(); });
vm.addEventListener('click', function(e){ if(vbar.contains(e.target) || VM.capture) return; setBarHidden(!VM.barHidden); });
document.addEventListener('keydown', function(e){
  if(!VM.open || VM.capture) return;
  var k=e.key;
  if(k==='Escape') closeVM();
  else if(k===' '||k==='k'||k==='K'){ e.preventDefault(); setPlaying(!VM.playing); }
  else if(k==='ArrowRight') go(VM.idx+1);
  else if(k==='ArrowLeft') go(VM.idx-1);
  else if(k==='h'||k==='H') setBarHidden(!VM.barHidden);
  else if(k==='m'||k==='M') $('#vSnd').click();
  else if(k==='b'||k==='B') $('#vMus').click();
  else if(k==='a'||k==='A') $('#vAr').click();
  else if(k==='f'||k==='F'){ if(fsOK) $('#vFs').click(); }
});

/* ================= boot ================= */
rebuildPage();
(function(){
  var ar=(QS.get('ar')||'').replace('x',':'); if(AR[ar]) VM.ar=ar;
  if(QS.get('capture')==='1'){
    openVM({capture:true, push:false});
    // API for tools/render_video.js
    window.__BENCHROT={ total:VM.total, fps:30, bpm:BPM, phase:PHASE, sfx:SFX_LIST, size:AR[VM.ar], slides:VM.slides.map(function(x){return {type:x.type,k:x.k,start:x.start,dur:x.dur};}),
      seek:function(ms){ applyTime(ms); return document.fonts ? document.fonts.ready.then(function(){return true;}) : true; } };
    return;
  }
  if(QS.get('video')==='1' || location.hash==='#video'){ if(location.hash==='#video'){ try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} } openVM(); return; }
  var pi=profileFromHash(); if(pi>=0) pmOpen(pi,true);
})();
})();
