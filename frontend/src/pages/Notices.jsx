import { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Search,
  CalendarDays,
  ExternalLink,
  ArrowUpRight,
  FileText,
  Download,
  Bell,
  AlertCircle,
  Droplets,
  Zap,
  Calendar,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";
import styles from "../modules/Notices.module.css";
import { getNotices } from "../services/notices";
// Sample data - replace with Django API data later



const categoryConfig = {
  GENERAL: {
    label: "General",
    icon: Bell,
    color: "green",
  },
  EVENT: {
    label: "Event",
    icon: Calendar,
    color: "purple",
  },
  WATER: {
    label: "Water Supply",
    icon: Droplets,
    color: "blue",
  },
  ELECTRICITY: {
    label: "Electricity",
    icon: Zap,
    color: "orange",
  },
  IMPORTANT: {
    label: "Important",
    icon: AlertCircle,
    color: "red",
  },
};

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ==============================
// NOTICE CARD COMPONENT
// ==============================

function NoticeCard({ notice }) {
  const config =
    categoryConfig[notice.category] || categoryConfig.GENERAL;

  const Icon = config.icon;

  return (
    <article
      className={`${styles.noticeCard} ${
        notice.is_important ? styles.importantCard : ""
      }`}
    >
      {notice.is_important && (
        <div className={styles.importantRibbon}>
          <Sparkles size={13} />
          Important Update
        </div>
      )}

      <div className={styles.cardTop}>
        <span
          className={`${styles.categoryBadge} ${
            styles[config.color]
          }`}
        >
          <Icon size={14} />
          {notice.category?.replaceAll("_"," ") || config.label}
        </span>

        <span className={styles.cardDate}>
          <CalendarDays size={14} />
          {formatDate(notice.published_at)}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3>{notice.title}</h3>

        <p>{notice.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <Link
          to={`/notices/${notice.id}`}
          className={styles.readMore}
        >
          Read Full Notice
          <ArrowUpRight size={17} />
        </Link>

        {notice.attachment && (
          <a
            href={notice.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attachmentButton}
            title="View Attachment"
            aria-label={`View attachment for ${notice.title}`}
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

// ==============================
// MAIN NOTICES PAGE
// ==============================

function Notices() {
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [category,setCategory]=useState("");
  const [search, setSearch] = useState("");

  const [notices,setNotices] = useState([])

  // Search by title and description

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notices
      .filter(notice=>!category || notice.category===category)
      .filter((notice) => {
        return (
          notice.title.toLowerCase().includes(query) ||
          notice.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Important notices first

        if (a.is_important !== b.is_important) {
          return (
            Number(b.is_important) -
            Number(a.is_important)
          );
        }

        // Latest notices first

        return (
          new Date(b.published_at) -
          new Date(a.published_at)
        );
      });
  }, [notices, search, category]);

  const importantCount = notices.filter(
    (notice) => notice.is_important
  ).length;

  const clearSearch = () => {
    setSearch("");
  };


  // This useEffect is used to retrive data from the server.

  useEffect(()=>{
    getNotices()
    .then((response)=>{
     setNotices(response.data)
    })
    .catch((error)=>{
      setError("Could not load notices. Please refresh to retry.")
    })
    .finally(()=>setLoading(false))
  },[])

  if (error) return <p role="alert">{error}</p>;
  if (loading) return <p role="status">Loading notices…</p>;
  return (
    <div className={styles.page}>

      {/* ==========================
          HERO SECTION
      ========================== */}

      <section className={styles.hero}>
        <div className={styles.heroDecorationOne}></div>
        <div className={styles.heroDecorationTwo}></div>

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>

            <div className={styles.heroBadge}>
              <span className={styles.liveDot}></span>
              Official Village Updates
            </div>

            <h1>
              Village <span>Notice Board</span>
            </h1>

            <p>
              Stay connected with your village. Get the latest
              announcements, important updates, public notices
              and community information — all in one place.
            </p>

            <div className={styles.heroStats}>

              <div className={styles.stat}>
                <div className={styles.statIcon}>
                  <FileText size={20} />
                </div>

                <div>
                  <strong>{notices.length}</strong>
                  <span>Total Notices</span>
                </div>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.stat}>
                <div className={styles.statIcon}>
                  <Megaphone size={20} />
                </div>

                <div>
                  <strong>{importantCount}</strong>
                  <span>Important Updates</span>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.heroVisual}>

            <div className={styles.heroIcon}>
              <Megaphone
                size={70}
                strokeWidth={1.3}
              />
            </div>

            <div className={styles.floatingBadge}>
              <Bell size={16} />
              Stay Informed
            </div>

          </div>
        </div>
      </section>

      {/* ==========================
          MAIN CONTENT
      ========================== */}

      <main className={styles.main}>

        <div className={styles.contentHeader}>

          <div className={styles.sectionTitle}>

            <span className={styles.eyebrow}>
              COMMUNITY ANNOUNCEMENTS
            </span>

            <h2>Latest Notices</h2>

            <p>
              Browse important information and announcements
              from your Gram Panchayat.
            </p>

          </div>

          <div className={styles.noticeCount}>
            <FileText size={17} />
            {filteredNotices.length} Notices
          </div>

        </div>

        {/* ==========================
            SEARCH SECTION
        ========================== */}

        <label>Category <select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(notices.map(n=>n.category))].map(c=><option key={c}>{c}</option>)}</select></label><div className={styles.searchSection}>

          <div className={styles.searchWrapper}>

            <Search size={20} />

            <input
              type="search"
              placeholder="Search notices, announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search notices"
            />

            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

          </div>

        </div>

        {/* ==========================
            NOTICE CARDS
        ========================== */}

        {filteredNotices.length > 0 ? (

          <div className={styles.noticeGrid}>

            {filteredNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
              />
            ))}

          </div>

        ) : (

          <div className={styles.emptyState}>

            <div className={styles.emptyIcon}>
              <Search size={32} />
            </div>

            <h3>No Notices Found</h3>

            <p>
              {search
                ? "No notices match your search. Try a different keyword."
                : "There are no notices available at the moment."}
            </p>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className={styles.resetButton}
              >
                Clear Search
                <ChevronRight size={17} />
              </button>
            )}

          </div>

        )}

        {/* ==========================
            BOTTOM INFO
        ========================== */}

        <div className={styles.infoBanner}>

          <div className={styles.infoIcon}>
            <Bell size={24} />
          </div>

          <div className={styles.infoText}>
            <h3>Never miss an important update</h3>

            <p>
              Visit the notice board regularly for the latest
              announcements from your village administration.
            </p>
          </div>

          <Link to="/" className={styles.homeLink}>
            Back to Home
            <ArrowUpRight size={17} />
          </Link>

        </div>

      </main>
    </div>
  );
}

export default Notices;