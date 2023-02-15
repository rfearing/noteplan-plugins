export { listAllReminders } from './NPPluginMain' // add one of these for every command specified in plugin.json (the function could be in any file as long as it's exported)

/**
 * Other imports/exports - you will normally not need to edit these
 */
// eslint-disable-next-line import/order
export { onUpdateOrInstall, init, onSettingsUpdated } from './NPTriggers-Hooks'
export { onOpen, onEditorWillSave } from './NPTriggers-Hooks'
