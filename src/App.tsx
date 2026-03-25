import { PageLayout } from '@/layouts'
import { ThemeContextProvider } from '@/providers'

function App() {
  return (
    <ThemeContextProvider>
      <PageLayout />
    </ThemeContextProvider>
  )
}

export { App }
