import styles from "../modules/WaterUtilityCard.module.css"

const DAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]
function WaterUtilityCard({utility}){
    let now = new Date()
    let today = DAYS[now.getDay()]
    let utilitySchedules = utility.schedules
    let todaysUtiliy = utilitySchedules.filter((schedule)=>schedule.day === today)
    console.log(utility.schedules)
    console.log("todays utility schedule is :",todaysUtiliy)
    return(
        <div className={styles.container}>
        <h2>{utility.name}</h2>

        </div>
    )
} export default WaterUtilityCard