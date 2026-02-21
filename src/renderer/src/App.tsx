import { QueryProvider } from '@renderer/providers/query-provider'
import { ThemeProvider } from '@renderer/providers/theme-provider'
import { I18nProvider } from '@renderer/providers/i18n-provider'
import Layout from './components/layout'
import { TooltipProvider } from './components/ui/tooltip'
import usePage from './hooks/use-page'
import { PageProvider } from './providers/page-provider'
import AppsScreen from './screens/apps'
import SettingsScreen from './screens/setting'

function AppContent() {
  const { page } = usePage()

  return (
    <Layout>
      {page === 'apps' && <AppsScreen />}
      {page === 'settings' && <SettingsScreen />}
    </Layout>
  )
}

function App(): React.JSX.Element {
  return (
    <QueryProvider>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
            <PageProvider>
              <AppContent />
            </PageProvider>
          </I18nProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryProvider>
  )
}

export default App
