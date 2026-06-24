'use client'

interface GameHeaderProps {
  title: string
  subtitle: string
  connectionStatus: string
  connectionDot: 'solo' | 'host' | 'guest' | 'connecting'
  playerRoleBadge?: string | null
  onBack: () => void
  onRestart: () => void
  onStats: () => void
  onHelp: () => void
  username: string
  onUsernameChange: (val: string) => void
}

const DOT_COLORS: Record<string, string> = {
  solo: '#f59e0b',
  host: '#f59e0b',
  guest: '#4ade80',
  connecting: '#f59e0b',
}

export default function GameHeader({
  title, subtitle, connectionStatus, connectionDot, playerRoleBadge,
  onBack, onRestart, onStats, onHelp,
  username, onUsernameChange,
}: GameHeaderProps) {
  return (
    <header
      className="relative z-10 px-3 sm:px-6 py-3 sm:py-4"
      style={{
        background: 'linear-gradient(180deg, #1e1508 0%, #17120a 100%)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, var(--color-gold-dim), var(--color-gold), var(--color-gold-dim), transparent)',
      }} />

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Back + title */}
        <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onBack} className="brass-btn px-2.5 py-1.5 text-[9px] sm:text-[10px] cursor-pointer">
              <i className="fa-solid fa-arrow-left" /> Kembali
            </button>
            <div>
              <h2
                className="text-sm sm:text-base md:text-xl font-bold tracking-tight flex items-center flex-wrap gap-1.5 sm:gap-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ivory)' }}
              >
                <span>{title}</span>
                {playerRoleBadge && (
                  <span
                    className="text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm uppercase tracking-wide"
                    style={{
                      background: 'rgba(201,162,39,0.15)',
                      color: 'var(--color-gold)',
                      border: '1px solid rgba(201,162,39,0.25)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {playerRoleBadge}
                  </span>
                )}
              </h2>
              <p className="text-[9px] sm:text-[10px] hidden sm:block" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: status + controls + username */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 text-xs w-full md:w-auto mt-0.5 md:mt-0">
          {/* Username */}
          <div
            className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded flex-1 md:flex-initial max-w-[120px] sm:max-w-none"
            style={{ background: 'rgba(10,8,4,0.6)', border: '1px solid var(--color-border)' }}
          >
            <i className="fa-solid fa-user text-[8px] sm:text-[9px]" style={{ color: 'var(--color-gold-dim)' }} />
            <input
              type="text"
              placeholder="Nama"
              maxLength={12}
              value={username}
              onChange={e => onUsernameChange(e.target.value)}
              className="bg-transparent border-none text-[9px] sm:text-xs font-bold focus:outline-none w-full md:w-20"
              style={{ color: 'var(--color-ivory)', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Connection status */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 sm:py-1.5 rounded h-[28px] sm:h-[34px] whitespace-nowrap"
            style={{ background: 'rgba(10,8,4,0.6)', border: '1px solid var(--color-border)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: DOT_COLORS[connectionDot] ?? '#f59e0b',
                animation: 'pulse-green 2s infinite',
              }}
            />
            <span
              className="text-[9px] sm:text-[10px] font-bold"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {connectionStatus}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Restart */}
            <button
              onClick={onRestart}
              title="Ulangi Permainan"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded flex items-center justify-center transition-all cursor-pointer"
              style={{ border: '1px solid var(--color-border)', background: 'rgba(10,8,4,0.4)' }}
            >
              <i className="fa-solid fa-arrow-rotate-right text-xs sm:text-sm" style={{ color: 'var(--color-gold-dim)' }} />
            </button>

            {/* Stats */}
            <button
              onClick={onStats}
              title="Statistik"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded flex items-center justify-center transition-all cursor-pointer"
              style={{ border: '1px solid var(--color-border)', background: 'rgba(10,8,4,0.4)' }}
            >
              <i className="fa-solid fa-chart-simple text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {/* Help */}
            <button
              onClick={onHelp}
              title="Cara Bermain"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded flex items-center justify-center transition-all cursor-pointer"
              style={{ border: '1px solid var(--color-border)', background: 'rgba(10,8,4,0.4)' }}
            >
              <i className="fa-solid fa-circle-info text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
