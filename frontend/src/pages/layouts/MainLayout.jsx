import { Link, Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import NoticeTicker from "../../components/NoticeTicker";
import getTrickerNotices from "../../services/notices";
import { useEffect, useState } from "react";
function MainLayout(){
    let [notices,setNotices] = useState([])
    
    useEffect(()=>{
     getTrickerNotices()
     .then((response)=>{
        setNotices(response.data)
     })
     .catch(()=>setNotices([]))
    },[])
   
    return(
        <div>
            <Navbar/>
             <NoticeTicker notices={notices} />
            <Outlet />
            <footer style={{padding:"2rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>{["about","contact","privacy","terms"].map(page=><Link key={page} to={"/"+page}>{page[0].toUpperCase()+page.slice(1)}</Link>)}</footer>

        </div>
    )
} export default MainLayout;