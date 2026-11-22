import { api } from "./client";
export default function getTrickerNotices() { return api.get("notices/", {params:{noticeTricker:true}}); }
export const getNotices = () => api.get("notices/");
export const getNoticeDetails = id => api.get("notices/" + id);
