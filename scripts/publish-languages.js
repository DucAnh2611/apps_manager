const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')
const { resolve } = require('path')
const dotenv = require('dotenv')
dotenv.config()

const langDir = resolve(__dirname, '..', 'languages')
const metaPath = resolve(langDir, 'languages-meta.json')

const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))

// Bump minor version for each language
for (const lang of meta) {
  const [major, minor, patch] = lang.version.split('.').map(Number)
  lang.version = `${major}.${minor + 1}.${patch}`
  console.log(`${lang.code}: ${major}.${minor}.${patch} -> ${lang.version}`)
}
writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n')

const files = ['languages-meta.json', ...meta.map((lang) => `${lang.code}.json`)]

const tag = 'languages-v1'

for (const file of files) {
  const filePath = resolve(langDir, file)

  try {
    execSync(`gh release delete-asset ${tag} ${file} --yes`, { stdio: 'ignore' })
  } catch {
    // Asset may not exist yet, ignore
  }

  try {
    execSync(`gh release upload ${tag} "${filePath}"`, { stdio: 'inherit' })
    console.log(`Uploaded ${file}`)
  } catch {
    console.error(`Failed to upload ${file}`)
    process.exit(1)
  }
}

console.log('All language assets published successfully')
