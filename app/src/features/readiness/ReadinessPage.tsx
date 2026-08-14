import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconAlertTriangle, IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useNeedsAttentionData, useWeddingReadinessData } from './api'
import { computeWeddingReadiness, readinessLevelColor, readinessLevelLabel } from './calculate'
import { computeNeedsAttention } from './needsAttention'

export function ReadinessPage() {
  const navigate = useNavigate()
  const { person } = useAuth()
  const canView = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data, isLoading, isError } = useWeddingReadinessData(canView)
  const { data: attentionData } = useNeedsAttentionData(canView)
  const attentionItems = attentionData ? computeNeedsAttention(attentionData) : []

  if (!canView) {
    return (
      <Stack p="md" gap="md">
        <Text c="dimmed">You don't have access to wedding readiness.</Text>
      </Stack>
    )
  }

  const readiness = data ? computeWeddingReadiness(data) : null

  return (
    <Stack p="md" pb={96} gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} aria-label="Back">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3}>Wedding Readiness</Title>
      </Group>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load readiness data. Check your connection and try again.
        </Text>
      )}

      {readiness && !isError && (
        <>
          <Card withBorder radius="md" p="lg">
            <Group justify="space-between">
              <Title order={1}>{readiness.overallPercent ?? '—'}%</Title>
              <Badge size="lg" color={readinessLevelColor(readiness.level)} variant="light">
                {readinessLevelLabel(readiness.level)}
              </Badge>
            </Group>
          </Card>

          {readiness.blockers.length > 0 && (
            <Alert icon={<IconAlertTriangle size={16} />} color="red" title="Critical blockers">
              <Stack gap={4}>
                {readiness.blockers.map((b) => (
                  <Text key={b.id} size="sm">
                    {b.label}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          {attentionItems.length > 0 && (
            <Card withBorder radius="md" p="lg">
              <Title order={4} mb="sm">
                Needs Attention
              </Title>
              <Stack gap="xs">
                {attentionItems.map((item) => (
                  <UnstyledButton key={item.id} onClick={() => navigate(item.linkTo)} style={{ width: '100%' }}>
                    <Group gap={6} wrap="nowrap">
                      <IconAlertTriangle
                        size={14}
                        color={
                          item.severity === 'critical' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-yellow-6)'
                        }
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm">{item.label}</Text>
                        <Text size="xs" c="dimmed">
                          {item.sublabel}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>
            </Card>
          )}

          <Stack gap="sm">
            {readiness.categories.map((c) => (
              <div key={c.key}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">{c.label}</Text>
                  <Text size="sm" c="dimmed">
                    {c.percent === null ? 'No data yet' : `${c.percent}% (${c.readyCount}/${c.totalCount})`}
                  </Text>
                </Group>
                <Progress value={c.percent ?? 0} color={c.percent === null ? 'gray' : undefined} size="sm" />
              </div>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}
