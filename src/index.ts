import { defineInterface } from '@directus/extensions-sdk'
import InterfaceComponent from './interface.vue'

export default defineInterface({
  id: 'autosave',
  name: 'Autosave',
  icon: 'save',
  description:
    'Attempt to automatically save changes to an item in near-realtime.',
  component: InterfaceComponent,
  options: [
    {
      field: 'autosave_frequency',
      type: 'integer',
      name: 'Autosave Frequency',
      meta: {
        width: 'half',
        interface: 'input',
        note: 'Frequency to save changes in milliseconds',
      },
    },
  ],
  hideLabel: true,
  hideLoader: true,
  types: ['alias'],
  localTypes: ['presentation'],
  group: 'presentation',
})
