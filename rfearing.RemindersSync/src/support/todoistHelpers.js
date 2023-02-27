// @flow

import pluginJson from '../../plugin.json'
import {ProjectType, ItemType} from './types'
export const SYNC_API = 'https://api.todoist.com/sync/v9'
export const PROJECTS_CACHE = `${pluginJson['plugin.id']}-projects.json`
export const IDENTIFIER = '%%\u200B%%'

const getOptions = body => {
	const token = getApiToken()
	return {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body
	}
}

const shouldShow = data => !(data.is_deleted || data.is_archived)

/**
 * Checks if the Todoist api token is valid
 */
const getApiToken = () => {
  const apiToken = DataStore.settings.apiToken ?? ''

  if (apiToken === '') {
    CommandBar.prompt('API Token Needed', 'No api token found. Please add your Todoist api token in the plugin settings.')
    return
  }
	return apiToken
}

// Create Task from Reminder
export const createTasksFromProject = (project: ProjectType) => {
	Editor.insertTextAtCursor(`### ${project.name} ${IDENTIFIER} \n`)
}

// Create Task from Reminder
export const createTaskFromItem = (item: ItemType) => {
	Editor.insertParagraphAtCursor(`${item.content} ${IDENTIFIER}`, 'open', 0)
	if (item.description) {
		Editor.insertParagraphAtCursor(`${item.description} ${IDENTIFIER}`, 'text', 1)
	}
}

export const getProjects = async (sync_token = '*') => {
  try {
    const body = JSON.stringify({
      sync_token,
      resource_types: '["projects"]',
    })
    const options = getOptions(body)

    const response = await fetch(`${SYNC_API}/sync`, options)
    const data = JSON.parse(response)

		if (data.projects) {
			return data.projects.filter(p => shouldShow(p))
		} else {
			console.log('No projects found')
			return false
		}
  } catch (error) {
    console.log(error)
  }
}

export const getProjectItems = async (project_id: string) => {
  try {
    const body = JSON.stringify({project_id})
    const options = getOptions(body)

    const response = await fetch(`${SYNC_API}/projects/get_data`, options)
    const json = JSON.parse(response)
		const items = json.items.filter(i => shouldShow(i))

		// Items without sections
		const sections = {
			[0]: {
				name: '',
				items: items.filter(i => !i.section_id)
			}
		}

		// Tie items to sections
		json.sections.reduce((all, current) => {
			current && (all[current.id] = {
				name: current.name,
				items: items.filter(i => i.section_id === current.id)
			})

			return all
		}, sections)

		return sections
  } catch (error) {
    console.log(error)
  }
}
