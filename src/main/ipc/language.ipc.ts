import { BrowserWindow, ipcMain } from 'electron'
import { LANGUAGE_CHANNELS } from '../../shared/constants/languages'
import {
  downloadLanguage,
  getAvailableLanguages,
  getInstalledLanguages,
  getTranslations
} from '../services/language.service'

export function registerLanguageHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(LANGUAGE_CHANNELS.GET_AVAILABLE, async () => {
    return await getAvailableLanguages()
  })

  ipcMain.handle(LANGUAGE_CHANNELS.GET_INSTALLED, () => {
    return getInstalledLanguages()
  })

  ipcMain.handle(LANGUAGE_CHANNELS.DOWNLOAD, async (_event, code: string) => {
    return await downloadLanguage(code, mainWindow)
  })

  ipcMain.handle(LANGUAGE_CHANNELS.GET_TRANSLATIONS, (_event, code: string) => {
    return getTranslations(code)
  })
}
