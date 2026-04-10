function StatusBadge({ status, type = "info" }) {
  return <span className={`badge ${type}`}>{status}</span>;
}

export default StatusBadge;
