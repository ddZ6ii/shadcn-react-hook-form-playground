import { BugReportForm } from '@/components'
import { PageLayout } from '@/layouts'
import { ThemeContextProvider } from '@/providers'

function App() {
  return (
    <ThemeContextProvider>
      <PageLayout>
        <BugReportForm />
      </PageLayout>
    </ThemeContextProvider>
  )
}

export { App }
