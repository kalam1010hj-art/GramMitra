import { ArrowRight } from "lucide-react";

import styles from "../modules/UtilitySchedule.module.css";

function formatTime(time) {
  if (!time) return "--";

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function UtilitySchedule({ schedule, nowMinutes }) {

  const [startHours, startMinutes] = schedule.start_time
    .split(":")
    .map(Number);

  const [endHours, endMinutes] = schedule.end_time
    .split(":")
    .map(Number);

  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;

  const isCurrent =
    nowMinutes >= start && nowMinutes < end;

  const isUpcoming = nowMinutes < start;

  const status = isCurrent
    ? "Now"
    : isUpcoming
    ? "Upcoming"
    : "Finished";

  return (

    <div
      className={`${styles.schedule} ${
        isCurrent ? styles.currentSchedule : ""
      }`}
    >

      <div className={styles.scheduleMain}>

        <div className={styles.timeRange}>

          <span className={styles.time}>
            {formatTime(schedule.start_time)}
          </span>

          <ArrowRight
            size={17}
            className={styles.arrow}
          />

          <span className={styles.time}>
            {formatTime(schedule.end_time)}
          </span>

        </div>

        {/* <span
          className={`${styles.scheduleStatus} ${
            isCurrent
              ? styles.current
              : isUpcoming
              ? styles.upcoming
              : styles.finished
          }`}
        >
          {status}
        </span> */}

      </div>

      {schedule.description && (

        <p className={styles.description}>
          {schedule.description}
        </p>

      )}

    </div>
  );
}

export default UtilitySchedule;