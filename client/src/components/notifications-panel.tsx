import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { PaymentApprovalModal } from "@/components/payment-approval-modal";
import type { Notification, ContributionWithDetails, User } from "@shared/schema";

interface NotificationsPanelProps {
  currentUser: User | null;
}

export function NotificationsPanel({ currentUser }: NotificationsPanelProps) {
  const queryClient = useQueryClient();
  const [selectedContribution, setSelectedContribution] = useState<ContributionWithDetails | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: contributions = [] } = useQuery<ContributionWithDetails[]>({
    queryKey: ["/api/contributions", "admin", currentUser?.id],
    enabled: !!currentUser?.id && currentUser?.role === "admin",
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const paymentNotifications = notifications.filter(n => n.type === "payment_submitted");

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // If it's a payment notification, open the approval modal
    if (notification.contributionId) {
      const contribution = contributions.find(c => c.id === notification.contributionId);
      if (contribution) {
        setSelectedContribution(contribution);
        setApprovalModalOpen(true);
      }
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
              
              {notifications.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full">
                  View All Notifications
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentApprovalModal
        open={approvalModalOpen}
        onOpenChange={setApprovalModalOpen}
        contribution={selectedContribution}
        currentUser={currentUser}
      />
    </>
  );
}