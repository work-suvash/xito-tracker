import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id } as any); // Type workaround
    refetch();
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync({});
    refetch();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_due': return <DollarSign className="h-5 w-5 text-amber-500" />;
      case 'deadline': return <Clock className="h-5 w-5 text-red-500" />;
      case 'wedding_upcoming': return <Calendar className="h-5 w-5 text-primary" />;
      case 'delivery_pending': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <PageTransition>
    <FadeList className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">You have {unreadCount} unread messages.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No new notifications to display.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'opacity-70 bg-background' : 'bg-muted/30'}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  notification.isRead ? 'bg-muted' : 'bg-background shadow-sm border'
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                      {notification.title || notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {notification.title && (
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  )}
                  
                  {(notification.clientName || notification.dueDate) && (
                    <div className="flex items-center gap-2 mt-2">
                      {notification.clientName && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {notification.clientName}
                        </Badge>
                      )}
                      {notification.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Due: {new Date(notification.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {!notification.isRead && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-8 w-8 rounded-full"
                    onClick={() => handleMarkRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </FadeList>
    </PageTransition>
  );
}
