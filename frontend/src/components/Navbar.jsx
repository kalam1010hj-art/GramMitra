import {
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";

import {
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

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
  LogOut,
  UserRound,
} from "lucide-react";

import styles from "../modules/Navbar.module.css";
import { AuthContext } from "../context/AuthProvider";


/* ================================
   NAVIGATION LINKS
================================ */

const publicLinks = [
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


/* ================================
   PROFILE IMAGE URL
================================ */

function getProfileImageUrl(image) {
  if (!image || typeof image !== "string") {
    return null;
  }

  const imagePath = image.trim();

  if (!imagePath) {
    return null;
  }

  // Absolute URL from Cloudinary or Django
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Protocol-relative URL
  if (imagePath.startsWith("//")) {
    return `${window.location.protocol}${imagePath}`;
  }

  // Relative Django media URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  try {
    const backendUrl = new URL(
      API_BASE_URL,
      window.location.origin
    );

    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return new URL(
      normalizedPath,
      backendUrl.origin
    ).href;

  } catch {
    return null;
  }
}


/* ================================
   REUSABLE PROFILE AVATAR
================================ */

function ProfileAvatar({ src, large = false }) {

  const [failedSrc, setFailedSrc] = useState(null);

  const showImage = Boolean(src && failedSrc !== src);

  return (
    <span
      className={`${styles.avatar} ${
        large ? styles.avatarLarge : ""
      }`}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className={styles.avatarImage}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <UserRound
          size={large ? 27 : 21}
          strokeWidth={1.8}
        />
      )}
    </span>
  );
}


/* ================================
   NAVBAR COMPONENT
================================ */

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    IsAuthenticated,
    LogoutUser,
  } = useContext(AuthContext);

  const navigationLinks = ["admin","official"].includes(user?.role) ? [...publicLinks, {name:"Dashboard", path:"/dashboard", icon:LayoutGrid}] : publicLinks;
  const profileImage = getProfileImageUrl(
    user?.profile_image
  );


  /* ================================
     CLOSE MENUS
  ================================ */

  function closeMenus() {
    setMenuOpen(false);
    setProfileOpen(false);
  }


  /* ================================
     LOGOUT
  ================================ */

  async function handleLogout() {

    try { await LogoutUser(); } catch { window.alert("Logout could not be confirmed. Please retry."); return; }

    closeMenus();

    navigate("/", { replace: true });
  }


  /* ================================
     CLOSE ON ROUTE CHANGE
  ================================ */

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);


  /* ================================
     ESCAPE + OUTSIDE CLICK
  ================================ */

  useEffect(() => {

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    }

    function handleOutsideClick(event) {

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

    }

    document.addEventListener("keydown", handleEscape);

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };

  }, []);


  /* ================================
     LOCK BODY SCROLL ON MOBILE
  ================================ */

  useEffect(() => {

    if (!menuOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };

  }, [menuOpen]);


  return (
    <header className={styles.header}>

      <div className={styles.navbar}>

        {/* ===========================
            BRAND
        =========================== */}

        <Link
          to="/"
          className={styles.brand}
          aria-label="GramMitra Home"
          onClick={closeMenus}
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


        {/* ===========================
            DESKTOP NAVIGATION
        =========================== */}

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


        {/* ===========================
            DESKTOP ACTIONS
        =========================== */}

        <div className={styles.desktopActions}>

          {IsAuthenticated ? (

            /* LOGGED IN */

            <div
              className={styles.profileWrapper}
              ref={profileRef}
            >

              <button
                type="button"
                className={styles.profileButton}
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                aria-label="Open account menu"
                aria-expanded={profileOpen}
                aria-controls="profile-dropdown"
              >

                <ProfileAvatar src={profileImage} />

              </button>


              {/* PROFILE DROPDOWN */}

              {profileOpen && (

                <div
                  id="profile-dropdown"
                  className={styles.profileDropdown}
                >

                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={closeMenus}
                  >
                    <UserRound size={18} />
                    <span>My Profile</span>
                  </Link>


                  <div className={styles.dropdownDivider} />


                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>

                </div>

              )}

            </div>

          ) : (

            /* NOT LOGGED IN */

            <>

              <Link
                to="/login"
                className={styles.loginButton}
              >
                <LogIn size={17} />
                <span>Login</span>
              </Link>


              <Link
                to="/register"
                className={styles.getStartedButton}
              >
                Get Started
                <ChevronRight size={17} />
              </Link>

            </>

          )}

        </div>


        {/* ===========================
            MOBILE ACTIONS
        =========================== */}

        <div className={styles.mobileHeaderActions}>

          {IsAuthenticated && (

            <Link
              to="/profile"
              className={styles.mobileQuickProfile}
              aria-label="My Profile"
              onClick={closeMenus}
            >

              <ProfileAvatar src={profileImage} />

            </Link>

          )}


          {/* MOBILE MENU TOGGLE */}

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >

            {menuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}

          </button>

        </div>

      </div>


      {/* ===========================
          MOBILE NAVIGATION
      =========================== */}

      <div
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >

        <nav
          className={styles.mobileNav}
          aria-label="Mobile navigation"
        >


          {/* MOBILE HEADER */}

          <div className={styles.mobileNavHeader}>

            <h3>Explore GramMitra</h3>

            <p>Your village, all in one place.</p>

          </div>


          {/* MOBILE LINKS */}

          <div className={styles.mobileNavLinks}>

            {navigationLinks.map((item) => {

              const Icon = item.icon;

              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${
                      isActive
                        ? styles.mobileActiveLink
                        : ""
                    }`
                  }
                >

                  <span className={styles.mobileLinkIcon}>
                    <Icon size={19} />
                  </span>

                  <span className={styles.mobileLinkText}>
                    {item.name}
                  </span>

                  <ChevronRight
                    size={17}
                    className={styles.mobileChevron}
                  />

                </NavLink>

              );

            })}

          </div>


          {/* ===========================
              MOBILE ACCOUNT ACTIONS
          =========================== */}

          <div className={styles.mobileActions}>

            {IsAuthenticated ? (

              /* LOGGED IN */

              <>

                <div className={styles.mobileProfileSection}>

                  <ProfileAvatar
                    src={profileImage}
                    large
                  />

                </div>


                <Link
                  to="/profile"
                  className={styles.mobileProfileButton}
                  onClick={closeMenus}
                >

                  <UserRound size={18} />

                  <span>My Profile</span>

                  <ChevronRight size={17} />

                </Link>


                <button
                  type="button"
                  className={styles.mobileLogoutButton}
                  onClick={handleLogout}
                >

                  <LogOut size={18} />

                  <span>Logout</span>

                </button>

              </>

            ) : (

              /* NOT LOGGED IN */

              <>

                <Link
                  to="/login"
                  className={styles.mobileLoginButton}
                  onClick={closeMenus}
                >

                  <LogIn size={18} />

                  <span>Login to your account</span>

                </Link>


                <Link
                  to="/register"
                  className={styles.mobileGetStarted}
                  onClick={closeMenus}
                >

                  <span>Get Started</span>

                  <ChevronRight size={18} />

                </Link>

              </>

            )}

          </div>


          {/* MOBILE FOOTER */}

          <div className={styles.mobileFooter}>

            <Leaf size={15} />

            <span>
              Connecting villages, empowering communities.
            </span>

          </div>

        </nav>

      </div>


      {/* ===========================
          MOBILE BACKDROP
      =========================== */}

      {menuOpen && (

        <button
          type="button"
          className={styles.backdrop}
          onClick={closeMenus}
          aria-label="Close navigation menu"
          tabIndex={-1}
        />

      )}

    </header>
  );
}

export default Navbar;