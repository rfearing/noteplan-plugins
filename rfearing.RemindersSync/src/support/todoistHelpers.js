// @flow

import pluginJson from '../../plugin.json'

// Make this an environment variable:
export const TODOIST_TOKEN = '9e51d0ad84d55eee09811f76203204625fd1e46c'
export const SYNC_API = 'https://api.todoist.com/sync/v9'
export const PROJECTS_CACHE = `${pluginJson['plugin.id']}-projects.json`

export const IDENTIFIER = '%%\u200B%%'

export type ItemType = {
  id: string,
  user_id: string,
  project_id?: string,
  content: string,
  description?: string,
  priority: number,
  due?: number,
  parent_id?: number,
  child_order: 1,
  section_id?: string,
  day_order: number,
  collapsed: boolean,
  labels: string[],
  checked: boolean,
  is_deleted: boolean,
  sync_id?: string,
  added_at: string
}

export type ProjectType = {
	id: string,
	name: string,
	color: ?string,
  project_id?: string,
  parent_id?: number,
  child_order: 1,
	collapsed?: boolean,
	shared?: boolean,
	sync_id?: string,
	is_deleted?: boolean,
	is_archived?: boolean,
	is_favorite?: boolean,
	view_style?: string,
}

const getOptions = body => ({
	method: 'POST',
	headers: {
		'Authorization': `Bearer ${TODOIST_TOKEN}`,
		'Content-Type': 'application/json'
	},
	body
})

const shouldShow = data => !(data.is_deleted || data.is_archived)

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
