import { Extractor, Transformer } from '@debkit/schema'
import {
  actionOnCloseOptions,
  monitorIntervalOptions,
  navigationItemsAlignmentOptions,
  navigationPositionOptions,
  navigationStyleOptions,
  SETTING_DEFAULTS,
  SETTING_KEYS,
  windowModeOptions
} from '../../../shared/constants/settings'

const { stringTypes, primitives } = Transformer

const stringTypeBoolean = ['true', 'false']

const valueToStringTypes = <T extends Readonly<{ value: string }[]>>(items: T) =>
  items.map((item) => item.value)

export default function useExtractSetting(settings?: Record<string, string>) {
  return Extractor.from(settings ?? {})
    .select({
      [SETTING_KEYS.AUTO_LAUNCH]: stringTypes(
        stringTypeBoolean,
        SETTING_DEFAULTS[SETTING_KEYS.AUTO_LAUNCH]
      ),
      [SETTING_KEYS.MONITOR_INTERVAL]: stringTypes(
        valueToStringTypes(monitorIntervalOptions),
        SETTING_DEFAULTS[SETTING_KEYS.MONITOR_INTERVAL]
      ),
      [SETTING_KEYS.SIDE_PANEL_OPEN]: stringTypes(
        stringTypeBoolean,
        SETTING_DEFAULTS[SETTING_KEYS.SIDE_PANEL_OPEN]
      ),
      [SETTING_KEYS.ACTION_ON_CLOSE]: stringTypes(
        valueToStringTypes(actionOnCloseOptions),
        SETTING_DEFAULTS[SETTING_KEYS.ACTION_ON_CLOSE]
      ),
      [SETTING_KEYS.WINDOW_MODE]: stringTypes(
        valueToStringTypes(windowModeOptions),
        SETTING_DEFAULTS[SETTING_KEYS.WINDOW_MODE]
      ),
      [SETTING_KEYS.WINDOW_WIDTH]: primitives(
        'string',
        SETTING_DEFAULTS[SETTING_KEYS.WINDOW_WIDTH]
      ),
      [SETTING_KEYS.WINDOW_HEIGHT]: primitives(
        'string',
        SETTING_DEFAULTS[SETTING_KEYS.WINDOW_HEIGHT]
      ),
      [SETTING_KEYS.NAVIGATION_STYLE]: stringTypes(
        valueToStringTypes(navigationStyleOptions),
        SETTING_DEFAULTS[SETTING_KEYS.NAVIGATION_STYLE]
      ),
      [SETTING_KEYS.NAVIGATION_POSITION]: stringTypes(
        valueToStringTypes(navigationPositionOptions),
        SETTING_DEFAULTS[SETTING_KEYS.NAVIGATION_POSITION]
      ),
      [SETTING_KEYS.NAVIGATION_AUTO_HIDE]: stringTypes(
        stringTypeBoolean,
        SETTING_DEFAULTS[SETTING_KEYS.NAVIGATION_AUTO_HIDE]
      ),
      [SETTING_KEYS.NAVIGATION_AUTO_HIDE_DELAY]: primitives(
        'string',
        SETTING_DEFAULTS[SETTING_KEYS.NAVIGATION_AUTO_HIDE_DELAY]
      ),
      [SETTING_KEYS.NAVIGATION_ITEMS_ALIGNMENT]: stringTypes(
        valueToStringTypes(navigationItemsAlignmentOptions),
        SETTING_DEFAULTS[SETTING_KEYS.NAVIGATION_ITEMS_ALIGNMENT]
      )
    })
    .allowNull([])
}
