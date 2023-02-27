import pluginJson from '../plugin.json'
import { addTrigger } from '../../helpers/NPFrontMatter'
import { createTitle, createRemindersList } from './support/helpers'
import {
  /* TODOIST_TOKEN, SYNC_API, PROJECTS_CACHE, */
  createTaskFromItem,
  createTasksFromProject,
  getProjects,
  getProjectItems,
} from './support/todoistHelpers'
import { logError, JSP } from '@helpers/dev'

// List all lists and their reminders
export async function listAllReminders() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    for (const title of titles) {
      await createTitle(title)
      const reminders = await Calendar.remindersByLists([title])
      createRemindersList(reminders)
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
    createRemindersList(reminders)
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

/*
 * *******
 * Todoist
 * *******
 */
export async function listProjects() {
  // console.log(DataStore.loadJSON(PROJECTS_CACHE))
  // DataStore.saveJSON(projects, PROJECTS_CACHE)
  const projects = await getProjects()
  if (projects) {
    projects.map(project => {
      createTasksFromProject(project)
    })
  }
}

// Display To-dos from a specific list
export async function listProjectItems() {
  try {
    addTrigger(Editor, 'onEditorWillSave', pluginJson['plugin.id'], 'onEditorWillSave')
    const projects = await getProjects()
    const titles = projects.map(project => project.name)

    // Pick a Project
    const optionChosen = await CommandBar.showOptions(
      titles,
      'Inbox'
    )
    const title = optionChosen.value
    await createTitle(title, 2)

    // Get Project Items & Sections
    const project = projects.find(project => project.name === title)
    const data = await getProjectItems(project.id)

    Object.keys(data).map(key => {
      const section = data[key]

      if (section.name) {
        createTitle(section.name, 4)
      }

      section.items.map(item => createTaskFromItem(item))
    })
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}
