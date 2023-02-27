// @flow

export type TypeOptions = 'open' | 'checklist'

/*
 * *********
 * Reminders
 * *********
 */
export type ReminderType = {
  title: string,
  date: string, // (always the date that the plugin is run)
  endDate?: string,
  type: string,
  isAllDay?: Boolean,
  isCompleted?: boolean,
  occurrences?: string[],
  calendar?: string,
  notes?: string,
  url?: string,
  availability?: number
}

/*
 * *******
 * Todoist
 * *******
 */
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