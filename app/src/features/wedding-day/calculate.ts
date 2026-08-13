import dayjs, { type Dayjs } from 'dayjs'
import type { EventRow } from '../../types/database'

// No explicit end_time on most seeded events (they're "5 PM onwards" style)
// — fall back to a reasonable default duration rather than treating an
// open-ended event as instantaneous.
const DEFAULT_DURATION_HOURS = 4

export type EventDayStatus = 'upcoming' | 'active' | 'completed'

export interface CurrentEventState {
  event: EventRow
  status: EventDayStatus
  countdownLabel: string
}

function eventStart(event: EventRow): Dayjs | null {
  if (!event.start_time) return null
  return dayjs(`${event.event_date}T${event.start_time}`)
}

// Capped at the next same-day event's start (when there is one) — same-day
// weddings functions often run back-to-back closer than the 4h default
// (e.g. Mandva Havan 5PM into Sangeet 7PM), so without this cap two
// "active" windows can overlap and the wrong event gets shown as current.
function eventEnd(event: EventRow, nextEventToday: EventRow | undefined): Dayjs | null {
  const start = eventStart(event)
  if (!start) return null
  const fallbackEnd = event.end_time
    ? dayjs(`${event.event_date}T${event.end_time}`)
    : start.add(DEFAULT_DURATION_HOURS, 'hour')

  const nextStart = nextEventToday ? eventStart(nextEventToday) : null
  if (nextStart && nextStart.isBefore(fallbackEnd)) return nextStart
  return fallbackEnd
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} to go`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'} to go`
}

// Automatic mode detection — spec: "the user should not need to manually
// switch modes." Wedding Day Mode activates for the whole calendar day of
// any event, not just a narrow window right before it starts, so someone
// opening the app the morning of Haldi sees it immediately.
export function getCurrentEventState(events: EventRow[], now: Dayjs = dayjs()): CurrentEventState | null {
  const today = now.format('YYYY-MM-DD')
  const todaysEvents = events
    .filter((e) => e.event_date === today)
    .sort((a, b) => (a.start_time ?? '00:00').localeCompare(b.start_time ?? '00:00'))

  if (todaysEvents.length === 0) return null

  for (let i = 0; i < todaysEvents.length; i++) {
    const event = todaysEvents[i]
    const start = eventStart(event)
    const end = eventEnd(event, todaysEvents[i + 1])
    if (start && end && !now.isBefore(start) && now.isBefore(end)) {
      return { event, status: 'active', countdownLabel: 'Happening now' }
    }
  }

  for (const event of todaysEvents) {
    const start = eventStart(event)
    if (start && now.isBefore(start)) {
      return { event, status: 'upcoming', countdownLabel: formatCountdown(start.diff(now, 'minute')) }
    }
  }

  return { event: todaysEvents[todaysEvents.length - 1], status: 'completed', countdownLabel: 'Wrapped up' }
}
