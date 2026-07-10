import { useEffect, useMemo, useState, type CSSProperties } from "react";

export interface GameLeaderboardProps {
  /** Accent color used for active tabs / nav highlights. */
  accentColor?: string;
  /** Seconds between automatic activity-leaderboard refreshes (10-900). */
  refreshSeconds?: number;
  /** Whether to show the "my rank" pinned row on activity leaderboards. */
  showMyRank?: boolean;
}

type ActMetric = "mult" | "score";
type ActStatus = "coming" | "active" | "ended";

interface ActTabDef {
  name: string;
  badge: string;
  metric: ActMetric;
  status: ActStatus;
}

type RankCols = "winloss" | "hall";

interface RankTabDef {
  name: string;
  kind?: "win" | "loss";
  metric?: ActMetric;
  cols: RankCols;
  label: string;
}

interface ActRow {
  rank: number;
  name: string;
  value: string;
  reward: string;
}

interface HallRow {
  rank: number;
  name: string;
  value: string;
  hall: string;
}

interface WinLossRow {
  rank: number;
  name: string;
  winLoss: string;
  winPos: boolean;
  scoreBet: string;
  rate: string;
}

type RankRow = HallRow | WinLossRow;

const ACT_TABS: ActTabDef[] = [
  { name: "捕魚倍率榜", badge: "COMING SOON", metric: "mult", status: "coming" },
  { name: "奧丁倍率榜", badge: "NEW", metric: "mult", status: "active" },
  { name: "三國得分榜", badge: "NEW", metric: "score", status: "active" },
  { name: "三國倍率榜", badge: "", metric: "mult", status: "active" },
  { name: "三國倍率榜", badge: "ENDED", metric: "mult", status: "ended" },
  { name: "三國倍率榜", badge: "ENDED", metric: "mult", status: "ended" },
  { name: "三國倍率榜", badge: "ENDED", metric: "mult", status: "ended" },
];

const RANK_TABS: RankTabDef[] = [
  { name: "當日勝分榜", kind: "win", cols: "winloss", label: "當日累積勝分" },
  { name: "當日負分榜", kind: "loss", cols: "winloss", label: "當日累積負分" },
  { name: "單局勝分榜", metric: "score", cols: "hall", label: "單局最高勝分" },
  { name: "單局倍率榜", metric: "mult", cols: "hall", label: "單局最高倍率" },
];

const HALLS = [
  "奧丁之怒", "戰神呂布", "飛焰三國", "鬧海哪吒", "血戰傳奇", "天才釣手",
  "火爆猴王", "金猴爺老虎機", "魚機大亨", "發發發", "舞龍舞獅", "雷神之錘",
];

const NICKS = [
  "HC許小輝", "DARxNich", "賭神阿鴛", "you87ha", "errxx", "車尬六叫", "押對就開寶",
  "就是愛找麻煩", "就是要你說猛", "神來一把", "財神駕到", "一把梭哈", "穩穩的賺",
  "夜貓子", "手氣爆棚", "老司機", "幸運女神", "錢途無量", "星幣獵人", "醉臥沙場",
  "龍哥來了", "天選之人", "常勝將軍", "手氣王", "阿福來了", "小資女孩", "打不死的",
  "爆分達人", "沉默是金", "孤注一擲", "逆風翻盤", "見好就收", "風火輪", "金光閃閃",
  "歐皇上身", "非酋翻身", "穩健派", "衝一波", "安啦", "發財金",
];

const MEDAL: Record<number, string> = { 1: "#f4b73f", 2: "#aeb9c9", 3: "#d69256" };

function rewardFor(r: number): number {
  if (r === 1) return 100000;
  if (r === 2) return 50000;
  if (r === 3) return 30000;
  if (r <= 10) return 10000;
  if (r <= 25) return 5000;
  return 2000;
}

function padName(n: number): string {
  return "ttxim" + String(n).padStart(5, "0");
}

function buildAct(i: number): ActRow[] {
  const tab = ACT_TABS[i];
  if (!tab || tab.status === "coming") return [];
  const isScore = tab.metric === "score";
  const rows: ActRow[] = [];
  let val = isScore ? 2400000 + Math.random() * 220000 : 250 + Math.random() * 8;
  for (let r = 1; r <= 50; r++) {
    val -= isScore ? Math.floor(18000 + Math.random() * 46000) : 0.35 + Math.random() * 3.6;
    if (val < 1) val = 1 + Math.random();
    rows.push({
      rank: r,
      name: padName(400 + i * 47 + r + Math.floor(Math.random() * 3)),
      value: isScore ? Math.round(val).toLocaleString("en-US") : val.toFixed(2) + "x",
      reward: rewardFor(r).toLocaleString("en-US"),
    });
  }
  return rows;
}

function buildRank(i: number): HallRow[] {
  const tab = RANK_TABS[i];
  const kind = tab.metric;
  const rows: HallRow[] = [];
  let val = kind === "mult" ? 250 + Math.random() * 8 : 3200000 + Math.random() * 400000;
  for (let r = 1; r <= 50; r++) {
    val -= kind === "mult" ? 0.35 + Math.random() * 3.6 : Math.floor(28000 + Math.random() * 66000);
    if (val < 1) val = 1 + Math.random();
    const value = kind === "mult" ? val.toFixed(2) + "x" : Math.round(val).toLocaleString("en-US");
    rows.push({
      rank: r,
      name: padName(400 + i * 53 + r + Math.floor(Math.random() * 3)),
      value,
      hall: HALLS[(r * 7 + i * 3) % HALLS.length],
    });
  }
  return rows;
}

function buildWinLoss(sign: 1 | -1): WinLossRow[] {
  const rows: { name: string; bet: number; score: number; wl: number; rate: number }[] = [];
  for (let r = 1; r <= 50; r++) {
    const bet = Math.floor(70000000 + Math.random() * 620000000);
    const rate = sign > 0 ? 1.05 + Math.random() * 1.6 : 0.35 + Math.random() * 0.6;
    const score = Math.round(bet * rate);
    rows.push({ name: NICKS[Math.floor(Math.random() * NICKS.length)], bet, score, wl: score - bet, rate });
  }
  rows.sort((a, b) => (sign > 0 ? b.wl - a.wl : a.wl - b.wl));
  return rows.map((x, idx) => ({
    rank: idx + 1,
    name: x.name,
    winLoss: x.wl.toLocaleString("en-US"),
    winPos: x.wl >= 0,
    scoreBet: x.score.toLocaleString("en-US") + "／" + x.bet.toLocaleString("en-US"),
    rate: (x.rate * 100).toFixed(1) + "%",
  }));
}

function buildRankTab(i: number): RankRow[] {
  const t = RANK_TABS[i];
  if (t.cols === "winloss") return buildWinLoss(t.kind === "win" ? 1 : -1);
  return buildRank(i);
}

function avatarStyle(name: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    flex: "none",
    background: `radial-gradient(circle at 32% 28%, hsl(${h} 85% 80%), hsl(${(h + 45) % 360} 68% 56%))`,
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(60,50,120,.18)",
  };
}

function navStyle(on: boolean): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    padding: "14px 8px",
    borderRadius: "16px",
    width: "100%",
    cursor: "pointer",
    color: on ? "#fff" : "#8a8298",
    background: on ? "linear-gradient(180deg,#8168ff,#6b4ff2)" : "transparent",
    boxShadow: on ? "0 10px 20px -8px rgba(107,79,242,.6)" : "none",
  };
}

function iconStyle(on: boolean, color: string): CSSProperties {
  return {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    background: on ? "rgba(255,255,255,.22)" : "#fff",
    border: on ? "none" : "1px solid #e7e2f5",
    color: on ? "#fff" : color,
  };
}

function badgeStyleFor(b: string): CSSProperties {
  const base: CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    borderRadius: "5px",
    padding: "2px 6px",
    letterSpacing: ".03em",
    whiteSpace: "nowrap",
  };
  if (b === "NEW") return { ...base, background: "#ff4d5e", color: "#fff" };
  if (b === "COMING SOON") return { ...base, background: "#eceaf2", color: "#a29fb0" };
  if (b === "ENDED") return { ...base, background: "#e6e8ee", color: "#9aa0ad" };
  return base;
}

function tabButtonStyle(active: boolean, disabled: boolean, ended: boolean, accent: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "7px",
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    fontSize: "14.5px",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: active ? "1px solid transparent" : "1px solid #e7e5ef",
    background: active ? accent : "#fff",
    color: active ? "#fff" : disabled || ended ? "#a6a3b3" : "#4a4763",
    boxShadow: active ? `0 8px 18px -8px ${accent}` : "none",
    opacity: disabled ? 0.8 : 1,
  };
}

interface NavTab {
  key: string;
  name: string;
  badge: string;
  onClick: () => void;
  disabled: boolean;
  style: CSSProperties;
}

interface DisplayRow {
  key: string;
  rankText: string;
  rankStyle: CSSProperties;
  rowStyle: CSSProperties;
  avatarStyle: CSSProperties;
  name: string;
  value?: string;
  reward?: string;
  hall?: string;
  winLoss?: string;
  scoreBet?: string;
  rate?: string;
  winLossStyle?: CSSProperties;
}

interface LBState {
  page: "activity" | "rank";
  actTab: number;
  rankTab: number;
  countdown: number;
  actData: ActRow[][];
  rankData: RankRow[][];
}

function initState(refreshSeconds: number): LBState {
  return {
    page: "activity",
    actTab: 1,
    rankTab: 0,
    countdown: refreshSeconds,
    actData: ACT_TABS.map((_, i) => buildAct(i)),
    rankData: RANK_TABS.map((_, i) => buildRankTab(i)),
  };
}

export default function GameLeaderboard({
  accentColor = "#7c5cff",
  refreshSeconds = 900,
  showMyRank = true,
}: GameLeaderboardProps) {
  const [state, setState] = useState<LBState>(() => initState(refreshSeconds));

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        let countdown = prev.countdown - 1;
        let actData = prev.actData;
        if (countdown <= 0) {
          actData = [...prev.actData];
          actData[prev.actTab] = buildAct(prev.actTab);
          countdown = refreshSeconds;
        }
        return { ...prev, countdown, actData };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshSeconds]);

  const goRank = () => setState((prev) => ({ ...prev, page: "rank" }));
  const goActivity = () => setState((prev) => ({ ...prev, page: "activity" }));
  const selectAct = (idx: number) =>
    setState((prev) => {
      if (ACT_TABS[idx].status === "coming") return prev;
      return { ...prev, actTab: idx, countdown: refreshSeconds };
    });
  const selectRank = (idx: number) => setState((prev) => ({ ...prev, rankTab: idx }));

  const isActivity = state.page === "activity";
  const isRank = state.page === "rank";

  const view = useMemo(() => {
    let tabs: NavTab[];
    let rawRows: RankRow[];
    let metricLabel: string;
    let showReward = false;
    let showHall = false;
    let showWinLoss = false;
    let rankNotes: string[] = [];

    if (isActivity) {
      const curIdx = state.actTab;
      tabs = ACT_TABS.map((t, idx) => {
        const active = idx === curIdx;
        const disabled = t.status === "coming";
        const ended = t.status === "ended";
        return {
          key: `act-${idx}`,
          name: t.name,
          badge: t.badge,
          disabled,
          onClick: () => selectAct(idx),
          style: tabButtonStyle(active, disabled, ended, accentColor),
        };
      });
      rawRows = state.actData[curIdx] ?? [];
      metricLabel = ACT_TABS[curIdx].metric === "score" ? "單局最高得分" : "單局最高倍率";
      showReward = true;
      showHall = false;
    } else {
      const curIdx = state.rankTab;
      tabs = RANK_TABS.map((t, idx) => {
        const active = idx === curIdx;
        return {
          key: `rank-${idx}`,
          name: t.name,
          badge: "",
          disabled: false,
          onClick: () => selectRank(idx),
          style: tabButtonStyle(active, false, false, accentColor),
        };
      });
      const rt = RANK_TABS[curIdx];
      rawRows = state.rankData[curIdx] ?? [];
      metricLabel = rt.label;
      if (rt.cols === "winloss") {
        showWinLoss = true;
        rankNotes = [
          "1. 總得分包含活動與遊戲館（搶莊妞妞、擷蛋除外）得分。",
          "2. 押注與得分皆以星幣為單位，銀幣會自動轉換。",
        ];
      } else {
        showHall = true;
        rankNotes = ["※ 得分包含活動與遊戲館（搶莊妞妞、擷蛋除外）"];
      }
    }

    const showNormalMetric = !showWinLoss;

    const rows: DisplayRow[] = rawRows.map((r, i) => {
      const top = r.rank <= 3;
      let bg: string;
      if (r.rank === 1) bg = "#fff8e8";
      else if (r.rank === 2) bg = "#f2f6fb";
      else if (r.rank === 3) bg = "#fbf1e6";
      else bg = i % 2 === 0 ? "#ffffff" : "#fbfaff";

      const rankStyle: CSSProperties = top
        ? {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: "15px",
            background: MEDAL[r.rank],
            boxShadow: `0 4px 10px -3px ${MEDAL[r.rank]}`,
          }
        : { fontSize: "15px", fontWeight: 600, color: "#9aa1b2" };

      const winLossRow = "winLoss" in r ? r : undefined;
      const hallRow = "hall" in r ? r : undefined;

      return {
        key: `row-${r.rank}-${r.name}`,
        rankText: String(r.rank),
        rankStyle,
        rowStyle: {
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          minHeight: "54px",
          borderBottom: "1px solid #f2f1f7",
          background: bg,
          boxShadow: top ? `inset 3px 0 0 ${MEDAL[r.rank]}` : "none",
        },
        avatarStyle: avatarStyle(r.name),
        name: r.name,
        value: "value" in r ? r.value : undefined,
        reward: "reward" in r ? r.reward : undefined,
        hall: hallRow?.hall,
        winLoss: winLossRow?.winLoss,
        scoreBet: winLossRow?.scoreBet,
        rate: winLossRow?.rate,
        winLossStyle: winLossRow
          ? {
              flex: "0 0 150px",
              textAlign: "right",
              fontSize: "15px",
              fontWeight: 700,
              color: winLossRow.winPos ? "#1b9e6b" : "#e23b52",
            }
          : undefined,
      };
    });

    const myRank = {
      name: "ttxim00495",
      value: ACT_TABS[state.actTab].metric === "score" ? "1,258,900" : "200.99x",
      reward: "未上榜",
    };

    return {
      tabs,
      rows,
      metricLabel,
      showReward,
      showHall,
      showWinLoss,
      showNormalMetric,
      rankNotes,
      myRank,
    };
  }, [isActivity, state.actTab, state.rankTab, state.actData, state.rankData, accentColor]);

  return (
    <div
      style={{
        width: "min(1280px,100%)",
        height: "min(760px,92vh)",
        display: "flex",
        background: "#ffffff",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 30px 80px -24px rgba(60,50,120,.35),0 2px 8px rgba(60,50,120,.08)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          flex: "0 0 128px",
          background: "linear-gradient(180deg,#f5f2ff,#efeafc)",
          borderRight: "1px solid #e9e5f7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "26px 12px",
          gap: "14px",
        }}
      >
        <div onClick={goRank} style={navStyle(isRank)}>
          <div style={iconStyle(isRank, "#f4b73f")}>★</div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>排行榜</span>
        </div>
        <div onClick={goActivity} style={navStyle(isActivity)}>
          <div style={iconStyle(isActivity, "#f4b73f")}>◆</div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>活動榜</span>
        </div>
        <div
          style={{
            marginTop: "auto",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "radial-gradient(circle,#fff 0%,#efeafc 70%)",
            border: "1px solid #e7e2f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#b7add6",
          }}
        >
          ★
        </div>
      </aside>

      {/* Tab menu (vertical) */}
      <nav
        style={{
          flex: "0 0 194px",
          background: "#fbfaff",
          borderRight: "1px solid #eef0f5",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "18px 12px",
          overflowY: "auto",
        }}
      >
        {view.tabs.map((t) => (
          <button key={t.key} onClick={t.onClick} disabled={t.disabled} style={t.style}>
            <span style={{ textAlign: "left" }}>{t.name}</span>
            {t.badge && <span style={badgeStyleFor(t.badge)}>{t.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {isActivity && (
          <header
            style={{
              position: "relative",
              height: "98px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #eef0f5",
              padding: "0 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%,#ffe08a,#f4b73f 60%,#e39a12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  color: "#8a5a00",
                  boxShadow: "0 6px 14px -4px rgba(228,154,18,.6)",
                }}
              >
                ★
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#8a8298", letterSpacing: ".06em" }}>
                  本期總獎勵
                </span>
                <span
                  style={{
                    fontSize: "38px",
                    fontWeight: 900,
                    background: "linear-gradient(180deg,#f6c24b,#e18f12)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  1,000,000
                </span>
              </div>
            </div>
            <button
              aria-label="關閉"
              style={{
                position: "absolute",
                right: "22px",
                top: "22px",
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                border: "1px solid #ececf2",
                background: "#f7f7fb",
                color: "#9a97a8",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </header>
        )}

        {isRank && (
          <header
            style={{
              position: "relative",
              height: "78px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #eef0f5",
              padding: "0 24px",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 900, color: "#3a3560" }}>排行榜</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 16px",
                  borderRadius: "11px",
                  border: "1px solid #e0dcf0",
                  background: "#f7f5ff",
                  color: "#5a49b8",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                2026/03/18<span style={{ fontSize: "11px", color: "#a49fc4" }}>▾</span>
              </button>
              <button
                aria-label="關閉"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  border: "1px solid #ececf2",
                  background: "#f7f7fb",
                  color: "#9a97a8",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          </header>
        )}

        {isActivity && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              padding: "14px 24px",
              background: "#faf9ff",
              borderTop: "1px solid #f0eefa",
              borderBottom: "1px solid #f0eefa",
            }}
          >
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                fontSize: "13.5px",
                color: "#5b5870",
              }}
            >
              <li style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#7c5cff" }}>•</span>於該期參加活動館別押注星幣，依單局最大倍率上榜贏獎
              </li>
              <li style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#7c5cff" }}>•</span>本期活動參加館別：魚機區遊戲盤、天才釣手
              </li>
            </ul>
            <div style={{ flex: "none", fontSize: "13.5px", color: "#5b5870" }}>
              本期活動時間：<span style={{ color: "#1b9e6b", fontWeight: 700 }}>2026/8/9-2026/9/9</span>
            </div>
          </div>
        )}

        {isRank && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "12px 24px",
              background: "#faf9ff",
              borderTop: "1px solid #f0eefa",
              borderBottom: "1px solid #f0eefa",
              fontSize: "13.5px",
              color: "#5b5870",
            }}
          >
            {view.rankNotes.map((n, idx) => (
              <div key={idx}>{n}</div>
            ))}
          </div>
        )}

        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "13px 24px",
            background: "#efeaff",
            color: "#5a49b8",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <div style={{ flex: "0 0 84px", textAlign: "center" }}>名次</div>
          <div style={{ flex: 1, minWidth: 0 }}>玩家暱稱</div>
          {view.showNormalMetric && (
            <div style={{ flex: "0 0 210px", textAlign: "center" }}>{view.metricLabel}</div>
          )}
          {view.showReward && <div style={{ flex: "0 0 190px", textAlign: "right" }}>獎勵</div>}
          {view.showHall && <div style={{ flex: "0 0 190px", textAlign: "center" }}>遊戲館</div>}
          {view.showWinLoss && (
            <>
              <div style={{ flex: "0 0 150px", textAlign: "right" }}>單日勝負</div>
              <div style={{ flex: "0 0 240px", textAlign: "right" }}>得分／押注</div>
              <div style={{ flex: "0 0 110px", textAlign: "right" }}>回報率</div>
            </>
          )}
        </div>

        {/* Table body */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {view.rows.map((r) => (
            <div key={r.key} style={r.rowStyle}>
              <div style={{ flex: "0 0 84px", display: "flex", justifyContent: "center" }}>
                <span style={r.rankStyle}>{r.rankText}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={r.avatarStyle} />
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "#2c3050",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.name}
                </span>
              </div>
              {view.showNormalMetric && (
                <div style={{ flex: "0 0 210px", textAlign: "center", fontSize: "15px", fontWeight: 700, color: "#2c3050" }}>
                  {r.value}
                </div>
              )}
              {view.showReward && (
                <div
                  style={{
                    flex: "0 0 190px",
                    textAlign: "right",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#2c3050",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#f4b73f" }}>★</span>
                  {r.reward}
                </div>
              )}
              {view.showHall && (
                <div style={{ flex: "0 0 190px", textAlign: "center", fontSize: "14.5px", fontWeight: 700, color: "#5a49b8" }}>
                  {r.hall}
                </div>
              )}
              {view.showWinLoss && (
                <>
                  <div style={r.winLossStyle}>{r.winLoss}</div>
                  <div
                    style={{
                      flex: "0 0 240px",
                      textAlign: "right",
                      fontSize: "14.5px",
                      fontWeight: 600,
                      color: "#2c3050",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.scoreBet}
                  </div>
                  <div style={{ flex: "0 0 110px", textAlign: "right", fontSize: "14.5px", fontWeight: 700, color: "#5a49b8" }}>
                    {r.rate}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* My rank (activity only) */}
        {isActivity && showMyRank && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              background: "#f4f1ff",
              borderTop: "1px solid #e7e2f5",
            }}
          >
            <div style={{ flex: "0 0 84px", display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#8a8298" }}>-</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  flex: "none",
                  background: "radial-gradient(circle at 32% 28%,#c9bcff,#7c5cff)",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 6px rgba(60,50,120,.18)",
                }}
              />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#6b4ff2", display: "flex", alignItems: "center", gap: "8px" }}>
                {view.myRank.name}
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8168ff", background: "#e7e1ff", borderRadius: "6px", padding: "2px 7px" }}>
                  我的排名
                </span>
              </span>
            </div>
            <div style={{ flex: "0 0 210px", textAlign: "center", fontSize: "15px", fontWeight: 700, color: "#2c3050" }}>
              {view.myRank.value}
            </div>
            <div style={{ flex: "0 0 190px", textAlign: "right", fontSize: "14px", fontWeight: 500, color: "#9a97a8" }}>
              {view.myRank.reward}
            </div>
          </div>
        )}

        {isActivity && (
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "7px",
              padding: "12px 24px",
              borderTop: "1px solid #eef0f5",
              fontSize: "13.5px",
              color: "#5b5870",
            }}
          >
            榜單刷新倒數{" "}
            <span style={{ color: "#1b9e6b", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{state.countdown}</span>{" "}
            秒 <span style={{ color: "#1b9e6b" }}>◷</span>
          </footer>
        )}

        {isRank && (
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "7px",
              padding: "12px 24px",
              borderTop: "1px solid #eef0f5",
              fontSize: "13.5px",
              color: "#5b5870",
            }}
          >
            查詢時間：<span style={{ color: "#1b9e6b", fontWeight: 700 }}>2026/03/18 14:30</span>
          </footer>
        )}
      </main>
    </div>
  );
}
