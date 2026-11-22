import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import styles from "../modules/Register.module.css";
import { register } from "../services/Authservices";

const initialFormData = {
  username: "",
  full_name: "",
  phone: "",
  email: "",
  password: "",
  confirm_password: "",
};

const fields = [
  "username",
  "full_name",
  "phone",
  "email",
  "password",
  "confirm_password",
];

// Convert Django validation errors into readable messages
function formatMessage(value) {
  if (Array.isArray(value)) {
    return value.map(formatMessage).join(" ");
  }

  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(formatMessage).join(" ");
  }

  return String(value ?? "");
}

// Handle errors returned by Django REST Framework
function parseBackendError(error) {
  const fieldErrors = {};
  let generalError = "";

  // Server did not respond
  if (!error.response) {
    return {
      fieldErrors,
      generalError: error.request
        ? "Unable to connect to the server. Check your internet connection."
        : "Something went wrong. Please try again.",
    };
  }

  const data = error.response.data;

  // Handle string errors
  if (typeof data?.error === "string") {
    return {
      fieldErrors,
      generalError: data.error,
    };
  }

  // Django serializer validation errors
  const errors = data?.error || data;

  if (errors && typeof errors === "object") {
    Object.entries(errors).forEach(([key, value]) => {
      const message = formatMessage(value);

      if (fields.includes(key)) {
        fieldErrors[key] = message;
      } else if (
        key !== "detail" &&
        key !== "error"
      ) {
        generalError += `${message} `;
      }
    });
  }

  if (
    !generalError &&
    Object.keys(fieldErrors).length === 0
  ) {
    generalError =
      typeof data?.detail === "string"
        ? data.detail
        : "Registration failed. Please try again.";
  }

  return {
    fieldErrors,
    generalError: generalError.trim(),
  };
}

function Register() {
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState(initialFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Request states
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    let updatedValue = value;

    // Allow only numbers in phone field
    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Clear error for the edited field
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;

      const updatedErrors = { ...prev };
      delete updatedErrors[name];

      return updatedErrors;
    });

    setError("");
  }

  // Frontend validation
  function validateForm() {
    const errors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }

    if (formData.password.length < 8) {
      errors.password =
        "Password must contain at least 8 characters.";
    }

    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password.";
    } else if (
      formData.password !== formData.confirm_password
    ) {
      errors.confirm_password = "Passwords do not match.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  // Handle registration
  async function handleSubmit(e) {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        username: formData.username.trim() || formData.phone,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
      };

      await register(payload);

      // Registration successful
      navigate("/login", {
        replace: true,
        state: { registrationSuccess: true },
      });

    } catch (err) {
      const { fieldErrors, generalError } =
        parseBackendError(err);

      setFieldErrors(fieldErrors);
      setError(generalError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* LEFT SIDE */}
        <aside className={styles.leftSection}>

          <Link to="/" className={styles.brand}>
            <div className={styles.brandIcon}>
              <Leaf size={24} />
            </div>

            <span>
              Gram<span>Mitra</span>
            </span>
          </Link>

          <div className={styles.leftContent}>

            <div className={styles.welcomeBadge}>
              <span className={styles.badgeDot}></span>
              Your village. Your community.
            </div>

            <h1>
              A stronger village
              <br />
              starts with
              <span> connection.</span>
            </h1>

            <p className={styles.description}>
              Join GramMitra to stay connected with your
              village, discover government schemes, and
              access important community information.
            </p>

            <div className={styles.features}>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <FileText size={20} />
                </div>

                <div>
                  <h3>Village Updates</h3>
                  <p>
                    Stay informed about notices and
                    important announcements.
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Landmark size={20} />
                </div>

                <div>
                  <h3>Government Schemes</h3>
                  <p>
                    Discover schemes and benefits
                    available to your community.
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users size={20} />
                </div>

                <div>
                  <h3>Connected Community</h3>
                  <p>
                    Access village services and
                    community information easily.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.leftFooter}>
            <ShieldCheck size={18} />
            <span>
              Building smarter, connected villages.
            </span>
          </div>

          <div className={styles.decorativeCircleOne}></div>
          <div className={styles.decorativeCircleTwo}></div>

        </aside>

        {/* RIGHT SIDE */}
        <section className={styles.rightSection}>

          {/* Mobile brand */}
          <Link to="/" className={styles.mobileBrand}>
            <div className={styles.mobileBrandIcon}>
              <Leaf size={22} />
            </div>

            <span>GramMitra</span>
          </Link>

          <div className={styles.formContainer}>

            {/* HEADER */}
            <div className={styles.formHeader}>

              <div className={styles.headerIcon}>
                <UserRound size={24} />
              </div>

              <span className={styles.eyebrow}>
                GET STARTED
              </span>

              <h2>Create your account</h2>

              <p>
                Join your village community by creating
                your free GramMitra account.
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className={styles.form}
              noValidate={false}
            >

              {/* General Error */}
              {error && (
                <div
                  className={styles.errorBox}
                  role="alert"
                >
                  <AlertCircle size={19} />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className={styles.formGroup}>

                <label htmlFor="full_name">
                  Full Name <span>*</span>
                </label>

                <div
                  className={`${styles.inputWrapper} ${
                    fieldErrors.full_name ? styles.inputError : ""
                  }`}
                >
                  <UserRound
                    size={19}
                    className={styles.inputIcon}
                  />

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={!!fieldErrors.full_name}
                    aria-describedby={
                      fieldErrors.full_name
                        ? "full_name_error"
                        : undefined
                    }
                    required
                  />
                </div>

                {fieldErrors.full_name && (
                  <p
                    id="full_name_error"
                    className={styles.fieldError}
                  >
                    {fieldErrors.full_name}
                  </p>
                )}

              </div>

              {/* Username */}
              <div className={styles.formGroup}>

                <label htmlFor="username">
                  Username (optional)
                </label>

                <div
                  className={`${styles.inputWrapper} ${
                    fieldErrors.username ? styles.inputError : ""
                  }`}
                >
                  <UserRound
                    size={19}
                    className={styles.inputIcon}
                  />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    aria-invalid={!!fieldErrors.username}
                    aria-describedby={
                      fieldErrors.username
                        ? "username_error"
                        : undefined
                    }

                  />
                </div>

                {fieldErrors.username ? (
                  <p
                    id="username_error"
                    className={styles.fieldError}
                  >
                    {fieldErrors.username}
                  </p>
                ) : (
                  <p className={styles.inputHint}>
                    Optional. You can sign in with your phone number.
                  </p>
                )}

              </div>

              {/* Phone and Email */}
              <div className={styles.formRow}>

                {/* Phone */}
                <div className={styles.formGroup}>

                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <div
                    className={`${styles.inputWrapper} ${
                      fieldErrors.phone ? styles.inputError : ""
                    }`}
                  >
                    <Phone
                      size={19}
                      className={styles.inputIcon}
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel-national"
                      maxLength={10}
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={
                        fieldErrors.phone
                          ? "phone_error"
                          : undefined
                      }
                      required
                    />
                  </div>

                  {fieldErrors.phone && (
                    <p
                      id="phone_error"
                      className={styles.fieldError}
                    >
                      {fieldErrors.phone}
                    </p>
                  )}

                </div>

                {/* Email */}
                <div className={styles.formGroup}>

                  <label htmlFor="email">
                    Email Address
                    <span className={styles.optional}>
                      Optional
                    </span>
                  </label>

                  <div
                    className={`${styles.inputWrapper} ${
                      fieldErrors.email ? styles.inputError : ""
                    }`}
                  >
                    <Mail
                      size={19}
                      className={styles.inputIcon}
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={
                        fieldErrors.email
                          ? "email_error"
                          : undefined
                      }
                    />
                  </div>

                  {fieldErrors.email && (
                    <p
                      id="email_error"
                      className={styles.fieldError}
                    >
                      {fieldErrors.email}
                    </p>
                  )}

                </div>
              </div>

              {/* Password */}
              <div className={styles.formGroup}>

                <label htmlFor="password">
                  Password <span>*</span>
                </label>

                <div
                  className={`${styles.inputWrapper} ${
                    fieldErrors.password ? styles.inputError : ""
                  }`}
                >
                  <LockKeyhole
                    size={19}
                    className={styles.inputIcon}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password
                        ? "password_error"
                        : "password_hint"
                    }
                    required
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {fieldErrors.password ? (
                  <p
                    id="password_error"
                    className={styles.fieldError}
                  >
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p
                    id="password_hint"
                    className={styles.inputHint}
                  >
                    Use at least 8 characters.
                  </p>
                )}

              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>

                <label htmlFor="confirm_password">
                  Confirm Password <span>*</span>
                </label>

                <div
                  className={`${styles.inputWrapper} ${
                    fieldErrors.confirm_password
                      ? styles.inputError
                      : ""
                  }`}
                >
                  <LockKeyhole
                    size={19}
                    className={styles.inputIcon}
                  />

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={
                      !!fieldErrors.confirm_password
                    }
                    aria-describedby={
                      fieldErrors.confirm_password
                        ? "confirm_password_error"
                        : undefined
                    }
                    required
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {fieldErrors.confirm_password && (
                  <p
                    id="confirm_password_error"
                    className={styles.fieldError}
                  >
                    {fieldErrors.confirm_password}
                  </p>
                )}

              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
                aria-busy={isLoading}
              >

                {isLoading ? (
                  <>
                    <LoaderCircle
                      size={20}
                      className={styles.spinner}
                    />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={20} />
                  </>
                )}

              </button>

            </form>

            {/* LOGIN LINK */}
            <div className={styles.loginSection}>
              <p>
                Already have an account?{" "}
                <Link to="/login">
                  Sign In
                  <ArrowRight size={15} />
                </Link>
              </p>
            </div>

            {/* SECURITY NOTE */}
            <div className={styles.securityNote}>
              <CheckCircle2 size={17} />

              <span>
                Your account helps you securely access
                GramMitra village services.
              </span>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

export default Register;