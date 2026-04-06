"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Event } from "@/types/events";

interface CalendarProps {
  events: Event[];
  onEventClick: (event: any) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const calendarEvents = events.map((event) => ({id: event.id.toString(), title: "Event N°"+event.id, start: event.start_date, end: event.end_date, extendedProps: event}));
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"}}
      events={calendarEvents}
      eventClick={onEventClick}
      height="auto"
    />
  );
};
export default Calendar;