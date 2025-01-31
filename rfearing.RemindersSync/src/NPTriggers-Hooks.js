/* eslint-disable require-await */
// @flow

import pluginJson from '../plugin.json' // gives you access to the contents of plugin.json
import { IDENTIFIER } from './support/helpers'
import { log, logError, logDebug, timer, clo, JSP } from '@helpers/dev'
import { updateSettingData, pluginUpdated } from '@helpers/NPConfiguration'

/**
 * NOTEPLAN PER-NOTE TRIGGERS
 *
 * The following functions are called by NotePlan automatically
 * if a note has a triggers: section in its frontmatter
 * See the documentation: https://help.noteplan.co/article/173-plugin-note-triggers
 */

/**
 * onOpen
 * Plugin entrypoint for command: "/onOpen"
 * Called when a note is opened and that note
 * has a triggers: onOpen in its frontmatter
 * @param {TNote} note - current note in Editor
 */
export async function onOpen(note: TNote): Promise<void> {
  try {
    logDebug(pluginJson, `${pluginJson['plugin.id']} :: onOpen running for note:"${String(note.filename)}"`)
    // Try to guard against infinite loops of opens/refreshing
    // You can delete this code if you are sure that your onOpen trigger will not cause an infinite loop
    // But the safest thing to do is put your code inside the if loop below to ensure it runs no more than once every 15s
    const now = new Date()
    if (Editor?.note?.changedDate) {
      const lastEdit = new Date(Editor?.note?.changedDate)
      if (now - lastEdit > 15000) {
        logDebug(pluginJson, `onOpen ${timer(lastEdit)} since last edit`)
        // Put your code here or call a function that does the work
      } else {
        logDebug(pluginJson, `onOpen: Only ${timer(lastEdit)} since last edit (hasn't been 15s)`)
      }
    }
  } catch (error) {
    logError(pluginJson, `onOpen: ${JSP(error)}`)
  }
}

const isReminder = (paragraph) => {
  return (
    paragraph.content.includes(IDENTIFIER) // && (paragraph.type === 'open' || paragraph.type === 'checklist')
  )
}

/**
 * onEditorWillSave
 * Plugin entrypoint for command: "/onEditorWillSave"
 */
export async function onEditorWillSave() {
  try {
    logDebug(pluginJson, `${pluginJson['plugin.id']} :: onEditorWillSave running with note in Editor:"${String(Editor.filename)}"`)

    const paragraphs = Editor.paragraphs
    const todos = paragraphs.filter((p) => isReminder(p))
    todos.forEach(element => {
      if (element.type === 'done') {
        // console.log(`DONE: ${element.content}`)
      }
    })

    // paragraphs[4].content = "test"
    // Editor.updateParagraphs(paragraphs)
  } catch (error) {
    logError(pluginJson, `onEditorWillSave: ${JSP(error)}`)
  }
}

/*
 * NOTEPLAN GLOBAL PLUGIN HOOKS
 *
 * The rest of these functions are called by NotePlan automatically under certain conditions
 * It is unlikely you will need to edit/add anything below this line
 *
 */

/**
 * NotePlan calls this function after the plugin is installed or updated.
 * The `updateSettingData` function looks through the new plugin settings in plugin.json and updates
 * the user preferences to include any new fields
 */
export async function onUpdateOrInstall(): Promise<void> {
  try {
    logDebug(pluginJson, `${pluginJson['plugin.id']} :: onUpdateOrInstall running`)
    await updateSettingData(pluginJson)
  } catch (error) {
    logError(pluginJson, `onUpdateOrInstall: ${JSP(error)}`)
  }
}

/**
 * NotePlan calls this function every time the plugin is run (any command in this plugin, including triggers)
 * You should not need to edit this function. All work should be done in the commands themselves
 */
export function init(): void {
  try {
    logDebug(pluginJson, `${pluginJson['plugin.id']} :: init running`)
    //   clo(DataStore.settings, `${pluginJson['plugin.id']} Plugin Settings`)
    DataStore.installOrUpdatePluginsByID([pluginJson['plugin.id']], true, false, false).then((r) => pluginUpdated(pluginJson, r))
  } catch (error) {
    logError(pluginJson, `init: ${JSP(error)}`)
  }
}

/**
 * NotePlan calls this function settings are updated in the Preferences panel
 * You should not need to edit this function
 */
export async function onSettingsUpdated(): Promise<void> {
  try {
    logDebug(pluginJson, `${pluginJson['plugin.id']} :: onSettingsUpdated running`)
  } catch (error) {
    logError(pluginJson, `onSettingsUpdated: ${JSP(error)}`)
  }
}


/**
 * onEditorWillSave - look for timeblocks that were marked done and remove them
 * Plugin entrypoint for command: "/onEditorWillSave" (trigger)
 * @author @dwertheimer
 * @param {*} incoming
 */
/*
export async function onEditorWillSave(incoming: string | null = null) {
  try {
    const completedTypes = ['done', 'scheduled', 'cancelled', 'checklistDone', 'checklistScheduled', 'checklistCancelled']
    logDebug(pluginJson, `onEditorWillSave running with incoming:${String(incoming)}`)
    const config = await getConfig()
    const { checkedItemChecksOriginal, todoChar, timeBlockHeading } = config
    // check for today note? -- if (!editorIsOpenToToday())
    if (shouldRunCheckedItemChecksOriginal(config)) {
      // get character block
      const updatedParasInTodayNote = []
      const timeBlocks = getBlockUnderHeading(Editor, timeBlockHeading, false)
      if (timeBlocks?.length) {
        const checkedItems = timeBlocks.filter((f) => completedTypes.indexOf(f.type) > -1)
        if (checkedItems?.length) {
          // clo(checkedItems, `onEditorWillSave found:${checkedItems?.length} checked items`)
          const todayTodos = getTodaysFilteredTodos(config)
          // clo(todayTodos, `onEditorWillSave ${todayTodos?.length} todayTodos`)
          checkedItems.forEach((item, i) => {
            const referenceID = item.content.match(/noteplan:\/\/.*(\%5E.*)\)/)?.[1].replace('%5E', '^') || null
            logDebug(pluginJson, `onEditorWillSave: item[${i}] content="${item.content}" blockID="${referenceID}"`)
            const todo = todayTodos.find((f) => (referenceID ? f.blockId === referenceID : cleanTimeBlockLine(item.content, config) === cleanTimeBlockLine(f.content, config)))
            if (todo) {
              clo(todo, `onEditorWillSave: found todo for item[${i}] blockID="${referenceID}" content=${todo.content} in file ${todo.filename || ''} | now updating`)
              const isEditor = Editor.filename === todo.filename
              const note = isEditor ? Editor : todo.note
              todo.type = 'done'
              note?.updateParagraph(todo)
              logDebug(pluginJson, `onEditorWillSave: found todo for item[${i}] blockID="${referenceID}" content=${todo.content} in file ${todo.filename || ''} | now updating`)
              if (!isEditor) {
                DataStore.updateCache(note)
              } else {
                logDebug(pluginJson, `onEditorWillSave: checked off item: "${item.content}" but manual refresh of TimeBlocks will be required`)
                updatedParasInTodayNote.push(Editor.paragraphs[todo.lineIndex])
              }
            } else {
              logDebug(pluginJson, `onEditorWillSave: no todo found for item[${i}] blockID="${referenceID}" cleanContent="${cleanTimeBlockLine(item.content, config)}"`)
            }
          })
          // re-run /atb - but is it safe within a hook?
          await createTimeBlocksForTodaysTasks(config, updatedParasInTodayNote)
        }
      }
    }
  } catch (error) {
    logError(pluginJson, JSP(error))
  }
}

*/
