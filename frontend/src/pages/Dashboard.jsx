import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { useRecords } from "../hooks/useRecords";
import { api, errorText } from "../services/client";
import ManageRecords from "./ManageRecords";
import { Result } from "./PublicServices";
import s from "../modules/Workspace.module.css";

const statuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];
function OfficialPicker() {
  const [search, setSearch] = useState("");
  const result = useRecords(
    "accounts/users?role=official&search=" + encodeURIComponent(search),
  );
  return (
    <div>
      <label>
        Find official
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <label>
        Assignment
        <select name="assigned_to" defaultValue="">
          <option value="">Keep current assignment</option>
          <option value="none">Unassign</option>
          {(result.data?.results || [])
            .filter((user) => user.is_active)
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} (#{user.id})
              </option>
            ))}
        </select>
      </label>
      {result.error && <p role="alert">{result.error}</p>}
    </div>
  );
}
function Progress({ row, admin, refresh }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of Object.keys(values))
      if (values[key] === "") delete values[key];
    if (values.assigned_to === "none") values.assigned_to = null;
    setBusy(true);
    setError("");
    try {
      await api.patch("grievances/" + row.id, values);
      refresh();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={s.panel} onSubmit={submit}>
      <h2>{row.title}</h2>
      <p>
        {row.location} · {row.category} · {row.status}
      </p>
      <p>{row.description}</p>
      <p>Assigned official · {row.assigned_to?.full_name || "Unassigned"}</p>
      <Link to={"/grievances/" + row.id}>View activity and attachments</Link>
      <div className={s.form}>
        <label>
          Status
          <select name="new_status" defaultValue={row.status}>
            {statuses.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        {admin && (
          <>
            <OfficialPicker />
            <label>
              Priority
              <select name="priority" defaultValue={row.priority}>
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <label>
          Progress update
          <textarea name="message" />
        </label>
        <label>
          Resolution note
          <textarea name="resolution_note" defaultValue={row.resolution_note} />
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>Save update</button>
    </form>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext),
    admin = user?.role === "admin";
  const [tab, setTab] = useState("grievances"),
    [filters, setFilters] = useState({}),
    [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0),
    [selected, setSelected] = useState(null),
    [message, setMessage] = useState("");
  const stats = useRecords("dashboard/", revision);
  const rows = useRecords(
    "grievances/?" + new URLSearchParams({ ...filters, page }),
    revision,
  );
  function filter(key, value) {
    setPage(1);
    setFilters({ ...filters, [key]: value });
  }
  return (
    <main className={s.page}>
      <h1>{admin ? "Admin" : "Official"} dashboard</h1>
      <Result result={stats}>
        {(data) => (
          <div className={s.grid}>
            {Object.entries(data)
              .filter(([, v]) => typeof v === "number")
              .map(([key, value]) => (
                <div key={key} className={s.card}>
                  <strong>{value}</strong>
                  {key === "total"
                    ? "Total grievances"
                    : key.replaceAll("_", " ")}
                </div>
              ))}
          </div>
        )}
      </Result>
      {!admin && stats.data && (
        <section>
          <h2>Recent assignments</h2>
          {stats.data.recent_assignments?.length ? (
            <ul>
              {stats.data.recent_assignments.map((row) => (
                <li key={row.id}>
                  <Link to={"/grievances/" + row.id}>{row.title}</Link> ·{" "}
                  {new Date(row.assigned_at).toLocaleDateString("en-IN")}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent assignments recorded.</p>
          )}
        </section>
      )}
      {admin && (
        <aside>
          <nav>
            <button onClick={() => setTab("grievances")}>Grievances</button>
            <button onClick={() => setTab("manage")}>
              Manage village records
            </button>
          </nav>
        </aside>
      )}
      {tab === "manage" ? (
        <ManageRecords />
      ) : (
        <section>
          <h2>{admin ? "All grievances" : "Assigned grievances"}</h2>
          <div className={s.form}>
            <label>
              Search
              <input
                type="search"
                onChange={(e) => filter("search", e.target.value)}
              />
            </label>
            <label>
              Status
              <select onChange={(e) => filter("status", e.target.value)}>
                <option value="">All</option>
                {statuses.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select onChange={(e) => filter("category", e.target.value)}>
                <option value="">All</option>
                {[
                  "WATER",
                  "ELECTRICITY",
                  "ROAD",
                  "DRAINAGE",
                  "SANITATION",
                  "STREET_LIGHT",
                  "OTHER",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            {admin && (
              <label>
                Official ID
                <input
                  type="number"
                  min="1"
                  onChange={(e) => filter("assigned_to", e.target.value)}
                />
              </label>
            )}
          </div>
          <p role="status">{message}</p>
          {selected && (
            <Progress
              key={selected.id}
              row={selected}
              admin={admin}
              refresh={() => {
                setSelected(null);
                setMessage("Grievance updated.");
                setRevision(revision + 1);
              }}
            />
          )}
          <Result result={rows}>
            {(data) => (
              <>
                <div className={s.table}>
                  <table>
                    <thead>
                      <tr>
                        <th>Grievance</th>
                        <th>Status</th>
                        <th>Assigned to</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <Link to={"/grievances/" + row.id}>
                              {row.title}
                            </Link>
                          </td>
                          <td>{row.status}</td>
                          <td>{row.assigned_to?.full_name || "Unassigned"}</td>
                          <td>
                            <button onClick={() => setSelected(row)}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!data.count && <p>No matching grievances.</p>}
                <nav>
                  <button
                    disabled={!data.previous}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  Page {page}
                  <button
                    disabled={!data.next}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              </>
            )}
          </Result>
        </section>
      )}
    </main>
  );
}
