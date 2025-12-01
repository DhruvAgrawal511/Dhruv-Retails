import "./SummaryCard.css";

export default function SummaryCard({ title, value, icon }) {
  return (
    <div className="summary-card">
      <div className="card-icon">{icon}</div>
      <h4 className="card-title">{title}</h4>
      <h2 className="card-value">{value}</h2>
    </div>
  );
}

