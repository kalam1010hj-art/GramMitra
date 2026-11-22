import { Link } from "react-router-dom";
import { useRecords } from "../hooks/useRecords";
import { Utilities, Result, serviceLinks } from "./PublicServices";
import styles from "../modules/Home.module.css";
import s from "../modules/Workspace.module.css";

export default function Home() {
  const notices = useRecords("notices/?noticeTricker=true&page=1");
  const schemes = useRecords("schemes/?page=1");
  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>GramMitra</h1>
          <h2>Connecting Villages. Empowering Communities.</h2>
          <p className={styles.heroDescription}>
            Check local service timings, find village officials and follow your
            complaint from submission to resolution.
          </p>
          <div className={styles.heroLinks}>
            <a href="#services">Explore services</a>
            <Link to="/grievances/create">Submit grievance</Link>
          </div>
        </div>
      </section>
      <div className={s.page}>
        <Utilities />
        <section id="services">
          <h2>Quick services</h2>
          <nav className={styles.quickGrid}>
            {serviceLinks.map(([label, to]) => (
              <Link className={styles.quickCard} key={to} to={to}>
                {label}
              </Link>
            ))}
          </nav>
        </section>
        {[
          [notices, "Important announcements", "notices"],
          [schemes, "Recent government schemes", "schemes"],
        ].map(([result, title, path]) => (
          <section key={path}>
            <h2>{title}</h2>
            <Result result={result}>
              {({ results }) => (
                <div className={s.grid}>
                  {results.slice(0, 4).map((row) => (
                    <Link
                      key={row.id}
                      className={s.card}
                      to={"/" + path + "/" + row.id}
                    >
                      {row.title || row.name}
                    </Link>
                  ))}
                  {!results.length && <p>No current listings.</p>}
                </div>
              )}
            </Result>
          </section>
        ))}
        <section>
          <h2>How GramMitra works</h2>
          <p>
            Browse public services directly. Sign in to submit a complaint with
            its location and an optional photo. Open your grievance history to
            see the assigned official, progress updates and resolution.
          </p>
        </section>
      </div>
    </main>
  );
}
