import pluginJson from '../plugin.json'
import { createTask, createTitle } from './support/helpers'
import { logError, JSP } from '@helpers/dev'

// List all lists and their reminders
export async function listAllReminders() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    for (const title of titles) {
      await createTitle(title)
      const reminders = await Calendar.remindersByLists([title])
      for (const reminder of reminders) {
        if (reminder.isCompleted) {
          continue
        }
        await createTask(reminder.title)
      }

    }
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

// List all reminders from a specific list

// Update reminders

// Create reminders
