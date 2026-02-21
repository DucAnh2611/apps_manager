const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const pkgPath = resolve(__dirname, '..', 'package.json')

const args = process.argv.slice(2)
const typeIndex = args.indexOf('--type')

if (typeIndex === -1 || !args[typeIndex + 1]) {
  console.error('Usage: node scripts/bump-version.js --type <hotfix|feat>')
  process.exit(1)
}

const type = args[typeIndex + 1]

if (type !== 'hotfix' && type !== 'feat') {
  console.error('Invalid type. Use "hotfix" (patch) or "feat" (minor)')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)

if (type === 'hotfix') {
  pkg.version = `${major}.${minor}.${patch + 1}`
} else {
  pkg.version = `${major}.${minor + 1}.0`
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`Version bumped to ${pkg.version}`)
