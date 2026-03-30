<!-- 
  这个组件的主要作用是 在 Vue 应用中集中配置 Naive UI 的 Provider，
  并将消息、通知、对话框、加载条等 API 挂载到全局 window 对象上，
  方便在任意地方（如工具函数、axios 拦截器、非 Vue 文件）直接调用这些方法，
  而无需在组件中通过组合式函数获取。
-->
<script lang="ts" setup>
import NaiveProvider from './NaiveProvider.vue'
import { dateZhCN, zhCN } from 'naive-ui'

const { defaultTheme, themeOverrides } = useTheme()

defineOptions({
  name: 'App'
})
useCopyCode()
</script>

<template>
  <NConfigProvider
    class="h-full"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="defaultTheme"
    :theme-overrides="themeOverrides"
  >
   <!-- 整个应用都处于这些 Provider 的作用域内，且全局 API 已挂载完毕 -->
   <!-- Naive UI 的 useMessage、useNotification 等组合式函数，依赖其对应的 Provider 通过 provide 提供的上下文实例。 -->
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
</template>

<style lang="scss">
@use "@/styles/index";
</style>
