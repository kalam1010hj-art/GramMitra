import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecords } from "../hooks/useRecords";
import s from "../modules/Workspace.module.css";

export const serviceLinks = [
  ["Government schemes", "/schemes"],
  ["Submit a grievance", "/grievances/create"],
  ["Track a grievance", "/grievances"],
  ["Village notices", "/notices"],
  ["Utility schedules", "/services"],
  ["Officials directory", "/officials"],
];

export function Result({ result, children }) {
  if (result.error) return <p role="alert">{result.error}</p>;
  if (!result.data) return <p role="status">Loading…</p>;
  return children(result.data);
}

const days = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function scheduleInfo(rows, date) {
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (name) => local.find((value) => value.type === name).value;
  const today = days.indexOf(part("weekday").toUpperCase());
  const time = Number(part("hour")) * 60 + Number(part("minute"));
  const minutes = (value) =>
    Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const slots = [];
  for (let offset = 0; offset <= 7; offset++) {
    for (const row of rows) {
      if (
        row.is_active &&
        (row.day === "DAILY" || row.day === days[(today + offset) % 7])
      ) {
        slots.push({
          row,
          offset,
          start: offset * 1440 + minutes(row.start_time),
          end: offset * 1440 + minutes(row.end_time),
        });
      }
    }
  }
  slots.sort((a, b) => a.start - b.start);
  const current = slots.find((slot) => slot.start <= time && time < slot.end);
  const next = slots.find((slot) => slot.start > time);
  return {
    today: slots.filter((slot) => slot.offset === 0),
    status: current
      ? "Available now · " + (current.end - time) + " min remaining"
      : next && next.start - time <= 30
        ? "Starting soon"
        : next
          ? "Scheduled later"
          : "Not available",
    next:
      next &&
      days[(today + next.offset) % 7].toLowerCase() +
        " " +
        next.row.start_time.slice(0, 5),
  };
}

export function Utilities() {
  const [tick, setTick] = useState(0);
  const result = useRecords("utility/", tick);
  useEffect(() => {
    const refresh = () => setTick((v) => v + 1);
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return (
    <section>
      <h2>Today’s utilities</h2>
      <p>Village time · Asia/Kolkata</p>
      <Result result={result}>
        {(rows) => (
          <div className={s.grid}>
            {!rows.length && <p>No utility schedules published.</p>}
            {rows.map((item) => {
              const info = scheduleInfo(item.schedules, new Date());
              return (
                <article className={s.card} key={item.id}>
                  <h3>{item.name}</h3>
                  <b>{info.status}</b>
                  <p>
                    {info.today
                      .map(
                        ({ row }) =>
                          row.start_time.slice(0, 5) +
                          "–" +
                          row.end_time.slice(0, 5),
                      )
                      .join(", ") || "No session today"}
                  </p>
                  {info.next && (
                    <small>Next scheduled start · {info.next}</small>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Result>
    </section>
  );
}

export function Services() {
  return (
    <main className={s.page}>
      <h1>Village services</h1>
      <Utilities />
      <nav>
        {serviceLinks.map(([label, to]) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}

export function Directory() {
  const [search, setSearch] = useState("");
  const result = useRecords("officials/?search=" + encodeURIComponent(search));
  return (
    <main className={s.page}>
      <h1>Officials directory</h1>
      <label>
        Find an official
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <Result result={result}>
        {(rows) => (
          <div className={s.grid}>
            {!rows.length && <p>No officials listed.</p>}
            {rows.map((row) => (
              <article className={s.card} key={row.id}>
                {row.profile_image && (
                  <img
                    loading="lazy"
                    src={
                      new URL(
                        row.profile_image,
                        import.meta.env.VITE_API_URL || "http://localhost:8000",
                      ).href
                    }
                    alt=""
                  />
                )}
                <h2>{row.full_name}</h2>
                <b>{row.designation}</b>
                <p>{row.department}</p>
                <p>{row.office}</p>
                <p>{row.public_contact}</p>
              </article>
            ))}
          </div>
        )}
      </Result>
    </main>
  );
}
