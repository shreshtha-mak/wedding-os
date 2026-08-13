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
  Title,
  createTheme,
  type MantineColorsTuple,
} from '@mantine/core'
import { DateInput, TimeInput } from '@mantine/dates'

// Wedding OS — UI Design System v2: white + deep navy, high-contrast,
// operational. Supersedes the earlier warm-neutral palette. Ramps below are
// HSL-interpolated from the doc's named anchor colors so every existing
// `color="green"`/`"red"`/`"yellow"`/`"blue"`/`"orange"`/`"gray"`/`"accent"`
// call site picks up the new palette automatically — no per-file rewrite
// needed for most of the shift. All pass WCAG AA (several AAA) against white.
const navy: MantineColorsTuple = [
  '#F5F7FA', '#E9EEF4', '#CFDAE6', '#7CA2CB', '#316AA9',
  '#12345B', '#0B1F3A', '#091A31', '#071427', '#050F1E',
]
const blueGray: MantineColorsTuple = [
  '#FBFCFD', '#F4F7FA', '#EBF0F5', '#D7E0EA', '#B7C3D1',
  '#7E91A8', '#526173', '#3C4B5F', '#283648', '#17212F',
]
// Success (Ready/Complete/Confirmed/Paid) — dark, high-contrast green.
const success: MantineColorsTuple = [
  '#F1F8F4', '#E0F0E7', '#CFE8DA', '#9AD5B5', '#60C791',
  '#33AD6E', '#1E7A4C', '#19653F', '#134F32', '#0E3A25',
]
// Warning (Needs Attention/Due Soon/Pending) — dark amber.
const warning: MantineColorsTuple = [
  '#FBF5EB', '#F6E9D1', '#F0DEB8', '#E7C37D', '#E1A740',
  '#C3841A', '#8A5A0F', '#754B0D', '#5F3D0A', '#4A2F08',
]
// Error/Critical (Blocker/Overdue/Missing) — dark red, not stop-sign red.
const critical: MantineColorsTuple = [
  '#FBEFEE', '#F5DCD9', '#EFC9C5', '#E39C96', '#D86E65',
  '#CD3F34', '#A02D26', '#85251F', '#6A1D19', '#4F1512',
]
// "At risk" — a distinct middle severity between warning and critical for
// the 4-tier readiness system (healthy/needs_attention/at_risk/blocked).
const atRisk: MantineColorsTuple = [
  '#FBF1E9', '#F6E1CF', '#F0D3B6', '#E6B585', '#DD9653',
  '#CD7828', '#9C5A1E', '#824B18', '#683B13', '#4E2C0E',
]

const fontFamily = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const theme = createTheme({
  primaryColor: 'accent',
  primaryShade: { light: 6, dark: 5 },
  fontFamily,
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  defaultRadius: 'md',
  black: '#17212F',
  white: '#FFFFFF',
  colors: {
    accent: navy,
    gray: blueGray,
    green: success,
    yellow: warning,
    red: critical,
    orange: atRisk,
    // Info deliberately reuses the navy family rather than introducing a
    // second blue hue (spec: "the primary navy family should remain dominant").
    blue: navy,
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  // Shadows reserved for genuinely elevated surfaces (dialogs, dropdowns,
  // sheets) — resting cards are distinguished by border + white, not shadow.
  shadows: {
    xs: '0 1px 2px rgba(23, 33, 47, 0.05)',
    sm: '0 2px 8px rgba(23, 33, 47, 0.06)',
    md: '0 6px 20px rgba(23, 33, 47, 0.10)',
    lg: '0 10px 28px rgba(23, 33, 47, 0.12)',
    xl: '0 16px 40px rgba(23, 33, 47, 0.14)',
  },
  headings: {
    fontFamily,
    sizes: {
      h1: { fontSize: '28px', fontWeight: '700', lineHeight: '1.2' },
      h2: { fontSize: '22px', fontWeight: '700', lineHeight: '1.25' },
      h3: { fontSize: '17px', fontWeight: '600', lineHeight: '1.3' },
      h4: { fontSize: '15px', fontWeight: '600', lineHeight: '1.3' },
      h5: { fontSize: '13px', fontWeight: '600', lineHeight: '1.35' },
      h6: { fontSize: '12px', fontWeight: '600', lineHeight: '1.35' },
    },
  },
  components: {
    // Headings get the navy tier (§14: "Major headings... #0B1F3A"), distinct
    // from the darker blue-grey used for ordinary body text.
    Title: Title.extend({ defaultProps: { c: 'accent.6' } }),
    Card: Card.extend({ defaultProps: { radius: 'md', withBorder: true, shadow: 'none', bg: 'white' } }),
    Button: Button.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { radius: 'sm' } }),
    Badge: Badge.extend({ defaultProps: { radius: 'xl' } }),
    Modal: Modal.extend({ defaultProps: { radius: 'lg', shadow: 'lg', padding: 'lg' } }),
    TextInput: TextInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    Textarea: Textarea.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    NumberInput: NumberInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    Select: Select.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    MultiSelect: MultiSelect.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    DateInput: DateInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
    TimeInput: TimeInput.extend({ defaultProps: { radius: 'sm', size: 'md' } }),
  },
})
