import axios from "axios"
const URL = import.meta.env.VITE_API_URL

function getUtility(){
   return axios.get(`${URL}/utility`)
} export default getUtility;
