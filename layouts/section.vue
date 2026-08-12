<script setup lang="ts">
defineProps<{ number: string }>()
</script>

<template>
  <div class="slidev-layout" style="display:flex;flex-direction:column;justify-content:center">
    <div style="font-family:var(--font-mono);font-size:120px;font-weight:600;color:var(--border);line-height:1;margin-bottom:24px">
      {{ number }}
    </div>
    <slot />
    <div style="width:180px;height:6px;background:var(--teal);margin-top:48px" />
  </div>
</template>

<style scoped>
.slidev-layout :deep(h2) {
  font-size: 88px;
  letter-spacing: -0.03em;
  line-height: 1;
}
</style>

<style src="../style.css"></style>
