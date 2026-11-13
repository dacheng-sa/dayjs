// Each scenario pins the "machine" (host timezone + current time) that Playwright emulates,
// then runs dayjs snippets next to the same operation in moment-timezone (the reference).
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import moment from 'moment-timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export { dayjs, moment }

export const scenarios = [
  {
    id: '1271',
    issue: 'iamkun/dayjs#1271',
    url: 'https://github.com/iamkun/dayjs/issues/1271',
    title: 'Add days across Daylight Saving Time',
    hostTz: 'America/Santiago', // reporter's machine
    now: '2020-12-20T15:00:00Z',
    snippets: [
      {
        code: "dayjs.tz('2020-10-24', 'Europe/London').add(2, 'day').toISOString()",
        dayjs: () => dayjs.tz('2020-10-24', 'Europe/London').add(2, 'day').toISOString(),
        moment: () => moment.tz('2020-10-24', 'Europe/London').add(2, 'day').toISOString()
      },
      {
        code: "dayjs.tz('2020-10-24', 'Europe/London').add(2, 'day').format()",
        dayjs: () => dayjs.tz('2020-10-24', 'Europe/London').add(2, 'day').format(),
        moment: () => moment.tz('2020-10-24', 'Europe/London').add(2, 'day').format()
      },
      {
        code: "dayjs.tz('2020-10-25', 'Europe/Berlin').add(1, 'day')\n  .diff(dayjs.tz('2020-10-26', 'Europe/Berlin'))",
        dayjs: () => String(dayjs.tz('2020-10-25', 'Europe/Berlin').add(1, 'day').diff(dayjs.tz('2020-10-26', 'Europe/Berlin'))),
        moment: () => String(moment.tz('2020-10-25', 'Europe/Berlin').add(1, 'day').diff(moment.tz('2020-10-26', 'Europe/Berlin')))
      },
      {
        code: "dayjs.tz('2021-03-12 19:00', 'America/New_York').add(1, 'month').format()",
        dayjs: () => dayjs.tz('2021-03-12 19:00', 'America/New_York').add(1, 'month').format(),
        moment: () => moment.tz('2021-03-12 19:00', 'America/New_York').add(1, 'month').format()
      },
      {
        code: "dayjs.tz('2020-10-25 00:00', 'Europe/London').add(3, 'hour').format()",
        dayjs: () => dayjs.tz('2020-10-25 00:00', 'Europe/London').add(3, 'hour').format(),
        moment: () => moment.tz('2020-10-25 00:00', 'Europe/London').add(3, 'hour').format()
      }
    ]
  },
  {
    id: '2609',
    issue: 'iamkun/dayjs#2609',
    url: 'https://github.com/iamkun/dayjs/issues/2609',
    title: 'Timezone bug with Daylight Savings (machine ahead of target zone)',
    hostTz: 'America/New_York', // reporter: EST
    now: '2024-03-15T15:00:00Z',
    snippets: [
      {
        code: "dayjs.tz('2024-03-10', 'America/Los_Angeles').format()",
        dayjs: () => dayjs.tz('2024-03-10', 'America/Los_Angeles').format(),
        moment: () => moment.tz('2024-03-10', 'America/Los_Angeles').format()
      },
      {
        code: "dayjs.tz('2024-03-10', 'America/Los_Angeles').format('YYYY-MM-DD')",
        dayjs: () => dayjs.tz('2024-03-10', 'America/Los_Angeles').format('YYYY-MM-DD'),
        moment: () => moment.tz('2024-03-10', 'America/Los_Angeles').format('YYYY-MM-DD')
      },
      {
        code: "dayjs('2024-03-10').tz('America/Los_Angeles', true).format()",
        dayjs: () => dayjs('2024-03-10').tz('America/Los_Angeles', true).format(),
        // moment's own keepLocalTime is host-dependent, so the reference is the wall time parsed in the zone
        moment: () => moment.tz('2024-03-10', 'America/Los_Angeles').format(),
        ref: "moment.tz('2024-03-10', 'America/Los_Angeles')"
      },
      {
        code: "dayjs.tz('2023-10-30', 'Europe/Paris').startOf('week').format()",
        dayjs: () => dayjs.tz('2023-10-30', 'Europe/Paris').startOf('week').format(),
        moment: () => moment.tz('2023-10-30', 'Europe/Paris').startOf('week').format()
      }
    ]
  },
  {
    id: '2609-comment',
    issue: 'iamkun/dayjs#2609 (comment)',
    url: 'https://github.com/iamkun/dayjs/issues/2609',
    title: 'tz(zone, keepLocalTime) is one hour off across the fall-back',
    hostTz: 'America/Los_Angeles',
    now: '2025-11-05T18:00:00Z',
    snippets: [
      {
        code: "dayjs('2025-11-01T23:00').tz('America/New_York', true).utc().toJSON()",
        dayjs: () => dayjs('2025-11-01T23:00').tz('America/New_York', true).utc().toJSON(),
        moment: () => moment.tz('2025-11-01 23:00', 'America/New_York').utc().toJSON(),
        ref: "moment.tz('2025-11-01 23:00', 'America/New_York')"
      },
      {
        code: "dayjs('2025-11-01T23:00').tz('America/New_York', true).format()",
        dayjs: () => dayjs('2025-11-01T23:00').tz('America/New_York', true).format(),
        moment: () => moment.tz('2025-11-01 23:00', 'America/New_York').format(),
        ref: "moment.tz('2025-11-01 23:00', 'America/New_York')"
      }
    ]
  },
  {
    id: 'mui',
    issue: 'mui/mui-x#10584',
    url: 'https://github.com/mui/mui-x/issues/10584',
    title: 'Daylight saving causes a duplicated day in the calendar',
    hostTz: 'Europe/Paris', // reporter's machine (MUI maintainer in France)
    now: '2023-10-20T10:00:00Z',
    calendar: { timezone: 'Europe/London', date: '2023-10-20' },
    snippets: [
      {
        code: "// how a calendar walks the days: .add(1, 'day') repeatedly\nlet d = dayjs.tz('2023-10-27', 'Europe/London')\nfor (i of 0..4) { out.push(d.format('ddd D HH:mm Z')); d = d.add(1, 'day') }",
        dayjs: () => walk(dayjs.tz('2023-10-27', 'Europe/London')),
        moment: () => walk(moment.tz('2023-10-27', 'Europe/London'))
      },
      {
        code: "dayjs.tz('2023-10-28', 'Europe/London').add(2, 'day').format()",
        dayjs: () => dayjs.tz('2023-10-28', 'Europe/London').add(2, 'day').format(),
        moment: () => moment.tz('2023-10-28', 'Europe/London').add(2, 'day').format()
      },
      {
        code: "dayjs.tz('2023-10-30', 'Europe/London').startOf('week').format()",
        dayjs: () => dayjs.tz('2023-10-30', 'Europe/London').startOf('week').format(),
        moment: () => moment.tz('2023-10-30', 'Europe/London').startOf('week').format()
      }
    ]
  },
  ...['2026-07-01T12:00:00Z', '2026-11-13T12:00:00Z'].map((now, i) => ({
    id: `overlap-${i ? 'winter' : 'summer'}`,
    issue: 'dayjs test suite (side finding)',
    url: 'https://github.com/iamkun/dayjs/blob/dev/test/plugin/timezone.test.js',
    title: `Ambiguous fall-back time depends on today's date (today = ${i ? 'winter' : 'summer'})`,
    hostTz: 'Europe/Paris',
    now,
    snippets: [
      {
        code: "dayjs.tz('2012-11-04 01:30', 'America/New_York').format()",
        dayjs: () => dayjs.tz('2012-11-04 01:30', 'America/New_York').format(),
        moment: () => moment.tz('2012-11-04 01:30', 'America/New_York').format()
      }
    ]
  }))
]

function walk(start) {
  const out = []
  let d = start
  for (let i = 0; i < 5; i += 1) {
    out.push(d.format('ddd D HH:mm Z'))
    d = d.add(1, 'day')
  }
  return out.join('\n')
}
