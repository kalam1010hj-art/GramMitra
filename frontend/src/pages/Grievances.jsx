import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  LoaderCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  MapPin,
  AlertCircle,
} from "lucide-react";

import GrievanceList from "../components/GrievanceList";
import styles from "../modules/Grievances.module.css";
import getGrievances from "../services/grievanceServices";

// Convert Axios errors into understandable messages for residents.
function getErrorMessage(error) {
  const status = error?.response?.status;

  if (!error?.response) {
    if (error?.message === "Unexpected grievance response format") {
      return "The server returned an unexpected response. Please try again.";
    }
    return "Unable to connect to GramMitra. Check your internet connection and try again.";
  }

  switch (status) {
    case 400:
      return "The request could not be processed. Please try again.";
    case 401:
      return "Your session has expired. Please sign in and try again.";
    case 403:
      return "You do not have permission to view these grievances.";
    case 404:
      return "The grievance service could not be found.";
    case 429:
      return "Too many requests. Please try again shortly.";
    default:
      return status >= 500
        ? "The GramMitra server is having trouble. Please try again later."
        : "Could not load grievances. Please try again.";
  }
}

const statusFilters = [
  { label: "All Grievances", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

function Grievances() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  

  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setError("");

    getGrievances()
      .then((response) => {
        if (!isCurrent) return;

        // Supports an array and DRF's paginated { results: [...] } shape.
        const data = response.data;
        const items = Array.isArray(data) ? data : data?.results;
        if (!Array.isArray(items)) {
          throw new Error("Unexpected grievance response format");
        }

        setGrievances(items);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Failed to load grievances:", err);
        setError(getErrorMessage(err));
        setGrievances([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    // Prevent older requests from updating state after unmount/retry.
    return () => {
      isCurrent = false;
    };
  }, [retryKey]);

  const retryLoading = () => setRetryKey((current) => current + 1);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: grievances.length,

      pending: grievances.filter((item) => item.status === "PENDING").length,

      inProgress: grievances.filter((item) => item.status === "IN_PROGRESS")
        .length,

      resolved: grievances.filter(
        (item) => item.status === "RESOLVED" || item.status === "CLOSED",
      ).length,
    };
  }, [grievances]);

  // Available categories
  const categories = useMemo(() => {
    return [
      ...new Set(grievances.map((item) => item.category).filter(Boolean)),
    ];
  }, [grievances]);

  // Search and filtering
  const filteredGrievances = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return grievances.filter((item) => {
      const matchesSearch =
        !searchText ||
        [item.title, item.description, item.location].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchText),
        );

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [grievances, search, statusFilter, categoryFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "ALL" || categoryFilter !== "ALL";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>GramMitra</span>
          <span>/</span>
          <strong>Grievance Center</strong>
        </div>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <ShieldCheck size={15} />
              Citizen Services
            </div>

            <h1>
              Your Voice.
              <br />
              <span>Our Priority.</span>
            </h1>

            <p className={styles.heroDescription}>
              Report village issues, track complaint progress, and stay informed
              about resolutions. Together, we can build a better community.
            </p>

            <div className={styles.heroActions}>
              <Link to="/grievances/create" className={styles.primaryButton}>
                <Plus size={18} />
                Raise a Grievance
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className={styles.heroDecoration}>
            <div className={styles.decorationCircle}>
              <ClipboardList size={75} strokeWidth={1.3} />
            </div>
            <div className={styles.decorationRing}></div>
          </div>
        </section>

        {/* Statistics */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.totalIcon}`}>
              <ClipboardList size={22} />
            </div>

            <div className={styles.statContent}>
              <p>Total Grievances</p>
              <h2>{isLoading || error ? "—" : stats.total}</h2>
              <span>Complaints registered</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.pendingIcon}`}>
              <Clock3 size={22} />
            </div>

            <div className={styles.statContent}>
              <p>Pending</p>
              <h2>{isLoading || error ? "—" : stats.pending}</h2>
              <span>Awaiting action</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.progressIcon}`}>
              <LoaderCircle size={22} />
            </div>

            <div className={styles.statContent}>
              <p>In Progress</p>
              <h2>{isLoading || error ? "—" : stats.inProgress}</h2>
              <span>Being addressed</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.resolvedIcon}`}>
              <CheckCircle2 size={22} />
            </div>

            <div className={styles.statContent}>
              <p>Resolved / Closed</p>
              <h2>{isLoading || error ? "—" : stats.resolved}</h2>
              <span>Complaints handled</span>
            </div>
          </div>
        </section>

        {/* Grievances Section */}
        <section className={styles.grievanceSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                COMMUNITY COMPLAINTS
              </span>

              <h2>Village Grievances</h2>

              <p>Browse and track issues reported by village residents.</p>
            </div>

            <div className={styles.locationBadge}>
              <MapPin size={16} />
              Village Portal
            </div>
          </div>

          {/* Search and Category */}
          <div className={styles.filterPanel}>
            <div className={styles.searchContainer}>
              <Search size={19} />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search grievances, issues, locations..."
                aria-label="Search grievances"
              />
            </div>

            <div className={styles.categoryContainer}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className={styles.filterTabs}>
            {statusFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`${styles.filterTab} ${
                  statusFilter === filter.value ? styles.activeTab : ""
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <div>
              <h3>
                {statusFilter === "ALL"
                  ? "All Complaints"
                  : statusFilters.find(
                      (filter) => filter.value === statusFilter,
                    )?.label}
              </h3>

              <p>
                {isLoading
                  ? "Loading grievances..."
                  : error
                    ? "Grievance data unavailable"
                    : `Showing ${filteredGrievances.length} of ${grievances.length} grievances`}
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={resetFilters}
              >
                <RotateCcw size={15} />
                Reset Filters
              </button>
            )}
          </div>

          {/* Loading, error, results, and empty states */}
          {isLoading ? (
            <div className={styles.feedbackState} role="status" aria-live="polite">
              <LoaderCircle size={38} className={styles.loadingSpinner} />
              <h3>Loading grievances...</h3>
              <p>Getting the latest complaints from GramMitra.</p>
            </div>
          ) : error ? (
            <div className={styles.feedbackState} role="alert">
              <div className={styles.errorIcon}>
                <AlertCircle size={34} />
              </div>
              <h3>Unable to load grievances</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={retryLoading}
                className={styles.retryButton}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          ) : filteredGrievances.length > 0 ? (
            <GrievanceList grievances={filteredGrievances} />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ClipboardList size={34} />
              </div>

              <h3>No grievances found</h3>
              <p>
                {hasActiveFilters
                  ? "We couldn't find any complaints matching your filters."
                  : "No grievances have been registered yet."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={styles.emptyButton}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className={styles.bottomBanner}>
          <div>
            <h3>Facing an issue in your village?</h3>

            <p>
              Your feedback matters. Submit a complaint and help improve your
              community.
            </p>
          </div>

          <Link to="/grievances/create" className={styles.bottomButton}>
            Submit Complaint
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Grievances;
