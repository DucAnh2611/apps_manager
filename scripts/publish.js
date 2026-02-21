const { readFileSync } = require('fs')
const { execSync } = require('child_process')
const { resolve } = require('path')

const pkgPath = resolve(__dirname, '..', 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const version = pkg.version

const args = process.argv.slice(2)
const forceFlag = args.includes('--force')
const minVersionArg = args.find((a) => !a.startsWith('--')) || null

let minVersion = minVersionArg
if (forceFlag && !minVersion) {
  // Hotfix: force all previous versions to update (minVersion = current version)
  minVersion = version
}

let notes = `Release v${version}`
if (minVersion) {
  notes += `\n\n<!--update-meta:{"minVersion":"${minVersion}"}-->`
}

console.log(`Publishing v${version}`)
if (minVersion) {
  console.log(`Force update for versions below ${minVersion}`)
}

execSync('pnpm build:win', { stdio: 'inherit', cwd: resolve(__dirname, '..') })
execSync(
  `electron-builder --win --publish always -c.releaseInfo.releaseNotes="${notes.replace(/"/g, '\\"')}"`,
  { stdio: 'inherit', cwd: resolve(__dirname, '..') }
)

console.log(`Published v${version} successfully`)
