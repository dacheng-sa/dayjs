// For each scenario: emulate the machine timezone, freeze the machine clock, open the page,
// click "Run snippets", then save a screenshot + video + JSON of the results.
// usage: node scripts/evidence.mjs [before|after ...]
import { chromium } from 'playwright'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { serve } from './serve.mjs'

const variants = process.argv.slice(2).length ? process.argv.slice(2) : ['before', 'after']
const browser = await chromium.launch()
const summary = {}

for (const variant of variants) {
  const { server, url } = await serve(`dist/${variant}`)
  const out = `evidence/${variant}`
  mkdirSync(`${out}/video-tmp`, { recursive: true })
  summary[variant] = {}
  // scenario list (machine timezone + mocked clock per scenario) comes from the built page itself
  const probe = await browser.newPage()
  await probe.goto(url)
  const scenarioMeta = await probe.evaluate(() => window.__scenarios)
  await probe.close()
  for (const s of scenarioMeta) {
    const context = await browser.newContext({
      timezoneId: s.hostTz,
      locale: 'en-US',
      viewport: { width: 1280, height: s.calendar ? 900 : 640 },
      recordVideo: { dir: `${out}/video-tmp`, size: { width: 1280, height: s.calendar ? 900 : 640 } }
    })
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date(s.now))
    await page.goto(`${url}?s=${s.id}`)
    await page.waitForSelector('#run')
    await page.waitForTimeout(1200)
    await page.click('#run')
    await page.waitForTimeout(s.calendar ? 2200 : 1600)
    await page.screenshot({ path: `${out}/${s.id}.png`, fullPage: true })
    const rows = await page.$$eval('table.snippets tbody tr', (trs) => trs.map((tr) => ({
      code: tr.cells[0].innerText, dayjs: tr.cells[1].innerText, expected: tr.cells[2].innerText, status: tr.cells[3].innerText
    })))
    const calendar = await page.$eval('.verdict', (e) => e.innerText).catch(() => undefined)
    summary[variant][s.id] = { hostTz: s.hostTz, now: s.now, rows, calendar }
    const video = page.video()
    await context.close()
    renameSync(await video.path(), `${out}/${s.id}.webm`)
    console.log(variant, s.id, rows.map((r) => r.status).join(' '), calendar || '')
  }
  server.close()
}
writeFileSync(`evidence/summary-${variants.join('-')}.json`, JSON.stringify(summary, null, 2))
await browser.close()
