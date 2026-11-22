import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Copy,
  Droplets,
  FileImage,
  Flag,
  MapPin,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import styles from "../modules/GrievanceDetails.module.css";
import { getGrievanceDetails } from "../services/grievanceServices";
const STEPS = [
  { label: "Submitted", detail: "Complaint received" },
  { label: "Assigned", detail: "Official appointed" },
  { label: "In progress", detail: "Work underway" },
  { label: "Resolved", detail: "Issue addressed" },
];

const STATUS = {
  PENDING: { label: "Pending", index: 0, css: "pending" },
  ASSIGNED: { label: "Assigned", index: 1, css: "assigned" },
  IN_PROGRESS: { label: "In progress", index: 2, css: "inProgress" },
  RESOLVED: { label: "Resolved", index: 3, css: "resolved" },
  REJECTED: { label: "Rejected", index: 0, css: "rejected" },
};

const CATEGORY_LABELS = {
  WATER: "Water supply",
  ELECTRICITY: "Electricity",
  GARBAGE: "Sanitation",
  ROAD: "Road & transport",
  OTHER: "Other",
};

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function initials(fullName = "") {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

// A DRF serializer can return a nested official object or an ID.
// Normalize both formats so the UI never treats an assigned official as missing.
function getAssignedOfficial(value) {
  if (value == null || value === "") return null;

  if (typeof value === "object" && !Array.isArray(value)) {
    const fullName = [value.full_name, value.name, value.username].find(
      (name) => typeof name === "string" && name.trim().length > 0
    );
    return {
      full_name: fullName?.trim() || "Assigned official",
      profile_image: value.profile_image || null,
    };
  }

  if (typeof value === "number" || (typeof value === "string" && value.trim())) {
    return {
      full_name: `Official #${value}`,
      profile_image: null,
    };
  }

  return null;
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoIcon} aria-hidden="true">
        <Icon size={17} />
      </span>
      <div>
        <span className={styles.infoLabel}>{label}</span>
        <div className={styles.infoValue}>{children}</div>
      </div>
    </div>
  );
}

// Convert Axios failures into useful, user-friendly messages.
function getGrievanceError(error) {
  if (error?.message === "INVALID_GRIEVANCE_RESPONSE") {
    return {
      title: "Unable to display grievance",
      message: "The server returned incomplete grievance details. Please try again.",
      kind: "invalid",
    };
  }

  const status = error?.response?.status;

  switch (status) {
    case 400:
      return {
        title: "Invalid grievance request",
        message: "Please check the grievance link and try again.",
        kind: "invalid",
      };
    case 401:
      return {
        title: "Login required",
        message: "Please sign in to view this grievance.",
        kind: "unauthorized",
      };
    case 403:
      return {
        title: "Access denied",
        message: "You do not have permission to view this grievance.",
        kind: "forbidden",
      };
    case 404:
      return {
        title: "Grievance not found",
        message: "This complaint may have been deleted or the link may be incorrect.",
        kind: "not-found",
      };
    case 429:
      return {
        title: "Too many requests",
        message: "Please wait a moment before trying again.",
        kind: "rate-limit",
      };
    default:
      if (status >= 500) {
        return {
          title: "Server unavailable",
          message: "GramMitra is having trouble loading this grievance. Please try again shortly.",
          kind: "server",
        };
      }
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      title: "You're offline",
      message: "Check your internet connection and try again.",
      kind: "network",
    };
  }

  return {
    title: "Could not load grievance",
    message: "Please check your connection and try again.",
    kind: "network",
  };
}

function FeedbackScreen({ loading, error, onBack, onRetry, onLogin }) {
  const showRetry = error && !["not-found", "forbidden", "unauthorized"].includes(error.kind);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backButton} type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Back to grievances
        </button>
        <section
          className={styles.feedbackCard}
          role={loading ? "status" : "alert"}
          aria-busy={loading}
        >
          <span className={`${styles.feedbackIcon} ${loading ? styles.feedbackLoading : styles.feedbackError}`}>
            {loading ? <LoaderCircle size={30} className={styles.spinner} /> : <AlertCircle size={30} />}
          </span>
          <h1>{loading ? "Loading grievance details" : error?.title ?? "Grievance unavailable"}</h1>
          <p>
            {loading
              ? "Fetching complaint information and the latest progress updates…"
              : error?.message ?? "We couldn't find the grievance details."}
          </p>
          {!loading && (
            <div className={styles.feedbackActions}>
              {showRetry && (
                <button className={styles.retryButton} type="button" onClick={onRetry}>
                  <RefreshCw size={17} /> Try again
                </button>
              )}
              {error?.kind === "unauthorized" && (
                <button className={styles.retryButton} type="button" onClick={onLogin}>
                  Sign in
                </button>
              )}
              <button className={styles.secondaryButton} type="button" onClick={onBack}>
                <ArrowLeft size={17} /> Go back
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function GrievanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Ignore late responses after unmount or when the route ID changes.
    let active = true;
    setLoading(true);
    setError(null);
    setGrievance(null);
    setCopied(false);

    getGrievanceDetails(id)
      .then((response) => {
        if (!active) return;

        const data = response?.data;
        if (!data || typeof data !== "object" || Array.isArray(data) || data.id == null) {
          throw new Error("INVALID_GRIEVANCE_RESPONSE");
        }
        setGrievance(data);
      })
      .catch((err) => {
        if (active) setError(getGrievanceError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, retryKey]);

  if (loading || error || !grievance) {
    return (
      <FeedbackScreen
        loading={loading}
        error={error}
        onBack={() => navigate(-1)}
        onRetry={() => setRetryKey((count) => count + 1)}
        onLogin={() => navigate("/login")}
      />
    );
  }

  const assignedTo = getAssignedOfficial(grievance.assigned_to);
  const apiStatus = String(grievance.status ?? "PENDING").trim().toUpperCase();

  // If an official has already been assigned but the API still says PENDING,
  // reflect the assignment in the progress UI. The database isn't modified.
  const currentStatus =
    apiStatus === "PENDING" && assignedTo ? "ASSIGNED" : apiStatus;
  const status = STATUS[currentStatus] ?? STATUS.PENDING;
  const complaintId = `GM-${String(grievance.id).padStart(4, "0")}`;
  const category = CATEGORY_LABELS[grievance.category] ?? grievance.category ?? "Other";


  const activities = [
    {
      id: "created",
      title: "Grievance submitted",
      message: "Your complaint was received by GramMitra.",
      by: grievance.user?.full_name ?? "Resident",
      date: grievance.created_at,
      submitted: true,
    },
    ...(Array.isArray(grievance.updates) ? grievance.updates : []).map((update) => ({
      id: update.id,
      title: update.new_status || "Status updated",
      message: update.message || "The grievance status was updated.",
      by: update.updated_by?.full_name ?? "GramMitra Team",
      date: update.created_at,
      submitted: false,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  async function copyId() {
    try {
      await navigator.clipboard.writeText(complaintId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backButton} type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Back to grievances
        </button>

        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>GRAMMITRA / CITIZEN SERVICES</p>
            <h1>Grievance details</h1>
            <p className={styles.subtitle}>View the complaint and follow every progress update.</p>
          </div>
          <div className={styles.idBox}>
            <span>Complaint reference</span>
            <div className={styles.idValue}>
              <strong>{complaintId}</strong>
              <button
                type="button"
                className={styles.copyButton}
                onClick={copyId}
                aria-label={copied ? "Complaint ID copied" : "Copy complaint ID"}
                title={copied ? "Copied" : "Copy ID"}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <span className={styles.copiedText}>Copied to clipboard</span>}
          </div>
        </div>

        <section className={styles.heroCard} aria-labelledby="grievance-title">
          <div className={styles.heroUpper}>
            <div className={styles.heroBadges}>
              <span className={styles.categoryBadge}>
                {grievance.category === "ELECTRICITY" ? <Zap size={15} /> : <Droplets size={15} />}
                {category}
              </span>
              <span className={`${styles.statusBadge} ${styles[status.css]}`}>
                <span className={styles.statusDot} /> {status.label}
              </span>
            </div>
            <h2 id="grievance-title">{grievance.title}</h2>
            <p className={styles.heroDescription}>{grievance.description}</p>
          </div>
          <div className={styles.heroFooter}>
            <span><MapPin size={16} /> {grievance.location || "Location not provided"}</span>
            <span><CalendarDays size={16} /> Filed {formatDate(grievance.created_at)}</span>
          </div>
        </section>

        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <section className={styles.card} aria-labelledby="progress-title">
              <div className={styles.sectionHead}>
                <div>
                  <h3 id="progress-title">Complaint progress</h3>
                  <p>Where your grievance currently stands</p>
                </div>
                <span className={styles.stepCounter}>Step {status.index + 1} of 4</span>
              </div>
              <ol className={styles.progressSteps}>
                {STEPS.map((step, index) => {
                  const completed = index < status.index;
                  const current = index === status.index;
                  return (
                    <li
                      key={step.label}
                      className={`${styles.progressStep} ${completed ? styles.completed : ""} ${current ? styles.current : ""}`}
                      aria-current={current ? "step" : undefined}
                    >
                      <span className={styles.stepCircle}>
                        {completed ? <Check size={17} /> : index === 3 && current ? <CheckCircle2 size={18} /> : index + 1}
                      </span>
                      <strong>{step.label}</strong>
                      <small>
                        {index === 1 && assignedTo
                          ? `Assigned to ${assignedTo.full_name}`
                          : step.detail}
                      </small>
                    </li>
                  );
                })}
              </ol>
              {assignedTo && (
                <div className={styles.assignmentBanner}>
                  <ShieldCheck size={17} aria-hidden="true" />
                  <span>
                    Assigned official: <strong>{assignedTo.full_name}</strong>
                  </span>
                </div>
              )}
              {apiStatus === "REJECTED" && (
                <p className={styles.rejectedNote}>This grievance has been marked as rejected.</p>
              )}
            </section>

            <section className={styles.card} aria-labelledby="description-title">
              <div className={styles.sectionHead}>
                <div>
                  <h3 id="description-title">Complaint information</h3>
                  <p>Details shared by the resident</p>
                </div>
                <ClipboardList className={styles.headerIcon} size={21} />
              </div>
              <div className={styles.detailBlock}>
                <span className={styles.blockLabel}>Description</span>
                <p>{grievance.description}</p>
              </div>
              <div className={styles.detailBlock}>
                <span className={styles.blockLabel}>Reported location</span>
                <div className={styles.locationLine}><MapPin size={17} /> {grievance.location || "Not specified"}</div>
              </div>
              <div className={styles.detailBlock}>
                <span className={styles.blockLabel}>Supporting photo</span>
                {grievance.image ? (
                  <a href={grievance.image} target="_blank" rel="noreferrer" className={styles.attachmentLink}>
                    <img src={grievance.image} alt="Photo attached to grievance" />
                    <span>View attached image</span>
                  </a>
                ) : (
                  <div className={styles.noPhoto}><FileImage size={20} /> No photo attached to this complaint</div>
                )}
              </div>
            </section>

            <section className={styles.card} aria-labelledby="activity-title">
              <div className={styles.sectionHead}>
                <div>
                  <h3 id="activity-title">Activity timeline</h3>
                  <p>Latest updates from the GramMitra team</p>
                </div>
                <MessageSquareText className={styles.headerIcon} size={21} />
              </div>
              <ol className={styles.timeline}>
                {activities.map((item, index) => (
                  <li className={styles.timelineItem} key={item.id}>
                    <span className={`${styles.timelineIcon} ${index === 0 ? styles.timelineLatest : ""}`}>
                      {item.submitted ? <ClipboardList size={16} /> : <Check size={16} />}
                    </span>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineTop}>
                        <h4>{item.title}</h4>
                        {index === 0 && <span className={styles.latestTag}>Latest</span>}
                      </div>
                      <p>{item.message}</p>
                      <div className={styles.timelineMeta}>
                        <span><UserRound size={13} /> {item.by}</span>
                        <span><Clock3 size={13} /> {formatDate(item.date)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {grievance.status === "RESOLVED" && grievance.resolution_note && (
              <section className={`${styles.card} ${styles.resolutionCard}`}>
                <h3><CheckCircle2 size={20} /> Resolution note</h3>
                <p>{grievance.resolution_note}</p>
                <small>Resolved {formatDate(grievance.resolved_at)}</small>
              </section>
            )}
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.card} aria-labelledby="overview-title">
              <div className={styles.sectionHead}><h3 id="overview-title">At a glance</h3></div>
              <div className={styles.infoList}>
                <InfoRow icon={ClipboardList} label="Category">{category}</InfoRow>
                <InfoRow icon={Flag} label="Priority">
                  <span className={`${styles.priorityBadge} ${styles[`priority${grievance.priority}`] || ""}`}>
                    {grievance.priority || "Not set"}
                  </span>
                </InfoRow>
                <InfoRow icon={CalendarDays} label="Submitted on">{formatDate(grievance.created_at)}</InfoRow>
                <InfoRow icon={Clock3} label="Last updated">{formatDate(grievance.updated_at || grievance.created_at)}</InfoRow>
                <InfoRow icon={UserRound} label="Reported by">{grievance.user?.full_name || "Resident"}</InfoRow>
              </div>
            </section>

            <section className={styles.card} aria-labelledby="official-title">
              <div className={styles.sectionHead}><h3 id="official-title">Assigned official</h3></div>
              {assignedTo ? (
                <div className={styles.official}>
                  {assignedTo.profile_image ? (
                    <img src={assignedTo.profile_image} alt="Assigned official" className={styles.avatar} />
                  ) : (
                    <span className={styles.avatarFallback}>{initials(assignedTo.full_name)}</span>
                  )}
                  <div>
                    <strong>{assignedTo.full_name}</strong>
                    <span>Village official</span>
                  </div>
                </div>
              ) : (
                <p className={styles.unassigned}>An official has not been assigned yet.</p>
              )}
              <div className={styles.officialNote}>
                <ShieldCheck size={17} />
                <span>Updates are shared here as the assigned official works on the issue.</span>
              </div>
            </section>

            <div className={styles.helpCard}>
              <span className={styles.helpIcon}><ShieldCheck size={24} /></span>
              <h3>We're here to help</h3>
              <p>GramMitra helps residents stay informed as local grievances are addressed.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
