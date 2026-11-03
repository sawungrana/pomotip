import type { Mode } from '../types'

export interface ModeUI {
  label: string
  tabActive: string
  soft: string
  solid: string
  ring: string
  btnText: string
}

export const MODE_UI: Record<Mode, ModeUI> = {
  focus: {
    label: 'Focus',
    tabActive: 'bg-coral text-paper',
    soft: 'bg-coral-soft',
    solid: 'bg-coral',
    ring: 'stroke-coral',
    btnText: 'text-paper',
  },
  short: {
    label: 'Short Break',
    tabActive: 'bg-mint text-ink',
    soft: 'bg-mint-soft',
    solid: 'bg-mint',
    ring: 'stroke-mint',
    btnText: 'text-ink',
  },
  long: {
    label: 'Long Break',
    tabActive: 'bg-peri text-paper',
    soft: 'bg-peri-soft',
    solid: 'bg-peri',
    ring: 'stroke-peri',
    btnText: 'text-paper',
  },
}

export const MODES: Mode[] = ['focus', 'short', 'long']
