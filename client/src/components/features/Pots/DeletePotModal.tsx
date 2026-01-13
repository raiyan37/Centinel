/**
 * Delete Pot Modal Component
 *
 * CONCEPT: A confirmation dialog for deleting a pot.
 * Shows warning that money will be returned to balance.
 *
 * Important: When a pot is deleted, all money in the pot
 * is returned to the user's current balance.
 *
 * Usage:
 *   <DeletePotModal
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     pot={selectedPot}
 *   />
 */

import { useDeletePot } from '@/queryHooks';
import type { Pot } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';

interface DeletePotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
}

export function DeletePotModal({
  open,
  onOpenChange,
  pot,
}: DeletePotModalProps) {
  const deletePot = useDeletePot();

  const handleDelete = async () => {
    if (!pot) return;

    try {
      await deletePot.mutateAsync(pot._id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete pot:', error);
    }
  };

  if (!pot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete '{pot.name}'?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this pot? This action cannot be
            reversed, and all the data inside it will be removed forever.
            {pot.total > 0 && (
              <>
                {' '}
                The {formatCurrency(pot.total)} currently in this pot will be
                returned to your balance.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePot.isPending}
            className="w-full"
          >
            {deletePot.isPending ? 'Deleting...' : 'Yes, Confirm Deletion'}
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
