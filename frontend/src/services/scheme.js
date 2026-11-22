import { api } from "./client";
export default function getSchemes() { return api.get("schemes/"); }
export const getSchemeDetails = id => api.get("schemes/" + id);
