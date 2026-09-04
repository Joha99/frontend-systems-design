/**
 * Calendar Month View
 *
 * Build a month-view calendar that displays days in a grid and supports navigation.
 *
 * Requirements:
 * 1. Display the current month as a 7-column grid (Sun-Sat headers).
 * 2. Calculate and render the correct number of day cells:
 *    - How many days in the current month?
 *    - What day of the week does the 1st fall on? (determines leading empty cells)
 *    - How many trailing empty cells to complete the last row?
 * 3. Prev/Next buttons navigate between months. Display "Month YYYY" as the header.
 * 4. Today's date is highlighted.
 * 5. Clicking a day selects it (highlighted differently from today).
 * 6. Show events on specific days. Hardcode 5-10 events with { date, title, color }.
 *    Days with events show a small colored dot. Clicking a day with events shows
 *    the event list below the calendar.
 * 7. Week number column on the left: calculate ISO week numbers for each row.
 *    Week 1 is the week containing the first Thursday of the year.
 *
 * Math focus:
 * - Days in month: new Date(year, month + 1, 0).getDate()
 * - First day offset: new Date(year, month, 1).getDay()
 * - Total cells needed: Math.ceil((firstDayOffset + daysInMonth) / 7) * 7
 * - Trailing empties: totalCells - firstDayOffset - daysInMonth
 * - ISO week number: involves Jan 4th rule, day-of-year calculation
 * - Month arithmetic: going from December to January increments year
 *
 * Time target: 25 minutes.
 */

import "./Calendar.css";

export const Calendar = () => {
  return <div>Calendar</div>;
};
