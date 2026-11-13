import { useEffect, useState } from "react";
import styles from "../modules/Loading.module.css";

const defaultMessages = [
    "Waking up the village...",
    "Asking the Panchayat for permission...",
    "The Sarpanch is checking the records...",
    "Fetching data from every corner of the village...",
    "Even the village gossip travels faster!",
    "Almost there! The village is getting ready...",
];

function Loading({
    message,
    messages = defaultMessages,
}) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (message || messages.length <= 1) return;

        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [message, messages]);

    const currentMessage = message || messages[index];

    return (
        <div
            className={styles.loading}
            role="status"
            aria-live="polite"
        >

            <div className={styles.scene}>

                {/* Night sky overlay */}
                <div className={styles.nightSky}></div>

                {/* Stars */}
                <div className={styles.stars}>
                    {Array.from({ length: 18 }).map((_, i) => (
                        <span
                            key={i}
                            className={styles.star}
                            style={{
                                left: `${(i * 37 + 11) % 95}%`,
                                top: `${(i * 23 + 8) % 65}%`,
                                animationDelay: `${(i % 6) * 0.4}s`,
                            }}
                        >
                            ✦
                        </span>
                    ))}
                </div>

                {/* Sun */}
                <div className={styles.sun}></div>

                {/* Moon */}
                <div className={styles.moon}>
                    <div className={styles.craterOne}></div>
                    <div className={styles.craterTwo}></div>
                </div>

                {/* Clouds */}
                <div className={`${styles.cloud} ${styles.cloudOne}`}>
                    <span></span>
                </div>

                <div className={`${styles.cloud} ${styles.cloudTwo}`}>
                    <span></span>
                </div>

                {/* Flying birds */}
                <div className={styles.birds}>⌁　⌁</div>

                {/* Distant mountains */}
                <div className={styles.mountainBack}></div>
                <div className={styles.mountainFront}></div>

                {/* Village landscape */}
                <div className={styles.field}></div>

                {/* Village houses */}
                <div className={`${styles.house} ${styles.houseOne}`}>
                    <div className={styles.roof}></div>
                    <div className={styles.houseBody}>
                        <div className={styles.houseWindow}></div>
                        <div className={styles.houseDoor}></div>
                    </div>
                </div>

                <div className={`${styles.house} ${styles.houseTwo}`}>
                    <div className={styles.roof}></div>
                    <div className={styles.houseBody}>
                        <div className={styles.houseWindow}></div>
                        <div className={styles.houseDoor}></div>
                    </div>
                </div>

                <div className={`${styles.house} ${styles.houseThree}`}>
                    <div className={styles.roof}></div>
                    <div className={styles.houseBody}>
                        <div className={styles.houseWindow}></div>
                        <div className={styles.houseDoor}></div>
                    </div>
                </div>

                {/* Trees */}
                <div className={`${styles.tree} ${styles.treeOne}`}>
                    🌳
                </div>

                <div className={`${styles.tree} ${styles.treeTwo}`}>
                    🌴
                </div>

                {/* Foreground */}
                <div className={styles.foreground}></div>

                {/* Scene label */}
                <div className={styles.timeLabel}>
                    <span className={styles.dayLabel}>A NEW DAY IN THE VILLAGE</span>
                </div>

            </div>

            {/* Loading text */}
            <div className={styles.messageContainer}>

                <h3 key={currentMessage} className={styles.message}>
                    {currentMessage}
                </h3>

                <p className={styles.subMessage}>
                    Good things take time. Stay with us!
                </p>

            </div>

        </div>
    );
}

export default Loading;