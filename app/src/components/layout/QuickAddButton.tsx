import { ActionIcon } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

// Shared floating "Add" action for every list-style panel (Guests, Outfits,
// Documents, Tasks, etc). Plain fixed-position element rather than
// Mantine's <Affix> so the bottom offset can safely be a calc() expression —
// it clears the fixed bottom nav (~58px of content) plus the nav's own
// safe-area padding, plus a visible gap. Previously every panel positioned
// this at bottom:24 directly against the viewport edge, which sat
// underneath/overlapping the nav on short viewports.
export function QuickAddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(58px + env(safe-area-inset-bottom) + 16px)',
        right: 24,
        zIndex: 200,
      }}
    >
      <ActionIcon size={56} radius="xl" onClick={onClick} aria-label={label}>
        <IconPlus size={26} />
      </ActionIcon>
    </div>
  )
}
