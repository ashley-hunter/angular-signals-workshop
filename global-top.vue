<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { slides, total, currentSlideNo } = useNav()

/** The section divider at or before the current slide, so every slide knows where it sits. */
const section = computed(() => {
  for (let no = currentSlideNo.value; no >= 1; no--) {
    const slide = slides.value[no - 1]
    if (slide?.meta?.layout === 'section') {
      return {
        number: slide.meta.slide?.frontmatter?.number as string | undefined,
        title: slide.meta.slide?.title as string | undefined,
      }
    }
  }
  return null
})

const isCover = computed(() => currentSlideNo.value === 1)
const isSection = computed(() => slides.value[currentSlideNo.value - 1]?.meta?.layout === 'section')
const progress = computed(() => currentSlideNo.value / total.value)
</script>

<template>
  <div v-if="!isCover" class="deck-progress">
    <div v-if="section && !isSection" class="deck-progress__label">
      <span class="deck-progress__section">{{ section.number }} {{ section.title }}</span>
      <span class="deck-progress__count">{{ currentSlideNo }} / {{ total }}</span>
    </div>
    <div class="deck-progress__track">
      <div class="deck-progress__fill" :style="{ transform: `scaleX(${progress})` }" />
    </div>
  </div>
</template>

<style scoped>
.deck-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.deck-progress__label {
  position: absolute;
  right: 56px;
  bottom: 26px;
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 20px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dim);
}

.deck-progress__section {
  color: var(--muted);
}

.deck-progress__count {
  padding-left: 14px;
  border-left: 1px solid var(--border);
}

.deck-progress__track {
  height: 4px;
  background: var(--border);
}

.deck-progress__fill {
  height: 100%;
  background: var(--teal);
  transform-origin: left center;
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
