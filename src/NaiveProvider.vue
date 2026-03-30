<script setup lang="ts">
// Naive UI 的 useMessage、useNotification 等组合式函数只能在组件的 setup 中调用，不能在普通函数中直接使用。
// 如果需要在非组件场景（例如网络请求的响应拦截器）中弹出消息，就需要这种全局挂载的方式。
function registerNaiveTools () {
  window.$ModalMessage = useMessage()
  window.$ModalNotification = useNotification()
  window.$ModalDialog = useDialog()
  window.$ModalLoadingBar = useLoadingBar()
}

const NaiveProviderWrapper = defineComponent({
  name: 'NaiveProviderWrapper',
  setup() {
    registerNaiveTools()
  },
  render() {
    return h('div')
  }
})
</script>
<!-- 全局挂载的用途是让你在非 Vue 组件环境中也能调用这些方法，比如：
      a. axios 拦截器
      b. 工具函数文件
      c. Vuex / Pinia 的 action
    但你依然需要在应用的某个顶层位置（通常是 App.vue）提供这些 Provider，确保整个应用都能享受它们提供的功能。 
-->
<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <slot></slot>
          <NaiveProviderWrapper />
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>
