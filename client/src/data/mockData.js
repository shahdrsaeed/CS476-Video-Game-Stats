/*
export const COACH_DATA = {
  name: "EP KOZZY",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", 
  role: "HEAD COACH"
};

export const TEAMS_LIST = [
  { id: 1, name: "Aspas", level: "LEVEL 542", currentRank: "RADIANT", winRate: "68.5%", points: "1.45" },
  { id: 2, name: "Less", level: "LEVEL 412", currentRank: "IMMORTAL 3", winRate: "62.1%", points: "1.28" },
  { id: 3, name: "Saadhak", level: "LEVEL 389", currentRank: "IMMORTAL 2", winRate: "59.8%", points: "1.15" },
];

export const REGISTRATION_REQUESTS = [
  { id: 1, player: "TenZ", team: "Sentinels", status: "Pending", date: "2024-03-20" },
  { id: 2, player: "Aspas", team: "Leviatán", status: "Approved", date: "2024-03-19" },
];
*/



export const PLAYERS_LIST = [
  {
    id: 1,
    name: "Aspas",
    valorantId: "Aspas#000",
    avatar: "https://i.pravatar.cc/150?u=aspas",
    team: "PHANTOM ESPORTS",
    level: 542,
    currentRank: "RADIANT",
    rankRating: 928,
    peakRank: "RADIANT",
    peakRR: 972,

    // Core stats
    kills: 3615,
    deaths: 2851,
    assists: 788,
    kdRatio: 1.45,
    kadRatio: 1.54,
    killsPerRound: 0.9,
    acs: 270.6,
    kast: "73.5%",
    ddDeltaPerRound: 32,
    damagePerRound: 176.4,
    headshotPercent: "35.4%",
    winRate: "68.5%",
    roundWinRate: "54.7%",
    firstBloods: 672,
    flawlessRounds: 145,
    aces: 8,
    wins: 113,
    losses: 64,
    matches: 178,
    playtime: "96h",

    // Accuracy
    accuracy: {
      head: "34.3%",
      body: "61.4%",
      legs: "4.3%",
    },

    // Top agents
    topAgents: [
      { name: "Neon", role: "Duelist", matches: 49, winRate: "67.3%", kd: 1.34, adr: 190.4, acs: 297.7, hours: 25 },
      { name: "Waylay", role: "Duelist", matches: 35, winRate: "68.6%", kd: 1.19, adr: 168.1, acs: 255.5, hours: 18 },
      { name: "Yoru", role: "Duelist", matches: 22, winRate: "72.7%", kd: 1.26, adr: 170.2, acs: 259.5, hours: 11 },
    ],

    // Roles
    roles: [
      { role: "Duelist", winRate: "64.0%", wins: 87, losses: 48, kda: 1.52 },
      { role: "Sentinel", winRate: "64.7%", wins: 11, losses: 6, kda: 1.48 },
      { role: "Controller", winRate: "56.3%", wins: 9, losses: 7, kda: 1.83 },
      { role: "Initiator", winRate: "66.7%", wins: 6, losses: 3, kda: 1.53 },
    ],

    // Top maps
    topMaps: [
      { map: "Haven", winRate: "85.7%", wins: 18, losses: 3 },
      { map: "Pearl", winRate: "65.7%", wins: 23, losses: 12 },
      { map: "Corrode", winRate: "65.2%", wins: 15, losses: 8 },
      { map: "Breeze", winRate: "60.7%", wins: 17, losses: 11 },
      { map: "Abyss", winRate: "57.7%", wins: 15, losses: 11 },
    ],

    // Top weapons
    topWeapons: [
      { weapon: "Vandal", type: "Assault Rifle", kills: 1582, headshotPct: "52%", bodyPct: "45%", legsPct: "3%" },
      { weapon: "Phantom", type: "Assault Rifle", kills: 414, headshotPct: "49%", bodyPct: "48%", legsPct: "2%" },
      { weapon: "Sheriff", type: "Sidearm", kills: 286, headshotPct: "64%", bodyPct: "35%", legsPct: "1%" },
    ],

    // Recent matches
    recentMatches: [
      { date: "Mar 6", map: "Bind", result: "W", score: "15:13", kd: 1.2, kda: "27/23/7", ddDelta: 31, hs: 27, acs: 299, placement: "MVP", rr: 738 },
      { date: "Mar 5", map: "Pearl", result: "W", score: "13:5", kd: 1.7, kda: "22/13/3", ddDelta: 75, hs: 32, acs: 344, placement: "MVP", rr: 905 },
      { date: "Mar 5", map: "Abyss", result: "W", score: "13:10", kd: 1.1, kda: "18/17/7", ddDelta: 12, hs: 35, acs: 240, placement: "2nd", rr: 581 },
      { date: "Mar 4", map: "Split", result: "W", score: "11:13", kd: 1.6, kda: "27/17/1", ddDelta: 77, hs: 34, acs: 308, placement: "MVP", rr: 837 },
      { date: "Mar 4", map: "Abyss", result: "L", score: "9:13", kd: 0.9, kda: "18/19/8", ddDelta: 3, hs: 48, acs: 228, placement: "4th", rr: 615 },
      { date: "Mar 4", map: "Haven", result: "W", score: "13:0", kd: 3.3, kda: "23/7/5", ddDelta: 208, hs: 42, acs: 494, placement: "MVP", rr: 1000 },
    ],
  },
  {
    id: 2,
    name: "Less",
    valorantId: "Less#BR1",
    avatar: "https://i.pravatar.cc/150?u=less",
    team: "PHANTOM ESPORTS",
    level: 412,
    currentRank: "IMMORTAL 3",
    rankRating: 780,
    peakRank: "RADIANT",
    peakRR: 820,

    kills: 2910,
    deaths: 2720,
    assists: 610,
    kdRatio: 1.28,
    kadRatio: 1.38,
    killsPerRound: 0.82,
    acs: 248.3,
    kast: "71.2%",
    ddDeltaPerRound: 24,
    damagePerRound: 162.1,
    headshotPercent: "31.2%",
    winRate: "62.1%",
    roundWinRate: "52.1%",
    firstBloods: 520,
    flawlessRounds: 112,
    aces: 5,
    wins: 98,
    losses: 60,
    matches: 158,
    playtime: "81h",

    accuracy: { head: "31.2%", body: "63.5%", legs: "5.3%" },

    topAgents: [
      { name: "Jett", role: "Duelist", matches: 44, winRate: "63.6%", kd: 1.28, adr: 175.2, acs: 268.4, hours: 22 },
      { name: "Reyna", role: "Duelist", matches: 30, winRate: "60.0%", kd: 1.21, adr: 158.9, acs: 244.1, hours: 15 },
    ],

    roles: [
      { role: "Duelist", winRate: "62.0%", wins: 74, losses: 45, kda: 1.28 },
      { role: "Initiator", winRate: "58.3%", wins: 14, losses: 10, kda: 1.41 },
    ],

    topMaps: [
      { map: "Pearl", winRate: "71.4%", wins: 20, losses: 8 },
      { map: "Haven", winRate: "68.0%", wins: 17, losses: 8 },
      { map: "Bind", winRate: "60.0%", wins: 15, losses: 10 },
    ],

    topWeapons: [
      { weapon: "Vandal", type: "Assault Rifle", kills: 1320, headshotPct: "48%", bodyPct: "47%", legsPct: "5%" },
      { weapon: "Operator", type: "Sniper", kills: 380, headshotPct: "35%", bodyPct: "60%", legsPct: "5%" },
    ],

    recentMatches: [
      { date: "Mar 6", map: "Haven", result: "W", score: "13:7", kd: 1.5, kda: "22/15/4", ddDelta: 55, hs: 30, acs: 278, placement: "2nd", rr: 720 },
      { date: "Mar 5", map: "Pearl", result: "L", score: "10:13", kd: 0.9, kda: "16/18/5", ddDelta: -12, hs: 28, acs: 210, placement: "3rd", rr: 580 },
      { date: "Mar 4", map: "Bind", result: "W", score: "13:9", kd: 1.4, kda: "20/14/6", ddDelta: 40, hs: 33, acs: 264, placement: "MVP", rr: 810 },
    ],
  },
  {
    id: 3,
    name: "Saadhak",
    valorantId: "Saadhak#LAN",
    avatar: "https://i.pravatar.cc/150?u=saadhak",
    team: "PHANTOM ESPORTS",
    level: 389,
    currentRank: "IMMORTAL 2",
    rankRating: 650,
    peakRank: "IMMORTAL 3",
    peakRR: 720,

    kills: 2540,
    deaths: 2480,
    assists: 920,
    kdRatio: 1.15,
    kadRatio: 1.52,
    killsPerRound: 0.74,
    acs: 224.8,
    kast: "75.4%",
    ddDeltaPerRound: 18,
    damagePerRound: 148.6,
    headshotPercent: "27.8%",
    winRate: "59.8%",
    roundWinRate: "51.2%",
    firstBloods: 310,
    flawlessRounds: 88,
    aces: 3,
    wins: 88,
    losses: 59,
    matches: 147,
    playtime: "74h",

    accuracy: { head: "27.8%", body: "65.1%", legs: "7.1%" },

    topAgents: [
      { name: "Viper", role: "Controller", matches: 52, winRate: "61.5%", kd: 1.15, adr: 148.2, acs: 224.1, hours: 28 },
      { name: "Astra", role: "Controller", matches: 28, winRate: "57.1%", kd: 1.08, adr: 138.4, acs: 208.7, hours: 14 },
    ],

    roles: [
      { role: "Controller", winRate: "60.0%", wins: 66, losses: 44, kda: 1.52 },
      { role: "Sentinel", winRate: "55.6%", wins: 10, losses: 8, kda: 1.38 },
    ],

    topMaps: [
      { map: "Bind", winRate: "66.7%", wins: 18, losses: 9 },
      { map: "Abyss", winRate: "62.5%", wins: 15, losses: 9 },
      { map: "Split", winRate: "58.3%", wins: 14, losses: 10 },
    ],

    topWeapons: [
      { weapon: "Phantom", type: "Assault Rifle", kills: 1180, headshotPct: "44%", bodyPct: "50%", legsPct: "6%" },
      { weapon: "Vandal", type: "Assault Rifle", kills: 620, headshotPct: "41%", bodyPct: "52%", legsPct: "7%" },
    ],

    recentMatches: [
      { date: "Mar 6", map: "Split", result: "W", score: "13:8", kd: 1.2, kda: "18/15/9", ddDelta: 22, hs: 26, acs: 238, placement: "3rd", rr: 690 },
      { date: "Mar 5", map: "Bind", result: "W", score: "13:11", kd: 1.1, kda: "17/16/8", ddDelta: 14, hs: 29, acs: 219, placement: "2nd", rr: 645 },
      { date: "Mar 4", map: "Haven", result: "L", score: "8:13", kd: 0.8, kda: "14/18/6", ddDelta: -28, hs: 24, acs: 188, placement: "4th", rr: 580 },
    ],
  },
];

export const COACH_DATA = {
  id: "coach_1",
  name: "EP KOZZY",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  role: "HEAD COACH",
  team: "PHANTOM ESPORTS",
  email: "kozzy@phantomesports.com",
};

export const REGISTRATION_REQUESTS = [
  { id: 1, player: "TenZ", team: "Sentinels", status: "Pending", date: "2024-03-20" },
  { id: 2, player: "Aspas", team: "Leviatán", status: "Approved", date: "2024-03-19" },
];