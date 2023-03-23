import pluginJson from '../plugin.json'
import { addTrigger } from '../../helpers/NPFrontMatter'
import { writeTitle, createRemindersList } from './support/helpers'
import {
  /* TODOIST_TOKEN, SYNC_API, PROJECTS_CACHE, */
  createTaskFromItem,
  createTasksFromProject,
  getProjects,
  getProjectItems,
} from './support/todoistHelpers'
import { logError, JSP } from '@helpers/dev'

/*
 * *******
 * Todoist
 * *******
 */
export async function listProjects() {
  const projects = await getProjects()
  if (projects) {
    projects.map(project => {
      createTasksFromProject(project)
    })
  }
}

export async function syncProjects() {
  const notes = DataStore.projectNotes.filter(note => !note.filename.startsWith('@'))
  const notePaths = notes.map(note => note.filename)
  const projects = await getProjects()
    .then(proj => addPropsToProject(proj))

  if (projects) {
    await projects.map(async project => {
      if (notePaths.includes(project.filename)) {
        console.log(`Includes ${project.name}`)
      } else {
        const content = await createNoteContent(project)
        // DataStore.newNoteWithContent(content, project.folder, project.filename)
        DataStore.newNoteWithContent(content, project.folder)
      }
    })
  }
}

function addPropsToProject(projects, type = ".txt") {
  const parentIds = projects.map(obj => obj.parent_id)
  function findParentName(id) {
    if (!id) {
      return null
    }

    const parent = projects.find(obj => obj.id === id)
    if (parent) {
      const parentName = findParentName(parent.parent_id)
      if (parentName) {
        return `${parentName}/${parent.name}`
      } else {
        return parent.name
      }
    } else {
      return null
    }
  }

  return projects.map(obj => {
    const isParent = parentIds.includes(obj.id) && !obj.parent_id
    const defaultFolder = isParent ? obj.name : '/'
    const header = isParent ? '---' : obj.name
    const parentName = obj.parent_id ? `${findParentName(obj.parent_id)}/` : defaultFolder

    return {
      ...obj,
      filename: `${parentName}/${obj.name}${type}`,
      header,
      folder: parentName,
    }
  })
}

export async function createNoteContent(project) {
  let content = `# ${project?.header || project.name}\n`
  const data = await getProjectItems(project.id)

  Object.keys(data).map(key => {
    const section = data[key]

    if (section.name) {
      content += `\n### ${section.name}\n---\n`
    }

    section.items.map(item => {
      content += `* ${item.content} %%${item.id}%%\n`
      if (item.description) {
        content += `${item.description.replace(/^/gm, '	')} %%${item.id}%%\n`
      }
    })
  })

  return content
}

/*
 * *******
 * ARCHIVE
 * *******
 */

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
    await writeTitle(title, 2)

    // Get Project Items & Sections
    const project = projects.find(project => project.name === title)
    const data = await getProjectItems(project.id)

    Object.keys(data).map(key => {
      const section = data[key]

      if (section.name) {
        writeTitle(section.name, 4)
      }

      section.items.map(item => createTaskFromItem(item))
    })
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

// List all reminders from a specific list
export async function listRemindersIn() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    const optionChosen = await CommandBar.prompt(
      'Which list would you like to sync?',
      'Pick from one of your reminders lists.',
      titles
    )
    const title = [titles[optionChosen]]
    await writeTitle(title)
    const reminders = await Calendar.remindersByLists(title)
    createRemindersList(reminders)
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

// List all lists and their reminders
export async function listAllReminders() {
  try {
    const titles = await Calendar.availableReminderListTitles()
    for (const title of titles) {
      await writeTitle(title)
      const reminders = await Calendar.remindersByLists([title])
      createRemindersList(reminders)
    }
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}