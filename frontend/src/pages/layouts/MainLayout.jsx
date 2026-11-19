import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import NoticeTicker from "../../components/NoticeTicker";
import getTrickerNotices from "../../services/notices";
import { useEffect, useState } from "react";
function MainLayout(){
    let [notices,setNotices] = useState([])
    
    useEffect(()=>{
     getTrickerNotices()
     .then((response)=>{
        console.log(response.data)
        setNotices(response.data)
     })
     .catch((error)=>{
        console.log(error.message)
     })
    },[])
   
    return(
        <div>
            <Navbar/>
             <NoticeTicker notices={notices} />
            <Outlet />

        </div>
    )
} export default MainLayout;