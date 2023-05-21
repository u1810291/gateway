import { format } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

export function transformMilitaryTimeToUTCMilitaryTime(militaryTime: string, tz: string): string {
  const hour = militaryTime.split(':')[0]
  const minutes = militaryTime.split(':')[1]

  const date = new Date(Date.UTC(2000, 0, 1, +hour, +minutes, 0))
  date.setHours(+hour)
  date.setMinutes(+minutes)
  date.setSeconds(0)

  return format(zonedTimeToUtc(date, tz), 'HH:mm')
}
