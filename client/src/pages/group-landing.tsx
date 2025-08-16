import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  Calendar, 
  Phone,
  Shield,
  Loader2,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

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
  const [step, setStep] = useState<"landing" | "phone" | "otp" | "onboarding">("landing");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch group landing data
  const { data: groupData, isLoading: groupLoading } = useQuery<GroupLandingData>({
    queryKey: ["/api/groups/registration", registrationId],
    enabled: !!registrationId
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      return apiRequest("/api/auth/send-otp", "POST", { phoneNumber: phone });
    },
    onSuccess: () => {
      setStep("otp");
      setError("");
    },
    onError: (error: any) => {
      setError(error.message || "Failed to send OTP");
    }
  });

  // Register with OTP mutation
  const registerMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      return apiRequest("/api/auth/register-with-otp", "POST", {
        phoneNumber: phone,
        otp,
        role: "member"
      });
    },
    onSuccess: (data: any) => {
      // Store user data and redirect to onboarding
      localStorage.setItem("user", JSON.stringify(data.user));
      setStep("onboarding");
    },
    onError: (error: any) => {
      setError(error.message || "Failed to verify OTP");
    }
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return apiRequest(`/api/groups/${groupId}/join`, "POST", { userId: user.id });
    },
    onSuccess: () => {
      // Redirect to member dashboard
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      setError(error.message || "Failed to join group");
    }
  });

  const handleJoinGroup = () => {
    setStep("phone");
    setError("");
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError("Please enter the OTP code");
      return;
    }
    registerMutation.mutate({ phone: phoneNumber, otp: otpCode });
  };

  const handleCompleteOnboarding = () => {
    if (groupData) {
      joinGroupMutation.mutate(groupData.group.id);
    }
  };

  const calculateProgress = () => {
    if (!groupData) return 0;
    const collected = parseFloat(groupData.totalCollected || "0");
    const target = parseFloat(groupData.totalTarget || "1");
    return Math.min((collected / target) * 100, 100);
  };

  const getDaysLeft = () => {
    if (!groupData?.projects[0]?.deadline) return 0;
    const deadline = new Date(groupData.projects[0].deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-nigerian-green" />
          <span>Loading group...</span>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold mb-2">Group Not Found</h1>
            <p className="text-gray-600 mb-4">The group link you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header with Logo */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-nigerian-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kontrib</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Group Contributions Made Easy</p>
        </div>

        {step === "landing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-nigerian-green" />
                {groupData.group.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Group Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goal Amount</span>
                  <span className="font-semibold text-nigerian-green">
                    {formatNaira(groupData.totalTarget)}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">
                      {formatNaira(groupData.totalCollected)} raised
                    </span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    {calculateProgress().toFixed(0)}% complete
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Deadline</span>
                  </div>
                  <Badge variant={getDaysLeft() < 7 ? "destructive" : "secondary"}>
                    {getDaysLeft()} days left
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Members</span>
                  </div>
                  <span className="text-sm font-medium">{groupData.memberCount}</span>
                </div>
              </div>

              {groupData.group.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {groupData.group.description}
                  </p>
                </div>
              )}

              <Button 
                onClick={handleJoinGroup}
                className="w-full bg-nigerian-green hover:bg-forest-green"
                size="lg"
                data-testid="join-group-button"
              >
                Join Group
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "phone" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-nigerian-green" />
                Enter Your Phone Number
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">WhatsApp Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="phone-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you an OTP via SMS to verify your number
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("landing")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="flex-1 bg-nigerian-green hover:bg-forest-green"
                  data-testid="send-otp-button"
                >
                  {sendOtpMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send OTP
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-nigerian-green" />
                Verify Your Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  data-testid="otp-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  OTP sent to {phoneNumber}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("phone")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyOtp}
                  disabled={registerMutation.isPending}
                  className="flex-1 bg-nigerian-green hover:bg-forest-green"
                  data-testid="verify-otp-button"
                >
                  {registerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "onboarding" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Welcome to {groupData.group.name}!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium mb-2">
                  You've successfully joined the group!
                </p>
                <p className="text-green-600 text-sm">
                  Your contribution status: <span className="font-medium text-red-600">Not Paid</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Group Purpose</h4>
                  <p className="text-sm text-gray-600">
                    {groupData.group.description || "Contributing together towards our shared goals."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">TARGET AMOUNT</Label>
                    <p className="font-semibold text-nigerian-green">
                      {formatNaira(groupData.totalTarget)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">DEADLINE</Label>
                    <p className="font-semibold">
                      {getDaysLeft()} days left
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">PROGRESS</Label>
                  <Progress value={calculateProgress()} className="h-2 mt-1" />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNaira(groupData.totalCollected)} of {formatNaira(groupData.totalTarget)} raised
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleCompleteOnboarding}
                disabled={joinGroupMutation.isPending}
                className="w-full bg-nigerian-green hover:bg-forest-green"
                size="lg"
                data-testid="complete-onboarding-button"
              >
                {joinGroupMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}