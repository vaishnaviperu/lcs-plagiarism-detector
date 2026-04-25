import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Loading, Err, exportCSV, rupee } from "../components/UI.jsx";

const RANKS = ["🥇","🥈","🥉"];
const RANK_CLS = ["gold","silver","bronze"];

export default function AgentPerformance() {
  const { data, loading, error } = useData(api.agentPerformance);

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Agent Performance</h1>
          <p className="page-subtitle">Ranked by bookings handled</p>
        </div>
        <button className="export-btn" onClick={() => exportCSV(data,"agent_performance.csv")}>⬇ CSV</button>
      </div>
      {loading && <Loading />}
      {error   && <Err message={error} />}
      {data && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {data.map((agent, i) => (
            <div className="agent-perf-card" key={agent.agent_id}>
              <div className={`agent-rank ${RANK_CLS[i] || ""}`}>{RANKS[i] || i + 1}</div>
              <div className="agent-info">
                <div className="agent-name-big">{agent.agent_name}</div>
                <div style={{ fontSize:12, color:"var(--text3)" }}>{agent.phone}</div>
                <div className="agent-stats">
                  <span className="agent-stat"><strong>{agent.total_bookings}</strong> bookings</span>
                  <span className="agent-stat"><strong>{rupee(agent.total_amount)}</strong> total</span>
                  <span className="agent-stat"><strong>{agent.commission_rate}%</strong> rate</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Commission</div>
                <div className="agent-commission">{rupee(agent.commission_earned)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}