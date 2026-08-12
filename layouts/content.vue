<script setup lang="ts">
defineProps<{
  eyebrow?: string
  eyebrowColor?: 'teal' | 'purple'
  title?: string
  /** Vertically centre and open the spacing up (statement slides). */
  center?: boolean
  /** Lighter background, used by the deck for its emphasis slides. */
  alt?: boolean
  /** grid-template-columns for the default/::right:: split, e.g. '1.2fr 0.8fr'. */
  split?: string
}>()
</script>

<template>
  <div
    class="slidev-layout"
    :class="{ alt }"
    style="display:flex;flex-direction:column"
    :style="center ? 'justify-content:center' : ''"
  >
    <div
      v-if="eyebrow"
      class="eyebrow"
      :class="eyebrowColor"
      :style="`margin-bottom:${center ? 44 : 28}px`"
      v-html="eyebrow"
    />
    <h2 v-if="title" :style="`margin-bottom:${center ? 40 : 20}px`" v-html="title" />

    <div v-if="$slots.right" class="split" :style="split ? `--split:${split}` : ''">
      <div><slot /></div>
      <div><slot name="right" /></div>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
.slidev-layout :deep(.lead) {
  margin-bottom: 48px;
}

/* A heading with no lead paragraph still needs air before the body */
.slidev-layout :deep(h2 + *:not(.lead)) {
  margin-top: 36px;
}
</style>

<style src="../style.css"></style>
