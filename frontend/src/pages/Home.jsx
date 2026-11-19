import { Link } from "react-router-dom";
import {
  Search,
  Droplets,
  Zap,
  Clock,
  ArrowRight,
  CalendarDays,
  Megaphone,
  Landmark,
  GraduationCap,
  HeartPulse,
  Home as HomeIcon,
  FileText,
  MessageSquare,
  Users,
  ChevronRight,
  Leaf,
} from "lucide-react";
import styles from "../modules/Home.module.css";
import { useEffect, useState } from "react";
import getUtility from "../services/utility";
import WaterUtilitys from "../components/WaterUtilitys";
import WaterUtilityCard from "../components/UtilityCard";

const utilities = [
  {
    id: 1,
    title: "Water Supply",
    icon: Droplets,
    time: "06:00 AM - 08:00 AM",
    description: "Monday, Wednesday & Friday",
    status: "Scheduled",
    updated: "Updated today",
    link: "/services/water",
    type: "water",
  },
  {
    id: 2,
    title: "Electricity",
    icon: Zap,
    time: "No planned outage",
    description: "No maintenance announced",
    status: "Regular Supply",
    updated: "Updated today",
    link: "/services/electricity",
    type: "electricity",
  },
];
const notices = [
  {
    id: 1,
    title: "Gram Sabha Meeting",
    description:
      "All village residents are requested to attend the upcoming Gram Sabha meeting.",
    category: "Meeting",
    date: "05 Nov 2026",
  },
  {
    id: 2,
    title: "Drinking Water Maintenance",
    description:
      "Water supply may be interrupted during scheduled maintenance work.",
    category: "Water",
    date: "05 Nov 2026",
  },
  {
    id: 3,
    title: "Free Vaccination Drive",
    description:
      "A vaccination drive will be organized at the village health centre.",
    category: "Health",
    date: "04 Nov 2026",
  },
];
const schemes = [
  {
    id: 1,
    title: "Agriculture Schemes",
    description: "Financial assistance and benefits for farmers.",
    icon: Leaf,
    category: "Agriculture",
  },
  {
    id: 2,
    title: "Education Schemes",
    description: "Scholarships and educational support for students.",
    icon: GraduationCap,
    category: "Education",
  },
  {
    id: 3,
    title: "Housing Schemes",
    description: "Government assistance for eligible families.",
    icon: HomeIcon,
    category: "Housing",
  },
  {
    id: 4,
    title: "Health Schemes",
    description: "Healthcare assistance and medical benefits.",
    icon: HeartPulse,
    category: "Health",
  },
];
const quickServices = [
  {
    title: "Register Complaint",
    description: "Report a village issue.",
    icon: MessageSquare,
    link: "/grievances",
  },
  {
    title: "Track Complaint",
    description: "Check your complaint status.",
    icon: FileText,
    link: "/grievances/track",
  },
  {
    title: "Panchayat Officials",
    description: "Find important contacts.",
    icon: Users,
    link: "/officials",
  },
  {
    title: "Public Services",
    description: "Explore village services.",
    icon: Landmark,
    link: "/services",
  },
];

function Home() {
  let [utilitys, setUtilities] = useState([]);
  let now = new Date();
  const Waterutilities = utilitys.filter(
    (utility) => utility.utility_type === "WATER" && utility.is_active,
  );

  const electricityUtilities = utilitys.filter(
    (utility) => utility.utility_type === "ELECTRICITY" && utility.is_active,
  );

  console.log("WaterUtilities", Waterutilities);

  useEffect(() => {
    getUtility().then((response) => {
      console.log("getUtility response :", response.data);
      setUtilities(response.data);
    });
  }, []);
  return (
    <div className={styles.home}>
      {/* HERO SECTION */}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.welcomeBadge}>
            <span className={styles.statusDot}></span>
            Your Village Information Portal
          </div>

          <h1>
            Your Village,
            <span> Connected.</span>
          </h1>

          <p className={styles.heroDescription}>
            Stay informed about village services, government schemes, important
            announcements and everything happening in your community.
          </p>

          <form
            className={styles.searchBox}
            onSubmit={(event) => {
              event.preventDefault();
              const query = event.currentTarget.elements.search.value.trim();

              if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
              }
            }}
          >
            <Search size={20} />

            <input
              type="search"
              name="search"
              placeholder="Search schemes, notices, services..."
              aria-label="Search village information"
            />

            <button type="submit">Search</button>
          </form>

          <div className={styles.heroLinks}>
            <Link to="/services">
              Explore Services <ArrowRight size={16} />
            </Link>

            <Link to="/notices">
              Latest Notices <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className={styles.heroDecoration}>
          <div className={styles.decorationCircle}></div>
          <Leaf className={styles.heroLeaf} />
        </div>
      </section>

      {/* UTILITY SECTION */}

   {/* VILLAGE UTILITIES */}

<section className={styles.section}>

  <div className={styles.sectionHeader}>
    <div>
      <span className={styles.eyebrow}>
        DAILY ESSENTIALS
      </span>

      <h2>Village Utilities</h2>

      <p>
        Check today's water supply and electricity schedules.
      </p>
    </div>

    <Link to="/services" className={styles.viewAll}>
      All Services <ArrowRight size={17} />
    </Link>
  </div>

  <div className={styles.utilityGrid}>

    {utilitys
      .filter((utility) => utility.is_active)
      .map((utility) => (
        <WaterUtilityCard
          key={utility.id}
          utility={utility}
        />
      ))}

  </div>

</section>

      {/* GOVERNMENT SCHEMES */}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>GOVERNMENT BENEFITS</span>

            <h2>Government Schemes</h2>

            <p>Discover schemes and benefits available to eligible citizens.</p>
          </div>

          <Link to="/schemes" className={styles.viewAll}>
            Explore All <ArrowRight size={17} />
          </Link>
        </div>

        <div className={styles.schemeGrid}>
          {schemes.map((scheme) => {
            const Icon = scheme.icon;

            return (
              <Link
                to={`/schemes?category=${scheme.category.toLowerCase()}`}
                key={scheme.id}
                className={styles.schemeCard}
              >
                <div className={styles.schemeIcon}>
                  <Icon size={23} />
                </div>

                <span className={styles.schemeCategory}>{scheme.category}</span>

                <h3>{scheme.title}</h3>

                <p>{scheme.description}</p>

                <span className={styles.schemeLink}>
                  Explore Schemes <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* QUICK SERVICES */}

      <section className={styles.quickSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>HERE TO HELP</span>

            <h2>How Can We Help You?</h2>

            <p>Access important Panchayat services quickly.</p>
          </div>
        </div>

        <div className={styles.quickGrid}>
          {quickServices.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                to={service.link}
                key={service.title}
                className={styles.quickCard}
              >
                <div className={styles.quickIcon}>
                  <Icon size={22} />
                </div>

                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <ArrowRight size={18} className={styles.quickArrow} />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
