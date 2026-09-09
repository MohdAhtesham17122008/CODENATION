import {
  Activity,
  AlertTriangle,
  Compass,
  MapPin,
  Radio,
  Search,
  WifiOff,
} from 'lucide-react'

const SUGGESTED_QUERIES = [
  { text: 'Show active devices', icon: Radio },
  { text: 'Show offline devices', icon: WifiOff },
  { text: 'Where are my devices?', icon: MapPin },
  { text: 'Give expedition status', icon: Compass },
  { text: 'Show recent alerts', icon: AlertTriangle },
  { text: 'Where is device P-001?', icon: Search },
  { text: 'Summarize operations', icon: Activity },
]

export default function QuickActions({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5 p-3 border-b border-[var(--line-soft)] bg-[var(--navy-950)]/40">
      <div className="w-full text-[10px] font-mono uppercase tracking-wider text-[var(--ink-low)] mb-1 flex items-center justify-between">
        <span>Quick Directives</span>
        <span className="text-[9px] text-[var(--ice-dim)]">Polar Intel</span>
      </div>
      {SUGGESTED_QUERIES.map(({ text, icon: Icon }) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] rounded bg-[var(--navy-850)] hover:bg-[var(--navy-800)] text-[var(--ink-mid)] hover:text-[var(--ice)] border border-[var(--line)] hover:border-[var(--ice-dim)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-left"
        >
          <Icon size={12} className="shrink-0 text-[var(--ice)]" />
          <span>{text}</span>
        </button>
      ))}
    </div>
  )
}
