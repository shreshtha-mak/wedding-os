import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Textarea,
  TextInput,
  createTheme,
  type MantineColorsTuple,
} from '@mantine/core'
import { DateInput, TimeInput } from '@mantine/dates'

// Wedding OS — UI Design System v1: calm, warm-neutral, editorial. Ramps
// below are HSL-interpolated from the doc's named anchor colors so every
// existing `color="green"`/`"red"`/`"yellow"`/`"blue"`/`"orange"`/`"gray"`
// call site (status badges, dots, borders, dimmed text) picks up the muted
// palette automatically — no per-file changes needed for ~80% of the visual
// shift. `accent` (#8A6F5A) is new and becomes primaryColor.
const accent: MantineColorsTuple = [
  '#F6F5F4', '#E9E5E2', '#D7D0CB', '#C2B6AD', '#AE9C8E',
  '#9C8572', '#8A6F5A', '#6D5645', '#514033', '#362A21',
]
const warmGray: MantineColorsTuple = [
  '#FBFAF8', '#F8F7F4', '#F0EEE9', '#E7E3DD', '#C3BCB3',
  '#9A958E', '#86817A', '#706C67', '#4B4744', '#252321',
]
// Success (Ready/Complete/Confirmed/Paid) — muted sage, not traffic-light green.
const success: MantineColorsTuple = [
  '#F4F6F4', '#E3E8E4', '#CDD5CE', '#B0BFB3', '#93A997',
  '#79957E', '#6B8F71', '#537058', '#3D5441', '#28372A',
]
// Warning (Needs Attention/Due Soon/Pending) — muted amber.
const warning: MantineColorsTuple = [
  '#F7F5F2', '#EDE7DE', '#DFD3C3', '#D0BBA0', '#C1A37B',
  '#B68E59', '#BC8A46', '#966C33', '#715124', '#4B3517',
]
// Critical (Blocker/Overdue/At Risk/Missing) — muted terracotta, not stop-sign red.
const critical: MantineColorsTuple = [
  '#F7F3F2', '#ECE1DF', '#DEC8C4', '#CDA7A2', '#BD877F',
  '#B1685E', '#B4574A', '#8E4238', '#6B3028', '#471F19',
]
// Informational (Draft/Pending/Confirmed-neutral) — muted slate, distinct from accent
// so the accent stays reserved for interactive emphasis (spec: "do not use
// the accent colour everywhere").
const info: MantineColorsTuple = [
  '#F4F5F6', '#E2E6E9', '#CBD2D7', '#ADB9C2', '#8FA1AD',
  '#738A9B', '#6E8A9E', '#536C7E', '#3D515F', '#27353F',
]
// "At risk" — a distinct middle severity between warning and critical, used
// by the readiness level system.
const atRisk: MantineColorsTuple = [
  '#F8F4F2', '#EDE5DE', '#E0CFC2', '#D1B59E', '#C49A79',
  '#B98256', '#C07A42', '#995F30', '#744622', '#4D2E15',
]

const fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const theme = createTheme({
  primaryColor: 'accent',
  primaryShade: { light: 6, dark: 5 },
  fontFamily,
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  defaultRadius: 'md',
  black: '#252321',
  white: '#FFFFFF',
  colors: {
    accent,
    gray: warmGray,
    green: success,
    yellow: warning,
    red: critical,
    blue: info,
    orange: atRisk,
  },
  // 8px system: xs/sm/md/lg/xl map directly onto the doc's allowed values.
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  // Near-flat by default — shadows reserved for genuinely elevated surfaces
  // (modal, dropdown, popover), never resting cards.
  shadows: {
    xs: '0 1px 2px rgba(37, 35, 33, 0.04)',
    sm: '0 2px 8px rgba(37, 35, 33, 0.05)',
    md: '0 6px 20px rgba(37, 35, 33, 0.08)',
    lg: '0 10px 28px rgba(37, 35, 33, 0.10)',
    xl: '0 16px 40px rgba(37, 35, 33, 0.12)',
  },
  headings: {
    // Sans by default everywhere — the serif (DM Serif Display) is reserved
    // for the few deliberately expressive moments (wedding title, countdown)
    // and applied directly there, not through the heading scale.
    fontFamily,
    sizes: {
      h1: { fontSize: '28px', fontWeight: '500', lineHeight: '1.2' },
      h2: { fontSize: '22px', fontWeight: '500', lineHeight: '1.25' },
      h3: { fontSize: '17px', fontWeight: '600', lineHeight: '1.3' },
      h4: { fontSize: '15px', fontWeight: '600', lineHeight: '1.3' },
      h5: { fontSize: '13px', fontWeight: '600', lineHeight: '1.35' },
      h6: { fontSize: '12px', fontWeight: '600', lineHeight: '1.35' },
    },
  },
  components: {
    Card: Card.extend({ defaultProps: { radius: 'md', withBorder: true, shadow: 'none', bg: 'white' } }),
    Button: Button.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { radius: 'sm' } }),
    Badge: Badge.extend({ defaultProps: { radius: 'xl' } }),
    Modal: Modal.extend({ defaultProps: { radius: 'md', shadow: 'lg', padding: 'lg' } }),
    TextInput: TextInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    Textarea: Textarea.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    NumberInput: NumberInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    Select: Select.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    MultiSelect: MultiSelect.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    DateInput: DateInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    TimeInput: TimeInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
  },
})
