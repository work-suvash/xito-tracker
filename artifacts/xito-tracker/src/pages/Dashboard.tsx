import { useState } from "react";
import { motion } from "framer-motion";
import { 
  useGetDashboardStats, 
  useListClients, 
  useGetUpcomingEvents,
  useGetMonthlyAnalytics,
  useGetProjectStatusBreakdown
} from "@workspace/api-client-react";
import { PageTransition, FadeList, FadeItem, FadeCard } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Briefcase, Camera, Video, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentClients, isLoading: clientsLoading } = useListClients({ limit: 5 } as any);
  const { data: upcomingEvents, isLoading: eventsLoading } = useGetUpcomingEvents();
  const { data: monthlyAnalytics, isLoading: analyticsLoading } = useGetMonthlyAnalytics();
  const { data: statusBreakdown, isLoading: statusLoading } = useGetProjectStatusBreakdown();

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <PageTransition>
    <FadeList className="space-y-8">
      <FadeItem>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's what's happening with your studio today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>
      </div>
      </FadeItem>
      
      {/* Stats Row */}
      <FadeList className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FadeCard>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium">+${stats?.collectedRevenue?.toLocaleString() || 0}</span> collected
                </p>
              </>
            )}
          </CardContent>
        </Card>
        </FadeCard>

        <FadeCard>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In post-production pipeline
                </p>
              </>
            )}
          </CardContent>
        </Card>
        </FadeCard>

        <FadeCard>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingDeliveries || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting final handoff
                </p>
              </>
            )}
          </CardContent>
        </Card>
        </FadeCard>

        <FadeCard>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.thisMonthBookings || 0} Bookings</div>
                <p className="text-xs text-muted-foreground mt-1">
                  New clients onboarded
                </p>
              </>
            )}
          </CardContent>
        </Card>
        </FadeCard>
      </FadeList>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and bookings for the year.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analyticsLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyAnalytics || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="monthName" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value?.substring(0, 3)}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Secondary Chart / Events */}
        <Card className="col-span-full md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Deadlines, shoots, and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : upcomingEvents?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents?.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      event.urgency === 'critical' ? 'bg-destructive/10 text-destructive' :
                      event.urgency === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {event.type === 'wedding' ? <Camera className="h-5 w-5" /> : 
                       event.type === 'payment' ? <DollarSign className="h-5 w-5" /> : 
                       <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.clientName || event.projectName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {event.daysUntil === 0 ? 'Today' : 
                         event.daysUntil === 1 ? 'Tomorrow' : 
                         `In ${event.daysUntil} days`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full text-xs" asChild>
                  <Link href="/calendar">View Full Calendar <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Clients */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Latest couples added to your studio</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
               <div className="space-y-4">
               {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
             </div>
            ) : recentClients?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No clients yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/clients">Add your first client</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClients?.map((client) => (
                  <div key={client.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/clients/${client.id}`} className="text-sm font-medium hover:underline">
                          {client.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Pipeline Donut */}
        <Card className="col-span-full md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
            <CardDescription>Active projects by status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[280px]">
            {statusLoading ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : !statusBreakdown || statusBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No active projects</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
              {statusBreakdown?.map((entry, index) => (
                <div key={entry.status} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.status}</span>
                  <span className="font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeList>
    </PageTransition>
  );
}
