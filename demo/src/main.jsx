import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { scenarios, dayjs } from './scenarios'
import { AdapterDayjsV6 } from './AdapterDayjsV6'
import pkg from '../package.json'
import './style.css'

/* global __DAYJS_BUILD__ */
const build = __DAYJS_BUILD__
const params = new URLSearchParams(window.location.search)

function run(fn) {
  try { return fn() } catch (e) { return `throws: ${e.message}` }
}

function Environment({ scenario }) {
  const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <dl className="env">
      <div><dt>Machine timezone (emulated)</dt><dd>{resolved}{resolved !== scenario.hostTz && ' ⚠ emulation failed'}</dd></div>
      <div><dt>Machine clock (mocked)</dt><dd>{new Date().toString()}</dd></div>
      <div><dt>Day.js build</dt><dd>{build.ref} @ {build.sha}</dd></div>
      <div><dt>Reference</dt><dd>moment-timezone {window.momentTzVersion}</dd></div>
    </dl>
  )
}

function Snippets({ scenario, shown }) {
  return (
    <table className="snippets">
      <thead><tr><th>Snippet</th><th>Day.js result</th><th>Expected (moment-timezone)</th><th /></tr></thead>
      <tbody>
        {scenario.snippets.map((s) => {
          const actual = run(s.dayjs)
          const expected = run(s.moment)
          const ok = actual === expected
          return (
            <tr key={s.code} className={shown ? (ok ? 'pass' : 'fail') : ''}>
              <td><pre>{s.code}</pre></td>
              <td><pre>{shown ? actual : '…'}</pre></td>
              <td><pre>{shown ? expected : '…'}</pre>{s.ref && <div className="ref">ref: {s.ref}</div>}</td>
              <td className="status">{shown && (ok ? 'PASS' : 'FAIL')}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const ADAPTERS = [
  { key: 'v6', label: 'MUI X 6.16 adapter logic (as reported)', Adapter: AdapterDayjsV6 },
  { key: 'v9', label: `MUI X ${pkg.dependencies['@mui/x-date-pickers']} adapter (current, has its own workaround)`, Adapter: AdapterDayjs }
]

function OneCalendar({ timezone, start, Adapter, label }) {
  const ref = useRef(null)
  const [dupes, setDupes] = useState(null)
  const weeks = run(() => new Adapter().getWeekArray(start))

  useEffect(() => {
    const t = setTimeout(() => {
      const cells = [...ref.current.querySelectorAll('button.MuiPickerDay-root, button.MuiPickersDay-root')]
      const seen = {}
      cells.forEach((c) => { seen[c.textContent] = (seen[c.textContent] || 0) + 1 })
      const repeated = Object.keys(seen).filter((k) => seen[k] > 1)
      cells.forEach((c) => c.classList.toggle('dupe', repeated.includes(c.textContent)))
      setDupes({ count: cells.length, repeated })
    }, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div ref={ref} className={`calendar ${dupes ? (dupes.repeated.length ? 'bad' : 'good') : ''}`}>
      <h3>{label}</h3>
      <LocalizationProvider dateAdapter={Adapter}>
        <DateCalendar timezone={timezone} defaultValue={start} />
      </LocalizationProvider>
      <p className="verdict">
        {dupes && (dupes.repeated.length
          ? `FAIL — ${dupes.count} day cells, duplicated: ${dupes.repeated.join(', ')}`
          : `PASS — ${dupes.count} day cells, no duplicates`)}
      </p>
      <pre className="weeks">{Array.isArray(weeks)
        ? weeks.map((w) => w.map((d) => d.format('D').padStart(2)).join(' ')).join('\n')
        : weeks}</pre>
    </div>
  )
}

function Calendar({ scenario }) {
  const timezone = params.get('caltz') || scenario.calendar.timezone
  const { date } = scenario.calendar
  const start = timezone === 'system' ? dayjs(date) : dayjs.tz(date, timezone)
  return (
    <>
      <p className="hint">{`<DateCalendar timezone="${timezone}" defaultValue={dayjs.tz('${date}', '${timezone}')} />`} — below each calendar: <code>adapter.getWeekArray(value)</code></p>
      <div className="calendar-row">
        {ADAPTERS.map((a) => <OneCalendar key={a.key} timezone={timezone} start={start} Adapter={a.Adapter} label={a.label} />)}
      </div>
    </>
  )
}

function Scenario({ scenario }) {
  const [shown, setShown] = useState(params.has('autorun'))
  return (
    <section>
      <header>
        <span className={`build ${build.variant}`}>{{ reported: 'AS REPORTED (v1.11.10)', before: 'BEFORE fix (current dev)', after: 'AFTER fix' }[build.variant]}</span>
        <h1><a href={scenario.url}>{scenario.issue}</a> — {scenario.title}</h1>
      </header>
      <Environment scenario={scenario} />
      <button id="run" onClick={() => setShown(true)}>Run snippets</button>
      <Snippets scenario={scenario} shown={shown} />
      {scenario.calendar && shown && <Calendar scenario={scenario} />}
    </section>
  )
}

function Index() {
  return (
    <section>
      <h1>Day.js DST demo ({build.variant})</h1>
      <ul>{scenarios.map((s) => <li key={s.id}><a href={`?s=${s.id}`}>{s.issue}: {s.title}</a> (machine: {s.hostTz})</li>)}</ul>
    </section>
  )
}

window.momentTzVersion = pkg.dependencies['moment-timezone']
window.muiVersion = pkg.dependencies['@mui/x-date-pickers']
window.__scenarios = scenarios.map(({ id, hostTz, now, calendar }) => ({ id, hostTz, now, calendar: !!calendar }))
const scenario = scenarios.find((s) => s.id === params.get('s'))
createRoot(document.getElementById('root')).render(scenario ? <Scenario scenario={scenario} /> : <Index />)
