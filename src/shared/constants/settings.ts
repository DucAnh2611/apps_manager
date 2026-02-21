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
  NAVIGATION_ITEMS_ALIGNMENT: 'navigation_items_alignment',
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

export const NAVIGATION_ITEMS_ALIGNMENT = {
  START: 'start',
  CENTER: 'center',
  END: 'end'
} as const

// Setting option arrays for UI dropdowns
export const monitorIntervalOptions = [
  { label: '2', value: MONITOR_INTERVALS.TWO_SECONDS },
  { label: '5', value: MONITOR_INTERVALS.FIVE_SECONDS },
  { label: '10', value: MONITOR_INTERVALS.TEN_SECONDS },
  { label: '30', value: MONITOR_INTERVALS.THIRTY_SECONDS }
] as const

export const actionOnCloseOptions = [
  { label: 'settings.start.actionOnClose.options.quit', value: ACTIONS_ON_CLOSE.QUIT },
  { label: 'settings.start.actionOnClose.options.minimize', value: ACTIONS_ON_CLOSE.MINIMIZE }
] as const

export const windowModeOptions = [
  { label: 'settings.start.windowMode.options.full', value: WINDOW_MODES.FULL },
  { label: 'settings.start.windowMode.options.custom', value: WINDOW_MODES.CUSTOM }
] as const

export const navigationStyleOptions = [
  { label: 'settings.behavior.navStyle.options.side', value: NAVIGATION_STYLES.SIDE },
  { label: 'settings.behavior.navStyle.options.floating', value: NAVIGATION_STYLES.FLOATING }
] as const

export const navigationPositionOptions = [
  { label: 'settings.behavior.navPosition.options.bottom', value: NAVIGATION_POSITIONS.BOTTOM },
  { label: 'settings.behavior.navPosition.options.top', value: NAVIGATION_POSITIONS.TOP },
  { label: 'settings.behavior.navPosition.options.left', value: NAVIGATION_POSITIONS.LEFT },
  { label: 'settings.behavior.navPosition.options.right', value: NAVIGATION_POSITIONS.RIGHT }
] as const

export const navigationItemsAlignmentOptions = [
  {
    label: 'settings.behavior.navItemsAlignment.options.start',
    value: NAVIGATION_ITEMS_ALIGNMENT.START
  },
  {
    label: 'settings.behavior.navItemsAlignment.options.center',
    value: NAVIGATION_ITEMS_ALIGNMENT.CENTER
  },
  {
    label: 'settings.behavior.navItemsAlignment.options.end',
    value: NAVIGATION_ITEMS_ALIGNMENT.END
  }
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
  [SETTING_KEYS.NAVIGATION_ITEMS_ALIGNMENT]: NAVIGATION_ITEMS_ALIGNMENT.START,
  [SETTING_KEYS.APP_COLUMNS]: '5',
  [SETTING_KEYS.LANGUAGE]: 'en'
}
