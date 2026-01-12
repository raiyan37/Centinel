/**
 * Pots Page
 *
 * CONCEPT: Displays all savings pots with progress toward goals.
 * Built third in the page order as per the implementation plan.
 *
 * Features:
 * - Grid of pot cards with progress bars
 * - Add/Edit/Delete pot modals
 * - Deposit/Withdraw modals with live preview
 * - Loading, error, and empty states
 * - Responsive 2-column grid on desktop
 *
 * Balance Integration:
 * - Adding money to pot: Deducts from current balance
 * - Withdrawing from pot: Adds to current balance
 * - Deleting pot: Returns all money to balance
 */

import * as React from 'react';
import { usePots } from '@/queryHooks';
import type { Pot } from '@/lib/api';
import { Button } from '@/components/ui';
import { ErrorState } from '@/components';
import {
  PotCard,
  AddPotForm,
  EditPotForm,
  DeletePotModal,
  DepositPotForm,
  WithdrawPotForm,
} from '@/components/features/Pots';

export function PotsPage() {
  const { data, isLoading, error, refetch } = usePots();

  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);
  const [selectedPot, setSelectedPot] = React.useState<Pot | null>(null);

  const pots = data?.data.pots ?? [];

  // Get used themes to prevent duplicates
  const usedThemes = pots.map((p) => p.theme);

  // Handlers
  const handleEdit = (pot: Pot) => {
    setSelectedPot(pot);
    setIsEditOpen(true);
  };

  const handleDelete = (pot: Pot) => {
    setSelectedPot(pot);
    setIsDeleteOpen(true);
  };

  const handleDeposit = (pot: Pot) => {
    setSelectedPot(pot);
    setIsDepositOpen(true);
  };

  const handleWithdraw = (pot: Pot) => {
    setSelectedPot(pot);
    setIsWithdrawOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0" role="status" aria-live="polite" aria-busy="true">
        <div className="flex items-center justify-between">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
            Pots
          </h1>
        </div>
        <span className="sr-only">Loading pots...</span>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-4 h-4 bg-[var(--color-beige-100)] rounded-full" />
                <div className="h-6 bg-[var(--color-beige-100)] rounded w-1/3" />
              </div>
              <div className="h-10 bg-[var(--color-beige-100)] rounded w-1/2 mb-4" />
              <div className="h-2 bg-[var(--color-beige-100)] rounded-full mb-3" />
              <div className="flex justify-between mb-8">
                <div className="h-4 bg-[var(--color-beige-100)] rounded w-16" />
                <div className="h-4 bg-[var(--color-beige-100)] rounded w-24" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-[var(--color-beige-100)] rounded-lg" />
                <div className="flex-1 h-10 bg-[var(--color-beige-100)] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Pots
        </h1>
        <ErrorState
          error={error}
          title="Error loading pots"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty state
  if (pots.length === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
            Pots
          </h1>
          <Button onClick={() => setIsAddOpen(true)}>+ Add New Pot</Button>
        </div>

        <div className="rounded-xl bg-white p-12 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-beige-100)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-grey-500)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-grey-900)] mb-2">
            No pots yet
          </h2>
          <p className="text-[var(--color-grey-500)] mb-6 max-w-md mx-auto">
            Start saving for your goals by creating a pot. Pots help you save
            for special purchases like vacations, gifts, or emergencies.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>Create Your First Pot</Button>
        </div>

        {/* Add Pot Modal */}
        <AddPotForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          usedThemes={usedThemes}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Pots
        </h1>
        <Button onClick={() => setIsAddOpen(true)}>+ Add New Pot</Button>
      </div>

      {/* Pot Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {pots.map((pot) => (
          <PotCard
            key={pot._id}
            pot={pot}
            onEdit={() => handleEdit(pot)}
            onDelete={() => handleDelete(pot)}
            onDeposit={() => handleDeposit(pot)}
            onWithdraw={() => handleWithdraw(pot)}
          />
        ))}
      </div>

      {/* Modals */}
      <AddPotForm
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        usedThemes={usedThemes}
      />

      <EditPotForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        pot={selectedPot}
        usedThemes={usedThemes}
      />

      <DeletePotModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        pot={selectedPot}
      />

      <DepositPotForm
        open={isDepositOpen}
        onOpenChange={setIsDepositOpen}
        pot={selectedPot}
      />

      <WithdrawPotForm
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        pot={selectedPot}
      />
    </div>
  );
}
