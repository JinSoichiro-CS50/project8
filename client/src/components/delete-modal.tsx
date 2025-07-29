import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Person } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
}

export default function DeleteModal({ open, onOpenChange, person }: DeleteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/people/${person?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Success", description: "Person deleted successfully!" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete person", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (person) {
      deleteMutation.mutate();
    }
  };

  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Delete Person</DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <strong>{person.firstName} {person.lastName}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
