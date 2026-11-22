import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Phone, ArrowRight } from "lucide-react";
import styles from "../modules/Login.module.css";
import  login from "../services/Authservices"
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function Login() {
  let {LoginUser} = useContext(AuthContext)
  let navigate =useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };


  function handleSubmit(e){
   e.preventDefault();
    if (!formData.username) {
      setError("Please enter a valid username");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }
    setIsLoading(true);
    setError("");
    login(formData)
    .then((response)=>{
      LoginUser(response.data.token,response.data.user)

      navigate(response.data.user.role === "resident" ? "/profile" : "/dashboard")

    })
    .catch((error)=>{

      setError(error.response?.data?.detail || "Unable to sign in. Please try again.")
    })
    .finally(()=>{
      setIsLoading(false)
    })

  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <div className={styles.brandIcon}>G</div>
          <span>Gram<span className={styles.brandAccent}>Mitra</span></span>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIcon}>
              <LockKeyhole size={25} strokeWidth={1.8} />
            </div>

            <h1>Welcome back</h1>
            <p>
              Sign in to your GramMitra account to access
              your village services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone number or username</label>

              <div className={styles.inputWrapper}>
                <Phone size={19} className={styles.inputIcon} />

                <input
                  id="phone"
                  type="text"
                  name="username"
                  placeholder="Phone number or username"
                  value={formData.username}
                  onChange={handleChange}


                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
              </div>

              <div className={styles.inputWrapper}>
                <LockKeyhole
                  size={19}
                  className={styles.inputIcon}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <div className={styles.registerSection}>
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </div>
        </div>

        <div className={styles.bottomText}>
          <p>Connecting villages. Empowering communities.</p>
        </div>

      </div>
    </main>
  );
}

export default Login;