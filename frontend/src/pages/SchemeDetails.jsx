import {
  ArrowLeft,
  ArrowUpRight,
  Landmark,
  CheckCircle2,
  FileText,
  Users,
  Gift,
  ExternalLink,
  Clock,
  CalendarDays,
  Info,
  AlertCircle,
  WifiOff,
  ShieldAlert,
  SearchX,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import styles from "../modules/SchemeDetails.module.css";
import { getSchemeDetails } from "../services/scheme";
import Loading from "../components/Loading";

function SchemeDetails() {
  const { id } = useParams();

  const [scheme, setScheme] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert comma-separated string into an array
  function splitStringToList(string) {
    return string
      ? string.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
  }

  // Fetch scheme details
  useEffect(() => {
    setLoading(true);
    setError(null);
    setScheme(null);

    getSchemeDetails(id)
      .then((response) => {
        setScheme(response.data);
      })
      .catch((error) => {

        if (error.response) {
          setError(error.response.status);
        } else {
          setError("NETWORK_ERROR");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Loading
  if (isLoading) {
    return <Loading message="Fetching scheme details..." />;
  }

  // Error messages
  const errorMessages = {
    400: {
      icon: AlertCircle,
      title: "Invalid Request",
      message: "The request could not be processed. Please try again.",
    },

    401: {
      icon: ShieldAlert,
      title: "Authentication Required",
      message: "Please log in to access this information.",
    },

    403: {
      icon: ShieldAlert,
      title: "Access Denied",
      message: "You don't have permission to access this information.",
    },

    404: {
      icon: SearchX,
      title: "Scheme Not Found",
      message:
        "The scheme you're looking for doesn't exist or may have been removed.",
    },

    500: {
      icon: AlertCircle,
      title: "Internal Server Error",
      message:
        "Something went wrong on our server. Please try again later.",
    },

    NETWORK_ERROR: {
      icon: WifiOff,
      title: "Connection Failed",
      message:
        "Unable to connect to the server. Check your internet connection and try again.",
    },
  };

  // Error UI
  if (error) {
    const errorContent = errorMessages[error] || {
      icon: AlertCircle,
      title: "Something Went Wrong",
      message:
        "We couldn't load the scheme details. Please try again later.",
    };

    const ErrorIcon = errorContent.icon;

    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <ErrorIcon size={34} />
            </div>

            <span className={styles.errorLabel}>
              ERROR {typeof error === "number" ? error : ""}
            </span>

            <h1>{errorContent.title}</h1>

            <p>{errorContent.message}</p>

            <div className={styles.errorActions}>
              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>

              <Link to="/schemes" className={styles.backButton}>
                <ArrowLeft size={17} />
                Back to Schemes
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!scheme) return null;

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Convert strings into arrays
  const benefits = splitStringToList(scheme.benfits);
  const documents = splitStringToList(scheme.required_documents);
  const eligibility = splitStringToList(scheme.eligibility);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/schemes">Schemes</Link>
          <span>/</span>
          <span>{scheme.name}</span>
        </div>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badges}>
              <span className={styles.category}>
                <Landmark size={14} />
                {scheme.category}
              </span>

              <span className={styles.status}>
                <span></span>
                {scheme.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <h1>{scheme.name}</h1>

            <p>{scheme.description}</p>

            <div className={styles.heroActions}>
              <a
                href={scheme.official_website}
                target="_blank"
                rel="noreferrer"
                className={styles.primaryButton}
              >
                Apply Now
                <ArrowUpRight size={18} />
              </a>

              <Link to="/schemes" className={styles.secondaryButton}>
                <ArrowLeft size={17} />
                All Schemes
              </Link>
            </div>
          </div>

          <div className={styles.heroIcon}>
            <Landmark size={65} strokeWidth={1.2} />
          </div>
        </section>

        {/* Main content */}
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            {/* Overview */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>
                  <Info size={20} />
                </div>

                <div>
                  <h2>About this scheme</h2>
                  <p>Understand what this scheme offers.</p>
                </div>
              </div>

              <p className={styles.bodyText}>{scheme.description}</p>
            </section>

            {/* Benefits */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>
                  <Gift size={20} />
                </div>

                <div>
                  <h2>Benefits</h2>
                  <p>What beneficiaries receive.</p>
                </div>
              </div>

              <div className={styles.rows}>
                {benefits.map((benefit, index) => (
                  <div className={styles.row} key={index}>
                    <CheckCircle2 size={19} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>
                  <Users size={20} />
                </div>

                <div>
                  <h2>Eligibility criteria</h2>
                  <p>Check whether you qualify.</p>
                </div>
              </div>

              <div className={styles.rows}>
                {eligibility.map((item, index) => (
                  <div className={styles.row} key={index}>
                    <CheckCircle2 size={19} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>
                  <FileText size={20} />
                </div>

                <div>
                  <h2>Required documents</h2>
                  <p>Keep these documents ready before applying.</p>
                </div>
              </div>

              <div className={styles.rows}>
                {documents.map((doc, index) => (
                  <div className={styles.row} key={index}>
                    <FileText size={19} />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Application period */}
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionIcon}>
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2>Application period</h2>
                  <p>Important dates for this scheme.</p>
                </div>
              </div>

              <div className={styles.documentGrid}>
                <div className={styles.document}>
                  <CalendarDays size={19} />

                  <div>
                    <small>Start date</small>
                    <p>{formatDate(scheme.start_date)}</p>
                  </div>
                </div>

                <div className={styles.document}>
                  <CalendarDays size={19} />

                  <div>
                    <small>End date</small>
                    <p>{formatDate(scheme.end_date)}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.quickCard}>
              <h3>Quick information</h3>

              <div className={styles.quickItem}>
                <span>Category</span>
                <strong>{scheme.category}</strong>
              </div>

              <div className={styles.quickItem}>
                <span>Scheme status</span>
                <strong className={styles.activeText}>
                  {scheme.is_active ? "Active" : "Inactive"}
                </strong>
              </div>

              <div className={styles.quickItem}>
                <span>Start date</span>
                <strong>{formatDate(scheme.start_date)}</strong>
              </div>

              <div className={styles.quickItem}>
                <span>End date</span>
                <strong>{formatDate(scheme.end_date)}</strong>
              </div>

              <a
                href={scheme.official_website}
                target="_blank"
                rel="noreferrer"
                className={styles.websiteButton}
              >
                Official Website
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Help card */}
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <Users size={21} />
              </div>

              <h3>Need assistance?</h3>

              <p>
                Contact your local Gram Panchayat or Agriculture Officer
                for assistance with this scheme.
              </p>

              <Link to="/contact" className={styles.helpLink}>
                Get Help
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Note */}
            <div className={styles.noteCard}>
              <Clock size={19} />

              <p>
                Scheme details and eligibility requirements may change.
                Always verify the latest information on the official
                government website.
              </p>
            </div>
          </aside>
        </div>

        {/* Bottom navigation */}
        <div className={styles.bottomNavigation}>
          <Link to="/schemes">
            <ArrowLeft size={17} />
            Back to all schemes
          </Link>
        </div>
      </div>
    </main>
  );
}

export default SchemeDetails;