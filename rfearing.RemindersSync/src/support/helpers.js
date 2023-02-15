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
