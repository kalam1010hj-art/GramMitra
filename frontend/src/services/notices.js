import axios from "axios";

const URL = import.meta.env.VITE_API_URL

function getTrickerNotices(){
    return axios.get(`${URL}/notices/`,
        {
            params:{
                noticeTricker:true
            }
        }
    )
}
export default getTrickerNotices;


// This function used in the Notice page for retriving all Notices.
function getNotices(){
    return axios.get(`${URL}/notices/`)
} export {getNotices}

// This function is used in Notice Details page ,for retriving single Notice details

function getNoticeDetails(id){
return axios.get(`${URL}/notices/${id}`)
} export {getNoticeDetails}
