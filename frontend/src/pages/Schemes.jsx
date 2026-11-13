import {
  Landmark,
  AlertCircle,
  ShieldAlert,
  SearchX,
  WifiOff,
  ArrowLeft,
  SlidersHorizontal
} from "lucide-react";

import { Link } from "react-router-dom";

import SchemeCard from "../components/SchemeCard";
// import schemesData from "../data/schemesData";
import getSchemes from "../services/scheme";
import { useEffect, useState } from "react";
import styles from "../modules/Schemes.module.css";
import Loading from "../components/Loading";

function Schemes() {


let [schemesData,SetSchemeData] = useState([])
let [isLoading,SetLoading] = useState(true)
let [error,setError] = useState(null)
let[filtered,SetFilter] = useState("ALL")
let filteredSchemeData = []
console.log("Schemes rendered and category selected is: ",filtered)
console.log("filtered_data",filteredSchemeData)
if(filtered === "ALL"){
  filteredSchemeData = schemesData
  console.log("filtered_data",filteredSchemeData)
}else{
  filteredSchemeData = schemesData.filter((scheme)=>scheme.category == filtered)
}

const errorMessages = {
    400: {
      icon: AlertCircle,
      title: "Invalid Request",
      message: "The request could not be processed. Please try again.",
    },

    401: {
      icon: ShieldAlert,
      title: "Authentication Required",
      message: "Please log in to access this information.",
    },

    403: {
      icon: ShieldAlert,
      title: "Access Denied",
      message: "You don't have permission to access this information.",
    },

    404: {
      icon: SearchX,
      title: "Scheme Not Found",
      message:
        "The scheme you're looking for doesn't exist or may have been removed.",
    },

    500: {
      icon: AlertCircle,
      title: "Internal Server Error",
      message:
        "Something went wrong on our server. Please try again later.",
    },

    NETWORK_ERROR: {
      icon: WifiOff,
      title: "Connection Failed",
      message:
        "Unable to connect to the server. Check your internet connection and try again.",
    },
    REQUEST_ERROR: {
  icon: AlertCircle,
  title: "Request Failed",
  message: "Something went wrong while preparing your request.",
}
  };

const activeSchemes = schemesData.filter(
(scheme) => scheme.is_active
).length;
useEffect(()=>{
  SetLoading(true)
  setError(null)
  getSchemes()
  .then((response)=>{
   SetSchemeData(response.data)
  })
  .catch((error)=>{
   
    if(error.response){
      // server responsed with an http response error
      setError(error.response.status)
    }else if(error.request){
      // request sent but no response received
      setError("NETWORK_ERROR")
    }else{
      // error while configuring the request
      setError("REQUEST_ERROR")
    }
  })
  .finally(()=>{
    SetLoading(false)
  })
},[])

if(isLoading){
  return <Loading/>
}
if (error) {
    const errorContent = errorMessages[error] || {
      icon: AlertCircle,
      title: "Something Went Wrong",
      message:
        "We couldn't load the scheme details. Please try again later.",
    };

    const ErrorIcon = errorContent.icon;
console.log("Filtered Data:",filtered)
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <ErrorIcon size={34} />
            </div>

            <span className={styles.errorLabel}>
              ERROR {typeof error === "number" ? error : ""}
            </span>

            <h1>{errorContent.title}</h1>

            <p>{errorContent.message}</p>

            <div className={styles.errorActions}>
              <button
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>

              <Link to="/schemes" className={styles.backButton}>
                <ArrowLeft size={17} />
                Back to Schemes
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
return ( <main className={styles.page}>


  {/* Hero Section */}
  <section className={styles.hero}>

    <div className={styles.heroContent}>

      <div className={styles.eyebrow}>
        <Landmark size={15} />
        <span>GOVERNMENT INITIATIVES</span>
      </div>

      <h1>
        Government Schemes
        <span> Made Accessible.</span>
      </h1>

      <p className={styles.heroDescription}>
        Discover government welfare schemes, understand their
        benefits, check eligibility and find the support you
        deserve.
      </p>

      <div className={styles.heroStats}>

        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {schemesData.length}
          </span>
          <span className={styles.statLabel}>
            Total Schemes
          </span>
        </div>

        <div className={styles.statDivider}></div>

        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {activeSchemes}
          </span>
          <span className={styles.statLabel}>
            Active Schemes
          </span>
        </div>

      </div>

    </div>

    <div className={styles.heroDecoration}>
      <div className={styles.heroIcon}>
        <Landmark size={64} strokeWidth={1.2} />
      </div>

      <div className={styles.decorationCircle}></div>
    </div>

  </section>

  {/* Schemes Section */}
  <section className={styles.schemesSection}>

    <div className={styles.sectionHeader}>

      <div>
        <span className={styles.sectionEyebrow}>
          EXPLORE BENEFITS
        </span>

        <h2>Government Welfare Schemes</h2>

        <p>
          Explore government schemes and discover their benefits.
        </p>
      </div>

      <div className={styles.resultCount}>
        {filteredSchemeData.length} Schemes Available
      </div>
      
    </div>

  <div className={styles.filterContainer}>

  <div className={styles.filterLabel}>
    <SlidersHorizontal size={18} />
    <span>Filter Schemes</span>
  </div>

  <div className={styles.selectWrapper}>

    <select
      className={styles.categorySelect}
      value={filtered}
      onChange={(e) => SetFilter(e.target.value)}
    >
      <option value="ALL">All Categories</option>
      <option value="EDUCATION">Education</option>
      <option value="AGRICULTURE">Agriculture</option>
      <option value="HEALTH">Health</option>
      <option value="HOUSING">Housing</option>
      <option value="PENSION">Pension</option>
      <option value="WOMEN">Women</option>
      <option value="STUDENT">Student</option>
      <option value="OTHER">Other</option>
    </select>

  </div>

  <div className={styles.filteredCount}>
    Showing <strong>{filteredSchemeData.length}</strong> of{" "}
    <strong>{schemesData.length}</strong> schemes
  </div>

</div>

    {/* Scheme Cards */}
 {
 schemesData.length>0 ?   <div className={styles.schemeGrid}>

      {filteredSchemeData.map((scheme) => (
        <SchemeCard
          key={scheme.id}
          scheme={scheme}
        />
      ))}

    </div>:
    <div>
      <h3>NO Schemes Available currently </h3>
    </div>
    }

  </section>

</main>


);
}

export default Schemes;
