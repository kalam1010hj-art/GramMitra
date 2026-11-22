import { api } from "./client";
export default function getGrievances(params) {
  return api.get("grievances/", { params });
}
export const getGrievanceDetails = (id) => api.get("grievances/" + id);
