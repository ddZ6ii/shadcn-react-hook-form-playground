import { lazy, Suspense } from 'react'

import {
  BugReportFormSkeleton,
  ExpenseTrackerSkeleton,
  RegisterFormSkeleton,
} from '@/components'
import type { Tab } from '@/types'
import { delay } from '@/utilities'

// Lazy load the form components (requires a dynamic import that resolves to a module with a default export).
// This works here because Radix TabsContent unmounts inactive tabs by default (no forceMount)
// so each form only loads when its tab is first activated — not on initial page load.
const BugReportForm = lazy(() => import('@/components/bug-report-form'))
const RegisterForm = lazy(() => import('@/components/register-form'))
const ExpenseTrackerForm = lazy(
  () => import('@/components/expense-tracker-form'),
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
