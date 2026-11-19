import WaterUtilityCard from "./UtilityCard";
import styles from "../modules/WaterUtilitys.module.css";

function WaterUtilitys({ WaterUtilities }) {
  return (
    <div className={styles.container}>
      {WaterUtilities.map((utility) => (
        <WaterUtilityCard key={utility.id} utility={utility} />
      ))}
    </div>
  );
}

export default WaterUtilitys;
