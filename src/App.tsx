import { BugReportForm, RegisterForm } from '@/components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePreference } from '@/hooks'
import { PageLayout } from '@/layouts'
import { ThemeContextProvider } from '@/providers'
import { delay } from '@/utilities'

type TabName = 'bug' | 'register'

type Tab = {
  value: TabName
  title: string
  renderContent: () => React.JSX.Element
}

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

function App() {
  const [selectedTab, setSelectedTab] = usePreference<TabName>(
    'selectedTab',
    TABS[0].value,
  )

  return (
    <ThemeContextProvider>
      <PageLayout>
        <Tabs value={selectedTab} className="gap-4">
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => {
                  setSelectedTab(tab.value)
                }}
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.renderContent()}
            </TabsContent>
          ))}
        </Tabs>
      </PageLayout>
    </ThemeContextProvider>
  )
}

export { App }
