// @flow

// Types:
type TypeOptions = 'open' | 'checklist'

// Create Task from Reminder
export const createTask = (reminderText: string = '', type: TypeOptions = 'open') => {
  Editor.insertParagraphAtCursor(reminderText, type, 0)
}

// Create Title for List
export const createTitle = (title: string = '') => {
  Editor.insertTextAtCursor(`### ${title}\n`)
}

// Insert options for an array of strings
export const createList = async (list: Array<string> = []) => {
  for (const reminder of list) {
    if (reminder?.isCompleted) {
      continue
    }

    await createTask(reminder.title)
  }
}

/*
Title: Modest Mouse
date: (always the date that the plugin is run)
endDate: undefined
type: reminder
isAllDay: true
isCompleted: false
occurrences: undefined
calendar: Band Bucket List
notes:
url:
availability: 0
*/