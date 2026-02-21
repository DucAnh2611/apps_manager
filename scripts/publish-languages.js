const { readFileSync } = require('fs')
const { execSync } = require('child_process')
const { resolve } = require('path')

const langDir = resolve(__dirname, '..', 'languages')
const metaPath = resolve(langDir, 'languages-meta.json')

const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
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
