import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

import {
  Menu,
  X,
  ChevronRight,
  Leaf,
  House,
  Landmark,
  Bell,
  MessageSquareText,
  LayoutGrid,
  LogIn,
} from "lucide-react";

import styles from "../modules/Navbar.module.css";

const navigationLinks = [
  {
    name: "Home",
    path: "/",
    icon: House,
    end: true,
  },
  {
    name: "Schemes",
    path: "/schemes",
    icon: Landmark,
  },
  {
    name: "Notices",
    path: "/notices",
    icon: Bell,
  },
  {
    name: "Complaints",
    path: "/grievances",
    icon: MessageSquareText,
  },
  {
    name: "Services",
    path: "/services",
    icon: LayoutGrid,
  },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  // Close mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu when Escape is pressed.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>

        {/* Brand */}
        <Link
          to="/"
          className={styles.brand}
          aria-label="GramMitra home"
          onClick={closeMenu}
        >
          <div className={styles.logo}>
            <Leaf size={23} strokeWidth={2.2} />
          </div>

          <div className={styles.brandContent}>
            <span className={styles.brandName}>
              Gram<span>Mitra</span>
            </span>

            <span className={styles.tagline}>
              Your Village, Connected
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={styles.desktopNav}
          aria-label="Main navigation"
        >
          {navigationLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${
                  isActive ? styles.activeLink : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <Link to="/login" className={styles.loginButton}>
            <LogIn size={17} />
            <span>Login</span>
          </Link>

          <Link to="/register" className={styles.getStartedButton}>
            Get Started
            <ChevronRight size={17} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className={styles.mobileNav}
          aria-label="Mobile navigation"
        >
          <div className={styles.mobileNavHeader}>
            <span>Explore GramMitra</span>
            <span className={styles.mobileNavSubtitle}>
              Your village, all in one place.
            </span>
          </div>

          <div className={styles.mobileNavLinks}>
            {navigationLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  tabIndex={menuOpen ? 0 : -1}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${
                      isActive ? styles.mobileActiveLink : ""
                    }`
                  }
                >
                  <span className={styles.mobileLinkIcon}>
                    <Icon size={19} />
                  </span>

                  <span>{item.name}</span>

                  <ChevronRight
                    size={17}
                    className={styles.mobileChevron}
                  />
                </NavLink>
              );
            })}
          </div>

          <div className={styles.mobileActions}>
            <Link
              to="/login"
              className={styles.mobileLoginButton}
              tabIndex={menuOpen ? 0 : -1}
            >
              <LogIn size={18} />
              Login to your account
            </Link>

            <Link
              to="/register"
              className={styles.mobileGetStarted}
              tabIndex={menuOpen ? 0 : -1}
            >
              Get Started
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className={styles.mobileFooter}>
            <Leaf size={15} />
            <span>Connecting villages, empowering communities.</span>
          </div>
        </nav>
      </div>

      {/* Mobile menu backdrop */}
      <button
        type="button"
        className={`${styles.backdrop} ${
          menuOpen ? styles.backdropVisible : ""
        }`}
        onClick={closeMenu}
        aria-label="Close navigation menu"
        tabIndex={menuOpen ? 0 : -1}
        aria-hidden={!menuOpen}
      />
    </header>
  );
}

export default Navbar;