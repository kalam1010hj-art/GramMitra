import axios from "axios"

// This method retrives all the Schemes present in the Database.
const URL = import.meta.env.VITE_API_URL
function getSchemes(){
   return axios.get(`${URL}/schemes`)
}
export default getSchemes

// This method retrives information of the single Scheme in the Database.
export function getSchemeDetails(id){
  return axios.get(`${URL}/schemes/${id}`)
}