import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Person, InsertPerson, insertPersonSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

interface PersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person | null;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PersonModal({ open, onOpenChange, person }: PersonModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<InsertPerson>({
    firstName: '',
    lastName: '',
    month: null,
    day: null,
    year: null,
  });

  useEffect(() => {
    if (person) {
      setFormData({
        firstName: person.firstName,
        lastName: person.lastName,
        month: person.month,
        day: person.day,
        year: person.year,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        month: null,
        day: null,
        year: null,
      });
    }
  }, [person, open]);

  const createMutation = useMutation({
    mutationFn: (data: InsertPerson) => apiRequest("POST", "/api/people", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Success", description: "Person added successfully!" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add person", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertPerson) => apiRequest("PUT", `/api/people/${person?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({ title: "Success", description: "Person updated successfully!" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update person", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = insertPersonSchema.parse(formData);
      if (person) {
        updateMutation.mutate(validatedData);
      } else {
        createMutation.mutate(validatedData);
      }
    } catch (error) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {person ? 'Edit Person' : 'Add New Person'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <Select 
                value={formData.month || ""} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, month: value || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={formData.day || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value ? parseInt(e.target.value) : null }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="year">Year (Optional)</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.year || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : null }))}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
