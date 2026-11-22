import GrievanceCard from "./GrievanceCard";
import styles from "../modules/GrievanceList.module.css";

function GrievanceList({ grievances = [] }) {
  return (
    <div className={styles.grievanceGrid}>
      {grievances.map((grievance) => (
        <GrievanceCard
          key={grievance.id}
          grievance={grievance}
        />
      ))}
    </div>
  );
}

export default GrievanceList;