import { lazy, Suspense, useContext, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthContext } from "./context/AuthProvider";
import MainLayout from "./pages/layouts/MainLayout";
import { Directory, Services } from "./pages/PublicServices";
import s from "./modules/Workspace.module.css";

const files = import.meta.glob([
  "./pages/*.jsx",
  "!./pages/PublicServices.jsx",
  "!./pages/ManageRecords.jsx",
]);
const load = (name) => lazy(files["./pages/" + name + ".jsx"]);
const publicRoutes = [
  ["/", load("Home")],
  ["schemes", load("Schemes")],
  ["schemes/:id", load("SchemeDetails")],
  ["notices", load("Notices")],
  ["notices/:id", load("NoticeDetails")],
  ["services", Services],
  ["officials", Directory],
];
const personal = [
  ["profile", load("Profile")],
  ["profile/edit", load("EditProfile")],
  ["profile/password", load("AccountPassword")],
  ["grievances", load("Grievances")],
  ["grievances/:id", load("GrievanceDetails")],
];
const Login = load("Login"),
  Register = load("Register"),
  Dashboard = load("Dashboard"),
  Post = load("PostGrievance");

function Guard({ roles }) {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role))
    return <Navigate to="/profile" replace />;
  return <Outlet />;
}
const information = {
  about: [
    "About GramMitra",
    "GramMitra helps residents find village services and follow grievance updates.",
  ],
  contact: [
    "Contact the village office",
    "Use the officials directory for published office and contact details.",
  ],
  privacy: [
    "Privacy policy",
    "GramMitra uses your account details to authenticate you and deliver village services. Your grievances are available to you, assigned officials and administrators. Submit only information needed to describe the issue. Contact the village office about your account or records.",
  ],
  terms: [
    "Terms of service",
    "Use your own account and submit accurate information. Service times are published schedules and may change. Contact local emergency services for immediate assistance.",
  ],
};

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const part = pathname.split("/").filter(Boolean)[0] || "Village services";
    document.title = part[0].toUpperCase() + part.slice(1) + " | GramMitra";
    document.querySelector('meta[name="robots"]').content =
      /^\/(dashboard|profile|grievances|login|register)(\/|$)/.test(pathname)
        ? "noindex, nofollow"
        : "index, follow";
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Suspense fallback={<p role="status">Loading GramMitra…</p>}>
      <Routes>
        <Route element={<MainLayout />}>
          {publicRoutes.map(([path, Page]) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          {Object.entries(information).map(([path, [title, body]]) => (
            <Route
              key={path}
              path={path}
              element={
                <main className={s.page}>
                  <h1>{title}</h1>
                  <p>{body}</p>
                  <Link to="/officials">Officials directory</Link>
                </main>
              }
            />
          ))}
          <Route element={<Guard />}>
            {personal.map(([path, Page]) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
          </Route>
          <Route element={<Guard roles={["admin", "official"]} />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<Guard roles={["resident"]} />}>
            <Route path="grievances/create" element={<Post />} />
          </Route>
          <Route
            path="*"
            element={
              <main className={s.page}>
                <h1>Page not found</h1>
                <Link to="/">Return to village services</Link>
              </main>
            }
          />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </Suspense>
  );
}
