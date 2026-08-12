import { Center, Loader } from '@mantine/core'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { LoginPage } from '../features/auth/LoginPage'
import { HomePage } from '../features/home/HomePage'
import { TasksPage } from '../features/tasks/TasksPage'
import { PeoplePage } from '../features/people/PeoplePage'
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
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/people" element={<PeoplePage />} />
      </Route>
    </Routes>
  )
}
