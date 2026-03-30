<script lang="ts" setup>

/**
 * Slot: Top + Center + Bottom
 */
defineOptions({
  name: 'LayoutSlotFrame'
})

</script>
<!--  上中下布局  中间一栏自适应  -->
<template>
  <div class="slot-frame-layout-container">
    <div
      v-if="$slots.top"
      class="top"
    >
      <slot name="top"></slot>
    </div>
    <div class="center">
      <slot name="center"></slot>
    </div>
    <div class="bottom">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// --at-apply: 是 UnoCSS（或 Windi CSS）提供的一个 CSS 自定义属性，
// 用于在 <style> 块中“应用”原子类（utility classes）。


// 在 CSS（或 SCSS）中，你可以通过 --at-apply: 后面跟一组实用类名，
// 将这些类的样式内联到当前选择器中。

// 这相当于将原子类“复制”到 CSS 规则里，避免了在 HTML 中堆砌大量类名，
// 也便于在组件样式集中管理。

.slot-frame-layout-container {
  --at-apply: h-100dvh;
  --at-apply: flex flex-col;
  --at-apply: overflow-hidden;

  .top,
  .bottom {
    --at-apply: w-full;

    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    min-height: 0;
  }

  .center {
    --at-apply: flex flex-1 min-w-0 overflow-hidden;
  }
}
</style>
