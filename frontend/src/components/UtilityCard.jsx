import {
  Droplets,
  Zap,
  Trash2,
  Settings2,
  Clock3,
} from "lucide-react";

import styles from "../modules/UtilityCard.module.css";
import UtilitySchedule from "./UtilitySchedule";

const utilityConfig = {
  WATER: {
    icon: Droplets,
    label: "Water Supply",
    scheduleTitle: "Supply Timings",
    theme: "water",
  },

  ELECTRICITY: {
    icon: Zap,
    label: "Electricity",
    scheduleTitle: "Electricity Timings",
    theme: "electricity",
  },

  GARBAGE: {
    icon: Trash2,
    label: "Garbage Collection",
    scheduleTitle: "Collection Timings",
    theme: "garbage",
  },

  OTHER: {
    icon: Settings2,
    label: "Other Services",
    scheduleTitle: "Service Timings",
    theme: "other",
  },
};

function UtilityCard({ utility }) {

  const schedules = utility.schedules ?? [];

  // Select configuration based on utility type
  const config =
    utilityConfig[utility.utility_type] ?? utilityConfig.OTHER;

  const Icon = config.icon;

  return (
    <div
      className={`${styles.container} ${styles[config.theme]}`}
    >

      {/* Utility Header */}
      <div className={styles.header}>

        <div className={styles.utilityInfo}>

          <div className={styles.icon}>
            <Icon size={25} />
          </div>

          <div className={styles.titleSection}>
            <h2>{utility.name}</h2>
            <p>{config.label}</p>
          </div>

        </div>

        <span
          className={
            utility.is_active
              ? styles.activeBadge
              : styles.inactiveBadge
          }
        >
          <span className={styles.statusDot}></span>
          {utility.is_active ? "Enabled" : "Disabled"}
        </span>

      </div>

      {/* Description */}
      {utility.description && (
        <p className={styles.description}>
          {utility.description}
        </p>
      )}

      {/* Schedule Header */}
      <div className={styles.scheduleHeader}>

        <div className={styles.scheduleTitle}>
          <Clock3 size={18} />
          <h3>{config.scheduleTitle}</h3>
        </div>

        <span className={styles.scheduleCount}>
          {schedules.length}{" "}
          {schedules.length === 1
            ? "Schedule"
            : "Schedules"}
        </span>

      </div>

      {/* Schedules */}
      <div className={styles.schedules}>

        {schedules.length > 0 ? (

          schedules.map((schedule) => (
            <UtilitySchedule
              key={schedule.id}
              schedule={schedule}
            />
          ))

        ) : (

          <div className={styles.emptyState}>
            <Clock3 size={30} />
            <p>No schedules available</p>
          </div>

        )}

      </div>

    </div>
  );
}

export default UtilityCard;