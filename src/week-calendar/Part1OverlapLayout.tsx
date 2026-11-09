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

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./WeekCalendar.module.css";
import { type CalendarEvent, fetchEvents } from "./mockApi";

const SLOT_DURATION_MIN = 30;
const SLOT_HEIGHT_PX = 50;

const getDaysOfWeek = (relativeDate: Date = new Date()) => {
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

const getHalfHourSlots = () => {
  const totalSlots = (24 * 60) / 30;

  const slotsStartTime = new Date();
  slotsStartTime.setHours(0, 0, 0, 0);

  const halfHourSlots = Array.from({ length: totalSlots }, () => {
    const currTime = new Date(slotsStartTime);
    slotsStartTime.setMinutes(slotsStartTime.getMinutes() + 30);
    return currTime;
  });

  return halfHourSlots;
};

const getClusters = (eventsInDay: CalendarEvent[]) => {
  if (eventsInDay.length === 0) return [];

  const sorted = [...eventsInDay].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  let currClusterEnd = new Date(sorted[0].end).getTime();
  let currCluster: CalendarEvent[] = [sorted[0]];
  const res: CalendarEvent[][] = [currCluster];

  for (let i = 1; i < sorted.length; i++) {
    const currEvent = sorted[i];
    const currStart = new Date(currEvent.start).getTime();
    const currEnd = new Date(currEvent.end).getTime();

    if (currStart < currClusterEnd) {
      // insert to current cluster
      currCluster.push(currEvent);

      if (currEnd > currClusterEnd) {
        currClusterEnd = currEnd;
      }
    } else {
      // create a new cluster
      currCluster = [currEvent];
      currClusterEnd = currEnd;
      res.push(currCluster);
    }
  }

  console.log("cluster res", res);
  return res;
};

export const Part1OverlapLayout = () => {
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>(getDaysOfWeek);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents(daysOfWeek[0].toISOString(), daysOfWeek[6].toISOString()).then(
      (events) => {
        setEvents(events);
      },
    );
  }, []);

  const halfHourSlots = getHalfHourSlots();
  const eventsByDay: CalendarEvent[][] = Array.from({ length: 7 }, () => []);

  for (const event of events) {
    const startDate = new Date(event.start);
    eventsByDay[startDate.getDay()].push(event);
  }

  console.log("eventsByDay", eventsByDay);

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
                key={dayName}
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
                <div
                  key={displayedSlotTime}
                  className={`${styles.halfHourSlot} ${styles.slotLabel}`}
                >
                  {displayedSlotTime}
                </div>
              );
            })}
          </div>
          {eventsByDay.map((events, i) => {
            return (
              <div className={styles.column}>
                {halfHourSlots.map((_, i) => {
                  return <div key={i} className={styles.halfHourSlot}></div>;
                })}

                {events.map((event) => {
                  const startDate = new Date(event.start);
                  const dayStart = new Date(event.start);
                  dayStart.setHours(0, 0, 0, 0);
                  const minSinceStart =
                    (startDate.getTime() - dayStart.getTime()) / (1000 * 60);
                  const startSlot = minSinceStart / 30;
                  const topOffset = startSlot * 50;

                  const endDate = new Date(event.end);
                  const durationMin =
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                  const slotCount = durationMin / 30;
                  const height = slotCount * 50;

                  return (
                    <div
                      className={styles.event}
                      style={
                        {
                          "--top-offset": `${topOffset}px`,
                          "--height": `${height}px`,
                        } as CSSProperties
                      }
                    >
                      <h4>{event.title}</h4>
                      <div>{durationMin} mins</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
