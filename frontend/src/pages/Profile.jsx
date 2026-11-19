import { useContext } from "react";
import { Link } from "react-router-dom";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  LockKeyhole,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Camera,
  Home,
} from "lucide-react";

import { AuthContext } from "../context/AuthProvider";
import styles from "../modules/Profile.module.css";

function Profile() {
  const { user } = useContext(AuthContext);

  const fullName = user?.full_name || "GramMitra User";
  const username = user?.username || "Not provided";
  const email = user?.email || "Not provided";
  const phone = user?.phone || "Not provided";
  const role = user?.role || "resident";

  const profileImage = user?.profile_image;

  const roleName =
    role.charAt(0).toUpperCase() + role.slice(1);

  const accountStatus =
    user?.is_active === false ? "Inactive" : "Active";

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Page heading */}
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              MY ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              View your personal information and manage
              your GramMitra account.
            </p>
          </div>

          <Link to="/" className={styles.homeLink}>
            <Home size={17} />
            Back to Home
          </Link>
        </div>

        <div className={styles.layout}>

          {/* LEFT COLUMN */}
          <div className={styles.mainColumn}>

            {/* Profile overview */}
            <section className={styles.profileCard}>

              <div className={styles.cover}>
                <div className={styles.coverPattern}></div>
                <span>GRAMMITRA COMMUNITY</span>
              </div>

              <div className={styles.profileContent}>

                <div className={styles.profileTop}>

                  <div className={styles.avatarWrapper}>

                    <div className={styles.avatar}>
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={fullName}
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <UserRound size={45} />
                      )}
                    </div>

                    <span className={styles.cameraIcon}>
                      <Camera size={15} />
                    </span>

                  </div>
             <Link to={"/profile/edit"}>
                  <button
                    type="button"
                    className={styles.editButton}
                   
                    title="Coming soon"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>
</Link>
                </div>

                <div className={styles.profileIdentity}>
                  <h2>{fullName}</h2>
                  <p>@{username}</p>

                  <div className={styles.badges}>
                    <span className={styles.roleBadge}>
                      <ShieldCheck size={14} />
                      {roleName}
                    </span>

                    <span
                      className={
                        user?.is_active === false
                          ? styles.inactiveBadge
                          : styles.activeBadge
                      }
                    >
                      <CheckCircle2 size={14} />
                      {accountStatus}
                    </span>
                  </div>

                </div>

              </div>
            </section>

            {/* Personal information */}
            <section className={styles.infoCard}>

              <div className={styles.sectionHeader}>
                <div>
                  <h3>Personal Information</h3>
                  <p>
                    Your basic account and contact details
                  </p>
                </div>

                <div className={styles.headerIcon}>
                  <UserRound size={20} />
                </div>
              </div>

              <div className={styles.infoGrid}>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <UserRound size={19} />
                  </div>

                  <div>
                    <span>Full Name</span>
                    <strong>{fullName}</strong>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <UserRound size={19} />
                  </div>

                  <div>
                    <span>Username</span>
                    <strong>{username}</strong>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Mail size={19} />
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{email}</strong>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Phone size={19} />
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>{phone}</strong>
                  </div>
                </div>

              </div>
            </section>

            {/* Account information */}
            <section className={styles.infoCard}>

              <div className={styles.sectionHeader}>
                <div>
                  <h3>Account Information</h3>
                  <p>
                    Your account role and current status
                  </p>
                </div>

                <div className={styles.headerIcon}>
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className={styles.accountRows}>

                <div className={styles.accountRow}>
                  <div className={styles.accountLabel}>
                    <ShieldCheck size={18} />
                    <span>Account Role</span>
                  </div>

                  <strong>{roleName}</strong>
                </div>

                <div className={styles.accountRow}>
                  <div className={styles.accountLabel}>
                    <CheckCircle2 size={18} />
                    <span>Account Status</span>
                  </div>

                  <span className={styles.statusText}>
                    {accountStatus}
                  </span>
                </div>

              </div>

            </section>

          </div>

          {/* RIGHT COLUMN */}
          <aside className={styles.sidebar}>

            {/* Grievances */}
            <section className={styles.sideCard}>

              <div className={styles.sideIcon}>
                <ClipboardList size={23} />
              </div>

              <h3>My Grievances</h3>

              <p>
                Track complaints and service requests
                submitted to your Gram Panchayat.
              </p>

              <div className={styles.comingSoon}>
                <Clock3 size={16} />
                Coming Soon
              </div>

              <button
                type="button"
                className={styles.grievanceButton}
                disabled
              >
                View My Grievances
                <ArrowRight size={17} />
              </button>

            </section>

            {/* Account settings */}
            <section className={styles.sideCard}>

              <h3>Account Settings</h3>

              <p>
                Manage your account preferences and
                security settings.
              </p>

              <div className={styles.settingsList}>
             
                <button type="button" >
                  <span className={styles.settingLeft}>
                    <Pencil size={18} />
                    Edit Profile
                  </span>

                  <ArrowRight size={17} />
                </button>

                <button type="button" disabled>
                  <span className={styles.settingLeft}>
                    <LockKeyhole size={18} />
                    Change Password
                  </span>

                  <ArrowRight size={17} />
                </button>

              </div>

            </section>

            {/* Community message */}
            <div className={styles.communityCard}>
              <div className={styles.communityIcon}>
                <Home size={22} />
              </div>

              <h3>Our Village, Our Responsibility</h3>

              <p>
                GramMitra connects residents with
                essential village services and helps
                build a stronger, more informed community.
              </p>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default Profile;