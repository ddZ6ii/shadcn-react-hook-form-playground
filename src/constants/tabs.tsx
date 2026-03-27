import { BugReportForm, RegisterForm } from '@/components'
import type { Tab } from '@/types'
import { delay } from '@/utilities'

const onBugReportSubmit = async (data: unknown): Promise<void> => {
  console.log('Bug report submitted with:', data)
  await delay()
}

const onRegisterSubmit = async (data: unknown): Promise<void> => {
  console.log('Registration form submitted with:', data)
  await delay()
}

const TABS: Tab[] = [
  {
    value: 'bug',
    title: 'Bug Report',
    renderContent: () => <BugReportForm onSubmit={onBugReportSubmit} />,
  },
  {
    value: 'register',
    title: 'Register',
    renderContent: () => <RegisterForm onSubmit={onRegisterSubmit} />,
  },
]

export { TABS }
