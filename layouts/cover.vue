<script setup lang="ts">
defineProps<{ eyebrow?: string; meta?: string[] }>()
</script>

<template>
  <div class="slidev-layout" style="display:flex;flex-direction:column;justify-content:center">
    <div v-if="eyebrow" class="eyebrow" style="margin-bottom:44px" v-html="eyebrow" />
    <slot />
    <div v-if="meta" style="display:flex;gap:56px;margin-top:96px;font-family:var(--font-mono);font-size:24px;color:var(--dim)">
      <span v-for="m in meta" :key="m">{{ m }}</span>
    </div>
  </div>
</template>

<style scoped>
.slidev-layout :deep(h1) {
  font-size: 112px;
  letter-spacing: -0.035em;
  line-height: 1;
}

.slidev-layout :deep(h1 + p) {
  font-size: 40px;
  font-weight: 300;
  color: var(--muted);
  line-height: 1.35;
  margin-top: 36px;
  max-width: 1200px;
}
</style>

<style src="../style.css"></style>
