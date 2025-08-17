import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  Calendar, 
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { formatNaira, calculateProgress } from "@/lib/currency";

interface GroupLandingData {
  group: {
    id: string;
    name: string;
    description: string;
    adminId: string;
  };
  projects: Array<{
    id: string;
    name: string;
    targetAmount: string;
    collectedAmount: string;
    deadline: string;
  }>;
  memberCount: number;
  totalTarget: string;
  totalCollected: string;
}

export default function GroupLanding() {
  const { registrationId } = useParams();
  const [, navigate] = useLocation();

  // Fetch group landing data
  const { data: groupData, isLoading: groupLoading } = useQuery<GroupLandingData>({
    queryKey: ["/api/groups/registration", registrationId],
    enabled: !!registrationId
  });

  // Calculate days remaining until earliest deadline
  const getDaysRemaining = () => {
    if (!groupData?.projects.length) return null;
    
    const earliestDeadline = groupData.projects.reduce((earliest, project) => {
      const projectDeadline = new Date(project.deadline);
      return !earliest || projectDeadline < earliest ? projectDeadline : earliest;
    }, null as Date | null);
    
    if (!earliestDeadline) return null;
    
    const now = new Date();
    const diffTime = earliestDeadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle Join Group button click
  const handleJoinGroup = () => {
    navigate("/");
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-green-600">Loading...</div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h1>
          <p className="text-gray-600">This group link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress(groupData.totalCollected, groupData.totalTarget);
  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-white">
      {/* Kontrib Logo Header */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-sm mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-2xl font-bold text-green-600">Kontrib</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* Group Name & Goal Amount */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {groupData.group.name}
          </h1>
          <div className="text-4xl font-bold text-green-600 mb-1">
            {formatNaira(groupData.totalTarget)}
          </div>
          <p className="text-gray-600 text-sm">Goal Amount</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900">Progress</span>
            <span className="text-lg font-bold text-green-600">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-4 mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Raised: {formatNaira(groupData.totalCollected)}</span>
            <span>Remaining: {formatNaira(parseInt(groupData.totalTarget) - parseInt(groupData.totalCollected))}</span>
          </div>
        </div>

        {/* Deadline Countdown */}
        {daysRemaining !== null && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-semibold text-orange-800">Deadline</span>
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-1">
              {daysRemaining}
            </div>
            <div className="text-orange-700 font-medium">
              {daysRemaining === 1 ? 'day left' : 'days left'}
            </div>
          </div>
        )}

        {/* Join Group Button */}
        <Button 
          onClick={handleJoinGroup}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-8 text-xl font-bold rounded-2xl shadow-lg mb-4"
          data-testid="button-join-group"
        >
          Join Group
        </Button>

        {/* Group Description */}
        {groupData.group.description && (
          <div className="text-center text-gray-600 text-sm px-4">
            {groupData.group.description}
          </div>
        )}
      </div>
    </div>
  );
}