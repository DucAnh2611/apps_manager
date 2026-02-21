export const SETTING_KEYS = {
  THEME: 'theme',
  AUTO_LAUNCH: 'auto_launch',
  MONITOR_INTERVAL: 'monitor_interval',
  WINDOW_MODE: 'window_mode',
  WINDOW_WIDTH: 'window_width',
  WINDOW_HEIGHT: 'window_height',
  ACTION_ON_CLOSE: 'action_on_close',
  SIDE_PANEL_OPEN: 'side_panel_open',
  NAVIGATION_AUTO_HIDE: 'navigation_auto_hide',
  NAVIGATION_AUTO_HIDE_DELAY: 'navigation_auto_hide_delay',
  NAVIGATION_STYLE: 'navigation_style',
  NAVIGATION_POSITION: 'navigation_position',
  APP_COLUMNS: 'app_columns',
  LANGUAGE: 'language'
} as const

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS]

// Setting value enums
export const NAVIGATION_STYLES = {
  SIDE: 'side',
  FLOATING: 'floating'
} as const

export const NAVIGATION_POSITIONS = {
  BOTTOM: 'bottom',
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right'
} as const

export const ACTIONS_ON_CLOSE = {
  QUIT: 'quit-the-app',
  MINIMIZE: 'minimize'
} as const

export const WINDOW_MODES = {
  FULL: 'full',
  CUSTOM: 'custom'
} as const

export const MONITOR_INTERVALS = {
  TWO_SECONDS: '2000',
  FIVE_SECONDS: '5000',
  TEN_SECONDS: '10000',
  THIRTY_SECONDS: '30000'
} as const

// Setting option arrays for UI dropdowns
export const monitorIntervalOptions = [
  { label: '2 seconds', value: MONITOR_INTERVALS.TWO_SECONDS },
  { label: '5 seconds', value: MONITOR_INTERVALS.FIVE_SECONDS },
  { label: '10 seconds', value: MONITOR_INTERVALS.TEN_SECONDS },
  { label: '30 seconds', value: MONITOR_INTERVALS.THIRTY_SECONDS }
] as const

export const actionOnCloseOptions = [
  { label: 'Quit the app', value: ACTIONS_ON_CLOSE.QUIT },
  { label: 'Minimize', value: ACTIONS_ON_CLOSE.MINIMIZE }
] as const

export const windowModeOptions = [
  { label: 'Full screen', value: WINDOW_MODES.FULL },
  { label: 'Custom', value: WINDOW_MODES.CUSTOM }
] as const

export const navigationStyleOptions = [
  { label: 'Side', value: NAVIGATION_STYLES.SIDE },
  { label: 'Floating', value: NAVIGATION_STYLES.FLOATING }
] as const

export const navigationPositionOptions = [
  { label: 'Bottom', value: NAVIGATION_POSITIONS.BOTTOM },
  { label: 'Top', value: NAVIGATION_POSITIONS.TOP },
  { label: 'Left', value: NAVIGATION_POSITIONS.LEFT },
  { label: 'Right', value: NAVIGATION_POSITIONS.RIGHT }
] as const

// Default values
export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  [SETTING_KEYS.THEME]: 'system',
  [SETTING_KEYS.AUTO_LAUNCH]: 'false',
  [SETTING_KEYS.MONITOR_INTERVAL]: MONITOR_INTERVALS.FIVE_SECONDS,
  [SETTING_KEYS.WINDOW_MODE]: WINDOW_MODES.CUSTOM,
  [SETTING_KEYS.WINDOW_WIDTH]: '1200',
  [SETTING_KEYS.WINDOW_HEIGHT]: '800',
  [SETTING_KEYS.ACTION_ON_CLOSE]: ACTIONS_ON_CLOSE.MINIMIZE,
  [SETTING_KEYS.SIDE_PANEL_OPEN]: 'true',
  [SETTING_KEYS.NAVIGATION_AUTO_HIDE]: 'false',
  [SETTING_KEYS.NAVIGATION_AUTO_HIDE_DELAY]: '0',
  [SETTING_KEYS.NAVIGATION_STYLE]: NAVIGATION_STYLES.SIDE,
  [SETTING_KEYS.NAVIGATION_POSITION]: NAVIGATION_POSITIONS.BOTTOM,
  [SETTING_KEYS.APP_COLUMNS]: '5',
  [SETTING_KEYS.LANGUAGE]: 'en'
}
