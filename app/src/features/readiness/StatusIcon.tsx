import { IconAlertOctagon, IconAlertTriangle, IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'
import type { ReadinessLevel } from './calculate'

// Status is never colour-alone (design system §21) — pair the readiness
// level's colour with a shape/icon that stays legible without colour vision.
export function ReadinessLevelIcon({ level, size = 14 }: { level: ReadinessLevel; size?: number }) {
  switch (level) {
    case 'healthy':
      return <IconCircleCheck size={size} />
    case 'needs_attention':
      return <IconAlertTriangle size={size} />
    case 'at_risk':
      return <IconExclamationCircle size={size} />
    case 'blocked':
      return <IconAlertOctagon size={size} />
  }
}
