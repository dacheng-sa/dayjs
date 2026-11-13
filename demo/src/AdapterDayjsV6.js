// The current MUI X AdapterDayjs, with `adjustOffset` swapped back to the implementation that
// shipped in @mui/x-date-pickers 6.16.2 (Oct 2023), the version mui/mui-x#10584 was reported against.
// Copied from node_modules/@mui/x-date-pickers@6.16.2/AdapterDayjs/AdapterDayjs.js lines 260-275.
// Newer MUI X versions rebuild values from their wall time instead, which hides the dayjs bug.
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export class AdapterDayjsV6 extends AdapterDayjs {
  constructor(...args) {
    super(...args)
    this.adjustOffset = (value) => {
      if (!this.hasTimezonePlugin()) {
        return value
      }
      const timezone = this.getTimezone(value)
      if (timezone !== 'UTC') {
        const fixedValue = value.tz(this.cleanTimezone(timezone), true)
        if ((fixedValue.$offset ?? 0) === (value.$offset ?? 0)) {
          return value
        }
        return fixedValue
      }
      return value
    }
  }
}
