// Voice-note waveform: 30 bars, the first 12 "played" (fg1), the rest fg3.
// Heights come from data/mock/chat.ts (WAVE).

export function Waveform({ wave, played }: { wave: number[]; played: number }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, height: 24 }} aria-hidden="true">
      {wave.map((h, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: h,
            background: i < played ? 'var(--fg1)' : 'var(--fg3)',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}

/** 12px filled play triangle in a 28px ink circle (both prototypes). */
export function PlayCircle() {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        background: 'var(--fg1)',
        color: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
    </span>
  )
}
