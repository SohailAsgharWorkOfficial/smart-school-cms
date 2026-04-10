function Spinner({ fullScreen = false, label = "Loading..." }) {
  return (
    <div className={fullScreen ? "spinner-shell" : "empty-state"}>
      <div className="spinner" />
      <p className="muted-text">{label}</p>
    </div>
  );
}

export default Spinner;
