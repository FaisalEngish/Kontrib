import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserMinus, UserPlus } from "lucide-react";

interface ManageAccountabilityPartnersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export function ManageAccountabilityPartnersModal({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName 
}: ManageAccountabilityPartnersModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ["/api/groups", groupId, "members"],
    enabled: open,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["/api/groups", groupId, "accountability-partners"],
    enabled: open,
  });

  const addPartnerMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/accountability-partners`, { userId });
    },
    onSuccess: () => {
      toast({
        title: "Partner Added",
        description: "Accountability partner has been added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "accountability-partners"] });
      setSelectedUserId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add accountability partner",
        variant: "destructive",
      });
    },
  });

  const removePartnerMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/groups/${groupId}/accountability-partners/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Partner Removed",
        description: "Accountability partner has been removed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "accountability-partners"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove accountability partner",
        variant: "destructive",
      });
    },
  });

  const handleAddPartner = () => {
    if (!selectedUserId) {
      toast({
        title: "No Member Selected",
        description: "Please select a member to add as accountability partner",
        variant: "destructive",
      });
      return;
    }

    addPartnerMutation.mutate(selectedUserId);
  };

  const handleRemovePartner = (userId: string) => {
    removePartnerMutation.mutate(userId);
  };

  // Filter out current accountability partners from available members
  const availableMembers = members.filter(
    (member: any) => !partners.some((partner: any) => partner.userId === member.userId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Manage Accountability Partners</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Assign up to 2 accountability partners to help manage {groupName}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Partners */}
          <div>
            <Label className="text-base font-medium">Current Partners ({partners.length}/2)</Label>
            {partners.length === 0 ? (
              <p className="text-sm text-gray-500 mt-2">No accountability partners assigned yet.</p>
            ) : (
              <div className="space-y-2 mt-3">
                {partners.map((partner: any) => (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{partner.userFullName}</p>
                      <p className="text-sm text-gray-600">@{partner.userName}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePartner(partner.userId)}
                      disabled={removePartnerMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Partner */}
          {partners.length < 2 && availableMembers.length > 0 && (
            <div>
              <Label className="text-base font-medium">Add New Partner</Label>
              <div className="flex space-x-2 mt-3">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member: any) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.user.fullName} (@{member.user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddPartner}
                  disabled={addPartnerMutation.isPending || !selectedUserId}
                  className="bg-nigerian-green hover:bg-forest-green"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {partners.length >= 2 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Maximum number of accountability partners assigned (2/2)
              </p>
            </div>
          )}

          {availableMembers.length === 0 && partners.length < 2 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                No available members to assign as accountability partners.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}