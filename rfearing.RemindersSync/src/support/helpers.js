// @flow

import { ReminderType, TypeOptions } from './types'

export const IDENTIFIER = '%%\u200B%%'

// Create Task from Reminder
export const createTask = (reminderText: string = '', type: TypeOptions = 'open') => {
  Editor.insertParagraphAtCursor(`${reminderText} ${IDENTIFIER}`, type, 0)
}

// Create Title for List
export const createTitle = (title: string = '', heading = 3) => {
  const header = [...Array(heading)].map(() => '#').join('')
  Editor.insertTextAtCursor(`${header} ${title} ${IDENTIFIER} \n`)
}

// Create a task from a an array of reminders
export const createRemindersList = async (list: ReminderType[] = []) => {
  for (const reminder of list) {
    if (reminder?.isCompleted) {
      continue
    }

    await createTask(reminder.title)
  }
}
