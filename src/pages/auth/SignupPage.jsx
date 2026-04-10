import { Link, useNavigate } from "react-router-dom";
import { UserPlus2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../contexts/AuthContext";
import { registerUser } from "../../services/authService";
import { DASHBOARD_REDIRECT } from "../../utils/constants";

function SignupPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      role: "student",
      phone: "",
      guardianName: "",
      guardianPhone: "",
      department: "",
      qualification: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values) => {
    try {
      if (values.role === "admin") {
        toast.error("Public admin signup is disabled. Create admins from Firebase Console.");
        return;
      }

      await registerUser(values);
      const profile = await refreshProfile();
      toast.success("Account created successfully");
      navigate(DASHBOARD_REDIRECT[profile?.role ?? values.role] ?? "/student", { replace: true });
    } catch (error) {
      toast.error(error.message.replace("Firebase:", "").trim());
    }
  };

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher" },
    { value: "admin", label: "Admin (restricted)" },
  ];

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="badge info" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
            Smart School Access
          </p>
          <h1>Create your school account and jump straight into the right dashboard.</h1>
          <p style={{ maxWidth: 580, color: "rgba(255,255,255,0.82)" }}>
            Students and teachers can self-register here. Admin accounts stay restricted and should
            be created from Firebase Console or by an existing admin.
          </p>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="split-header">
            <div>
              <p className="muted-text">Create Account</p>
              <h2>Sign up</h2>
            </div>
            <UserPlus2 color="#2d678e" size={32} />
          </div>

          <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <FormField label="Full Name" name="displayName" register={register} errors={errors} rules={{ required: "Name is required" }} />
              <FormField label="Role" name="role" type="select" register={register} errors={errors} options={roleOptions} rules={{ required: "Role is required" }} />
              <FormField label="Email" name="email" type="email" register={register} errors={errors} rules={{ required: "Email is required" }} />
              <FormField label="Password" name="password" type="password" register={register} errors={errors} rules={{ required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } }} />
              <FormField label="Phone" name="phone" register={register} errors={errors} />
              {selectedRole === "student" ? (
                <>
                  <FormField label="Guardian Name" name="guardianName" register={register} errors={errors} />
                  <FormField label="Guardian Phone" name="guardianPhone" register={register} errors={errors} />
                </>
              ) : null}
              {selectedRole === "teacher" ? (
                <>
                  <FormField label="Department" name="department" register={register} errors={errors} />
                  <FormField label="Qualification" name="qualification" register={register} errors={errors} />
                </>
              ) : null}
            </div>

            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="helper-text">
            Already have an account? <Link to="/login" style={{ color: "#2d678e", fontWeight: 700 }}>Login here</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;
