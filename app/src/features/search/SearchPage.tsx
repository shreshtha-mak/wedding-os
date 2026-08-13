import { useState } from 'react'
import { ActionIcon, Center, Group, Loader, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { IconArrowLeft, IconSearch } from '@tabler/icons-react'
import { useDebouncedValue } from '@mantine/hooks'
import { useNavigate } from 'react-router-dom'
import { useSearch } from './api'

export function SearchPage() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [debounced] = useDebouncedValue(term, 300)
  const { data: results, isFetching } = useSearch(debounced)

  const groups = results?.reduce<Record<string, typeof results>>((acc, r) => {
    ;(acc[r.type] ??= []).push(r)
    return acc
  }, {})

  return (
    <Stack p="md" pb={96} gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} aria-label="Back">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3}>Search</Title>
      </Group>

      <TextInput
        placeholder="Search everything..."
        leftSection={<IconSearch size={16} />}
        autoFocus
        value={term}
        onChange={(e) => setTerm(e.currentTarget.value)}
      />

      {isFetching && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}

      {term.trim().length >= 2 && !isFetching && results?.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No results for "{term}".
        </Text>
      )}

      {term.trim().length > 0 && term.trim().length < 2 && (
        <Text c="dimmed" size="sm">
          Keep typing...
        </Text>
      )}

      <Stack gap="md">
        {groups &&
          Object.entries(groups).map(([type, items]) => (
            <Stack key={type} gap={4}>
              <Text size="sm" fw={600} c="dimmed">
                {type}
              </Text>
              {items.map((item) => (
                <UnstyledButton key={`${item.type}-${item.id}`} onClick={() => navigate(item.linkTo)}>
                  <Text
                    size="sm"
                    py={6}
                    style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
                  >
                    {item.label}
                  </Text>
                </UnstyledButton>
              ))}
            </Stack>
          ))}
      </Stack>
    </Stack>
  )
}
