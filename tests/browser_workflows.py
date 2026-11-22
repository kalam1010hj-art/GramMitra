"""Browser integration against an isolated local database and the real React app."""

import os
import secrets
import shutil
import subprocess
import sys
import tempfile
import time
from contextlib import ExitStack
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = "http://127.0.0.1:5173"
BACKEND = "http://127.0.0.1:8011"


def ready(url):
    for _ in range(100):
        try:
            with urlopen(url, timeout=1):
                return
        except OSError:
            time.sleep(0.15)
    raise RuntimeError("Server unavailable: " + url)


def main():
    with tempfile.TemporaryDirectory() as temp, ExitStack() as stack:
        password = secrets.token_urlsafe(24)
        env = dict(
            os.environ,
            DATABASE_URL="sqlite:///" + str(Path(temp) / "browser.sqlite3"),
            GRAMMITRA_ENV="development",
            DEBUG="true",
            TEST_PASSWORD=password,
        )

        def django(*args):
            subprocess.run(
                [sys.executable, "manage.py", *args],
                env=env,
                cwd=ROOT / "backend",
                check=True,
                stdout=subprocess.DEVNULL,
            )

        django("migrate", "--noinput")
        django(
            "shell",
            "-c",
            "import os; from accounts.models import User; "
            "[User.objects.create_user(role,role,password=os.environ['TEST_PASSWORD'],phone=phone,role=role) "
            "for role,phone in [('admin','9100000001'),('official','9100000002')]]",
        )

        def server(args, cwd, environment):
            process = subprocess.Popen(
                args,
                cwd=cwd,
                env=environment,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

            def stop():
                process.terminate()
                process.wait(timeout=10)

            stack.callback(stop)
            return process

        server(
            [sys.executable, "manage.py", "runserver", "127.0.0.1:8011", "--noreload"],
            ROOT / "backend",
            env,
        )
        ready(BACKEND + "/notices/")
        dist = str(Path(temp) / "dist")
        vite_command = ["node", "node_modules/vite/bin/vite.js"]
        subprocess.run(
            [*vite_command, "build", "--outDir", dist],
            cwd=ROOT / "frontend",
            env=dict(env, VITE_API_URL=BACKEND),
            check=True,
            stdout=subprocess.DEVNULL,
        )
        vite = server(
            [
                *vite_command,
                "preview",
                "--outDir",
                dist,
                "--host",
                "127.0.0.1",
                "--port",
                "5173",
                "--strictPort",
            ],
            ROOT / "frontend",
            env,
        )
        ready(FRONTEND)
        if vite.poll() is not None:
            raise RuntimeError("Port 5173 must be available.")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=os.getenv("CHROMIUM_BIN") or shutil.which("chromium"),
                args=["--no-sandbox"],
            )
            page = browser.new_page(viewport={"width": 390, "height": 844})
            failures = []
            page.on("pageerror", lambda error: failures.append(str(error)))
            page.goto(FRONTEND + "/dashboard")
            expect(page).to_have_url(FRONTEND + "/login")
            page.goto(FRONTEND + "/register")
            for field, value in {
                "full_name": "Test Resident",
                "phone": "9100000003",
                "password": password,
                "confirm_password": password,
            }.items():
                page.locator('[name="' + field + '"]').fill(value)
            page.locator('button[type="submit"]').click()
            expect(page).to_have_url(FRONTEND + "/login")

            def login(name):
                page.goto(FRONTEND + "/login")
                page.locator('[name="username"]').fill(name)
                page.locator('[name="password"]').fill(password)
                page.locator('button[type="submit"]').click()

            login("9100000003")
            expect(page).to_have_url(FRONTEND + "/profile")
            page.reload()
            expect(page.get_by_text("Test Resident").first).to_be_visible()
            page.goto(FRONTEND + "/grievances/create")
            page.locator("#grievance-title").fill("Water supply interrupted")
            page.get_by_role("button", name="Water Supply").click()
            page.locator("#grievance-description").fill(
                "Please check the supply at the village school."
            )
            page.locator("#grievance-location").fill("Village school")
            page.locator('button[type="submit"]').click()
            expect(
                page.get_by_text("Grievance submitted successfully!")
            ).to_be_visible()
            page.goto(FRONTEND + "/grievances/1")
            expect(
                page.get_by_role("heading", name="Water supply interrupted")
            ).to_be_visible()
            page.goto(FRONTEND + "/dashboard")
            expect(page).to_have_url(FRONTEND + "/profile")
            page.set_viewport_size({"width": 1280, "height": 900})
            login("admin")
            expect(page).to_have_url(FRONTEND + "/dashboard")
            page.get_by_role("button", name="Manage", exact=True).click()
            page.locator('[name="assigned_to"]').select_option("2")
            page.get_by_role("button", name="Save update").click()
            expect(page.get_by_text("Grievance updated.")).to_be_visible()
            page.get_by_role("button", name="Manage village records").click()
            page.get_by_role("button", name="Add record").click()
            page.locator('[name="title"]').fill("Water meeting")
            page.locator('textarea[name="description"]').fill("Meeting at the village office")
            page.locator('[name="is_important"]').check()
            page.get_by_role("button", name="Save", exact=True).click()
            expect(page.get_by_role("cell", name="Water meeting")).to_be_visible()
            page.goto(FRONTEND + "/notices")
            expect(page.get_by_role("heading", name="Water meeting")).to_be_visible()
            login("official")
            expect(page).to_have_url(FRONTEND + "/dashboard")
            page.get_by_role("button", name="Manage", exact=True).click()
            page.locator('[name="new_status"]').select_option("IN_PROGRESS")
            page.get_by_role("button", name="Save update").click()
            expect(page.get_by_role("cell", name="IN_PROGRESS")).to_be_visible()
            page.goto(FRONTEND + "/officials")
            expect(page.get_by_text("No officials listed.")).to_be_visible()
            page.goto(FRONTEND + "/services")
            expect(page.get_by_text("No utility schedules published.")).to_be_visible()
            assert not failures, failures
            browser.close()
            print(
                "Passed resident registration, login, persistence, mobile submission, private routes, assignment, official progress and public navigation."
            )


if __name__ == "__main__":
    main()
