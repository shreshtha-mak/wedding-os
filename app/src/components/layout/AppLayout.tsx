import { UnstyledButton, Text } from '@mantine/core'
import { IconCalendarEvent, IconClipboardList, IconDots, IconHome, IconUsers } from '@tabler/icons-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { useOnlineStatus } from '../../lib/useOnlineStatus'
import { ErrorBoundary } from '../ErrorBoundary'

const BASE_TABS = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/events', label: 'Events', icon: IconCalendarEvent },
  { to: '/planning', label: 'Planning', icon: IconClipboardList },
  { to: '/people', label: 'People', icon: IconUsers },
]

export function AppLayout() {
  const location = useLocation()
  const { person } = useAuth()
  const online = useOnlineStatus()
  // More (Vendors/Budget/Menus) is entirely organiser/admin-only at the RLS
  // level, so a restricted user would land on three empty tabs — hide the
  // whole entry point rather than show a section with nothing in it.
  const canSeeMore = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const tabs = canSeeMore ? [...BASE_TABS, { to: '/more', label: 'More', icon: IconDots }] : BASE_TABS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      {!online && (
        <div
          style={{
            padding: '6px 12px',
            textAlign: 'center',
            background: 'var(--mantine-color-yellow-light)',
            fontSize: 13,
          }}
        >
          You're offline — changes won't save until you're back online.
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          borderTop: '1px solid var(--mantine-color-default-border)',
          background: 'var(--mantine-color-body)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <UnstyledButton
              key={to}
              component={NavLink}
              to={to}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 0',
                color: active
                  ? 'var(--mantine-color-blue-6)'
                  : 'var(--mantine-color-dimmed)',
              }}
            >
              <Icon size={22} />
              <Text size="xs">{label}</Text>
            </UnstyledButton>
          )
        })}
      </nav>
    </div>
  )
}
