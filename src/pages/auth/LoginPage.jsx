import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../contexts/AuthContext";
import { demoCredentials } from "../../data/sampleData";
import { firebaseReady } from "../../firebase/config";
import { loginUser, logoutUser } from "../../services/authService";
import { DASHBOARD_REDIRECT } from "../../utils/constants";

function LoginPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const inferRoleFromEmail = (email) => {
    if (email.includes("teacher")) return "teacher";
    if (email.includes("student")) return "student";
    return "admin";
  };

  const onSubmit = async (values) => {
    try {
      await loginUser(values.email, values.password);
      const profile = await refreshProfile();
      if (!profile) {
        await logoutUser();
        toast.error("This account has no role profile in Firestore yet. Use signup or create the users document.");
        return;
      }
      toast.success("Login successful");
      navigate(DASHBOARD_REDIRECT[profile?.role ?? inferRoleFromEmail(values.email)] ?? "/admin", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.message.replace("Firebase:", "").trim());
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="badge info" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
            Smart School Platform
          </p>
          <h1>Operate admissions, academics, attendance, and results from one secure portal.</h1>
          <p style={{ maxWidth: 580, color: "rgba(255,255,255,0.82)" }}>
            This React and Firebase web app is structured for real CRUD operations today and future
            modules like parent access, fee collection, notifications, and timetable automation.
          </p>
        </div>

        <div className="highlight-card" style={{ color: "#fff", background: "rgba(255,255,255,0.12)" }}>
          <strong>Included roles</strong>
          <p style={{ marginTop: "0.4rem", color: "rgba(255,255,255,0.78)" }}>
            Admin controls records and publishing, teachers manage assigned academics, and
            students securely view only their own information.
          </p>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="split-header">
            <div>
              <p className="muted-text">Secure Sign In</p>
              <h2>Welcome back</h2>
            </div>
            <ShieldCheck color="#2d678e" size={32} />
          </div>

          {!firebaseReady ? (
            <div className="highlight-card">
              <strong>Firebase configuration needed</strong>
              <p className="helper-text">
                Add the values from `.env.example` into a local `.env` file before testing auth and
                Firestore features.
              </p>
            </div>
          ) : null}

          <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              register={register}
              errors={errors}
              rules={{ required: "Email is required" }}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              register={register}
              errors={errors}
              rules={{ required: "Password is required" }}
            />

            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="login-demo">
            <p className="muted-text">Demo sign-in shortcuts</p>
            {demoCredentials.map((demo) => (
              <button
                key={demo.role}
                className="demo-chip"
                type="button"
                onClick={() => {
                  setValue("email", demo.email);
                  setValue("password", demo.password);
                }}
              >
                <strong>{demo.role}</strong>
                <div className="helper-text">{demo.email}</div>
              </button>
            ))}
          </div>

          <p className="helper-text">
            Need an account? <Link to="/signup" style={{ color: "#2d678e", fontWeight: 700 }}>Open signup</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
