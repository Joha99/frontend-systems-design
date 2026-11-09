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

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./WeekCalendar.module.css";
import { type CalendarEvent, fetchEvents } from "./mockApi";

const SLOT_DURATION_MIN = 30;
const SLOT_HEIGHT_PX = 50;
const COLUMN_WIDTH_PX = 200;
const MS_IN_MIN = 1000 * 60;

const getDaysOfWeek = (relativeDate: Date = new Date()) => {
  const currentDay = relativeDate.getDay(); // 0 - 6

  const sundayOfWeek = new Date(relativeDate);
  sundayOfWeek.setDate(relativeDate.getDate() - currentDay);
  sundayOfWeek.setHours(0, 0, 0, 0);

  const weekDays: Date[] = [];

  for (let d = 0; d < 8; d++) {
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
  const totalSlots = (24 * 60) / SLOT_DURATION_MIN;

  const slotsStartTime = new Date();
  slotsStartTime.setHours(0, 0, 0, 0);

  const halfHourSlots = Array.from({ length: totalSlots }, () => {
    const currTime = new Date(slotsStartTime);
    slotsStartTime.setMinutes(slotsStartTime.getMinutes() + SLOT_DURATION_MIN);
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
      currCluster.push(currEvent);
      if (currEnd > currClusterEnd) {
        currClusterEnd = currEnd;
      }
    } else {
      currCluster = [currEvent];
      currClusterEnd = currEnd;
      res.push(currCluster);
    }
  }

  return res;
};

const getClusterLanes = (cluster: CalendarEvent[]) => {
  const lanes: CalendarEvent[][] = [];

  for (let i = 0; i < cluster.length; i++) {
    const currEvent = cluster[i];
    const currEventStart = new Date(currEvent.start).getTime();

    if (lanes.length === 0) {
      lanes.push([currEvent]);
      continue;
    }

    let addedToExistingLane = false;
    for (const lane of lanes) {
      const lastInLane = lane[lane.length - 1];
      const lastInLaneEnd = new Date(lastInLane.end).getTime();

      if (lastInLaneEnd <= currEventStart) {
        addedToExistingLane = true;
        lane.push(currEvent);
        break;
      }
    }

    if (!addedToExistingLane) {
      lanes.push([currEvent]);
    }
  }

  return lanes;
};

const randomRgba = (alpha = 0.3) => {
  const channel = () => Math.floor(Math.random() * 256);
  return `rgba(${channel()}, ${channel()}, ${channel()}, ${alpha})`;
};

const getTopOffset = (current: Date) => {
  const start = new Date(current);
  start.setHours(0, 0, 0, 0);

  const minSinceStart = (current.getTime() - start.getTime()) / MS_IN_MIN;
  const startSlot = minSinceStart / SLOT_DURATION_MIN;
  const nowTopOffsetPx = startSlot * SLOT_HEIGHT_PX;

  return nowTopOffsetPx;
};

export const Part1OverlapLayout = () => {
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>(getDaysOfWeek);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents(daysOfWeek[0].toISOString(), daysOfWeek[7].toISOString()).then(
      (events) => {
        console.log(events);
        setEvents(events);
      },
    );

    const minsFromStartToEightAm = 8 * 60;
    const slotsBeforeEightAm = minsFromStartToEightAm / SLOT_DURATION_MIN;
    const pxBeforeEightAm = slotsBeforeEightAm * SLOT_HEIGHT_PX;
    scrollContainerRef.current?.scrollTo({
      top: pxBeforeEightAm,
    });
  }, []);

  const halfHourSlots = getHalfHourSlots();
  const eventsByDay: CalendarEvent[][] = Array.from({ length: 7 }, () => []);

  for (const event of events) {
    const startDate = new Date(event.start);
    eventsByDay[startDate.getDay()].push(event);
  }

  const now = new Date();
  const nowTopOffsetPx = getTopOffset(now);

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>Week Calendar: Part 1</h2>

      <div className={styles.calendar}>
        <div className={styles.header}>
          <div />
          {daysOfWeek.slice(0, 7).map((day) => {
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
        <div className={styles.weekGrid} ref={scrollContainerRef}>
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
          {eventsByDay.map((events, d) => {
            const dayIsToday = now.getDay() === d;
            const clusters = getClusters(events);
            const clusterLanes = clusters.map((cluster) =>
              getClusterLanes(cluster),
            );

            return (
              <div className={styles.column}>
                {halfHourSlots.map((_, s) => {
                  return <div key={s} className={styles.halfHourSlot}></div>;
                })}
                {clusterLanes.map((clusterLane) => {
                  return clusterLane.map((lane, l) => {
                    return lane.map((laneEvent) => {
                      const randomBg = randomRgba();

                      const widthPx = COLUMN_WIDTH_PX / clusterLane.length;
                      const leftOffsetPx = l * widthPx;

                      const startDate = new Date(laneEvent.start);
                      const topOffsetPx = getTopOffset(startDate);

                      const endDate = new Date(laneEvent.end);
                      const bottomOffsetPx = getTopOffset(endDate);

                      const durationMin =
                        (endDate.getTime() - startDate.getTime()) / MS_IN_MIN;
                      const height = bottomOffsetPx - topOffsetPx;

                      return (
                        <div
                          className={styles.event}
                          style={
                            {
                              "--height": `${height}px`,
                              "--width": `${widthPx}px`,
                              "--top": `${topOffsetPx}px`,
                              "--left": `${leftOffsetPx}px`,
                              "--bg": randomBg,
                            } as CSSProperties
                          }
                        >
                          <h4>{laneEvent.title}</h4>
                          <div>{durationMin} mins</div>
                        </div>
                      );
                    });
                  });
                })}
                {dayIsToday && (
                  <div
                    className={styles.todayLine}
                    style={{
                      top: `${nowTopOffsetPx}px`,
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
