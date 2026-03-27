import { lazy, Suspense } from 'react'

import { BugReportFormSkeleton } from '@/bug-report/components'
import type { Tab } from '@/shared/types'
import { RegisterFormSkeleton } from '@/register/components'
import { ExpenseTrackerSkeleton } from '@/expense-tracker/components'
import { delay } from '@/shared/utilities'

// Lazy load the form components (requires a dynamic import that resolves to a module with a default export).
// This works here because Radix TabsContent unmounts inactive tabs by default (no forceMount)
// so each form only loads when its tab is first activated — not on initial page load.
const BugReportForm = lazy(
  () => import('@/bug-report/components/bug-report-form'),
)
const RegisterForm = lazy(() => import('@/register/components/register-form'))
const ExpenseTrackerForm = lazy(
  () => import('@/expense-tracker/components/expense-tracker-form'),
)

const TABS: Tab[] = [
  {
    value: 'bug',
    title: 'Bug Report',
    renderContent: () => (
      <Suspense fallback={<BugReportFormSkeleton />}>
        <BugReportForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Bug report submitted with:', data)
            await delay()
          }}
        />
      </Suspense>
    ),
  },
  {
    value: 'register',
    title: 'Register',
    renderContent: () => (
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Registration form submitted with:', data)
            await delay()
          }}
        />
      </Suspense>
    ),
  },
  {
    value: 'expense-tracker',
    title: 'Expense Tracker',
    renderContent: () => (
      <Suspense fallback={<ExpenseTrackerSkeleton />}>
        <ExpenseTrackerForm
          onSubmit={async (data: unknown): Promise<void> => {
            console.log('Expense tracker form submitted with:', data)
            await delay()
          }}
        />
      </Suspense>
    ),
  },
]

export { TABS }
