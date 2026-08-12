<script setup lang="ts">
import { ApplicationRef, createComponent, type Type } from '@angular/core'
import { createApplication } from '@angular/platform-browser'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const { component } = defineProps<{ component: Type<unknown> }>()
const host = useTemplateRef<HTMLElement>('host')
let app: ApplicationRef | undefined

onMounted(async () => {
  app = await createApplication()
  const ref = createComponent(component, {
    environmentInjector: app.injector,
    hostElement: host.value!,
  })
  app.attachView(ref.hostView)
})

onBeforeUnmount(() => app?.destroy())
</script>

<template>
  <div ref="host" />
</template>
