import { UnstyledButton, Text } from '@mantine/core'
import { IconHome, IconListCheck } from '@tabler/icons-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/tasks', label: 'Tasks', icon: IconListCheck },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
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
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
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
