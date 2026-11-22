import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

function getGrievances() {
  return axios.get(`${URL}grievances/`);
}
export default getGrievances;
export function getGrievanceDetails(id){
   return axios.get(`${URL}grievances/${id}`)
}