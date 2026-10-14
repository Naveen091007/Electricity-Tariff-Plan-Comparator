/**
 * WattWise brand logo component.
 * Renders a custom SVG icon + wordmark.
 * size: controls the icon height in px (wordmark scales proportionally)
 * dark: true = white text (for dark backgrounds), false = navy text
 */

interface Props {
  size?: number
  dark?: boolean
  subtitle?: string
}

export default function Logo({ size = 36, dark = true, subtitle }: Props) {
  const textColor = dark ? '#ffffff' : '#0f2744'
  const subColor  = dark ? '#93c5fd' : '#64748b'

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* SVG icon: hexagon shield + lightning bolt */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer hexagon */}
        <path
          d="M20 2 L35.59 10.5 L35.59 29.5 L20 38 L4.41 29.5 L4.41 10.5 Z"
          fill="url(#ww-grad)"
        />
        {/* Inner glow ring */}
        <path
          d="M20 5 L33 13 L33 27 L20 35 L7 27 L7 13 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        {/* Lightning bolt */}
        <path
          d="M22 8 L14 22 L19.5 22 L17.5 32 L26 18 L20 18 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Subtle dot accent */}
        <circle cx="28" cy="12" r="1.8" fill="rgba(255,255,255,0.55)" />

        <defs>
          <linearGradient id="ww-grad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#1d4ed8" />
            <stop offset="50%"  stopColor="#0f2744" />
            <stop offset="100%" stopColor="#2d7d46" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <div className="leading-none">
        <div
          className="font-extrabold tracking-tight"
          style={{
            fontSize: size * 0.52,
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          Watt<span style={{ color: '#34d399' }}>Wise</span>
        </div>
        {subtitle && (
          <div
            className="font-normal mt-0.5"
            style={{ fontSize: size * 0.27, color: subColor, letterSpacing: '0.01em' }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
