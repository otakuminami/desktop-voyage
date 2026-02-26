(() => {
  "use strict";

  const SAVE_KEY = "desktop-voyage-save-v1";
  const GAME_VERSION = 1;

  const WORLD = {
    width: 1400,
    height: 900,
    lonMin: 95,
    lonMax: 145,
    latMin: -10,
    latMax: 45,
  };

  const CONFIG = {
    shipSpeed: 46,
    supplyDrainPerSecond: 0.06,
    eventMinMs: 15000,
    eventMaxMs: 45000,
    eventDecisionTimeoutMs: 8000,
    eventAutoContinueMs: 1000,
    portIdleAutoDepartMs: 10000,
    rescueDurationMs: 30 * 60 * 1000,
    autoSaveMs: 12000,
    portDockRadius: 15,
    portArrivalRadius: 30,
    obstacleBuffer: 2,
    avoidRadiusPadding: 24,
    trailFadeMs: 14000,
    trailPointMinDistance: 4,
    trailMaxPoints: 300,
  };

  const NAV = {
    cellSize: 16,
    rerouteCooldownMs: 1800,
    noProgressRerouteMs: 2200,
    maxSearchNodes: 60000,
  };

  const PORT_ICON_SCALE = 2.5;

  const PORTS_RAW = [
    { id: "shanghai", name: "上海", lon: 117.00, lat: 36.00 },
    { id: "guangzhou", name: "广州", lon: 105.00, lat: 24.00 },
    { id: "hongkong", name: "香港", lon: 108.70, lat: 20.10 },
    { id: "kaohsiung", name: "高雄", lon: 120.26, lat: 22.15 },
    { id: "nagasaki", name: "长崎", lon: 130.01, lat: 32.64 },
    { id: "busan", name: "釜山", lon: 126.60, lat: 36.00 },
    { id: "singapore", name: "新加坡", lon: 102.99, lat: 1.61 },
    { id: "tokyo", name: "东京", lon: 138.67, lat: 37.42 },
    { id: "bangkok", name: "曼谷", lon: 99.36, lat: 13.87 },
    { id: "jakarta", name: "雅加达", lon: 110.40, lat: -2.50 },
  ];

  const LAND_SHAPES_RAW = [
    {
      name: "Mainland",
      points: [
        [96, 6],
        [98, 12],
        [101, 19],
        [105, 24],
        [110, 30],
        [117, 36],
        [121, 41],
        [123, 44],
        [112, 44],
        [103, 38],
        [99, 30],
        [96, 20],
        [95, 10],
      ],
    },
    {
      name: "Korea",
      points: [
        [124.3, 34],
        [126.8, 36.2],
        [128.8, 39.3],
        [129.4, 41.2],
        [127.6, 41.8],
        [125.4, 39.4],
        [124.1, 36.6],
      ],
    },
    {
      name: "Japan",
      points: [
        [130.2, 31.4],
        [132.6, 34.1],
        [135.9, 35.8],
        [138.8, 37.5],
        [141.8, 40.4],
        [143.4, 43.2],
        [140.1, 42.4],
        [137.2, 39.8],
        [134.8, 36.8],
        [132.0, 34.9],
        [129.8, 32.4],
      ],
    },
    {
      name: "Taiwan",
      points: [
        [120.4, 21.9],
        [121.1, 23.3],
        [121.4, 25.2],
        [120.8, 25.5],
        [120.2, 24.2],
        [119.9, 22.8],
      ],
    },
    {
      name: "Luzon",
      points: [
        [120.2, 14.5],
        [121.7, 16.5],
        [122.4, 18.4],
        [121.4, 19.0],
        [120.0, 17.6],
        [119.4, 15.2],
      ],
    },
    {
      name: "PhilippinesSouth",
      points: [
        [122.0, 6.8],
        [124.2, 9.4],
        [125.4, 11.1],
        [124.0, 12.6],
        [122.0, 11.0],
        [121.2, 8.4],
      ],
    },
    {
      name: "BorneoNW",
      points: [
        [108.4, -0.2],
        [111.8, 2.2],
        [115.2, 5.4],
        [117.8, 4.8],
        [118.8, 2.1],
        [117.6, -0.6],
        [113.7, -2.3],
        [110.4, -2.5],
      ],
    },
    {
      name: "Malay",
      points: [
        [99.2, 1.8],
        [100.4, 4.8],
        [101.6, 7.8],
        [102.6, 8.4],
        [103.2, 6.0],
        [103.3, 2.6],
        [102.8, 1.0],
        [101.0, 1.0],
      ],
    },
    {
      name: "Indochina",
      points: [
        [97.4, 7.4],
        [98.7, 12.0],
        [101.0, 18.5],
        [105.0, 22.3],
        [108.3, 21.5],
        [109.0, 18.0],
        [106.2, 14.0],
        [103.5, 10.0],
        [101.4, 7.8],
        [99.0, 6.2],
      ],
    },
  ];

  const OBSTACLES_RAW = [
    { lon: 110, lat: 26, r: 130 },
    { lon: 103, lat: 14, r: 92 },
    { lon: 127, lat: 38, r: 52 },
    { lon: 136, lat: 38, r: 90 },
    { lon: 121, lat: 23.8, r: 35 },
    { lon: 122.7, lat: 12.4, r: 78 },
    { lon: 113.5, lat: 1.4, r: 98 },
    { lon: 101.5, lat: 5.3, r: 58 },
  ];

  const EVENT_POOL = {
    bad: [
      {
        title: "突发狂风",
        description: "海面骤起狂风，船头被连续拍击。",
        options: [
          {
            label: "收帆硬抗",
            result: { hull: -11, supplies: -7, gold: 0 },
            summary: "你顶住了风浪，但船体受损。",
          },
          {
            label: "全速冲过去",
            result: { hull: -20, supplies: -4, gold: 0 },
            summary: "勉强冲出风区，船板发出异响。",
          },
          {
            label: "抛弃重货减负",
            result: { hull: -7, supplies: -3, gold: -8 },
            summary: "损伤较轻，但损失了一些财物。",
          },
        ],
      },
      {
        title: "暗礁区",
        description: "船底下方出现大片暗礁，躲避空间很小。",
        options: [
          {
            label: "立刻急转舵",
            result: { hull: -8, supplies: -6, gold: 0 },
            summary: "擦碰了礁石，但避免了重创。",
          },
          {
            label: "保持航线祈祷",
            result: { hull: -17, supplies: -5, gold: 0 },
            summary: "船底传来剧烈撞击声。",
          },
          {
            label: "抛锚减速",
            result: { hull: -5, supplies: -10, gold: 0 },
            summary: "船体更安全，但补给消耗很大。",
          },
        ],
      },
      {
        title: "甲板失火",
        description: "油灯翻倒，火星向补给区蔓延。",
        options: [
          {
            label: "用淡水灭火",
            result: { hull: -6, supplies: -15, gold: 0 },
            summary: "火势被压住，但补给大减。",
          },
          {
            label: "用帆布闷灭",
            result: { hull: -10, supplies: -6, gold: 0 },
            summary: "火灭了，甲板留下严重灼痕。",
          },
          {
            label: "封舱等待燃尽",
            result: { hull: -18, supplies: -4, gold: 0 },
            summary: "损失扩大，船体结构受损。",
          },
        ],
      },
      {
        title: "舱底渗漏",
        description: "底舱进水速度加快，泵水压力很大。",
        options: [
          {
            label: "立刻堵漏",
            result: { hull: -7, supplies: -8, gold: 0 },
            summary: "暂时堵住了裂口。",
          },
          {
            label: "先排水再补",
            result: { hull: -11, supplies: -10, gold: 0 },
            summary: "船况稳定下来，但代价不小。",
          },
          {
            label: "无视继续前进",
            result: { hull: -22, supplies: -5, gold: 0 },
            summary: "渗漏恶化，船体明显下沉。",
          },
        ],
      },
      {
        title: "船员疲惫",
        description: "连续值守导致操作失误频发。",
        options: [
          {
            label: "临时加餐补给",
            result: { hull: -5, supplies: -12, gold: 0 },
            summary: "船员状态恢复，但补给压力变大。",
          },
          {
            label: "继续强行推进",
            result: { hull: -14, supplies: -5, gold: 0 },
            summary: "效率下降，索具又断了几处。",
          },
          {
            label: "发放金币激励",
            result: { hull: -4, supplies: -4, gold: -10 },
            summary: "士气回升，但金币减少。",
          },
        ],
      },
      {
        title: "船壳虫害",
        description: "温暖海域里，船壳被生物持续侵蚀。",
        options: [
          {
            label: "紧急刷焦油",
            result: { hull: -8, supplies: -7, gold: -6 },
            summary: "侵蚀速度放缓，但花费不小。",
          },
          {
            label: "先不处理",
            result: { hull: -16, supplies: -4, gold: 0 },
            summary: "夜里损伤迅速扩大。",
          },
          {
            label: "刮除并重封",
            result: { hull: -10, supplies: -10, gold: 0 },
            summary: "船体暂时稳住了。",
          },
        ],
      },
      {
        title: "黑潮偏流",
        description: "强海流把你拖向危险浅滩。",
        options: [
          {
            label: "抛弃压舱物",
            result: { hull: -7, supplies: -5, gold: -12 },
            summary: "成功脱离，但损失了贵重货物。",
          },
          {
            label: "强行逆流顶住",
            result: { hull: -15, supplies: -9, gold: 0 },
            summary: "脱困后船体出现多处裂痕。",
          },
          {
            label: "顺流漂移重算路线",
            result: { hull: -9, supplies: -11, gold: 0 },
            summary: "更稳妥，但补给消耗更高。",
          },
        ],
      },
      {
        title: "疫病蔓延",
        description: "甲板上出现发热症状，作业能力下降。",
        options: [
          {
            label: "立刻启用药品",
            result: { hull: -4, supplies: -14, gold: -5 },
            summary: "病情被控制住了。",
          },
          {
            label: "维持原计划",
            result: { hull: -10, supplies: -8, gold: 0 },
            summary: "航行效率持续下降。",
          },
          {
            label: "临时绕港休整",
            result: { hull: -6, supplies: -10, gold: 0 },
            summary: "情况稳定，但补给减少。",
          },
        ],
      },
      {
        title: "夜间碰撞",
        description: "夜色中突然出现漂浮残骸，来不及完全避让。",
        options: [
          {
            label: "正面吃撞击",
            result: { hull: -18, supplies: -5, gold: 0 },
            summary: "船艏承受了主要冲击。",
          },
          {
            label: "极限转向避让",
            result: { hull: -10, supplies: -9, gold: 0 },
            summary: "避开大部分冲击，侧舷仍受损。",
          },
          {
            label: "鸣号减速",
            result: { hull: -6, supplies: -11, gold: 0 },
            summary: "船体更安全，但补给代价更高。",
          },
        ],
      },
      {
        title: "海盗尾随",
        description: "一队小型快船在远处持续跟踪。",
        options: [
          {
            label: "花钱消灾",
            result: { hull: -2, supplies: -4, gold: -16 },
            summary: "对方收钱离开了。",
          },
          {
            label: "全力甩开",
            result: { hull: -13, supplies: -7, gold: -4 },
            summary: "成功脱离，但船体受创。",
          },
          {
            label: "组织反击",
            result: { hull: -17, supplies: -9, gold: 3 },
            summary: "逼退海盗，代价惨重。",
          },
        ],
      },
    ],
    good: [
      {
        title: "顺风航段",
        description: "稳定尾风让航行效率明显提升。",
        options: [
          {
            label: "趁机节省补给",
            result: { hull: 0, supplies: 12, gold: 0 },
            summary: "你成功节约了不少补给。",
          },
          {
            label: "加速搜寻漂流物",
            result: { hull: 2, supplies: 5, gold: 8 },
            summary: "捞到一些可变现物资。",
          },
          {
            label: "维持常规航行",
            result: { hull: 1, supplies: 7, gold: 3 },
            summary: "整体状态小幅改善。",
          },
        ],
      },
      {
        title: "海上补给箱",
        description: "附近漂浮着一批尚未破损的箱子。",
        options: [
          {
            label: "全部打捞",
            result: { hull: -2, supplies: 10, gold: 14 },
            summary: "收益不错，但船体有轻微损伤。",
          },
          {
            label: "只拿补给",
            result: { hull: 0, supplies: 14, gold: 0 },
            summary: "补给得到明显恢复。",
          },
          {
            label: "只拿值钱货",
            result: { hull: 0, supplies: 4, gold: 18 },
            summary: "金币收入很可观。",
          },
        ],
      },
      {
        title: "友方船队",
        description: "一支商船队愿意短程护航。",
        options: [
          {
            label: "接受护航",
            result: { hull: 8, supplies: 6, gold: 0 },
            summary: "航线安全提升，状态回暖。",
          },
          {
            label: "交换航路情报",
            result: { hull: 4, supplies: 4, gold: 10 },
            summary: "双方都有收获。",
          },
          {
            label: "保持独航",
            result: { hull: 1, supplies: 3, gold: 2 },
            summary: "小有收获，不受牵制。",
          },
        ],
      },
      {
        title: "平静海面",
        description: "海况稳定，适合短时维护与整备。",
        options: [
          {
            label: "进行轻度维修",
            result: { hull: 12, supplies: -4, gold: 0 },
            summary: "耐久明显回升。",
          },
          {
            label: "严格配给",
            result: { hull: 2, supplies: 10, gold: 0 },
            summary: "补给得到恢复。",
          },
          {
            label: "搜索附近残骸",
            result: { hull: -2, supplies: 3, gold: 12 },
            summary: "有点风险，但赚到金币。",
          },
        ],
      },
    ],
    neutral: [
      {
        title: "浓雾带",
        description: "能见度骤降，前方状况难以判断。",
        options: [
          {
            label: "降速鸣钟",
            result: { hull: -2, supplies: -6, gold: 0 },
            summary: "风险降低，但补给消耗增加。",
          },
          {
            label: "保持原速",
            result: { hull: -6, supplies: -2, gold: 0 },
            summary: "节省了补给，风险偏高。",
          },
          {
            label: "短暂停船观察",
            result: { hull: 0, supplies: -8, gold: 0 },
            summary: "没有受损，但前进效率很低。",
          },
        ],
      },
      {
        title: "可疑求救信号",
        description: "远处短暂闪过信号火光，真假难辨。",
        options: [
          {
            label: "前往查看",
            result: { hull: -4, supplies: -4, gold: 6 },
            summary: "只找到少量可用物资。",
          },
          {
            label: "忽略并继续",
            result: { hull: 0, supplies: -3, gold: 0 },
            summary: "没有额外风险，继续航行。",
          },
          {
            label: "绕一圈再离开",
            result: { hull: -1, supplies: -5, gold: 2 },
            summary: "风险可控，收益有限。",
          },
        ],
      },
      {
        title: "市井传闻",
        description: "路过船只贩卖一条真假难辨的港口情报。",
        options: [
          {
            label: "花钱买情报",
            result: { hull: 0, supplies: -2, gold: -6 },
            summary: "短期无变化，也许后续有用。",
          },
          {
            label: "卖出自己的传闻",
            result: { hull: 0, supplies: -1, gold: 6 },
            summary: "轻松赚到一笔金币。",
          },
          {
            label: "礼貌拒绝",
            result: { hull: 0, supplies: -2, gold: 0 },
            summary: "稳妥通过，不冒额外风险。",
          },
        ],
      },
      {
        title: "异常洋流",
        description: "水温与流向突然变化，航向开始偏移。",
        options: [
          {
            label: "保守修正航线",
            result: { hull: -3, supplies: -5, gold: 0 },
            summary: "你逐步恢复了航向。",
          },
          {
            label: "强推直线前进",
            result: { hull: -6, supplies: -4, gold: 0 },
            summary: "顶过去了，但有额外磨损。",
          },
          {
            label: "顺流观察片刻",
            result: { hull: -1, supplies: -6, gold: 0 },
            summary: "更稳一点，但效率较低。",
          },
        ],
      },
    ],
  };

  const canvas = document.getElementById("world");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const ui = {
    mapPanel: document.querySelector(".map-panel"),
    hudPanel: document.querySelector(".hud-panel"),
    hull: document.getElementById("hullStat"),
    supplies: document.getElementById("supplyStat"),
    gold: document.getElementById("goldStat"),
    time: document.getElementById("timeStat"),
    mode: document.getElementById("modeStat"),
    portSelect: document.getElementById("portSelect"),
    targetX: document.getElementById("targetX"),
    targetY: document.getElementById("targetY"),
    setPortBtn: document.getElementById("setPortBtn"),
    setCoordBtn: document.getElementById("setCoordBtn"),
    targetLabel: document.getElementById("targetLabel"),
    logList: document.getElementById("logList"),
    rescueBanner: document.getElementById("rescueBanner"),
    eventModal: document.getElementById("eventModal"),
    eventTitle: document.getElementById("eventTitle"),
    eventDesc: document.getElementById("eventDesc"),
    eventOptions: document.getElementById("eventOptions"),
  };

  const LAND_SHAPES = LAND_SHAPES_RAW.map((shape) => ({
    name: shape.name,
    points: shape.points.map(([lon, lat]) => lonLatToWorld(lon, lat)),
  }));

  const PORTS = PORTS_RAW.map((p) => {
    const pos = lonLatToWorld(p.lon, p.lat);
    return { ...p, ...pos };
  });

  const OBSTACLES = OBSTACLES_RAW.map((o) => {
    const pos = lonLatToWorld(o.lon, o.lat);
    return { x: pos.x, y: pos.y, r: o.r };
  });

  const state = {
    mode: "sailing",
    ship: { x: 0, y: 0, heading: 0 },
    target: null,
    currentPortId: "shanghai",
    stats: {
      hull: 100,
      supplies: 100,
      gold: 0,
    },
    survivalMs: 0,
    nextEventInMs: randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs),
    activeEvent: null,
    eventContinueAction: null,
    eventDecisionMs: 0,
    eventAutoContinueMs: 0,
    rescueEndAt: null,
    rescuedPortId: null,
    rescueCheatUpCount: 0,
    autoSaveInMs: CONFIG.autoSaveMs,
    portIdleMs: 0,
    lastDockedAt: 0,
    trailPoints: [],
    logEntries: [],
    worldTime: 0,
    nav: {
      avoidLockSide: 0,
      avoidLockMs: 0,
      bestTargetDist: Number.POSITIVE_INFINITY,
      noProgressMs: 0,
      routePoints: [],
      routeIndex: 0,
      rerouteCooldownMs: 0,
    },
  };

  let rafId = null;
  let lastFrameMs = performance.now();

  function lonLatToWorld(lon, lat) {
    const lonRange = WORLD.lonMax - WORLD.lonMin;
    const latRange = WORLD.latMax - WORLD.latMin;
    const x = ((lon - WORLD.lonMin) / lonRange) * WORLD.width;
    const y = WORLD.height - ((lat - WORLD.latMin) / latRange) * WORLD.height;
    return { x, y };
  }

  function worldToLonLat(x, y) {
    const lon = WORLD.lonMin + (x / WORLD.width) * (WORLD.lonMax - WORLD.lonMin);
    const lat = WORLD.latMin + ((WORLD.height - y) / WORLD.height) * (WORLD.latMax - WORLD.latMin);
    return { lon, lat };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampToWorld(x, y) {
    return {
      x: clamp(x, 0, WORLD.width),
      y: clamp(y, 0, WORLD.height),
    };
  }

  function torusDistance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.hypot(dx, dy);
  }

  function normalize(vec) {
    const mag = Math.hypot(vec.x, vec.y) || 1;
    return { x: vec.x / mag, y: vec.y / mag };
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function pruneTrailPoints() {
    const fadeSec = CONFIG.trailFadeMs / 1000;
    const cutoff = state.worldTime - fadeSec;
    state.trailPoints = state.trailPoints.filter((p) => p.t >= cutoff);
    if (state.trailPoints.length > CONFIG.trailMaxPoints) {
      state.trailPoints = state.trailPoints.slice(state.trailPoints.length - CONFIG.trailMaxPoints);
    }
  }

  function addTrailPoint(force = false) {
    const last = state.trailPoints[state.trailPoints.length - 1];
    if (
      !force &&
      last &&
      Math.hypot(state.ship.x - last.x, state.ship.y - last.y) < CONFIG.trailPointMinDistance
    ) {
      return;
    }
    state.trailPoints.push({ x: state.ship.x, y: state.ship.y, t: state.worldTime });
    if (state.trailPoints.length > CONFIG.trailMaxPoints) {
      state.trailPoints.shift();
    }
  }

  function resetTrail() {
    state.trailPoints = [];
    addTrailPoint(true);
  }

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(totalSec % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function modeLabel(mode) {
    if (mode === "sailing") return "航行中";
    if (mode === "event") return "事件处理中";
    return "救援休整";
  }

  function pushLog(message) {
    const stamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    state.logEntries.unshift(`${stamp} | ${message}`);
    state.logEntries = state.logEntries.slice(0, 9);
    renderLog();
  }

  function renderLog() {
    ui.logList.innerHTML = "";
    for (const line of state.logEntries) {
      const item = document.createElement("li");
      item.textContent = line;
      ui.logList.appendChild(item);
    }
  }

  function setTargetPortInternal(portId, source = "manual") {
    const port = PORTS.find((p) => p.id === portId);
    if (!port) return;
    state.target = {
      type: "port",
      id: port.id,
      label: port.name,
      x: port.x,
      y: port.y,
    };
    state.portIdleMs = 0;
    resetNavigationMemory();
    planRouteToTarget();
    if (source === "auto") {
      pushLog(`港口待命超过10秒，已自动设定目的地：${port.name}。`);
      saveGame("set-port-auto");
    } else {
      pushLog(`已设定港口目标：${port.name}。`);
      saveGame("set-port");
    }
  }

  function setTargetPort(portId) {
    recoverInvalidModeState("设置港口目标");
    if (state.mode === "rescue") {
      pushLog("救援休整期间无法设置目标。");
      return;
    }
    setTargetPortInternal(portId, "manual");
  }

  function setTargetCoordinate(x, y) {
    recoverInvalidModeState("设置坐标目标");
    if (state.mode === "rescue") {
      pushLog("救援休整期间无法设置目标。");
      return;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      pushLog("坐标目标无效。");
      return;
    }
    const targetX = clamp(x, 0, WORLD.width);
    const targetY = clamp(y, 0, WORLD.height);
    if (targetX !== x || targetY !== y) {
      pushLog("目标坐标超出地图边界，已自动限制到边界内。");
    }
    state.target = {
      type: "coord",
      id: null,
      label: `坐标 ${Math.round(targetX)}, ${Math.round(targetY)}`,
      x: targetX,
      y: targetY,
    };
    state.portIdleMs = 0;
    resetNavigationMemory();
    planRouteToTarget();
    pushLog(`已设定坐标目标：(${Math.round(targetX)}, ${Math.round(targetY)})。`);
    saveGame("set-xy");
  }

  function pickRandomOtherPort(currentPortId) {
    const candidates = PORTS.filter((p) => p.id !== currentPortId);
    if (candidates.length === 0) return null;
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  function pickNearestPort() {
    let best = PORTS[0];
    let bestDist = Number.POSITIVE_INFINITY;
    for (const port of PORTS) {
      const d = torusDistance(state.ship, port);
      if (d < bestDist) {
        best = port;
        bestDist = d;
      }
    }
    return best;
  }

  function dockAtPort(port, source) {
    state.ship.x = port.x;
    state.ship.y = port.y;
    state.currentPortId = port.id;
    state.lastDockedAt = Date.now();
    state.portIdleMs = 0;

    if (state.target && state.target.type === "port" && state.target.id === port.id) {
      state.target = null;
    }
    if (source === "rescue") {
      // Rescue teleports the ship to a port; reset trail to avoid a long jump line.
      resetTrail();
    } else {
      // Normal arrival keeps the route trail and lets it fade out naturally.
      addTrailPoint(true);
    }
    resetNavigationMemory();

    const tag = source === "rescue" ? "被救援至" : "已停靠";
    pushLog(`${tag}${port.name}。`);
    saveGame("dock");
  }

  function triggerRescue(reason) {
    if (state.mode === "rescue") return;

    const port = pickNearestPort();
    state.mode = "rescue";
    state.activeEvent = null;
    state.eventContinueAction = null;
    hideEventModal();
    state.rescueEndAt = Date.now() + CONFIG.rescueDurationMs;
    state.rescuedPortId = port.id;
    state.rescueCheatUpCount = 0;
    state.target = null;
    state.portIdleMs = 0;
    resetNavigationMemory();
    state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);

    dockAtPort(port, "rescue");
    pushLog(`触发紧急救援（${reason}），需休整 30 分钟。`);
    saveGame("rescue-start");
  }

  function completeRescue() {
    if (state.mode !== "rescue") return;
    state.mode = "sailing";
    state.rescueEndAt = null;
    state.rescuedPortId = null;
    state.rescueCheatUpCount = 0;
    state.stats.hull = 100;
    state.stats.supplies = 100;
    state.survivalMs = 0;
    state.portIdleMs = 0;
    pushLog("休整结束，存活计时已重置，可重新起航。");
    saveGame("rescue-end");
  }

  function applyOutcome(result) {
    state.stats.hull = clamp(state.stats.hull + (result.hull || 0), 0, 100);
    state.stats.supplies = clamp(state.stats.supplies + (result.supplies || 0), 0, 100);
    state.stats.gold = Math.max(0, state.stats.gold + (result.gold || 0));
  }

  function pickRandomEvent() {
    const roll = Math.random();
    let category = "bad";
    if (roll < 0.5) category = "bad";
    else if (roll < 0.75) category = "good";
    else category = "neutral";

    const bucket = EVENT_POOL[category];
    return bucket[Math.floor(Math.random() * bucket.length)];
  }

  function openEvent() {
    const event = pickRandomEvent();
    state.mode = "event";
    state.activeEvent = event;
    state.eventDecisionMs = CONFIG.eventDecisionTimeoutMs;
    state.eventAutoContinueMs = 0;

    ui.eventTitle.textContent = event.title;
    ui.eventDesc.textContent = event.description;
    ui.eventOptions.innerHTML = "";

    event.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", () => resolveEvent(option));
      ui.eventOptions.appendChild(button);
    });

    ui.eventModal.classList.remove("hidden");
    saveGame("event-open");
  }

  function hideEventModal() {
    ui.eventModal.classList.add("hidden");
    ui.eventOptions.innerHTML = "";
    state.activeEvent = null;
    state.eventContinueAction = null;
    state.eventDecisionMs = 0;
    state.eventAutoContinueMs = 0;
  }

  function recoverInvalidModeState(source) {
    let recovered = false;

    if (state.mode === "event" && !state.activeEvent && !state.eventContinueAction) {
      state.mode = "sailing";
      state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
      pushLog(`检测到异常事件状态（${source}），已恢复航行。`);
      recovered = true;
    }

    if (state.mode === "rescue" && (!state.rescueEndAt || !Number.isFinite(state.rescueEndAt))) {
      state.mode = "sailing";
      state.rescueEndAt = null;
      state.rescuedPortId = null;
      state.stats.hull = Math.max(state.stats.hull, 100);
      state.stats.supplies = Math.max(state.stats.supplies, 100);
      pushLog(`检测到异常救援状态（${source}），已恢复航行。`);
      recovered = true;
    }

    return recovered;
  }

  function formatDelta(value, name) {
    if (!value) return `${name} 0`;
    return `${name} ${value > 0 ? "+" : ""}${value}`;
  }

  function buildOutcomeText(option) {
    const result = option.result || {};
    const lines = [option.summary];
    lines.push(
      `${formatDelta(result.hull || 0, "耐久")}，${formatDelta(result.supplies || 0, "补给")}，${formatDelta(
        result.gold || 0,
        "金币"
      )}`
    );
    return lines.join("\n");
  }

  function showEventOutcome(option, onContinue, options = {}) {
    const autoContinueMs = Number.isFinite(options.autoContinueMs) ? options.autoContinueMs : 0;
    ui.eventTitle.textContent = "事件结果";
    ui.eventDesc.textContent = buildOutcomeText(option);
    ui.eventOptions.innerHTML = "";
    state.activeEvent = null;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = autoContinueMs > 0 ? "自动继续中..." : "继续航行";
    state.eventContinueAction = onContinue;
    state.eventAutoContinueMs = autoContinueMs;
    button.addEventListener("click", () => {
      const action = state.eventContinueAction;
      hideEventModal();
      if (action) action();
    });
    ui.eventOptions.appendChild(button);
    ui.eventModal.classList.remove("hidden");
  }

  function resolveEvent(option, options = {}) {
    const autoSelected = !!options.autoSelected;
    if (state.mode !== "event") return;

    applyOutcome(option.result || {});
    if (autoSelected) {
      pushLog(`事件超时，系统已自动选择：${option.label}。`);
    }
    pushLog(`事件结果：${option.summary}`);

    const outcomeOptions = autoSelected ? { autoContinueMs: CONFIG.eventAutoContinueMs } : {};

    if (state.stats.hull <= 0 || state.stats.supplies <= 0) {
      showEventOutcome(option, () => {
        triggerRescue("事件后进入危急状态");
      }, outcomeOptions);
      return;
    }

    showEventOutcome(option, () => {
      state.mode = "sailing";
      state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
      saveGame("event-resolve");
    }, outcomeOptions);
  }

  function findNearbyPort() {
    for (const port of PORTS) {
      if (torusDistance(state.ship, port) <= CONFIG.portDockRadius) {
        return port;
      }
    }
    return null;
  }

  function maybeAutoDepartFromPort(dt) {
    if (state.mode !== "sailing" || state.target) {
      state.portIdleMs = 0;
      return;
    }

    const nearby = findNearbyPort();
    if (!nearby) {
      state.portIdleMs = 0;
      return;
    }

    state.portIdleMs += dt * 1000;
    if (state.portIdleMs < CONFIG.portIdleAutoDepartMs) return;

    const destination = pickRandomOtherPort(nearby.id);
    state.portIdleMs = 0;
    if (!destination) return;
    setTargetPortInternal(destination.id, "auto");
  }

  function pointInPolygon(point, polygonPoints) {
    let inside = false;
    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      const pi = polygonPoints[i];
      const pj = polygonPoints[j];
      const intersects =
        (pi.y > point.y) !== (pj.y > point.y) &&
        point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y + 1e-9) + pi.x;
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function closestPointOnSegment(point, a, b) {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const denom = abx * abx + aby * aby;
    if (denom <= 1e-9) return { x: a.x, y: a.y };
    const t = clamp(((point.x - a.x) * abx + (point.y - a.y) * aby) / denom, 0, 1);
    return { x: a.x + abx * t, y: a.y + aby * t };
  }

  function sampleShapeClearance(point, shape) {
    let nearestPoint = shape.points[0];
    let edgeDistance = Number.POSITIVE_INFINITY;
    const count = shape.points.length;
    for (let i = 0; i < count; i++) {
      const a = shape.points[i];
      const b = shape.points[(i + 1) % count];
      const cp = closestPointOnSegment(point, a, b);
      const d = Math.hypot(point.x - cp.x, point.y - cp.y);
      if (d < edgeDistance) {
        edgeDistance = d;
        nearestPoint = cp;
      }
    }
    return {
      inside: pointInPolygon(point, shape.points),
      edgeDistance,
      nearestPoint,
    };
  }

  function getLandSample(point) {
    let bestInside = null;
    let bestOutside = null;

    for (const shape of LAND_SHAPES) {
      const sample = sampleShapeClearance(point, shape);
      if (sample.inside) {
        if (!bestInside || sample.edgeDistance < bestInside.edgeDistance) {
          bestInside = sample;
        }
      } else if (!bestOutside || sample.edgeDistance < bestOutside.edgeDistance) {
        bestOutside = sample;
      }
    }

    const chosen = bestInside || bestOutside;
    if (!chosen) {
      return {
        inside: false,
        edgeDistance: Number.POSITIVE_INFINITY,
        nearestPoint: null,
        signedDistance: Number.POSITIVE_INFINITY,
      };
    }

    return {
      inside: !!bestInside,
      edgeDistance: chosen.edgeDistance,
      nearestPoint: chosen.nearestPoint,
      signedDistance: bestInside ? -chosen.edgeDistance : chosen.edgeDistance,
    };
  }

  function getAvoidVector() {
    const sample = getLandSample(state.ship);
    if (!sample.nearestPoint) return { x: 0, y: 0 };
    const vx = sample.inside ? sample.nearestPoint.x - state.ship.x : state.ship.x - sample.nearestPoint.x;
    const vy = sample.inside ? sample.nearestPoint.y - state.ship.y : state.ship.y - sample.nearestPoint.y;
    const dist = Math.hypot(vx, vy);
    if (dist <= 1e-6) return { x: 0, y: 0 };

    if (sample.inside) {
      return {
        x: (vx / dist) * 1.25,
        y: (vy / dist) * 1.25,
      };
    }

    const threshold = CONFIG.obstacleBuffer + 2;
    if (sample.edgeDistance >= threshold) {
      return { x: 0, y: 0 };
    }

    const strength = ((threshold - sample.edgeDistance) / threshold) * 0.8;
    return {
      x: (vx / dist) * strength,
      y: (vy / dist) * strength,
    };
  }

  function positionCollides(x, y) {
    return minObstacleClearance({ x, y }) <= 0;
  }

  function minObstacleClearance(point) {
    const sample = getLandSample(point);
    return sample.signedDistance - CONFIG.obstacleBuffer;
  }

  function rotateVector(vec, angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
      x: vec.x * cos - vec.y * sin,
      y: vec.x * sin + vec.y * cos,
    };
  }

  function resetNavigationMemory() {
    state.nav.avoidLockSide = 0;
    state.nav.avoidLockMs = 0;
    state.nav.bestTargetDist = Number.POSITIVE_INFINITY;
    state.nav.noProgressMs = 0;
    state.nav.routePoints = [];
    state.nav.routeIndex = 0;
    state.nav.rerouteCooldownMs = 0;
  }

  function gridCellFromWorld(point, cols, rows) {
    const cx = clamp(Math.round(point.x / NAV.cellSize), 0, cols - 1);
    const cy = clamp(Math.round(point.y / NAV.cellSize), 0, rows - 1);
    return { cx, cy };
  }

  function worldFromGridCell(cx, cy) {
    return clampToWorld(cx * NAV.cellSize, cy * NAV.cellSize);
  }

  function gridKey(cx, cy, cols) {
    return cy * cols + cx;
  }

  function findNearestWalkableCell(baseCell, walkable, cols, rows, maxRadius = 8) {
    if (walkable[baseCell.cy][baseCell.cx]) return baseCell;
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let y = baseCell.cy - radius; y <= baseCell.cy + radius; y++) {
        if (y < 0 || y >= rows) continue;
        for (let x = baseCell.cx - radius; x <= baseCell.cx + radius; x++) {
          if (x < 0 || x >= cols) continue;
          if (!walkable[y][x]) continue;
          return { cx: x, cy: y };
        }
      }
    }
    return null;
  }

  function buildRoutePath(startPoint, endPoint) {
    const cols = Math.floor(WORLD.width / NAV.cellSize) + 1;
    const rows = Math.floor(WORLD.height / NAV.cellSize) + 1;

    const walkable = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        const p = worldFromGridCell(x, y);
        return !positionCollides(p.x, p.y);
      })
    );

    const startCellRaw = gridCellFromWorld(startPoint, cols, rows);
    const endCellRaw = gridCellFromWorld(endPoint, cols, rows);
    const startCell = findNearestWalkableCell(startCellRaw, walkable, cols, rows);
    const endCell = findNearestWalkableCell(endCellRaw, walkable, cols, rows);
    if (!startCell || !endCell) return null;

    const totalNodes = cols * rows;
    const g = new Float64Array(totalNodes);
    const f = new Float64Array(totalNodes);
    const parent = new Int32Array(totalNodes);
    g.fill(Number.POSITIVE_INFINITY);
    f.fill(Number.POSITIVE_INFINITY);
    parent.fill(-1);

    const openSet = new Set();
    const startKey = gridKey(startCell.cx, startCell.cy, cols);
    const endKey = gridKey(endCell.cx, endCell.cy, cols);

    g[startKey] = 0;
    f[startKey] = Math.hypot(endCell.cx - startCell.cx, endCell.cy - startCell.cy);
    openSet.add(startKey);

    const dirs = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ];

    let searched = 0;
    while (openSet.size > 0 && searched < NAV.maxSearchNodes) {
      searched++;
      let current = -1;
      let bestF = Number.POSITIVE_INFINITY;
      for (const key of openSet) {
        if (f[key] < bestF) {
          bestF = f[key];
          current = key;
        }
      }
      if (current < 0) break;
      if (current === endKey) break;

      openSet.delete(current);
      const cx = current % cols;
      const cy = Math.floor(current / cols);

      for (const [dx, dy, cost] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        if (!walkable[ny][nx]) continue;

        const neighbor = gridKey(nx, ny, cols);
        const tentative = g[current] + cost;
        if (tentative >= g[neighbor]) continue;

        parent[neighbor] = current;
        g[neighbor] = tentative;
        f[neighbor] = tentative + Math.hypot(endCell.cx - nx, endCell.cy - ny);
        openSet.add(neighbor);
      }
    }

    if (parent[endKey] === -1 && endKey !== startKey) return null;

    const pathCells = [];
    let cur = endKey;
    pathCells.push(cur);
    while (cur !== startKey) {
      cur = parent[cur];
      if (cur < 0) return null;
      pathCells.push(cur);
    }
    pathCells.reverse();

    const points = [];
    for (let i = 1; i < pathCells.length; i++) {
      const key = pathCells[i];
      const cx = key % cols;
      const cy = Math.floor(key / cols);
      points.push(worldFromGridCell(cx, cy));
    }
    points.push({ x: endPoint.x, y: endPoint.y });
    return points;
  }

  function planRouteToTarget() {
    if (!state.target) return;
    const path = buildRoutePath(state.ship, state.target);
    if (path && path.length > 0) {
      state.nav.routePoints = path;
      state.nav.routeIndex = 0;
      state.nav.bestTargetDist = Number.POSITIVE_INFINITY;
      return;
    }
    state.nav.routePoints = [];
    state.nav.routeIndex = 0;
  }

  function getNavigationTarget() {
    if (!state.target) return null;
    while (state.nav.routeIndex < state.nav.routePoints.length) {
      const wp = state.nav.routePoints[state.nav.routeIndex];
      if (torusDistance(state.ship, wp) <= NAV.cellSize * 0.45) {
        state.nav.routeIndex++;
      } else {
        break;
      }
    }
    if (state.nav.routeIndex < state.nav.routePoints.length) {
      return { point: state.nav.routePoints[state.nav.routeIndex], isFinal: false };
    }
    return { point: state.target, isFinal: true };
  }

  function getEmergencyEscapeDirection() {
    const sample = getLandSample(state.ship);
    if (!sample.nearestPoint) return null;
    const dir = sample.inside
      ? { x: sample.nearestPoint.x - state.ship.x, y: sample.nearestPoint.y - state.ship.y }
      : { x: state.ship.x - sample.nearestPoint.x, y: state.ship.y - sample.nearestPoint.y };
    if (Math.hypot(dir.x, dir.y) <= 1e-6) return null;
    return normalize(dir);
  }

  function buildMoveCandidate(direction, speed, dt, moveTarget) {
    const pos = clampToWorld(state.ship.x + direction.x * speed * dt, state.ship.y + direction.y * speed * dt);
    const moved = Math.hypot(pos.x - state.ship.x, pos.y - state.ship.y);
    if (moved < 0.01) return null;

    const currentClear = minObstacleClearance(state.ship);
    const nextClear = minObstacleClearance(pos);
    const escaping = currentClear <= 0 && nextClear > currentClear + 0.05;
    if (nextClear <= 0 && !escaping) return null;

    return {
      x: pos.x,
      y: pos.y,
      heading: Math.atan2(direction.y, direction.x),
      moved,
      targetDist: moveTarget ? torusDistance(pos, moveTarget) : 0,
    };
  }

  function findDetourCandidate(baseDirection, speed, dt, moveTarget, preferredSign = 0) {
    const angleCandidates = [12, -12, 24, -24, 36, -36, 50, -50, 65, -65, 80, -80, 100, -100, 125, -125, 150, -150, 170, -170];
    let best = null;
    for (const deg of angleCandidates) {
      const sign = Math.sign(deg) || 1;
      if (preferredSign !== 0 && sign !== preferredSign) continue;
      const dir = normalize(rotateVector(baseDirection, (deg * Math.PI) / 180));
      const cand = buildMoveCandidate(dir, speed, dt, moveTarget);
      if (!cand) continue;
      const score = cand.targetDist + Math.abs(deg) * 0.65 - cand.moved * 4;
      if (!best || score < best.score) {
        best = { ...cand, score, turnSign: sign };
      }
    }
    return best;
  }

  function pickTurnSide(baseDirection) {
    const sample = getLandSample(state.ship);
    if (!sample.nearestPoint) return 1;
    const lx = sample.nearestPoint.x - state.ship.x;
    const ly = sample.nearestPoint.y - state.ship.y;
    const cross = baseDirection.x * ly - baseDirection.y * lx;
    return cross >= 0 ? -1 : 1;
  }

  function steerDirectionToTarget(moveTarget, isFinalTarget) {
    if (!moveTarget) return null;

    const dx = moveTarget.x - state.ship.x;
    const dy = moveTarget.y - state.ship.y;
    const targetDist = Math.hypot(dx, dy);
    const desired = normalize({ x: dx, y: dy });
    const avoid = getAvoidVector();
    let avoidWeight = 1.45;

    // Close-range harbor approach: reduce coastline repulsion near a port target.
    if (isFinalTarget && state.target && state.target.type === "port") {
      if (targetDist <= 120) avoidWeight = 0;
      else if (targetDist <= 220) avoidWeight = ((targetDist - 120) / 100) * 1.45;
    }

    const mixed = {
      x: desired.x + avoid.x * avoidWeight,
      y: desired.y + avoid.y * avoidWeight,
    };

    const vec = normalize(mixed);
    return vec;
  }

  function updateShip(dt) {
    if (!state.target) return;

    const navTarget = getNavigationTarget();
    if (!navTarget) return;
    const moveTarget = navTarget.point;
    const direction = steerDirectionToTarget(moveTarget, navTarget.isFinal);
    if (!direction) return;

    const speed = CONFIG.shipSpeed;
    if (state.nav.rerouteCooldownMs > 0) {
      state.nav.rerouteCooldownMs = Math.max(0, state.nav.rerouteCooldownMs - dt * 1000);
    }
    if (state.nav.avoidLockMs > 0) {
      state.nav.avoidLockMs = Math.max(0, state.nav.avoidLockMs - dt * 1000);
      if (state.nav.avoidLockMs <= 0) state.nav.avoidLockSide = 0;
    }

    const distBefore = torusDistance(state.ship, moveTarget);
    let chosen = null;
    if (state.nav.avoidLockSide !== 0) {
      chosen = findDetourCandidate(direction, speed, dt, moveTarget, state.nav.avoidLockSide);
    }

    if (!chosen) {
      chosen = buildMoveCandidate(direction, speed, dt, moveTarget);
    }

    if (!chosen) {
      chosen = findDetourCandidate(direction, speed, dt, moveTarget);
    }

    if (!chosen) {
      const emergencyDir = getEmergencyEscapeDirection();
      if (emergencyDir) {
        chosen = buildMoveCandidate(emergencyDir, speed, dt, moveTarget);
      }
    }

    if (!chosen) {
      if (state.nav.rerouteCooldownMs <= 0) {
        planRouteToTarget();
        state.nav.rerouteCooldownMs = NAV.rerouteCooldownMs;
      }
      return;
    }

    state.ship.x = chosen.x;
    state.ship.y = chosen.y;
    state.ship.heading = chosen.heading;
    addTrailPoint();

    const distAfterMove = torusDistance(state.ship, moveTarget);
    if (state.nav.bestTargetDist === Number.POSITIVE_INFINITY || distAfterMove < state.nav.bestTargetDist - 1) {
      state.nav.bestTargetDist = distAfterMove;
      state.nav.noProgressMs = 0;
    } else {
      const progress = distBefore - distAfterMove;
      if (progress > 0.35) {
        state.nav.noProgressMs = 0;
      } else {
        state.nav.noProgressMs += dt * 1000;
      }
    }

    if (state.nav.noProgressMs >= NAV.noProgressRerouteMs) {
      if (state.nav.rerouteCooldownMs <= 0) {
        planRouteToTarget();
        state.nav.rerouteCooldownMs = NAV.rerouteCooldownMs;
      }
      const preferred = pickTurnSide(direction);
      state.nav.avoidLockSide =
        state.nav.avoidLockSide === preferred ? -preferred : preferred;
      state.nav.avoidLockMs = 3000;
      state.nav.noProgressMs = 0;
      state.nav.bestTargetDist = distAfterMove;
    }

    const targetDist = torusDistance(state.ship, state.target);
    if (state.target.type === "port" && state.target.id) {
      if (targetDist <= CONFIG.portArrivalRadius) {
        const port = PORTS.find((p) => p.id === state.target.id);
        state.target = null;
        resetNavigationMemory();
        if (port) dockAtPort(port, "arrival");
      }
    } else if (targetDist <= 12) {
      state.target = null;
      resetNavigationMemory();
      pushLog("已到达坐标目标。");
      saveGame("coord-reached");
    }

    const nearby = findNearbyPort();
    const shouldAutoDock =
      nearby &&
      (!state.target || (state.target.type === "port" && state.target.id === nearby.id));
    if (shouldAutoDock && Date.now() - state.lastDockedAt > 5000) {
      dockAtPort(nearby, "arrival");
    }
  }

  function updateRescueBanner() {
    if (state.mode !== "rescue" || !state.rescueEndAt) {
      ui.rescueBanner.classList.add("hidden");
      ui.rescueBanner.textContent = "";
      return;
    }

    const remaining = Math.max(0, state.rescueEndAt - Date.now());
    ui.rescueBanner.classList.remove("hidden");
    ui.rescueBanner.textContent = `救援休整中：剩余 ${formatDuration(remaining)}`;
  }

  function drawOcean(timeSec) {
    const g = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    g.addColorStop(0, "#10395f");
    g.addColorStop(0.45, "#19699b");
    g.addColorStop(1, "#12425f");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.globalAlpha = 0.17;
    ctx.strokeStyle = "#8dc5e6";
    ctx.lineWidth = 1;
    const waveOffset = (timeSec * 28) % 36;
    for (let y = -36; y < WORLD.height + 36; y += 36) {
      ctx.beginPath();
      for (let x = -20; x <= WORLD.width + 20; x += 18) {
        const curveY = y + Math.sin((x + waveOffset) * 0.032) * 2;
        if (x === -20) ctx.moveTo(x, curveY);
        else ctx.lineTo(x, curveY);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawLand() {
    for (const shape of LAND_SHAPES) {
      ctx.beginPath();
      shape.points.forEach((p, index) => {
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = "#3b6d3f";
      ctx.fill();
      ctx.strokeStyle = "#1f4f28";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawTrail() {
    if (state.trailPoints.length < 2) return;

    const fadeSec = CONFIG.trailFadeMs / 1000;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 1; i < state.trailPoints.length; i++) {
      const prev = state.trailPoints[i - 1];
      const cur = state.trailPoints[i];
      const ageRatio = clamp((state.worldTime - cur.t) / fadeSec, 0, 1);
      const alpha = 1 - ageRatio;
      if (alpha <= 0.01) continue;

      const strength = alpha * alpha;
      const dashOn = 1.4 + strength * 2.2;
      const dashOff = 3.2 + (1 - strength) * 4.6;
      ctx.setLineDash([dashOn, dashOff]);
      ctx.lineDashOffset = -((state.worldTime * 26 + i * 1.8) % 20);
      ctx.strokeStyle = `rgba(243, 251, 255, ${(0.05 + strength * 0.56).toFixed(3)})`;
      ctx.lineWidth = 0.7 + strength * 2.6;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();

      // Add tiny white foam bubbles on fresher segments for a wake-like look.
      if (strength > 0.18 && i % 3 === 0) {
        const mx = (prev.x + cur.x) * 0.5;
        const my = (prev.y + cur.y) * 0.5;
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(248, 253, 255, ${(0.04 + strength * 0.34).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(mx, my, 0.6 + strength * 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawPortIconBase(x, y, isCurrent) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(PORT_ICON_SCALE, PORT_ICON_SCALE);
    ctx.fillStyle = isCurrent ? "rgba(255, 212, 120, 0.95)" : "rgba(245, 241, 205, 0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isCurrent ? "#ff9d33" : "#5a3e18";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();
  }

  function drawCityIcon(port, isCurrent) {
    const accent = isCurrent ? "#ff8e3a" : "#16314d";
    const light = isCurrent ? "#fff3dc" : "#dff2ff";
    const warm = isCurrent ? "#ffe0ac" : "#f3dca5";
    const cool = isCurrent ? "#ffd7b4" : "#bde2f6";

    ctx.save();
    ctx.translate(port.x, port.y);
    ctx.scale(PORT_ICON_SCALE, PORT_ICON_SCALE);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;

    switch (port.id) {
      case "shanghai": {
        // 东方明珠轮廓
        ctx.fillStyle = accent;
        ctx.fillRect(-0.9, -4.4, 1.8, 8.6);
        ctx.beginPath();
        ctx.arc(0, -2.0, 1.35, 0, Math.PI * 2);
        ctx.fillStyle = light;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 1.5, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = warm;
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "guangzhou": {
        // 广州塔轮廓
        ctx.beginPath();
        ctx.moveTo(0, -4.8);
        ctx.lineTo(-1.8, -1.8);
        ctx.lineTo(-0.7, 4.8);
        ctx.lineTo(0.7, 4.8);
        ctx.lineTo(1.8, -1.8);
        ctx.closePath();
        ctx.fillStyle = cool;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -5.5);
        ctx.lineTo(0, 5.2);
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      case "hongkong": {
        // 维港天际线
        ctx.fillStyle = accent;
        ctx.fillRect(-3.8, 0.7, 1.5, 2.6);
        ctx.fillRect(-1.8, -1.0, 1.4, 4.3);
        ctx.fillRect(0.1, -0.2, 1.5, 3.5);
        ctx.fillRect(2.1, 0.6, 1.2, 2.7);
        ctx.strokeStyle = light;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-3.6, -1.3);
        ctx.lineTo(-2.4, -2.2);
        ctx.lineTo(-1.1, -1.3);
        ctx.stroke();
        break;
      }
      case "kaohsiung": {
        // 港口吊机
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-3.8, 3.2);
        ctx.lineTo(3.6, 3.2);
        ctx.moveTo(-2.2, 3.2);
        ctx.lineTo(-2.2, -2.6);
        ctx.lineTo(1.2, -2.6);
        ctx.lineTo(3.0, -4.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(2.6, -0.8, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = warm;
        ctx.fill();
        break;
      }
      case "nagasaki": {
        // 港湾教堂尖顶
        ctx.beginPath();
        ctx.moveTo(0, -4.8);
        ctx.lineTo(3.2, -1.2);
        ctx.lineTo(0.9, -1.2);
        ctx.lineTo(0.9, 3.6);
        ctx.lineTo(-0.9, 3.6);
        ctx.lineTo(-0.9, -1.2);
        ctx.lineTo(-3.2, -1.2);
        ctx.closePath();
        ctx.fillStyle = light;
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "busan": {
        // 山海城市：双峰+海浪
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-4.0, 1.5);
        ctx.lineTo(-1.8, -1.8);
        ctx.lineTo(0.0, 1.5);
        ctx.lineTo(2.0, -0.9);
        ctx.lineTo(3.8, 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3.8, 3.0);
        ctx.quadraticCurveTo(-2.5, 2.0, -1.2, 3.0);
        ctx.quadraticCurveTo(0.1, 4.0, 1.4, 3.0);
        ctx.quadraticCurveTo(2.6, 2.2, 3.8, 3.0);
        ctx.strokeStyle = light;
        ctx.stroke();
        break;
      }
      case "singapore": {
        // 鱼尾狮简化标志
        ctx.beginPath();
        ctx.moveTo(-3.4, 2.6);
        ctx.lineTo(-1.8, -0.8);
        ctx.lineTo(0.2, -2.0);
        ctx.lineTo(2.1, -0.9);
        ctx.lineTo(3.2, 1.9);
        ctx.lineTo(1.2, 2.2);
        ctx.lineTo(0.6, 4.0);
        ctx.lineTo(-0.8, 2.6);
        ctx.closePath();
        ctx.fillStyle = light;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.fillRect(-0.8, -3.3, 1.6, 1.0);
        break;
      }
      case "tokyo": {
        // 鸟居
        ctx.fillStyle = accent;
        ctx.fillRect(-3.9, -4.4, 7.8, 1.2);
        ctx.fillRect(-2.8, -2.7, 5.6, 0.9);
        ctx.fillRect(-2.2, -2.0, 1.1, 5.0);
        ctx.fillRect(1.1, -2.0, 1.1, 5.0);
        break;
      }
      case "bangkok": {
        // 佛塔尖顶
        ctx.beginPath();
        ctx.moveTo(0, -4.9);
        ctx.lineTo(2.0, -2.4);
        ctx.lineTo(1.2, -2.4);
        ctx.lineTo(2.8, 0.6);
        ctx.lineTo(1.6, 0.6);
        ctx.lineTo(1.6, 3.6);
        ctx.lineTo(-1.6, 3.6);
        ctx.lineTo(-1.6, 0.6);
        ctx.lineTo(-2.8, 0.6);
        ctx.lineTo(-1.2, -2.4);
        ctx.lineTo(-2.0, -2.4);
        ctx.closePath();
        ctx.fillStyle = warm;
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "jakarta": {
        // 国家纪念碑 Monas
        ctx.fillStyle = accent;
        ctx.fillRect(-0.9, -4.4, 1.8, 6.8);
        ctx.fillStyle = warm;
        ctx.beginPath();
        ctx.arc(0, -4.9, 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = light;
        ctx.fillRect(-3.4, 2.2, 6.8, 1.4);
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPorts() {
    for (const port of PORTS) {
      const isCurrent = state.currentPortId === port.id;
      drawPortIconBase(port.x, port.y, isCurrent);
      drawCityIcon(port, isCurrent);

      ctx.fillStyle = "#102238";
      ctx.font = "18px 'Press Start 2P', monospace";
      ctx.fillText(port.name, port.x + 13, port.y - 14);
    }
  }

  function drawTargetLine() {
    if (!state.target) return;

    const tx = state.target.x;
    const ty = state.target.y;

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#e6f2ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(state.ship.x, state.ship.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fff7d6";
    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShip() {
    ctx.save();
    ctx.translate(state.ship.x, state.ship.y);
    ctx.rotate(state.ship.heading);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Hull
    ctx.fillStyle = "#9a6238";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(8, -6);
    ctx.lineTo(-11, -7);
    ctx.lineTo(-14, -3);
    ctx.lineTo(-14, 3);
    ctx.lineTo(-11, 7);
    ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5f3920";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Deck
    ctx.fillStyle = "#c08657";
    ctx.fillRect(-8, -2.5, 16, 5);

    // Mast
    ctx.strokeStyle = "#d9d5cc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1, 8);
    ctx.lineTo(-1, -11);
    ctx.stroke();

    // Main sail
    ctx.fillStyle = "#f7f3e7";
    ctx.beginPath();
    ctx.moveTo(-1, -10);
    ctx.lineTo(-1, 1);
    ctx.lineTo(9, -3);
    ctx.closePath();
    ctx.fill();

    // Aft sail
    ctx.fillStyle = "#ece7db";
    ctx.beginPath();
    ctx.moveTo(-1, -8);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-8, -3);
    ctx.closePath();
    ctx.fill();

    // Flag
    ctx.fillStyle = "#f5d07a";
    ctx.beginPath();
    ctx.moveTo(-1, -11);
    ctx.lineTo(4, -9.5);
    ctx.lineTo(-1, -8);
    ctx.closePath();
    ctx.fill();

    // Bow highlight
    ctx.fillStyle = "#f2ead9";
    ctx.beginPath();
    ctx.moveTo(12, -1.7);
    ctx.lineTo(14, 0);
    ctx.lineTo(12, 1.7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawOverlayText() {
    function fitTextWithinWidth(rawText, maxWidth) {
      if (ctx.measureText(rawText).width <= maxWidth) return rawText;
      const suffix = "...";
      let low = 0;
      let high = rawText.length;
      while (low < high) {
        const mid = Math.ceil((low + high) / 2);
        const candidate = `${rawText.slice(0, mid)}${suffix}`;
        if (ctx.measureText(candidate).width <= maxWidth) {
          low = mid;
        } else {
          high = mid - 1;
        }
      }
      return `${rawText.slice(0, low)}${suffix}`;
    }

    const coords = worldToLonLat(state.ship.x, state.ship.y);
    const text = `船只坐标: ${Math.round(state.ship.x)}, ${Math.round(state.ship.y)} | 经纬度: ${coords.lon.toFixed(2)}, ${coords.lat.toFixed(2)}`;
    const boxX = 10;
    const horizontalPad = 8;
    const maxBoxWidth = WORLD.width - boxX * 2;
    let fontSize = 20;
    let textWidth = 0;

    do {
      ctx.font = `${fontSize}px 'VT323', monospace`;
      textWidth = ctx.measureText(text).width;
      if (textWidth + horizontalPad * 2 <= maxBoxWidth || fontSize <= 14) break;
      fontSize -= 1;
    } while (true);

    const contentMaxWidth = maxBoxWidth - horizontalPad * 2;
    const displayText = fitTextWithinWidth(text, contentMaxWidth);
    const displayWidth = Math.min(contentMaxWidth, ctx.measureText(displayText).width);
    const boxWidth = displayWidth + horizontalPad * 2;
    const boxHeight = fontSize >= 19 ? 44 : 40;
    const boxY = WORLD.height - boxHeight - 10;

    ctx.save();
    ctx.fillStyle = "rgba(5, 18, 32, 0.62)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "#d5ecfa";
    ctx.font = `${fontSize}px 'VT323', monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.beginPath();
    ctx.rect(boxX + horizontalPad, boxY, boxWidth - horizontalPad * 2, boxHeight);
    ctx.clip();
    ctx.fillText(displayText, boxX + horizontalPad, boxY + boxHeight / 2 + 1);
    ctx.restore();
  }

  function render() {
    drawOcean(state.worldTime);
    drawTrail();
    drawLand();
    drawTargetLine();
    drawPorts();
    drawShip();
    drawOverlayText();
    updateRescueBanner();
  }

  function updateUI() {
    ui.hull.textContent = Math.round(state.stats.hull).toString();
    ui.supplies.textContent = Math.round(state.stats.supplies).toString();
    ui.gold.textContent = Math.round(state.stats.gold).toString();
    ui.time.textContent = formatDuration(state.survivalMs);
    ui.mode.textContent = modeLabel(state.mode);
    ui.targetLabel.textContent = state.target ? state.target.label : "无";

    const rescueMode = state.mode === "rescue";
    ui.setPortBtn.disabled = rescueMode;
    ui.setCoordBtn.disabled = rescueMode;
    ui.portSelect.disabled = rescueMode;
    ui.targetX.disabled = rescueMode;
    ui.targetY.disabled = rescueMode;
  }

  function update(dt) {
    state.worldTime += dt;
    pruneTrailPoints();
    recoverInvalidModeState("每帧更新");

    if (state.mode === "event") {
      const dtMs = dt * 1000;
      if (state.activeEvent) {
        state.eventDecisionMs = Math.max(0, state.eventDecisionMs - dtMs);
        if (state.eventDecisionMs <= 0) {
          const options = Array.isArray(state.activeEvent.options) ? state.activeEvent.options : [];
          const picked = options.length ? options[Math.floor(Math.random() * options.length)] : null;
          if (picked) {
            resolveEvent(picked, { autoSelected: true });
          } else {
            pushLog("事件没有可用选项，已自动跳过并继续航行。");
            hideEventModal();
            state.mode = "sailing";
            state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
          }
        }
      } else if (state.eventContinueAction && state.eventAutoContinueMs > 0) {
        state.eventAutoContinueMs = Math.max(0, state.eventAutoContinueMs - dtMs);
        if (state.eventAutoContinueMs <= 0) {
          const action = state.eventContinueAction;
          hideEventModal();
          if (action) action();
        }
      }

      state.autoSaveInMs -= dt * 1000;
      if (state.autoSaveInMs <= 0) {
        saveGame("autosave");
        state.autoSaveInMs = CONFIG.autoSaveMs;
      }
      return;
    }

    if (state.mode === "rescue") {
      if (state.rescueEndAt && Date.now() >= state.rescueEndAt) {
        completeRescue();
      }
      state.autoSaveInMs -= dt * 1000;
      if (state.autoSaveInMs <= 0) {
        saveGame("autosave-rescue");
        state.autoSaveInMs = CONFIG.autoSaveMs;
      }
      return;
    }

    state.survivalMs += dt * 1000;

    state.stats.supplies = Math.max(0, state.stats.supplies - CONFIG.supplyDrainPerSecond * dt);
    if (state.stats.supplies <= 0 || state.stats.hull <= 0) {
      triggerRescue("核心资源耗尽");
      return;
    }

    updateShip(dt);
    maybeAutoDepartFromPort(dt);

    state.nextEventInMs -= dt * 1000;
    if (state.nextEventInMs <= 0) {
      state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
      openEvent();
      return;
    }

    state.autoSaveInMs -= dt * 1000;
    if (state.autoSaveInMs <= 0) {
      saveGame("autosave");
      state.autoSaveInMs = CONFIG.autoSaveMs;
    }
  }

  function frame(now) {
    const deltaMs = clamp(now - lastFrameMs, 0, 64);
    const dt = deltaMs / 1000;
    lastFrameMs = now;

    update(dt);
    updateUI();
    render();
    rafId = requestAnimationFrame(frame);
  }

  function serializeState() {
    return {
      version: GAME_VERSION,
      savedAt: Date.now(),
      mode: state.mode,
      ship: state.ship,
      target: state.target,
      currentPortId: state.currentPortId,
      stats: state.stats,
      survivalMs: state.survivalMs,
      nextEventInMs: state.nextEventInMs,
      portIdleMs: state.portIdleMs,
      rescueEndAt: state.rescueEndAt,
      rescuedPortId: state.rescuedPortId,
      logEntries: state.logEntries,
      worldTime: state.worldTime,
    };
  }

  function applyLoadedState(data) {
    state.mode = data.mode || "sailing";
    const loadedShipX = Number.isFinite(data.ship?.x) ? data.ship.x : PORTS.find((p) => p.id === "shanghai").x;
    const loadedShipY = Number.isFinite(data.ship?.y) ? data.ship.y : PORTS.find((p) => p.id === "shanghai").y;
    const shipPos = clampToWorld(loadedShipX, loadedShipY);
    state.ship = {
      x: shipPos.x,
      y: shipPos.y,
      heading: Number.isFinite(data.ship?.heading) ? data.ship.heading : 0,
    };

    state.target = data.target || null;
    if (state.target && Number.isFinite(state.target.x) && Number.isFinite(state.target.y)) {
      const fixed = clampToWorld(state.target.x, state.target.y);
      state.target.x = fixed.x;
      state.target.y = fixed.y;
    }
    state.currentPortId = data.currentPortId || "shanghai";

    state.stats = {
      hull: clamp(Number(data.stats?.hull ?? 100), 0, 100),
      supplies: clamp(Number(data.stats?.supplies ?? 100), 0, 100),
      gold: Math.max(0, Number(data.stats?.gold ?? 0)),
    };

    state.survivalMs = Math.max(0, Number(data.survivalMs ?? 0));
    state.nextEventInMs = clamp(
      Number(data.nextEventInMs ?? randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs)),
      CONFIG.eventMinMs,
      CONFIG.eventMaxMs
    );
    state.portIdleMs = clamp(Number(data.portIdleMs ?? 0), 0, CONFIG.portIdleAutoDepartMs);
    state.rescueEndAt = Number.isFinite(data.rescueEndAt) ? data.rescueEndAt : null;
    state.rescuedPortId = data.rescuedPortId || null;
    state.rescueCheatUpCount = 0;
    state.logEntries = Array.isArray(data.logEntries) ? data.logEntries.slice(0, 9) : [];
    state.worldTime = Number.isFinite(data.worldTime) ? data.worldTime : 0;
    state.autoSaveInMs = CONFIG.autoSaveMs;
    state.eventContinueAction = null;
    state.eventDecisionMs = 0;
    state.eventAutoContinueMs = 0;
    resetNavigationMemory();

    // Event state is not persisted in detail; recover to sailing to avoid save-load soft lock.
    if (state.mode === "event") {
      state.mode = "sailing";
      state.activeEvent = null;
      state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
      pushLog("检测到未完成事件，已自动恢复航行。");
    }

    if (state.mode === "rescue" && state.rescueEndAt && Date.now() >= state.rescueEndAt) {
      state.mode = "sailing";
      state.rescueEndAt = null;
      state.rescuedPortId = null;
      state.rescueCheatUpCount = 0;
      state.stats.hull = 100;
      state.stats.supplies = 100;
      state.survivalMs = 0;
      pushLog("离线期间休整已结束，状态已恢复，存活计时已重置。");
    }

    recoverInvalidModeState("读取存档");
    resetTrail();
    if (state.mode === "sailing" && state.target) {
      planRouteToTarget();
    }
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      if (!data || data.version !== GAME_VERSION) return false;
      applyLoadedState(data);
      pushLog("已读取本地存档。");
      return true;
    } catch (err) {
      console.error("读取存档失败:", err);
      return false;
    }
  }

  function saveGame(reason) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState()));
    } catch (err) {
      console.error("保存存档失败:", err);
      pushLog("存档失败，浏览器存储空间可能不足。");
    }

    if (reason === "dock" || reason === "event-resolve" || reason === "rescue-start") {
      pushLog(`已自动存档（${reason}）。`);
    }
  }

  function seedNewGame() {
    const startPort = PORTS.find((p) => p.id === "shanghai") || PORTS[0];
    state.mode = "sailing";
    state.ship = { x: startPort.x, y: startPort.y, heading: 0 };
    state.target = null;
    state.currentPortId = startPort.id;
    state.stats = { hull: 100, supplies: 100, gold: 0 };
    state.survivalMs = 0;
    state.nextEventInMs = randomRange(CONFIG.eventMinMs, CONFIG.eventMaxMs);
    state.activeEvent = null;
    state.eventContinueAction = null;
    state.eventDecisionMs = 0;
    state.eventAutoContinueMs = 0;
    state.rescueEndAt = null;
    state.rescuedPortId = null;
    state.rescueCheatUpCount = 0;
    state.autoSaveInMs = CONFIG.autoSaveMs;
    state.portIdleMs = 0;
    state.lastDockedAt = Date.now();
    state.logEntries = [];
    state.worldTime = 0;
    resetTrail();

    pushLog("新航程开始：上海港。");
    saveGame("seed");
  }

  function initPortControls() {
    ui.portSelect.innerHTML = "";
    for (const port of PORTS) {
      const option = document.createElement("option");
      option.value = port.id;
      option.textContent = port.name;
      ui.portSelect.appendChild(option);
    }
    ui.portSelect.value = "shanghai";
    ui.targetX.value = "980";
    ui.targetY.value = "500";

    ui.setPortBtn.addEventListener("click", () => {
      setTargetPort(ui.portSelect.value);
    });

    ui.setCoordBtn.addEventListener("click", () => {
      const x = Number(ui.targetX.value);
      const y = Number(ui.targetY.value);
      setTargetCoordinate(x, y);
    });

    ui.targetY.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const x = Number(ui.targetX.value);
        const y = Number(ui.targetY.value);
        setTargetCoordinate(x, y);
      }
    });

  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function syncHudHeightWithMap() {
    if (!ui.mapPanel || !ui.hudPanel) return;
    if (window.innerWidth <= 1200) {
      ui.hudPanel.style.height = "";
      return;
    }
    const mapHeight = Math.round(ui.mapPanel.getBoundingClientRect().height);
    if (mapHeight > 0) {
      ui.hudPanel.style.height = `${mapHeight}px`;
    }
  }

  function installGlobalHooks() {
    window.render_game_to_text = () => {
      const nearestPort = pickNearestPort();
      const payload = {
        coordinateSystem: {
          origin: "top-left",
          x: "increases rightward",
          y: "increases downward",
          wrap: "none, bounded map edges",
          width: WORLD.width,
          height: WORLD.height,
        },
        mode: state.mode,
        ship: {
          x: Number(state.ship.x.toFixed(1)),
          y: Number(state.ship.y.toFixed(1)),
          heading: Number(state.ship.heading.toFixed(3)),
        },
        target: state.target
          ? {
              type: state.target.type,
              x: Number(state.target.x.toFixed(1)),
              y: Number(state.target.y.toFixed(1)),
              label: state.target.label,
            }
          : null,
        nearestPort: nearestPort ? nearestPort.name : null,
        stats: {
          hull: Number(state.stats.hull.toFixed(1)),
          supplies: Number(state.stats.supplies.toFixed(1)),
          gold: Math.round(state.stats.gold),
          survivalSec: Math.floor(state.survivalMs / 1000),
          trailPointCount: state.trailPoints.length,
        },
        timers: {
          nextEventMs: Math.max(0, Math.round(state.nextEventInMs)),
          eventDecisionMs:
            state.mode === "event" && state.activeEvent ? Math.max(0, Math.round(state.eventDecisionMs)) : 0,
          eventAutoContinueMs:
            state.mode === "event" && !state.activeEvent && state.eventContinueAction
              ? Math.max(0, Math.round(state.eventAutoContinueMs))
              : 0,
          rescueRemainingMs:
            state.mode === "rescue" && state.rescueEndAt
              ? Math.max(0, state.rescueEndAt - Date.now())
              : 0,
        },
        activeEvent: state.activeEvent
          ? {
              title: state.activeEvent.title,
              options: state.activeEvent.options.map((o) => o.label),
            }
          : null,
      };
      return JSON.stringify(payload);
    };

    window.advanceTime = (ms) => {
      const stepMs = 1000 / 60;
      const steps = Math.max(1, Math.round(ms / stepMs));
      for (let i = 0; i < steps; i++) {
        update(stepMs / 1000);
      }
      updateUI();
      render();
      return Promise.resolve();
    };

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (state.mode === "rescue") {
        if (key === "arrowup") {
          event.preventDefault();
          state.rescueCheatUpCount += 1;
          if (state.rescueCheatUpCount >= 5) {
            completeRescue();
          }
          return;
        }
        state.rescueCheatUpCount = 0;
      }

      if (key === "f") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      // Lightweight keyboard shortcuts to support deterministic automated testing.
      if (key === "a" && state.mode === "sailing") {
        openEvent();
        return;
      }

      if (key === "b" && state.mode === "sailing") {
        triggerRescue("手动测试触发");
        return;
      }

      if ((key === " " || key === "spacebar") && state.mode === "event") {
        if (state.eventContinueAction) {
          const action = state.eventContinueAction;
          hideEventModal();
          action();
          return;
        }
        if (state.activeEvent) {
          const firstOption = state.activeEvent.options[0];
          if (firstOption) resolveEvent(firstOption);
        }
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        saveGame("tab-hidden");
      }
    });

    window.addEventListener("beforeunload", () => {
      saveGame("unload");
    });
  }

  function boot() {
    initPortControls();
    installGlobalHooks();

    const loaded = loadGame();
    if (!loaded) {
      seedNewGame();
    }

    updateUI();
    render();
    syncHudHeightWithMap();
    window.addEventListener("resize", syncHudHeightWithMap);

    if (rafId) cancelAnimationFrame(rafId);
    lastFrameMs = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  boot();
})();
