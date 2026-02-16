/**
 * Budgets Page
 *
 * CONCEPT: Displays all budget categories with spending progress,
 * donut charts, and latest transactions. Built second in the page
 * order as per the implementation plan.
 *
 * Features:
 * - Summary donut chart showing all spending (desktop sidebar)
 * - Budget cards with individual donut charts
 * - Latest 3 transactions per budget category
 * - "See All" links to filtered transactions page
 * - Add/Edit/Delete budget modals
 * - Empty state when no budgets exist
 *
 * Layout:
 * - Mobile: Single column with summary on top
 * - Desktop: Two columns - summary left, budget cards right
 */

import * as React from 'react';
import { useBudgets } from '@/queryHooks';
import type { Budget } from '@/lib/api';
import { Button } from '@/components/ui';
import { ErrorState } from '@/components';
import {
  BudgetCard,
  BudgetSpendingSummary,
  AddBudgetForm,
  EditBudgetForm,
  DeleteBudgetModal,
} from '@/components/features/Budgets';

export function BudgetsPage() {
  const { data, isLoading, error, refetch } = useBudgets();

  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedBudget, setSelectedBudget] = React.useState<Budget | null>(null);

  const budgets = data?.data.budgets ?? [];

  // Get used categories and themes to prevent duplicates
  const usedCategories = budgets.map((b) => b.category);
  const usedThemes = budgets.map((b) => b.theme);

  // Handlers
  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditOpen(true);
  };

  const handleDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0" role="status" aria-live="polite" aria-busy="true">
        <div className="flex items-center justify-between">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
            Budgets
          </h1>
        </div>
        <span className="sr-only">Loading budgets...</span>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Skeleton for summary */}
          <div className="lg:w-[350px] shrink-0">
            <div className="rounded-xl bg-white p-6 shadow-sm animate-pulse">
              <div className="w-60 h-60 mx-auto bg-[var(--color-beige-100)] rounded-full" />
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-[var(--color-beige-100)] rounded w-1/2" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-[var(--color-beige-100)] rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Skeleton for cards */}
          <div className="flex-1 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl bg-white p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-[var(--color-beige-100)] rounded w-1/3 mb-4" />
                <div className="h-40 bg-[var(--color-beige-100)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Budgets
        </h1>
        <ErrorState
          error={error}
          title="Error loading budgets"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
            Budgets
          </h1>
          <Button onClick={() => setIsAddOpen(true)}>+ Add New Budget</Button>
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-grey-900)] mb-2">
            No budgets yet
          </h2>
          <p className="text-[var(--color-grey-500)] mb-6 max-w-md mx-auto">
            Start tracking your spending by creating a budget. Budgets help you
            monitor spending in specific categories.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>Create Your First Budget</Button>
        </div>

        {/* Add Budget Modal */}
        <AddBudgetForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          usedCategories={usedCategories}
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
          Budgets
        </h1>
        <Button onClick={() => setIsAddOpen(true)}>+ Add New Budget</Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Spending Summary (desktop sticky) */}
        <div className="lg:w-[350px] shrink-0">
          <div className="lg:sticky lg:top-8">
            <BudgetSpendingSummary budgets={budgets} />
          </div>
        </div>

        {/* Right Column: Budget Cards */}
        <div className="flex-1 space-y-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => handleDelete(budget)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddBudgetForm
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        usedCategories={usedCategories}
        usedThemes={usedThemes}
      />

      <EditBudgetForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        budget={selectedBudget}
        usedThemes={usedThemes}
      />

      <DeleteBudgetModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        budget={selectedBudget}
      />
    </div>
  );
}
