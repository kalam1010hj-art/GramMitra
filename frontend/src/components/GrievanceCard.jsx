import { Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Droplets,
  Zap,
  Construction,
  AlertCircle,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import styles from "../modules/GrievanceCard.module.css";

const categoryIcons = {
  WATER: Droplets,
  ELECTRICITY: Zap,
  ROAD: Construction,
};

const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

function GrievanceCard({ grievance }) {
  const {
    id,
    title,
    description,
    category,
    location,
    status,
    priority,
    created_at,
  } = grievance;

  const CategoryIcon = categoryIcons[category] || AlertCircle;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const normalizedStatus = status?.toUpperCase() || "PENDING";
  const normalizedPriority = priority?.toUpperCase() || "MEDIUM";

  const isCompleted =
    normalizedStatus === "RESOLVED" ||
    normalizedStatus === "CLOSED";

  return (
    <article className={styles.card}>

      {/* Header */}
      <div className={styles.header}>

        <div className={styles.category}>
          <CategoryIcon size={16} />

          <span>
            {category?.replaceAll("_", " ") || "General"}
          </span>
        </div>

        <span
          className={`${styles.priority} ${
            styles[normalizedPriority] || ""
          }`}
        >
          {normalizedPriority}
        </span>

      </div>

      {/* Main Content */}
      <div className={styles.content}>

        <h3 className={styles.title}>
          {title}
        </h3>

        <p className={styles.description}>
          {description}
        </p>

      </div>

      {/* Metadata */}
      <div className={styles.metadata}>

        <div className={styles.location}>
          <MapPin size={14} />
          <span>{location || "Not specified"}</span>
        </div>

        <div className={styles.date}>
          <CalendarDays size={14} />
          <span>{formattedDate}</span>
        </div>

      </div>

      {/* Footer */}
      <div className={styles.footer}>

        <span
          className={`${styles.status} ${
            styles[normalizedStatus] || ""
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 size={14} />
          ) : (
            <Clock3 size={14} />
          )}

          {statusLabels[normalizedStatus] ||
            normalizedStatus.replaceAll("_", " ")}
        </span>

        <Link
          to={`/grievances/${id}`}
          className={styles.viewButton}
        >
          View Details
          <ArrowUpRight size={16} />
        </Link>

      </div>

    </article>
  );
}

export default GrievanceCard;