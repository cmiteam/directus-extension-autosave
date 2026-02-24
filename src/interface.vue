<template>
  <div v-if="primaryKey && primaryKey !== '+'">
    <VNotice type="info" icon="save" v-if="numChangesPending"
      >Autosave: {{ numChangesPending }} pending
      {{ numChangesPending.length === 1 ? 'change' : 'changes' }}</VNotice
    >
    <VNotice type="success" icon="save" v-else>Autosave: Up-to-date</VNotice>
  </div>
</template>

<script lang="ts" setup>
import { inject, watch, ref, computed, nextTick, Ref } from 'vue';
import { useSdk } from '@directus/extensions-sdk';
import { updateItem } from '@directus/sdk';
import debounce from 'lodash.debounce';

const props = withDefaults(
  defineProps<{
    collection: string;
    primaryKey: string | number;
    autosave_frequency?: number;
  }>(),
  { autosave_frequency: 1000 },
);

const sdk = useSdk();

const values = inject('values') as object;
const emit = defineEmits(['setFieldValue']);

// Guard flag to ignore value changes triggered by writing the server response back into the form.
const isSaving = ref(false);

// Track the latest edits to an object between debounced updates.
const changes: Ref<object | null> = ref(null);
const numChangesPending = computed(
  () => Object.keys(changes.value || {}).length,
);

// Simple object diff function. Not foolproof, but works well enough for this initial version.
const diffObjects = (
  oldObject: { [key: string]: any },
  newObject: { [key: string]: any },
) => {
  const diffInFields = Object.entries(newObject).filter(
    ([field, obj2Value]) =>
      JSON.stringify(oldObject[field]) !== JSON.stringify(obj2Value),
  );
  return Object.fromEntries(diffInFields);
};

watch(values, (newValue, oldValue) => {
  // Don't track anything if we're in "add" mode.
  if (props.primaryKey === '+' || !props.primaryKey) return;
  // Ignore changes triggered by writing the server response back into the form.
  if (isSaving.value) return;
  // If there was no previous value, don't count this as a change. It was probably during data loading.
  if (!oldValue || !Object.keys(oldValue).length) return;

  const diff = diffObjects(oldValue, newValue);
  // Ignore empty diffs.
  if (Object.keys(diff).length === 0) return;

  // Combine previous changes with the latest ones to collect updates during debounces.
  changes.value = {
    ...(changes.value || {}),
    ...diff,
  };
  triggerDebouncedUpdate();
});

const triggerDebouncedUpdate = debounce(async function () {
  // If there are no changes, don't do anything.
  if (!changes.value) return;
  // Copy the changes object, then reset it. That way we can collect changes that happen while this update call is pending.
  const changesToSave = { ...(changes.value || {}) };
  changes.value = null;

  // Trigger a server-side update.
  const result = await sdk.request(
    // @ts-ignore - No idea why TS is complaininga bout props.collection, and I don't really care.
    updateItem(props.collection, props.primaryKey, changesToSave),
  );

  // To avoid relational data duplicating itself, attempt to set the results of the update call back on the main form.
  // This causes some odd issues, like triggering a second auto-update on relational forms, but seems to largely work.
  // Set the saving guard so the watcher ignores these changes (prevents infinite update loops with collaborative editing).
  isSaving.value = true;
  for (const [key, value] of Object.entries(result as object)) {
    emit('setFieldValue', { field: key, value: value });
  }
  // Use nextTick to clear the guard after Vue has processed all the reactive updates.
  await nextTick();
  isSaving.value = false;
}, props.autosave_frequency);
</script>
