import { Component, type ReactNode } from 'react'
import { Button, Center, Stack, Text, Title } from '@mantine/core'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Without this, any uncaught render error (a bug, an unexpected null, a
// malformed record) crashes to a blank white screen with no way back short
// of the user knowing to reload. Keyed by route in AppLayout so navigating
// away from a broken page recovers automatically.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center style={{ minHeight: '60vh' }} p="md">
          <Stack align="center" gap="sm">
            <Title order={4}>Something went wrong</Title>
            <Text c="dimmed" size="sm" ta="center">
              Try reloading, or go back and try again.
            </Text>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </Stack>
        </Center>
      )
    }
    return this.props.children
  }
}
