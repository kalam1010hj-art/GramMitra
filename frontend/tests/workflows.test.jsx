// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import AuthProvider from "../src/context/AuthProvider";
import { api } from "../src/services/client";
import { scheduleInfo } from "../src/pages/PublicServices";

function mount(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '<meta name="robots" content="index">';
  window.scrollTo = vi.fn();
  vi.spyOn(api, "get").mockResolvedValue({ data: [] });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("account and grievance workflows", () => {
  it("redirects an anonymous visitor to login", async () => {
    mount("/grievances/1");
    expect(
      await screen.findByLabelText("Phone number or username"),
    ).toBeTruthy();
  });
  it("shows the API error when login fails", async () => {
    vi.spyOn(api, "post").mockRejectedValue({
      response: { status: 401, data: { detail: "Invalid credentials." } },
    });
    mount("/login");
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText("Phone number or username"),
      "9100000011",
    );
    await user.type(
      screen.getByLabelText("Password", { selector: "input" }),
      "incorrect",
    );
    await user.click(document.querySelector('button[type="submit"]'));
    expect(await screen.findByText("Invalid credentials.")).toBeTruthy();
  });
  it("restores a resident session and gates the staff dashboard", async () => {
    const resident = { id: 4, role: "resident", full_name: "Village resident" };
    localStorage.setItem("token", "test-session");
    localStorage.setItem("user", JSON.stringify(resident));
    api.get.mockImplementation((url) =>
      Promise.resolve({ data: url === "accounts/profileEdit" ? resident : [] }),
    );
    mount("/dashboard");
    expect(
      (await screen.findAllByText("Village resident")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Admin dashboard")).toBeNull();
  });
  it("submits the multipart resident form with no trusted user ID", async () => {
    const resident = { id: 4, role: "resident", full_name: "Village resident" };
    localStorage.setItem("token", "test-session");
    localStorage.setItem("user", JSON.stringify(resident));
    api.get.mockImplementation((url) =>
      Promise.resolve({ data: url === "accounts/profileEdit" ? resident : [] }),
    );
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValue({ data: { id: 1, tracking_id: "GM-000001" } });
    mount("/grievances/create");
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: "Water Supply" }),
    );
    await user.type(
      document.querySelector("#grievance-title"),
      "Broken water tap",
    );
    await user.type(
      document.querySelector("#grievance-description"),
      "The tap near the office needs repair.",
    );
    await user.type(document.querySelector("#grievance-location"), "Office");
    await user.click(document.querySelector('button[type="submit"]'));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    const [path, data] = post.mock.calls[0];
    expect(path).toBe("grievances/");
    expect(data.get("category")).toBe("WATER");
    expect(data.has("user")).toBe(false);
    expect(
      await screen.findByText("Grievance submitted successfully!"),
    ).toBeTruthy();
  });
});
describe("weekly village schedules", () => {
  const rows = [
    { day: "MONDAY", is_active: true, start_time: "06:00", end_time: "08:00" },
    { day: "MONDAY", is_active: true, start_time: "09:00", end_time: "10:00" },
  ];
  it("uses Indian local time across UTC dates", () => {
    const info = scheduleInfo(rows, new Date("2026-11-23T01:00:00Z"));
    expect(info.status).toContain("90 min remaining");
    expect(info.today).toHaveLength(2);
    expect(info.next).toBe("monday 09:00");
  });
  it("handles the gap between sessions and the end boundary", () => {
    expect(scheduleInfo(rows, new Date("2026-11-23T03:02:00Z")).status).toBe(
      "Starting soon",
    );
    expect(scheduleInfo(rows, new Date("2026-11-23T04:30:00Z")).next).toBe(
      "monday 06:00",
    );
    expect(scheduleInfo([], new Date()).status).toBe("Not available");
  });
});
