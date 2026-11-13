# dayjs DST demo

Reproduces [iamkun/dayjs#1271](https://github.com/iamkun/dayjs/issues/1271),
[iamkun/dayjs#2609](https://github.com/iamkun/dayjs/issues/2609) and
[mui/mui-x#10584](https://github.com/mui/mui-x/issues/10584), then shows them fixed by the
`fix/timezone-dst-arithmetic` branch of the local dayjs checkout (`../dayjs`).

## How it works

- `scripts/vendor.mjs` extracts dayjs `src/` at a git ref into `vendor/<variant>/`:
  - `reported`: `v1.11.10`, the version in the original reports
  - `before`: `dev`
  - `after`: `fix/timezone-dst-arithmetic`
- `vite.config.js` aliases every `dayjs` import (ours and MUI's `AdapterDayjs`) to that tree.
- `src/scenarios.js` holds the snippets. Each one runs next to moment-timezone 0.6.6 as the
  reference. For `tz(zone, true)` rows, the reference is the clock time parsed in the zone,
  because moment's own `keepLocalTime` is wrong on some machines.
- `scripts/evidence.mjs` uses Playwright to emulate each scenario's machine time zone
  (`timezoneId`) and fake its clock (`page.clock.setFixedTime`). It clicks "Run snippets", then
  saves a screenshot, a video and `evidence/summary-*.json`.
- `scripts/compose.mjs` stitches the videos side by side into `evidence/videos/*.mp4`.
- `scripts/probe-mui.mjs` checks the MUI calendar across machine zones and calendar zones.
- The MUI scenario renders two calendars: the current `AdapterDayjs` (9.18), and the same
  adapter with `adjustOffset` swapped back to its 6.16.2 code (`src/AdapterDayjsV6.js`). Newer
  MUI X rebuilds values from their clock time, which hides the dayjs bug.

## Run

```sh
npm install && npx playwright install chromium
npm run all            # vendor + build + evidence
node scripts/compose.mjs
```

## Results

| Scenario | Machine (emulated) | v1.11.10 | dev (d3e43be) | fix branch |
|---|---|---|---|---|
| #1271: add day/month/hour across DST | America/Santiago | 0/5 | 0/5 | 5/5 |
| #2609: `dayjs.tz` / `startOf` while the machine is in a different DST state | America/New_York | 1/4 | 1/4 | 4/4 |
| #2609 comment: `tz(zone, true)` | America/Los_Angeles | 0/2 | 0/2 | 2/2 |
| mui-x#10584: snippets | Europe/Paris | 1/3 | 1/3 | 3/3 |
| mui-x#10584: `<DateCalendar timezone="Europe/London">` | Europe/Paris | duplicate 29 | OK | OK |
| Ambiguous fall-back parse, clock set in summer | Europe/Paris | 1/1 | 1/1 | 1/1 |
| Ambiguous fall-back parse, clock set in winter | Europe/Paris | 0/1 | 0/1 | 1/1 |

On current `dev`, the duplicate day no longer shows in the calendar, but the offsets that
`add(1, 'day')` produces are still wrong.
