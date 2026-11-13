import { Link } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  ArrowUpRight,
  Gift,
} from "lucide-react";
import styles from "../modules/SchemeCard.module.css"

const categoryStyles = {
  AGRICULTURE: styles.agriculture,
  EDUCATION: styles.education,
  HEALTH: styles.health,
  HOUSING: styles.housing,
  EMPLOYMENT: styles.employment,
  PENSION: styles.pension,
  WOMEN: styles.women,
  STUDENT: styles.student,
  OTHER: styles.other,
};

const categoryLabels = {
  AGRICULTURE: "Agriculture",
  EDUCATION: "Education",
  HEALTH: "Health",
  HOUSING: "Housing",
  EMPLOYMENT: "Employment",
  PENSION: "Pension",
  WOMEN: "Women",
  STUDENT: "Student",
  OTHER: "Other",
};

function formatDate(date) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function SchemeCard({ scheme }) {
  const {
    id,
    category,
    name,
    description,
    required_documents,
    end_date,
    is_active,
  } = scheme;

  // Support both spellings until the backend field is corrected.
  const benefits = scheme.benefits || scheme.benfits;

  const categoryClass =
    categoryStyles[category] || styles.other;

  const categoryName =
    categoryLabels[category] || "Other";

  const documents = required_documents
    ? required_documents.split("\n").filter(Boolean)
    : [];

  return (
    <article className={styles.card}>

      {/* Card Header */}
      <div className={styles.cardHeader}>

        <span className={`${styles.category} ${categoryClass}`}>
          {categoryName}
        </span>

        <span
          className={`${styles.status} ${
            is_active ? styles.active : styles.inactive
          }`}
        >
          <span className={styles.statusDot}></span>
          {is_active ? "Active" : "Inactive"}
        </span>

      </div>

      {/* Scheme Information */}
      <div className={styles.content}>

        <h3 className={styles.title}>
          {name}
        </h3>

        <p className={styles.description}>
          {description || "No description available."}
        </p>

      </div>

      {/* Benefits */}
      {benefits && (
        <div className={styles.benefits}>

          <div className={styles.benefitIcon}>
            <Gift size={17} />
          </div>

          <div>
            <span className={styles.benefitLabel}>
              KEY BENEFIT
            </span>

            <p className={styles.benefitText}>
              {benefits}
            </p>
          </div>

        </div>
      )}

      {/* Card Footer Information */}
      <div className={styles.meta}>

        {documents.length > 0 && (
          <div className={styles.metaItem}>
            <FileText size={16} />

            <span>
              {documents.length} Required Documents
            </span>
          </div>
        )}

        {end_date && (
          <div className={styles.metaItem}>
            <CalendarDays size={16} />

            <span>
              Last date: {formatDate(end_date)}
            </span>
          </div>
        )}

      </div>

      {/* Action */}
      <div className={styles.cardFooter}>

        <Link
          to={`/schemes/${id}`}
          className={styles.detailsButton}
          aria-label={`View details of ${name}`}
        >
          View Details
          <ArrowUpRight size={17} />
        </Link>

      </div>

    </article>
  );
}

export default SchemeCard;