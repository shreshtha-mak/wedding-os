import { Center, Loader } from '@mantine/core'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { LoginPage } from '../features/auth/LoginPage'
import { HomePage } from '../features/home/HomePage'
import { PlanningPage } from '../features/planning/PlanningPage'
import { PeopleHubPage } from '../features/people/PeopleHubPage'
import { EventsPage } from '../features/events/EventsPage'
import { EventDetailPage } from '../features/events/EventDetailPage'
import { AppLayout } from '../components/layout/AppLayout'

export function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <Center style={{ minHeight: '100svh' }}>
        <Loader />
      </Center>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/people" element={<PeopleHubPage />} />
      </Route>
    </Routes>
  )
}
