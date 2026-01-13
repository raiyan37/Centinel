/**
 * Delete Budget Modal Component
 *
 * CONCEPT: A confirmation dialog for deleting a budget.
 * Shows warning message and requires explicit confirmation.
 *
 * Usage:
 *   <DeleteBudgetModal
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     budget={selectedBudget}
 *   />
 */

import { useDeleteBudget } from '@/queryHooks';
import type { Budget } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';

interface DeleteBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
}

export function DeleteBudgetModal({
  open,
  onOpenChange,
  budget,
}: DeleteBudgetModalProps) {
  const deleteBudget = useDeleteBudget();

  const handleDelete = async () => {
    if (!budget) return;

    try {
      await deleteBudget.mutateAsync(budget._id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  if (!budget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete '{budget.category}'?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this budget? This action cannot be
            reversed, and all the data inside it will be removed forever.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBudget.isPending}
            className="w-full"
          >
            {deleteBudget.isPending ? 'Deleting...' : 'Yes, Confirm Deletion'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            No, Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
