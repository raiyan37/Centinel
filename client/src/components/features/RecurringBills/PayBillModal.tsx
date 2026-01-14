/**
 * Pay Bill Modal Component
 *
 * CONCEPT: A confirmation modal to mark a bill as paid.
 * Creates a new transaction for the current payment.
 *
 * When a bill is paid:
 * 1. A new transaction is created with the bill amount
 * 2. The transaction appears in the Transactions page
 * 3. The bill status updates to "paid" in Recurring Bills
 *
 * Usage:
 *   <PayBillModal
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     bill={selectedBill}
 *   />
 */

import * as React from 'react';
import { useCreateTransaction } from '@/queryHooks';
import { formatCurrency } from '@/lib/utils';
import type { RecurringBill } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';

interface PayBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: RecurringBill | null;
}

export function PayBillModal({ open, onOpenChange, bill }: PayBillModalProps) {
  const createTransaction = useCreateTransaction();
  // Default to today's date when paying bills (UTC format YYYY-MM-DD)
  const [paymentDate, setPaymentDate] = React.useState(() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  });
  const [isPaying, setIsPaying] = React.useState(false);
  
  // Use a ref to prevent double-clicks (synchronous check)
  const isPayingRef = React.useRef(false);

  // Reset date when modal opens - use bill's due day in current month
  React.useEffect(() => {
    if (open && bill) {
      // Reset the paying ref when modal opens
      isPayingRef.current = false;
      setIsPaying(false);
      
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const currentDay = now.getUTCDate();
      
      // Use the bill's due day in the current month
      // If the due day has passed, use that day; otherwise use today
      let paymentDay = bill.dueDay;
      if (paymentDay > currentDay) {
        // Due day hasn't occurred yet, use today's date
        paymentDay = currentDay;
      }
      
      // Format as YYYY-MM-DD (UTC)
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`;
      setPaymentDate(formattedDate);
    }
  }, [open, bill]);

  const handlePay = async () => {
    // Synchronous double-click prevention using ref
    if (!bill || isPayingRef.current) return;
    
    // Set ref immediately (synchronous) to prevent double-clicks
    isPayingRef.current = true;
    setIsPaying(true);
    
    try {
      await createTransaction.mutateAsync({
        name: bill.name,
        amount: bill.amount, // Already negative
        category: bill.category,
        date: paymentDate,
        recurring: true,
        avatar: bill.avatar,
        isTemplate: false, // Actual payment - affects balance
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to record payment:', error);
      // Reset ref on error so user can try again
      isPayingRef.current = false;
    } finally {
      setIsPaying(false);
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Bill</DialogTitle>
          <DialogDescription>
            Record a payment for {bill.name}. This will create a transaction
            in your transaction history and deduct the amount from your balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bill Details */}
          <div className="p-4 bg-[var(--color-beige-100)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-grey-500)]">Vendor</span>
              <span className="font-medium text-[var(--color-grey-900)]">
                {bill.name}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-grey-500)]">Amount</span>
              <span className="font-bold text-[var(--color-grey-900)]">
                {formatCurrency(Math.abs(bill.amount))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-grey-500)]">Category</span>
              <span className="text-[var(--color-grey-900)]">{bill.category}</span>
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handlePay}
            disabled={isPaying}
            className="w-full"
          >
            {isPaying ? 'Processing...' : `Pay ${formatCurrency(Math.abs(bill.amount))}`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
