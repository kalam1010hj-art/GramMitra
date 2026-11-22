import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  Paperclip,
  Megaphone,
  Clock3,
} from "lucide-react";


import styles from "../modules/NoticeDetails.module.css";
import { getNoticeDetails } from "../services/notices";

function NoticeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);


//   This useEffect is used to retrive single Notice details by using getNoticeDetails fuctions and it take 1 argument id.

useEffect(()=>{
getNoticeDetails(id)
.then((response)=>{
    setNotice(response.data)
})
.catch((error)=>{
    if(error.response){
        setError(error.response.data?.detail || "Notice unavailable.")
    }
    else if(error.request){
        setError(error.message)
    }
})
.finally(()=>{
    setLoading(false)
})
},[id])







  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileName = (url) => {
    if (!url) return "Notice Attachment";

    try {
      const fileName = decodeURIComponent(
        new URL(url).pathname.split("/").pop()
      );

      return fileName || "Notice Attachment";
    } catch {
      return "Notice Attachment";
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading notice details...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <AlertCircle size={30} />
        </div>

        <h2>Notice Unavailable</h2>
        <p>{error || "Notice not found."}</p>

        <button
          onClick={() => navigate("/notices")}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          Back to Notices
        </button>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Breadcrumb */}

        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/notices">Notices</Link>
          <span>/</span>
          <span className={styles.current}>Notice Details</span>
        </div>

        {/* Back Navigation */}

        <Link to="/notices" className={styles.backLink}>
          <ArrowLeft size={18} />
          All Notices
        </Link>

        {/* Main Notice Card */}

        <article className={styles.noticeCard}>

          {/* Top Section */}

          <div className={styles.noticeHeader}>

            <div className={styles.labelRow}>
              <span className={styles.noticeLabel}>
                <Megaphone size={15} />
                Official Notice
              </span>

              {notice.is_important && (
                <span className={styles.importantBadge}>
                  <AlertCircle size={14} />
                  Important
                </span>
              )}
            </div>

            <h1 className={styles.title}>
              {notice.title}
            </h1>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <CalendarDays size={17} />
                <span>{formatDate(notice.published_at)}</span>
              </div>

              <div className={styles.metaItem}>
                <Clock3 size={17} />
                <span>{formatTime(notice.published_at)}</span>
              </div>
            </div>

          </div>

          {/* Notice Content */}

          <div className={styles.noticeBody}>

            <div className={styles.sectionHeading}>
              <FileText size={19} />
              <h2>Notice Information</h2>
            </div>

            <div className={styles.description}>
              {notice.description || "No description available."}
            </div>

          </div>

          {/* Attachment */}

          {notice.attachment && (
            <div className={styles.attachmentSection}>

              <div className={styles.sectionHeading}>
                <Paperclip size={19} />
                <h2>Attached Document</h2>
              </div>

              <p className={styles.attachmentHelp}>
                This notice includes an attachment. You can view
                or download the document below.
              </p>

              <div className={styles.attachmentCard}>

                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>
                    <FileText size={25} />
                  </div>

                  <div className={styles.fileDetails}>
                    <h3>{getFileName(notice.attachment)}</h3>
                    <p>Notice attachment</p>
                  </div>
                </div>

                <div className={styles.fileActions}>

                  <a
                    href={notice.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewButton}
                  >
                    <ExternalLink size={16} />
                    View
                  </a>

                  {/* <a
                    href={notice.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadButton}
                    download
                  >
                    <Download size={16} />
                    Download
                  </a> */}

                </div>

              </div>

            </div>
          )}

          {/* Footer */}

          <div className={styles.noticeFooter}>
            <div className={styles.footerIcon}>
              <Megaphone size={19} />
            </div>

            <div>
              <h4>GramMitra Notice Board</h4>
              <p>
                Stay informed about important village announcements
                and updates.
              </p>
            </div>
          </div>

        </article>

        {/* Bottom Navigation */}

        <div className={styles.bottomNavigation}>
          <Link to="/notices">
            <ArrowLeft size={18} />
            Back to All Notices
          </Link>
        </div>

      </div>
    </main>
  );
}

export default NoticeDetails;