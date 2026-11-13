// Extracts dayjs `src/` at a git ref into vendor/<variant>/ so each build uses an exact commit.
// usage: node scripts/vendor.mjs before dev   |   node scripts/vendor.mjs after fix/timezone-dst-arithmetic
import { execSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

const repo = process.env.DAYJS_REPO || '../dayjs'
const [variant, ref] = process.argv.slice(2)
if (!variant || !ref) throw new Error('usage: vendor.mjs <before|after> <git ref>')
const dir = `vendor/${variant}`
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })
execSync(`git -C ${repo} archive ${ref} src | tar -x -C ${dir}`)
const sha = execSync(`git -C ${repo} rev-parse --short ${ref}`).toString().trim()
writeFileSync(`${dir}/meta.json`, JSON.stringify({ variant, ref, sha }, null, 2))
console.log(`vendored dayjs ${ref} (${sha}) -> ${dir}`)
