// Which machine timezones / calendar timezones make today's MUI calendar show a duplicated day?
import { chromium } from 'playwright'
import { serve } from './serve.mjs'

const variant = process.argv[2] || 'before'
const hosts = process.env.HOSTS ? process.env.HOSTS.split(',') : ['America/New_York', 'America/Los_Angeles', 'Europe/Paris', 'Europe/London', 'UTC', 'Asia/Tokyo', 'America/Sao_Paulo', 'Australia/Sydney']
const calTzs = process.env.CALTZ ? process.env.CALTZ.split(',') : ['Europe/Paris', 'system', 'America/New_York']
const { server, url } = await serve(`dist/${variant}`)
const browser = await chromium.launch()
for (const caltz of calTzs) {
  for (const host of hosts) {
    const ctx = await browser.newContext({ timezoneId: host })
    const page = await ctx.newPage()
    await page.clock.setFixedTime(new Date('2023-10-20T10:00:00Z'))
    await page.goto(`${url}?s=mui&autorun=1&caltz=${caltz}`)
    await page.waitForTimeout(700)
    const v = (await page.$$eval('.verdict', (es) => es.map((e) => e.innerText))).join('  ||  ')
    console.log(caltz.padEnd(18), host.padEnd(22), v)
    await ctx.close()
  }
}
await browser.close(); server.close()
