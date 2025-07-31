import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, X, Eye } from "lucide-react";
import type { ContributionWithDetails, User } from "@shared/schema";

interface PaymentApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contribution: ContributionWithDetails | null;
  currentUser: User | null;
}

export function PaymentApprovalModal({ 
  open, 
  onOpenChange, 
  contribution,
  currentUser 
}: PaymentApprovalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmContributionMutation = useMutation({
    mutationFn: async () => {
      if (!contribution) throw new Error("No contribution to confirm");
      
      const response = await apiRequest("PATCH", `/api/contributions/${contribution.id}/confirm`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Confirmed",
        description: "The contribution has been confirmed and added to the project total.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      onOpenChange(false);
      setIsConfirming(false);
    },
    onError: (error) => {
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm the contribution. Please try again.",
        variant: "destructive",
      });
      setIsConfirming(false);
    },
  });

  const handleConfirm = () => {
    setIsConfirming(true);
    confirmContributionMutation.mutate();
  };

  if (!contribution) return null;

  const isAdmin = currentUser?.role === "admin";
  const canConfirm = isAdmin && contribution.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Contributor</p>
                <p className="font-semibold">{contribution.userName}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold text-green-600">{formatNaira(contribution.amount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Project</p>
                <p className="font-semibold">{contribution.projectName || contribution.groupName}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <Badge 
                  className={
                    contribution.status === "confirmed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-orange-100 text-orange-800"
                  }
                >
                  {contribution.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {(contribution.transactionRef || contribution.description) && (
            <div className="space-y-3">
              <h4 className="font-medium">Transaction Details</h4>
              {contribution.transactionRef && (
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {contribution.transactionRef}
                  </p>
                </div>
              )}
              {contribution.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm">{contribution.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Proof of Payment */}
          {contribution.proofOfPayment && (
            <div className="space-y-3">
              <h4 className="font-medium">Proof of Payment</h4>
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Payment receipt uploaded</span>
                </div>
                {contribution.proofOfPayment.startsWith('data:image') && (
                  <img 
                    src={contribution.proofOfPayment} 
                    alt="Proof of payment" 
                    className="mt-3 max-w-full h-auto rounded border"
                  />
                )}
              </div>
            </div>
          )}

          {/* Submission Date */}
          <div>
            <p className="text-sm text-gray-600">
              Submitted on {new Date(contribution.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!isAdmin && (
              <div className="text-sm text-gray-600 flex-1">
                <p>You can review this payment but only admins can confirm it.</p>
              </div>
            )}
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            
            {canConfirm && (
              <Button 
                onClick={handleConfirm}
                disabled={isConfirming || confirmContributionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isConfirming || confirmContributionMutation.isPending ? (
                  "Confirming..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}