import WaterUtilityCard from "./WaterUtilityCard"

const DAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]
function WaterUtilitys({WaterUtilities}){
    let now = new Date()
    let todaysUtilities = WaterUtilities.filter(
        (utility)=>utility.schedules?.find((schedule)=>schedule.day == DAYS[now.getDay()]))
    console.log(todaysUtilities)
    return (
        <div>
            {
                todaysUtilities.map((utility,id)=>{
                    return <WaterUtilityCard utility={utility} key={id}/>
                })
            }
        
         
        </div>
    )
} export default WaterUtilitys