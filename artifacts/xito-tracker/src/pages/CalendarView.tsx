import { useState } from "react";
import { useGetUpcomingEvents } from "@workspace/api-client-react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Camera, DollarSign } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: events, isLoading } = useGetUpcomingEvents();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Get days to pad the start and end of the grid to make it 7 columns
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const endDate = new Date(monthEnd);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (date: Date) => {
    if (!events) return [];
    return events.filter(e => isSameDay(new Date(e.date), date));
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'wedding': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'deadline': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'delivery': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'payment': return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <PageTransition>
    <FadeList className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Schedule and deadlines.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={today}>Today</Button>
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-32 text-center font-medium text-sm">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Calendar Grid */}
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
            {dateRange.map((date, i) => {
              const dayEvents = getDayEvents(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              
              return (
                <div 
                  key={i} 
                  className={`min-h-[100px] border-b border-r border-border p-2 transition-colors hover:bg-muted/10 ${
                    !isCurrentMonth ? 'bg-muted/5' : ''
                  } ${i % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                      isToday(date) ? 'bg-primary text-primary-foreground' : 
                      !isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'
                    }`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`text-[10px] px-1.5 py-1 rounded truncate border cursor-pointer hover:opacity-80 transition-opacity ${getEventStyle(event.type)}`}
                        title={`${event.title} - ${event.clientName}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sidebar */}
        <Card className="w-full lg:w-80 flex flex-col min-h-0">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!events || events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center min-w-[40px]">
                      <span className="text-xs font-semibold text-primary">{format(new Date(event.date), 'MMM')}</span>
                      <span className="text-lg font-bold">{format(new Date(event.date), 'dd')}</span>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg border ${getEventStyle(event.type)} bg-opacity-10 border-opacity-20`}>
                      <p className="text-sm font-semibold mb-1">{event.title}</p>
                      <p className="text-xs opacity-90">{event.clientName || event.projectName}</p>
                      <div className="flex items-center gap-1 mt-2 text-[10px] opacity-80 font-medium">
                        {event.daysUntil === 0 ? 'Today' : `In ${event.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeList>
    </PageTransition>
  );
}
