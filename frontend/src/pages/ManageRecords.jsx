import { useState } from "react";
import { api, errorText } from "../services/client";
import { useRecords } from "../hooks/useRecords";
import { Result } from "./PublicServices";
import s from "../modules/Workspace.module.css";

const categories =
  "AGRICULTURE EDUCATION HEALTH HOUSING EMPLOYMENT PENSION WOMEN STUDENT OTHER";
const days = "DAILY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY";
const catalogs = {
  Notices: {
    url: "notices/",
    fields: {
      title: "text",
      description: "textarea",
      category:
        "GENERAL WATER ELECTRICITY MEETING HEALTH PUBLIC_WORKS EMERGENCY",
      expires_at: "datetime-local",
      is_published: true,
      is_important: false,
      display_it: false,
      attachment: "file",
    },
  },
  Schemes: {
    url: "schemes/",
    fields: {
      name: "text",
      description: "textarea",
      category: categories,
      benfits: "textarea",
      required_documents: "textarea",
      eligibility: "textarea",
      official_website: "url",
      start_date: "datetime-local",
      end_date: "datetime-local",
      is_active: true,
    },
  },
  Utilities: {
    url: "utility/",
    fields: {
      name: "text",
      utility_type: "WATER ELECTRICITY GARBAGE OTHER",
      description: "textarea",
      is_active: true,
    },
  },
  Schedules: {
    url: "utility/schedule",
    fields: {
      utility: "number",
      day: days,
      start_time: "time",
      end_time: "time",
      description: "text",
      is_active: true,
    },
  },
  Directory: {
    url: "officials/",
    fields: {
      full_name: "text",
      designation: "text",
      department: "text",
      office: "text",
      public_contact: "text",
      profile_image: "file",
      is_active: true,
    },
  },
  Accounts: {
    url: "accounts/users",
    fields: { full_name: "text", phone: "tel", password: "password" },
  },
};
const labels = {
  benfits: "Benefits",
  display_it: "Show in announcement ticker",
  public_contact: "Authorized public contact",
  utility: "Utility ID",
};
const label = (key) => labels[key] || key.replaceAll("_", " ");

function dateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function Fields({ fields, row }) {
  return (
    <div className={s.form}>
      {Object.entries(fields).map(([key, type]) => {
        const value = row?.[key];
        let input;
        if (typeof type === "boolean")
          input = (
            <input type="checkbox" name={key} defaultChecked={value ?? type} />
          );
        else if (type.includes(" "))
          input = (
            <select name={key} defaultValue={value}>
              {type.split(" ").map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          );
        else if (type === "textarea")
          input = <textarea name={key} defaultValue={value || ""} />;
        else
          input = (
            <input
              name={key}
              type={type}
              defaultValue={
                type === "file"
                  ? undefined
                  : type === "datetime-local"
                    ? dateInput(value)
                    : (value ?? "")
              }
              autoComplete={type === "password" ? "new-password" : undefined}
            />
          );
        return (
          <label key={key}>
            {label(key)}
            {input}
          </label>
        );
      })}
    </div>
  );
}

function Editor({ kind, row, onSaved, onCancel }) {
  const { url, fields: createFields } = catalogs[kind];
  const fields =
    kind === "Accounts" && row
      ? { role: "resident official admin", is_active: true }
      : createFields;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    for (const [key, type] of Object.entries(fields)) {
      if (typeof type === "boolean") data.set(key, String(data.has(key)));
      if (type === "file" && !data.get(key)?.size) data.delete(key);
      if (type === "datetime-local" && data.get(key))
        data.set(key, new Date(data.get(key)).toISOString());
    }
    try {
      if (row)
        await api.patch(
          url.replace(/\/$/, "") + "/" + row.id + "?manage=1",
          data,
        );
      else await api.post(url, data);
      onSaved();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={s.panel} onSubmit={save}>
      <h3>
        {row
          ? "Edit record #" + row.id
          : kind === "Accounts"
            ? "Create official account"
            : "Create record"}
      </h3>
      <Fields fields={fields} row={row} />
      {error && <p role="alert">{error}</p>}
      <div className={s.actions}>
        <button disabled={busy}>Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Records({ kind }) {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [revision, setRevision] = useState(0);
  const [edit, setEdit] = useState(undefined),
    [message, setMessage] = useState("");
  const { url } = catalogs[kind];
  const result = useRecords(
    url + "?manage=1&page=" + page + "&search=" + encodeURIComponent(search),
    revision,
  );
  const refresh = () => {
    setEdit(undefined);
    setMessage("Saved.");
    setRevision((v) => v + 1);
  };
  async function remove(row) {
    if (
      !window.confirm(
        "Delete this record? " +
          (kind === "Utilities" ? "Its schedules will also be removed." : ""),
      )
    )
      return;
    try {
      await api.delete(url.replace(/\/$/, "") + "/" + row.id + "?manage=1");
      setPage(1);
      setRevision((v) => v + 1);
      setMessage("Record deleted.");
    } catch (err) {
      setMessage(errorText(err));
    }
  }
  return (
    <section>
      <h2>{kind}</h2>
      <div className={s.actions}>
        <button onClick={() => setEdit(null)}>
          Add {kind === "Accounts" ? "official" : "record"}
        </button>
        {["Accounts", "Schemes", "Directory", "Notices"].includes(kind) && (
          <label>
            Search
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        )}
      </div>
      {edit !== undefined && (
        <Editor
          key={edit?.id || "new"}
          row={edit}
          kind={kind}
          onSaved={refresh}
          onCancel={() => setEdit(undefined)}
        />
      )}
      <p role="status">{message}</p>
      <Result result={result}>
        {(data) => (
          <>
            <div className={s.table}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Record</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        {row.name ||
                          row.title ||
                          row.full_name ||
                          "Utility " +
                            row.utility +
                            " · " +
                            row.day +
                            " " +
                            row.start_time +
                            "–" +
                            row.end_time}{" "}
                        {row.role && " · " + row.role}
                      </td>
                      <td>
                        <button onClick={() => setEdit(row)}>Edit</button>{" "}
                        {kind !== "Accounts" && (
                          <button onClick={() => remove(row)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.count && <p>No records found.</p>}
            <nav>
              <button
                disabled={!data.previous}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              Page {page}
              <button disabled={!data.next} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </nav>
          </>
        )}
      </Result>
    </section>
  );
}

export default function ManageRecords() {
  const [kind, setKind] = useState("Notices");
  return (
    <section>
      <h2>Village administration</h2>
      <nav aria-label="Administration">
        {Object.keys(catalogs).map((k) => (
          <button aria-pressed={k === kind} key={k} onClick={() => setKind(k)}>
            {k}
          </button>
        ))}
      </nav>
      <Records key={kind} kind={kind} />
    </section>
  );
}
