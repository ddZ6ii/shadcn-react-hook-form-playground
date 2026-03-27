import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TABS } from '@/constants'
import { usePreference } from '@/hooks'
import { PageLayout } from '@/layouts'
import { ThemeContextProvider } from '@/providers'
import type { TabName } from '@/types'

function App() {
  const [selectedTab, setSelectedTab] = usePreference<TabName>(
    'selectedTab',
    TABS[0].value,
  )

  return (
    <ThemeContextProvider>
      <PageLayout>
        <Tabs value={selectedTab} className="gap-4">
          <TabsList className="mx-auto">
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
