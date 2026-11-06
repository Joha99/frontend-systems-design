/**
 * Week Calendar (Part 1 of 4): Week Grid + Overlap Layout
 *
 * Render one week and lay out overlapping events. This is the core algorithm.
 *
 * API: fetchEvents(fromISO, toISO) → events starting in [from, to)  (slow)
 *
 * Requirements:
 * 1. Render 7 day columns (Mon–Sun) by 24 hours in 30-minute rows. Start
 *    scrolled to 8:00. Show a red "now" line on today's column.
 * 2. Fetch this week's events (loading state) and position each one by its
 *    start/end time.
 * 3. Overlap layout, per day:
 *    - Group events into clusters of TRANSITIVELY overlapping events.
 *    - In a cluster, give each event the leftmost column that is free at its
 *      start time.
 *    - Width = 1 / (number of columns in its cluster).
 *    - Touching events (one ends 10:00, next starts 10:00) don't overlap.
 * 4. Keep the layout logic in pure functions outside the component.
 *
 * Done when: Monday's chain, Wednesday's touching events and Friday's 4-way
 * overlap all look like Google Calendar.
 *
 * Discussion: this is "meeting rooms II". Where could a min-heap help?
 *
 * Time target: 45 minutes.
 */

import { useEffect, useState } from "react";
import styles from "./WeekCalendar.module.css";
import { fetchEvents } from "./mockApi";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getDaysOfWeek = (relativeDate: Date) => {
  const currentDay = relativeDate.getDay(); // 0 - 6

  const sundayOfWeek = new Date(relativeDate);
  sundayOfWeek.setDate(relativeDate.getDate() - currentDay);
  sundayOfWeek.setHours(0, 0, 0, 0);

  const weekDays: Date[] = [];
  for (let d = 0; d < 7; d++) {
    const currentDay = new Date(sundayOfWeek);
    currentDay.setDate(currentDay.getDate() + d);
    weekDays.push(currentDay);
  }

  return weekDays;
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const Part1OverlapLayout = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());

  useEffect(() => {}, []);

  const totalSlots = (24 * 60) / 30;
  const daysOfWeek = getDaysOfWeek(startDate);

  const slotsStartTime = new Date();
  slotsStartTime.setHours(0, 0, 0, 0);
  const halfHourSlots = Array.from({ length: totalSlots }, () => {
    const currTime = new Date(slotsStartTime);
    slotsStartTime.setMinutes(slotsStartTime.getMinutes() + 30);
    return currTime;
  });

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>Week Calendar: Part 1</h2>

      <div className={styles.calendar}>
        <div className={styles.weekGrid}>
          <div />
          {daysOfWeek.map((day) => {
            const date = day.getDate();
            const dayName = day.toLocaleDateString([], { weekday: "long" });
            const dayIsToday = isToday(day);

            return (
              <div
                className={`${styles.dayName} ${dayIsToday ? styles.today : ""}`}
              >
                <h3>{dayName}</h3>
                <div>{date}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.weekGrid}>
          <div className={styles.column}>
            {halfHourSlots.map((slot) => {
              const displayedSlotTime = slot.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div className={`${styles.halfHourSlot} ${styles.slotLabel}`}>
                  {displayedSlotTime}
                </div>
              );
            })}
          </div>
          {daysOfWeek.map((day, i) => {
            return (
              <div key={i} className={styles.column}>
                {halfHourSlots.map((slot) => {
                  return <div className={styles.halfHourSlot}></div>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
