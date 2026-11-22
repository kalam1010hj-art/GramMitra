import { Link, Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import NoticeTicker from "../../components/NoticeTicker";
import getTrickerNotices from "../../services/notices";
import { useEffect, useState } from "react";
import footerStyles from "../../modules/Footer.module.css";

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
            <footer className={footerStyles.footer}>
                <nav className={footerStyles.links} aria-label="Footer">
                    {["About", "Contact", "Privacy", "Terms"].map(label => (
                        <Link key={label} to={"/" + label.toLowerCase()}>{label}</Link>
                    ))}
                </nav>
            </footer>

        </div>
    )
} export default MainLayout;