import pluginJson from '../plugin.json'
import { logError, JSP } from '@helpers/dev'

export async function listAllReminders() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    titles.forEach(async title => {
      const reminders = await Calendar.remindersByLists([title])
      console.log(`${title  } >>>>>>>>>>`)
      reminders.forEach((reminder) => {
        console.log(`${reminder.title  } isCompleted: ${reminder.isCompleted}`)
      })
      console.log(`${title}`)
    })
    console.log('DONE')
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}
