# GramMitra

GramMitra is a village public-services portal. Residents can check service timings, read notices and schemes, find public office contacts, and follow private complaints. Officials work on assigned grievances. Administrators manage assignments, accounts, services and publications.

## Project layout

| Directory | Responsibilities |
| --- | --- |
| `backend/accounts` | Phone or existing username login, token authentication, profile and password management |
| `backend/grievances` | Resident reports, evidence, assignments, transitions and activity history |
| `backend/officials` | Public directory, role-specific statistics and administrative account management |
| `backend/utilites`, `schemes`, `notices`, `panchayat` | Weekly schedules, scheme eligibility, announcements and village information |
| `frontend/src` | React, Vite, React Router, Axios, CSS Modules and Lucide icons |
| `tests` | Browser integration against an isolated Django database and a production frontend build |

All REST handlers use DRF `APIView`. Small catalog base classes reuse list, detail and validation behavior. URLs are registered explicitly with `.as_view()`. Django's own admin remains at `/admin/`.

## Local development

Use Python 3.12+ and Node 22.12+ with npm. From the repository root on Linux or macOS:

```sh
cd backend
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

On PowerShell use `.\.venv\Scripts\Activate.ps1` and `Copy-Item .env.example .env`. Set a stable local SECRET_KEY to keep Django admin sessions across restarts. Local development uses SQLite by default. Setting DATABASE_URL switches the database. Each official needs a distinct phone number. The first administrator can use the same login credentials for the React dashboard and Django admin. Administrative role and Django staff privileges are separate.

In a second terminal:

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The local API defaults to http://127.0.0.1:8000. Public screens show empty states until administrators publish real records. Directory entries are independent of login accounts and contain only details approved for publication.

## Role and workflow rules

- Residents register using their name, phone and password. They can keep an optional username, update their profile and track their own grievances.
- Submitting a grievance records its owner and initial activity. Residents can indicate urgency at submission. Staff control assignments and subsequent priority changes.
- Only assigned officials and administrators can record progress. A pending report may enter progress or be rejected. An in-progress report may be resolved or rejected. Both final transitions require a resolution note. Updates and grievance state are persisted together. Historical free-text updates remain intact.
- Administrators can create official accounts, publish and retire notices, maintain schedules and schemes, and manage directory entries. Assignments use actual official accounts. A directory entry alone does not grant access.
- Utility times are local to Asia/Kolkata. A schedule is daily or applies to one weekday. An active session must end later on the same day. Adjacent sessions are allowed. Active sessions for the same utility cannot overlap on the same day. Pre-existing schedules retain daily recurrence.
- New notices can be unpublished or given an expiry. Existing notices keep their former public visibility during migration. Review historical material before launch.

## API reference

Clients send `Authorization: Token <token>` on authenticated requests. Login and register accept JSON. Screens with file uploads use multipart form data. Validation errors return HTTP 400 with field-level messages. Private grievances outside the caller's scope return 404. Sessions expire after 30 days. Password change, administrative access changes and server logout revoke tokens.

| Method and path | Access and purpose |
| --- | --- |
| POST /accounts/register, /accounts/login | Register or authenticate. Login returns token and user. |
| GET, PATCH /accounts/profileEdit | Read or edit own name, email and profile image |
| POST /accounts/logout, /accounts/password | Revoke the token or change password with old_password and new_password |
| GET, POST /grievances/ | Page through authorized complaints or submit a resident grievance |
| GET, PATCH /grievances/{id} | Read details and ordered updates, edit a pending report, or record a staff action |
| GET /grievances/{id}/attachment | Stream evidence after an ownership or assignment check |
| POST /grievances/post-update | Submit a staff action with the grievance ID |
| GET /dashboard/ | Admin totals or official workload and recent assignments |
| GET, POST /accounts/users | Admin account search, role filtering and official creation |
| PATCH /accounts/users/{id} | Admin role and active status management |
| GET, POST /schemes/, /notices/, /utility/, /officials/ | Public catalog reads and admin creation |
| GET, PUT, PATCH, DELETE /{catalog}/{id} | Public details and admin management |
| GET, POST /utility/schedule | Read and create weekly service sessions |
| GET, PUT, PATCH, DELETE /utility/schedule/{id} | Read or manage an individual session |
| GET /panchayat/, /health/ | Village information and database-backed health check |

Grievance and account lists return `{count, next, previous, results}` with 20 rows per page. Grievances accept page, category, status, assigned_to and search. Public catalogs preserve the existing array response and support `?page=1` for pagination. Admin catalog requests use `?manage=1` to include unpublished, expired or inactive records.

Example resident submission to POST /grievances/:

```json
{"title":"Tap damaged","description":"The tap near the school is leaking.","category":"WATER","location":"School entrance"}
```

The response is HTTP 201 and includes the generated id, tracking_id, status and timestamps. An admin assigns it with `{"assigned_to": 7}` on PATCH /grievances/{id}. The official posts `{"new_status":"IN_PROGRESS","message":"Inspection completed."}` to the same PATCH endpoint. The final update includes `{"new_status":"RESOLVED","resolution_note":"Tap replaced."}`.

## Tests

```sh
cd backend
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py collectstatic --noinput
cd ../frontend
npm ci
npm test
npm run lint
npm run build
```

To test PostgreSQL, set DATABASE_URL to a **dedicated test cluster** whose database user can create a test database before running the Django suite. The default test run uses SQLite. For real-browser integration install the Python package playwright in a development environment, install Chromium with `python -m playwright install chromium`, and run `python tests/browser_workflows.py` from the repository root with ports 8011 and 5173 available. CHROMIUM_BIN can point to a system Chromium or headless-shell executable. The script creates disposable local accounts and uses a temporary database.

## Manual deployment

**Render backend** — select this repository, use the backend root directory and a Python runtime. Configure the variables below in the service environment. Use these commands:

| Stage | Command |
| --- | --- |
| Build | `python -m pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| Release, once before starting the new version | `python manage.py migrate --noinput && python manage.py createcachetable` |
| Start | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --access-logfile -` |
| Health check | /health/ |

If your service has no pre-deploy command, execute the release commands in a service shell, or prepend them to the start command for a single-instance deployment. Run createsuperuser once using the service environment.

| Environment variable | Value |
| --- | --- |
| GRAMMITRA_ENV | production |
| DEBUG | false |
| SECRET_KEY | A newly generated, high-entropy Django key. Rotate the development key from the original repository. |
| DATABASE_URL | Your Render PostgreSQL connection URL. Use the provider's TLS settings for external connections. |
| ALLOWED_HOSTS | Comma-separated backend hostnames without schemes. RENDER_EXTERNAL_HOSTNAME is picked up automatically. |
| CORS_ALLOWED_ORIGINS | Comma-separated exact frontend HTTPS origins, without trailing slashes. These also configure trusted CSRF origins. |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Backend-only media credentials |
| TRUSTED_PROXY_COUNT | Number of trusted proxies in front of Django. Verify the actual path before launch. |
| HSTS_PRELOAD | Defaults to false. Enable only if the domain owner elects to meet preload requirements. |

Set a fresh production secret before release. Existing public Cloudinary grievance images were uploaded under public delivery URLs by earlier versions. Run `python manage.py privatize_grievance_media` to count historical assets. After backing up PostgreSQL and confirming the Cloudinary account, run `python manage.py privatize_grievance_media --apply` during a maintenance window. It renames existing public assets to authenticated delivery, requests CDN invalidation and updates their stored identifiers. A second run resumes interrupted work. Verify old URLs are inaccessible before reopening historical complaints. New grievance evidence uses authenticated Cloudinary delivery and the API streams it after checking the requester. Notice and directory media are public. Review directory contacts and the site's privacy and terms text with the village office before public launch.

**Vercel frontend** — set root directory to frontend, framework to Vite, install command to npm ci, build command to npm run build and output directory to dist. Set VITE_API_URL to the exact public HTTPS backend origin at build time. The included vercel.json provides SPA fallback and private-route indexing headers. Rebuild the frontend whenever the public API origin changes.

After configuring the real services, use a test resident and official to verify upload, assignment, resolution, logout, direct-route refresh and cross-origin requests. Verify that the anonymous and unrelated resident sessions cannot load the grievance or its evidence. Check /health/ and collectstatic after each release. Back up PostgreSQL and media before migrations and periodically exercise restoration. By default the production Django deploy check reports the optional HSTS preload warning.
