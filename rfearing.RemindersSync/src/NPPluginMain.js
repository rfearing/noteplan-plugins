import pluginJson from '../plugin.json'
import { createTitle, createList } from './support/helpers'
import { logError, JSP } from '@helpers/dev'
import { addTrigger } from '@helpers/NPFrontMatter'

// List all lists and their reminders
export async function listAllReminders() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    for (const title of titles) {
      await createTitle(title)
      const reminders = await Calendar.remindersByLists([title])
      createList(reminders)
    }
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

// List all reminders from a specific list
export async function listRemindersIn() {
  try {
    // TODO: Add Trigger and Update on Editor Save
    // addTrigger(Editor, 'onEditorWillSave', pluginJson['plugin.id'], 'onEditorWillSave')
    const titles = await Calendar.availableReminderListTitles()
    const optionChosen = await CommandBar.prompt(
      'Which list would you like to sync?',
      'Pick from one of your reminders lists.',
      titles
    )
    const title = [titles[optionChosen]]
    await createTitle(title)
    const reminders = await Calendar.remindersByLists(title)
    createList(reminders)
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}


// Update reminders

// Create reminders
