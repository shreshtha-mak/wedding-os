import { HashRouter } from 'react-router-dom'
import { AppProviders } from './app/providers'
import { AppRoutes } from './app/router'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProviders>
    </ErrorBoundary>
  )
}
