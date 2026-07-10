import GameLeaderboard from "./GameLeaderboard";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg,#eef0fb 0%,#f6f3ff 55%,#fdf1f6 100%)",
      }}
    >
      <GameLeaderboard />
    </div>
  );
}
