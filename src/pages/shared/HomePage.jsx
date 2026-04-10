import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="badge info" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
            Smart School Student Management System
          </p>
          <h1>Dashboards are role-based, not missing.</h1>
          <p style={{ maxWidth: 600, color: "rgba(255,255,255,0.82)" }}>
            Admin, teacher, and student dashboards open after authentication. This public landing
            page gives you entry points instead of dumping you into a blank auth loop.
          </p>
        </div>

        <div className="grid-3">
          <div className="highlight-card" style={{ color: "#fff", background: "rgba(255,255,255,0.12)" }}>
            <strong>Admin Dashboard</strong>
            <p>Students, teachers, classes, subjects, records, attendance, and results.</p>
          </div>
          <div className="highlight-card" style={{ color: "#fff", background: "rgba(255,255,255,0.12)" }}>
            <strong>Teacher Dashboard</strong>
            <p>Assigned classes, attendance marking, and result entry only for permitted subjects.</p>
          </div>
          <div className="highlight-card" style={{ color: "#fff", background: "rgba(255,255,255,0.12)" }}>
            <strong>Student Dashboard</strong>
            <p>Own profile, class, subjects, attendance, and marks only.</p>
          </div>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <h2>Get in</h2>
          <p className="muted-text">
            Choose login if you already have an account, or signup if you want to create a teacher
            or student account.
          </p>
          <div className="button-row" style={{ marginTop: "1rem" }}>
            <Link className="button primary" to="/login">Login</Link>
            <Link className="button secondary" to="/signup">Signup</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
