import { shell } from 'electron'
import { spawn, exec } from 'child_process'
import { existsSync } from 'fs'

export async function launchApp(
  appPath: string,
  args?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!existsSync(appPath)) {
    return { success: false, error: `File not found: ${appPath}` }
  }

  try {
    if (args) {
      // When args are provided, use spawn with detached process
      const argList = parseArgs(args)
      const child = spawn(appPath, argList, {
        detached: true,
        stdio: 'ignore'
      })
      child.unref()
    } else if (process.platform === 'win32') {
      // On Windows, use shell.openPath for executables
      const error = await shell.openPath(appPath)
      if (error) {
        return { success: false, error }
      }
    } else {
      // On macOS/Linux, use exec for better control
      await new Promise<void>((resolve, reject) => {
        const cmd = process.platform === 'darwin' ? `open "${appPath}"` : `"${appPath}"`
        exec(cmd, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

function parseArgs(args: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false
  let quoteChar = ''

  for (let i = 0; i < args.length; i++) {
    const ch = args[i]

    if (inQuote) {
      if (ch === quoteChar) {
        inQuote = false
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = true
      quoteChar = ch
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        result.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }

  if (current) {
    result.push(current)
  }

  return result
}
