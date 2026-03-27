const pad = (value) => String(value).padStart(2, '0')

const toUtcStamp = (date) => [
  date.getUTCFullYear(),
  pad(date.getUTCMonth() + 1),
  pad(date.getUTCDate())
].join('') + 'T' + [
  pad(date.getUTCHours()),
  pad(date.getUTCMinutes()),
  pad(date.getUTCSeconds())
].join('') + 'Z'

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const formatDueDate = (value) => {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export const downloadCalendarEvent = (task) => {
  if (!task?.dueAt) return false

  const startDate = new Date(task.dueAt)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
  const fileName = slugify(task.title || 'tarea') || 'tarea'
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//V-List//Task Calendar//ES',
    'BEGIN:VEVENT',
    `UID:${task.id}@v-list.app`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(startDate)}`,
    `DTEND:${toUtcStamp(endDate)}`,
    `SUMMARY:${task.title || 'Tarea V-List'}`,
    'DESCRIPTION:Recordatorio generado desde V-List',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${fileName}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}
