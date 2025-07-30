import { Group, GroupWithStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Settings, Users } from "lucide-react";
import { formatNaira, calculateProgress } from "@/lib/currency";

interface GroupCardProps {
  group: GroupWithStats;
  isAdmin?: boolean;
  onManage?: (group: Group) => void;
  onShare?: (group: Group) => void;
  onMakePayment?: (group: Group) => void;
  userContribution?: string;
}

export function GroupCard({ 
  group, 
  isAdmin = false, 
  onManage, 
  onShare, 
  onMakePayment,
  userContribution 
}: GroupCardProps) {
  const progress = calculateProgress(group.collectedAmount, group.targetAmount);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-semibold text-gray-900">{group.name}</h4>
              <Badge className={getStatusColor(group.status)}>
                {group.status}
              </Badge>
            </div>
            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">
              {isAdmin ? "Members" : userContribution ? "My Contribution" : "Members"}
            </p>
            <p className="font-semibold">
              {isAdmin ? group.memberCount : userContribution ? formatNaira(userContribution) : group.memberCount}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Target</p>
            <p className="font-semibold">{formatNaira(group.targetAmount)}</p>
          </div>
          <div>
            <p className="text-gray-600">Collected</p>
            <p className="font-semibold text-green-600">{formatNaira(group.collectedAmount)}</p>
          </div>
          <div>
            <p className="text-gray-600">Progress</p>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs font-medium">{progress}%</span>
            </div>
          </div>
        </div>

        {isAdmin && group.pendingPayments > 0 && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <Users className="inline h-4 w-4 mr-1" />
              {group.pendingPayments} pending payments
            </p>
          </div>
        )}

        {isAdmin && group.customSlug && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-1">Custom URL for sharing:</p>
            <p className="text-sm font-mono text-blue-600 bg-white px-2 py-1 rounded">
              kontrib.app/{group.customSlug}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          {isAdmin ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare?.(group)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManage?.(group)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onMakePayment?.(group)}
              className="flex-1 bg-nigerian-green hover:bg-forest-green"
            >
              Make Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
