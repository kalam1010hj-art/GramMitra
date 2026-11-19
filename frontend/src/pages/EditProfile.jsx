import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Camera,
  UserRound,
  Mail,
  Phone,
  AtSign,
  ShieldCheck,
  Save,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LockKeyhole,
} from "lucide-react";

import { AuthContext } from "../context/AuthProvider";
import { updateProfile } from "../services/Authservices";

import styles from "../modules/EditProfile.module.css";

function EditProfile() {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // FORM DATA
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  // PROFILE IMAGE
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState(false);

  // UI STATES
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // LOAD EXISTING USER DATA
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // GENERATE IMAGE PREVIEW
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const objectURL = URL.createObjectURL(image);

    setPreview(objectURL);

    return () => {
      URL.revokeObjectURL(objectURL);
    };
  }, [image]);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: null,
    }));

    setError("");
  };

  // HANDLE PROFILE IMAGE CHANGE
  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setImage(selectedFile);
    setImageError(false);
    setError("");

    e.target.value = "";
  };

  // REMOVE NEWLY SELECTED IMAGE
  const cancelImageChange = () => {
    setImage(null);
    setImageError(false);
  };

  // CHECK WHETHER USER MODIFIED ANYTHING
  const hasChanges =
    formData.full_name !== (user?.full_name || "") ||
    formData.email !== (user?.email || "") ||
    image !== null;

  // SAVE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges || isSaving) return;

    setError("");
    setFieldErrors({});

    if (!formData.full_name.trim()) {
      setFieldErrors({
        full_name: ["Full name is required."],
      });
      return;
    }

    const data = new FormData();

    if (formData.full_name !== (user?.full_name || "")) {
      data.append("full_name", formData.full_name.trim());
    }

    if (formData.email !== (user?.email || "")) {
      data.append("email", formData.email);
    }

    if (image) {
      data.append("profile_image", image);
    }

    try {
      setIsSaving(true);

      const response = await updateProfile(data);

      // Supports either:
      // { full_name, email, ... }
      // or { message, user: { full_name, email, ... } }

      const updatedUser =
        response.data?.user || response.data;

      // UPDATE GLOBAL USER INFORMATION
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));

      // RETURN TO PROFILE PAGE
      navigate("/profile", {
        replace: true,
        state: { profileUpdated: true },
      });

    } catch (err) {
      const serverData = err.response?.data;

      const errors = serverData?.error || serverData || {};

      if (typeof errors === "object" && errors !== null) {
        setFieldErrors(errors);
      }

      const message =
        typeof errors.detail === "string"
          ? errors.detail
          : "Unable to update your profile. Please try again.";

      setError(message);

    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.loadingPage}>
        <LoaderCircle size={30} className={styles.spin} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  const displayImage = preview || user.profile_image;

  const roleName = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Resident";

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* BREADCRUMB */}

        <div className={styles.breadcrumb}>
          <Link to="/profile">
            <ArrowLeft size={17} />
            Back to Profile
          </Link>
        </div>

        {/* PAGE HEADER */}

        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              ACCOUNT SETTINGS
            </span>

            <h1>Edit Profile</h1>

            <p>
              Keep your personal information up to date
              and manage how your profile appears on GramMitra.
            </p>
          </div>

          <div className={styles.headerBadge}>
            <ShieldCheck size={17} />
            Personal Account
          </div>
        </div>

        <div className={styles.layout}>

          {/* LEFT SIDEBAR */}

          <aside className={styles.sidebar}>

            <div className={styles.profileSummary}>

              <div className={styles.summaryCover}></div>

              <div className={styles.summaryBody}>

                <div className={styles.summaryAvatar}>
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                    />
                  ) : (
                    <UserRound size={39} />
                  )}
                </div>

                <h3>{user.full_name || "GramMitra User"}</h3>

                <p>@{user.username || "username"}</p>

                <span className={styles.roleBadge}>
                  <ShieldCheck size={14} />
                  {roleName}
                </span>

                <div className={styles.summaryDivider}></div>

                <div className={styles.summaryInfo}>
                  <CheckCircle2 size={17} />

                  <span>
                    Your account information is managed
                    securely by GramMitra.
                  </span>
                </div>

              </div>
            </div>

            {/* SECURITY NOTE */}

            <div className={styles.securityCard}>
              <div className={styles.securityIcon}>
                <LockKeyhole size={20} />
              </div>

              <h3>Account Security</h3>

              <p>
                Your username, phone number, and account
                role cannot be changed from this page.
              </p>

              <div className={styles.securityFooter}>
                <ShieldCheck size={16} />
                Protected account information
              </div>
            </div>

          </aside>

          {/* EDIT FORM */}

          <section className={styles.formCard}>

            <form onSubmit={handleSubmit}>

              {/* PROFILE PHOTO SECTION */}

              <div className={styles.formSection}>

                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Profile Photo</h2>

                    <p>
                      Upload a photo to personalize your
                      GramMitra account.
                    </p>
                  </div>

                  <div className={styles.sectionIcon}>
                    <ImagePlus size={20} />
                  </div>
                </div>

                <div className={styles.photoSection}>

                  <div className={styles.avatarWrapper}>

                    <div className={styles.avatar}>
                      {displayImage && !imageError ? (
                        <img
                          src={displayImage}
                          alt="Profile preview"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <UserRound size={48} />
                      )}
                    </div>

                    <button
                      type="button"
                      className={styles.cameraButton}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change profile photo"
                    >
                      <Camera size={17} />
                    </button>

                  </div>

                  <div className={styles.photoActions}>

                    <h4>Profile Picture</h4>

                    <p>
                      JPG, PNG or WEBP. Maximum size 5 MB.
                    </p>

                    <div className={styles.photoButtons}>

                      <button
                        type="button"
                        className={styles.uploadButton}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={16} />
                        Change Photo
                      </button>

                      {image && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={cancelImageChange}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      )}

                    </div>

                    {image && (
                      <span className={styles.selectedFile}>
                        <CheckCircle2 size={14} />
                        {image.name}
                      </span>
                    )}

                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className={styles.hiddenInput}
                  />

                </div>

              </div>

              {/* PERSONAL INFORMATION */}

              <div className={styles.formSection}>

                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Personal Information</h2>

                    <p>
                      Update your basic account details.
                    </p>
                  </div>

                  <div className={styles.sectionIcon}>
                    <UserRound size={20} />
                  </div>
                </div>

                <div className={styles.formGrid}>

                  {/* FULL NAME */}

                  <div className={styles.formGroup}>
                    <label htmlFor="full_name">
                      Full Name
                      <span className={styles.required}>*</span>
                    </label>

                    <div className={styles.inputWrapper}>
                      <UserRound size={18} />

                      <input
                        id="full_name"
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        maxLength={150}
                        required
                      />
                    </div>

                    {fieldErrors.full_name && (
                      <span className={styles.fieldError}>
                        {fieldErrors.full_name[0]}
                      </span>
                    )}
                  </div>

                  {/* USERNAME */}

                  <div className={styles.formGroup}>
                    <label htmlFor="username">
                      Username
                    </label>

                    <div className={`${styles.inputWrapper} ${styles.readOnly}`}>
                      <AtSign size={18} />

                      <input
                        id="username"
                        type="text"
                        value={user.username || ""}
                        readOnly
                      />

                      <LockKeyhole size={15} />
                    </div>

                    <span className={styles.fieldHint}>
                      Username cannot be changed.
                    </span>
                  </div>

                  {/* EMAIL */}

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <div className={styles.inputWrapper}>
                      <Mail size={18} />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                      />
                    </div>

                    {fieldErrors.email && (
                      <span className={styles.fieldError}>
                        {fieldErrors.email[0]}
                      </span>
                    )}
                  </div>

                  {/* PHONE */}

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <div className={`${styles.inputWrapper} ${styles.readOnly}`}>
                      <Phone size={18} />

                      <input
                        id="phone"
                        type="text"
                        value={user.phone || ""}
                        readOnly
                      />

                      <LockKeyhole size={15} />
                    </div>

                    <span className={styles.fieldHint}>
                      Contact support to update your number.
                    </span>
                  </div>

                </div>

              </div>

              {/* ACCOUNT INFORMATION */}

              <div className={styles.formSection}>

                <div className={styles.sectionHeading}>
                  <div>
                    <h2>Account Information</h2>

                    <p>
                      Your account role and access permissions.
                    </p>
                  </div>

                  <div className={styles.sectionIcon}>
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className={styles.accountInfo}>

                  <div className={styles.accountItem}>
                    <span>Account Role</span>

                    <strong>{roleName}</strong>
                  </div>

                  <div className={styles.accountItem}>
                    <span>Account Status</span>

                    <span
                      className={
                        user.is_active === false
                          ? styles.inactiveStatus
                          : styles.activeStatus
                      }
                    >
                      <CheckCircle2 size={15} />

                      {user.is_active === false
                        ? "Inactive"
                        : "Active"}
                    </span>
                  </div>

                </div>

              </div>

              {/* ERROR MESSAGE */}

              {error && (
                <div className={styles.errorBox} role="alert">
                  <AlertCircle size={19} />
                  <span>{error}</span>
                </div>
              )}

              {/* ACTION BUTTONS */}

              <div className={styles.formActions}>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => navigate("/profile")}
                  disabled={isSaving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className={styles.spin}
                      />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>
    </main>
  );
}

export default EditProfile;