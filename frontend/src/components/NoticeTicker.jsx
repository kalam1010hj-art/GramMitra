import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import styles from "../modules/NoticeTicker.module.css";

function NoticeTicker({ notices = [] }) {

  if (notices.length === 0) return null;

  return (
    <div className={styles.ticker}>

      <div className={styles.label}>
        <Megaphone size={18} />
        <span>Latest Notices</span>
      </div>

      <div className={styles.tickerWrapper}>

        <div className={styles.tickerContent}>

          {[...notices, ...notices].map((notice, index) => (

            <Link
              key={`${notice.id}-${index}`}
              to={`/notices/${notice.id}`}
              className={styles.notice}
            >
              <span className={styles.dot}>●</span>
              {notice.title}
            </Link>

          ))}

        </div>

      </div>

    </div>
  );
}

export default NoticeTicker;