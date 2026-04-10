function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p className="muted-text">{label}</p>
      <div className="stat-value">{value}</div>
      {hint ? <p className="helper-text">{hint}</p> : null}
    </article>
  );
}

export default StatCard;
