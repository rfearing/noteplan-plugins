// @flow

// Types:
type ReminderType = {
  title: string,
  date: string, // (always the date that the plugin is run)
  endDate?: string,
  type: string,
  isAllDay?: Boolean,
  isCompleted?: boolean,
  occurrences?: string[],
  calendar?: string,
  notes?: string,
  url?: string,
  availability?: number
}

// export const IDENTIFIER = '%%rfearing.RemindersSync%%'
export const IDENTIFIER = '%%\u200B%%'

// Create Task from Reminder
export const createTask = (reminderText: string = '') => {
  Editor.insertParagraphAtCursor(`${reminderText} ${IDENTIFIER}`, 'open', 0)
}

// Create Title for List
export const createTitle = (title: string = '', heading = 3) => {
  const header = [...Array(heading)].map(() => '#').join('')
  Editor.insertTextAtCursor(`${header} ${title} ${IDENTIFIER} \n`)
}

// Create a task from a an array of reminders
export const createList = async (list: ReminderType[] = []) => {
  for (const reminder of list) {
    if (reminder?.isCompleted) {
      continue
    }

    await createTask(reminder.title)
  }
}
