<script lang="ts" setup>
</script>

<template>
  <LayoutSlotCenterPanel v-bind="$attrs">
    <!-- 预留左侧侧菜单栏  如果传入了sidebar 才会渲染左栏-->
    <template
      v-if="$slots.sidebar"
      #left
    >
      <div
        min-h-0
        flex="1 ~ col"
        :class="[
          'select-none',
          'bg-no-repeat bg-cover bg-right',
          'bg-bgcolor'
        ]"
      >
        <div
          v-if="$slots['sidebar-header']"
          py="2px"
        >
          <slot name="sidebar-header"></slot>
        </div>
       
        <div
          flex="1"
          p="20px"
          overflow-y-auto
        >
          <slot name="sidebar"></slot>
        </div>
        <div
          py="14px"
          px="20px"
        >
          <slot name="sidebar-action"></slot>
        </div>
      </div>
    </template>
     <!-- 右侧主内容区 -->
    <div
      h-full
      bg="#fefbff"
    >
      <slot name="default"></slot>
    </div>
  </LayoutSlotCenterPanel>
</template>

<style lang="scss" scoped>
</style>
