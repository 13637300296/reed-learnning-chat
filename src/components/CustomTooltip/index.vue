<script lang="tsx" setup>
</script>

<template>
  <n-tooltip
    trigger="hover"
    content-class="wrapper-tooltip-scroller"
    v-bind="$attrs"
  >
    <!-- 主体 -->
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <!-- tip 内容 -->
    <slot></slot>
  </n-tooltip>
</template>
