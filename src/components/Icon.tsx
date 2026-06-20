import Svg, { Circle, Path, Rect } from 'react-native-svg'

export type IconName =
  | 'upload'
  | 'download'
  | 'lock'
  | 'close'
  | 'check'
  | 'copy'
  | 'mail'
  | 'share'
  | 'folder'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'plus'
  | 'external'
  | 'trash'
  | 'qr'
  | 'eye'
  | 'clock'
  | 'calendar'
  | 'bell'
  | 'appearance'
  | 'settings'
  | 'logout'
  | 'github'

type IconProps = {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 18, color = '#000', strokeWidth = 1.7 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'upload' && (
        <>
          <Path d="M12 16V6" {...common} />
          <Path d="M8 10l4-4 4 4" {...common} />
          <Path d="M5 18h14" {...common} />
        </>
      )}
      {name === 'download' && (
        <>
          <Path d="M12 4v12" {...common} />
          <Path d="M8 12l4 4 4-4" {...common} />
          <Path d="M5 20h14" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Path d="M7 11V8a5 5 0 0 1 10 0v3" {...common} />
          <Rect x={5} y={11} width={14} height={9} rx={2} {...common} />
        </>
      )}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} strokeWidth={1.8} />}
      {name === 'check' && <Path d="M5 12l5 5L20 6" {...common} strokeWidth={2.2} />}
      {name === 'copy' && (
        <>
          <Rect x={9} y={9} width={11} height={11} rx={2} {...common} />
          <Path d="M5 15V5a2 2 0 0 1 2-2h8" {...common} />
        </>
      )}
      {name === 'mail' && (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...common} strokeWidth={1.6} />
          <Path d="M3 7l9 6 9-6" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'share' && (
        <>
          <Path d="M12 15V4" {...common} strokeWidth={1.6} />
          <Path d="M8 7l4-3 4 3" {...common} strokeWidth={1.6} />
          <Path d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'folder' && (
        <Path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...common} />
      )}
      {name === 'chevron-down' && <Path d="M6 9l6 6 6-6" {...common} strokeWidth={2} />}
      {name === 'chevron-right' && <Path d="M9 6l6 6-6 6" {...common} strokeWidth={2} />}
      {name === 'chevron-left' && <Path d="M15 6l-6 6 6 6" {...common} strokeWidth={1.8} />}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={7} {...common} />
          <Path d="M20 20l-3.5-3.5" {...common} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} strokeWidth={1.8} />}
      {name === 'external' && (
        <>
          <Path d="M14 4h6v6" {...common} strokeWidth={1.6} />
          <Path d="M20 4l-8 8" {...common} strokeWidth={1.6} />
          <Path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4 7h16" {...common} />
          <Path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" {...common} />
          <Path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" {...common} />
        </>
      )}
      {name === 'qr' && (
        <>
          <Rect x={4} y={4} width={6} height={6} rx={1} {...common} strokeWidth={1.6} />
          <Rect x={14} y={4} width={6} height={6} rx={1} {...common} strokeWidth={1.6} />
          <Rect x={4} y={14} width={6} height={6} rx={1} {...common} strokeWidth={1.6} />
          <Path d="M14 14h2v2" {...common} strokeWidth={1.6} />
          <Path d="M20 14v6" {...common} strokeWidth={1.6} />
          <Path d="M14 20h6" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'eye' && (
        <>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...common} strokeWidth={1.6} />
          <Circle cx={12} cy={12} r={3} {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} strokeWidth={1.6} />
          <Path d="M12 7v5l3 2" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={4.5} width={18} height={16} rx={2.5} {...common} strokeWidth={1.6} />
          <Path d="M3 9h18" {...common} strokeWidth={1.6} />
          <Path d="M8 2.5v4M16 2.5v4" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z" {...common} strokeWidth={1.6} />
          <Path d="M10.5 21a1.8 1.8 0 0 0 3 0" {...common} strokeWidth={1.6} />
        </>
      )}
      {name === 'appearance' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} strokeWidth={1.6} />
          <Path d="M12 3a9 9 0 0 0 0 18z" fill={color} stroke="none" />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3.2} {...common} strokeWidth={1.5} />
          <Path
            d="M19 13a1 1 0 0 0 .2 1.1l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V19a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.66-.91 1 1 0 0 0-1.1.2l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H5a2 2 0 1 1 0-4h.1a1 1 0 0 0 .91-.66 1 1 0 0 0-.2-1.1l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04a1 1 0 0 0 1.1.2H10a1 1 0 0 0 .6-.92V5a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.92 1 1 0 0 0 1.1-.2l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04a1 1 0 0 0-.2 1.1V10a1 1 0 0 0 .92.6H19a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.4z"
            {...common}
            strokeWidth={1.5}
          />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" {...common} />
          <Path d="M16 17l5-5-5-5" {...common} />
          <Path d="M21 12H9" {...common} />
        </>
      )}
      {name === 'github' && (
        <>
          <Circle cx={6} cy={6} r={2.2} {...common} />
          <Circle cx={6} cy={18} r={2.2} {...common} />
          <Circle cx={18} cy={8} r={2.2} {...common} />
          <Path d="M6 8.2v7.6" {...common} />
          <Path d="M18 10.2a6 6 0 0 1-6 6H9" {...common} />
        </>
      )}
    </Svg>
  )
}
