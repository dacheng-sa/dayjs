# Evidence: timezone plugin DST fix

Supporting material for the `fix/timezone-dst-arithmetic` pull request to iamkun/dayjs. This branch isn't meant to be merged.

- `evidence/<variant>/<scenario>.png`: screenshots of each scenario. Variants:
  - `reported`: dayjs v1.11.10
  - `before`: dev @ d3e43be
  - `after`: the PR branch
- `evidence/videos/*.mp4`: side-by-side recordings (before | after; the mui-x one is v1.11.10 | dev | fix).
- `evidence/summary-reported-before-after.json`: every snippet result, machine zone and mocked clock.
- `demo/`: the harness that produced them (Vite + MUI X + moment-timezone + Playwright). It emulates the machine's
  time zone with Playwright's `timezoneId` and freezes the clock with `page.clock.setFixedTime`. See `demo/README.md`.
