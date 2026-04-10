import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="spinner-shell">
      <div className="panel" style={{ maxWidth: 520 }}>
        <h2>Page not found</h2>
        <p className="muted-text">The route you requested does not exist in Smart School.</p>
        <Link className="button primary" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
