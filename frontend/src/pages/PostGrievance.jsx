import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthProvider";// Adjust path if your context is elsewhere
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Construction,
  Droplets,
  FileImage,
  Lightbulb,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Waves,
  X,
  Zap,
  Ellipsis,
} from "lucide-react";
import styles from "../modules/PostGrievance.module.css";
import { postGrievance, getGrievancePostError } from "../services/grievanceApi";

const CATEGORIES = [
  { value: "WATER", label: "Water Supply", Icon: Droplets },
  { value: "ELECTRICITY", label: "Electricity", Icon: Zap },
  { value: "ROAD", label: "Roads", Icon: Construction },
  { value: "DRAINAGE", label: "Drainage", Icon: Waves },
  { value: "SANITATION", label: "Sanitation", Icon: Trash2 },
  { value: "STREET_LIGHT", label: "Street Lights", Icon: Lightbulb },
  { value: "OTHER", label: "Other", Icon: Ellipsis },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", description: "Minor inconvenience" },
  { value: "MEDIUM", label: "Medium", description: "Needs attention" },
  { value: "HIGH", label: "High", description: "Major disruption" },
  { value: "URGENT", label: "Urgent", description: "Immediate safety concern" },
];

const INITIAL_VALUES = {
  title: "",
  description: "",
  category: "",
  location: "",
  priority: "MEDIUM",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * POST integration lives in grievanceApi.js.
 * The parent only needs to render <PostGrievance />.
 */
export default function PostGrievance({ onBack }) {
  const { user } = useContext(AuthContext);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setSubmitError("");
    setSuccess(null);
  };

  const setChoice = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError("");
    setSuccess(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setImageError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImage(null);
      setImageError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }
    setImage(file);
    setSuccess(null);
  };

  const clearImage = () => {
    setImage(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccess(null);

    if (!values.category) {
      setSubmitError("Please select a grievance category.");
      document.getElementById("grievance-categories")?.focus();
      return;
    }

    if (!values.title.trim() || !values.description.trim()) {
      setSubmitError("Please enter a title and a description of the issue.");
      return;
    }

    if (!user?.id) {
      setSubmitError("Your user information is unavailable. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("user", String(user.id));
    formData.append("title", values.title.trim());
    formData.append("description", values.description.trim());
    formData.append("category", values.category);
    formData.append("location", values.location.trim());
    formData.append("priority", values.priority);
    if (image) formData.append("image", image);

    try {
      setSubmitting(true);
      const responseData = await postGrievance(formData);
      const trackingId = responseData?.tracking_id ||
        (responseData?.id != null
          ? `GM-${String(responseData.id).padStart(6, "0")}`
          : "submitted");
      setSuccess(trackingId);
      setValues({ ...INITIAL_VALUES });
      clearImage();
    } catch (error) {
      setSubmitError(getGrievancePostError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => (typeof onBack === "function" ? onBack() : window.history.back())}
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </button>

        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={15} aria-hidden="true" /> Community support
            </span>
            <h1>Report a village issue</h1>
            <p>
              Help us improve your community. Share the issue with clear details
              so the responsible team can review it.
            </p>
          </div>
          <div className={styles.heroIcon} aria-hidden="true">
            <ClipboardList size={33} strokeWidth={1.7} />
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.formCard} aria-labelledby="form-heading">
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><ClipboardList size={20} /></span>
              <div>
                <h2 id="form-heading">Grievance details</h2>
                <p>Fields marked * are required.</p>
              </div>
            </div>

            {success && (
              <div className={styles.successBanner} role="status">
                <CheckCircle2 size={22} aria-hidden="true" />
                <div>
                  <strong>Grievance submitted successfully!</strong>
                  <p>
                    {success !== "submitted"
                      ? `Tracking ID: ${success}. You can follow its progress from your grievances page.`
                      : "Your report has been received. You can track its progress from your grievances page."}
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={20} aria-hidden="true" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="grievance-title">
                  Grievance title <span>*</span>
                </label>
                <input
                  id="grievance-title"
                  className={styles.input}
                  type="text"
                  name="title"
                  maxLength={200}
                  minLength={5}
                  required
                  placeholder="E.g. No drinking water for the past 3 days"
                  value={values.title}
                  onChange={updateField}
                  disabled={submitting}
                />
                <p className={styles.hint}>Give your grievance a short, clear title.</p>
              </div>

              <fieldset className={styles.categoryFieldset}>
                <legend className={styles.label}>Issue category <span>*</span></legend>
                <div
                  id="grievance-categories"
                  className={styles.categoryGrid}
                  tabIndex={-1}
                >
                  {CATEGORIES.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={values.category === value}
                      className={`${styles.categoryOption} ${values.category === value ? styles.categoryActive : ""}`}
                      onClick={() => setChoice("category", value)}
                      disabled={submitting}
                    >
                      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                      <span>{label}</span>
                      {values.category === value && (
                        <CheckCircle2 className={styles.selectedMark} size={15} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="grievance-description">
                  Describe the problem <span>*</span>
                </label>
                <textarea
                  id="grievance-description"
                  className={styles.textarea}
                  name="description"
                  required
                  minLength={10}
                  rows={6}
                  placeholder="Explain what happened, when it started, and how it affects the community..."
                  value={values.description}
                  onChange={updateField}
                  disabled={submitting}
                />
                <p className={styles.hint}>Include useful details so the issue can be investigated.</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="grievance-location">
                  <MapPin size={16} aria-hidden="true" /> Location <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="grievance-location"
                  className={styles.input}
                  type="text"
                  name="location"
                  maxLength={255}
                  placeholder="E.g. Near Government School, Main Road"
                  value={values.location}
                  onChange={updateField}
                  disabled={submitting}
                />
              </div>

              <fieldset className={styles.priorityFieldset}>
                <legend className={styles.label}>How serious is the issue?</legend>
                <div className={styles.priorityGrid}>
                  {PRIORITIES.map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={`${styles.priorityOption} ${values.priority === value ? styles.priorityActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={value}
                        checked={values.priority === value}
                        onChange={updateField}
                        disabled={submitting}
                      />
                      <span className={styles.priorityName}>{label}</span>
                      <small>{description}</small>
                    </label>
                  ))}
                </div>
                <p className={styles.hint}>The reviewing team may adjust the final priority.</p>
              </fieldset>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="grievance-image">
                  Supporting photo <span className={styles.optional}>(optional)</span>
                </label>
                {previewUrl ? (
                  <div className={styles.previewWrap}>
                    <img src={previewUrl} alt="Selected grievance evidence preview" className={styles.previewImage} />
                    <div className={styles.previewMeta}>
                      <FileImage size={18} aria-hidden="true" />
                      <span title={image?.name}>{image?.name}</span>
                      <button type="button" onClick={clearImage} disabled={submitting} aria-label="Remove selected image">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={styles.uploadZone} htmlFor="grievance-image">
                    <span className={styles.uploadIcon}><FileImage size={25} aria-hidden="true" /></span>
                    <strong>Click to upload a photo</strong>
                    <span>JPG, PNG or WebP · Max 5 MB</span>
                  </label>
                )}
                <input
                  ref={fileInputRef}
                  id="grievance-image"
                  className={styles.visuallyHidden}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting}
                />
                {imageError && <p className={styles.inlineError} role="alert">{imageError}</p>}
              </div>

              <div className={styles.formFooter}>
                <div className={styles.privacyNote}>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>Your report will be reviewed by the responsible team.</span>
                </div>
                <button className={styles.submitButton} type="submit" disabled={submitting}>
                  {submitting ? (
                    <><span className={styles.spinner} aria-hidden="true" /> Submitting...</>
                  ) : (
                    <><Send size={18} aria-hidden="true" /> Submit grievance</>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <span className={styles.infoIcon}><Clock3 size={20} /></span>
                <h2>What happens next?</h2>
              </div>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineNumber}>1</span>
                  <div><strong>Submitted</strong><p>Your grievance is recorded in GramMitra.</p></div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineNumber}>2</span>
                  <div><strong>Under review</strong><p>The responsible team reviews the details.</p></div>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineNumber}>3</span>
                  <div><strong>Updates & resolution</strong><p>Track status changes and the final outcome.</p></div>
                </div>
              </div>
            </div>
            <div className={styles.tipsCard}>
              <div className={styles.tipsHeading}><Lightbulb size={20} /><h2>Tips for a good report</h2></div>
              <ul>
                <li>Describe the exact problem clearly.</li>
                <li>Mention a landmark or nearby location.</li>
                <li>Attach a photo when possible.</li>
                <li>Avoid including sensitive personal information.</li>
              </ul>
            </div>
            <p className={styles.sideNote}>GramMitra · Helping our village stay connected.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
