import { api } from "./client";

export async function postGrievance(formData) {
  return (await api.post("grievances/", formData)).data;
}

/** Produce a useful error from DRF validation errors and HTTP failures. */
export function getGrievancePostError(error) {
  const status = error?.response?.status ?? error?.status;
  const details = error?.response?.data;

  if (status === 401) return "Please log in again to submit a grievance.";
  if (status === 403) return "Your account does not have permission to submit grievances.";
  if (status === 404) return "Grievance API not found. Check VITE_GRIEVANCE_POST_URL.";
  if (status === 413) return "The attached image is too large for the server.";
  if (status >= 500) return "Server error. Please try again in a moment.";

  if (typeof details === "string") return details;
  if (Array.isArray(details)) return details.map(String).join(" ");
  if (details && typeof details === "object") {
    const detail = details.detail || details.non_field_errors;
    if (detail) return Array.isArray(detail) ? detail.join(" ") : String(detail);

    const messages = Object.entries(details).map(([field, value]) => {
      const description = Array.isArray(value) ? value.join(" ") : String(value);
      return `${field.replaceAll("_", " ")}: ${description}`;
    });
    if (messages.length) return messages.join(" | ");
  }

  if (error?.code === "ERR_NETWORK" || (error?.request && !error?.response)) {
    return "Cannot reach the server. Check your internet connection and API URL.";
  }
  return error?.message || "Unable to submit your grievance. Please try again.";
}
