export function useClipText () {
  const copied = ref(false)
  const copyDuration = 1500
  // 设置 copied = true，并在 copyDuration 后重置为 false
  const handleCopied = () => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, copyDuration)
  }

  function copy (textToCopy) {
    // window.isSecureContext---判断当前网页是否运行在 安全上下文（Secure Context）
    // 出于安全考虑，只有在 HTTPS 或 localhost 下，浏览器才允许网页读写剪贴板。
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(textToCopy).then(() => {
        handleCopied()
      })
    } 
    // 降级方案（老旧浏览器或非安全上下文）
    else {
      // 创建一个 <textarea> 元素（因为只有可编辑元素才能选中文本）
      const textArea = document.createElement('textarea')
      // 把要复制的文本设为它的 value
      textArea.value = textToCopy
      // 隐藏它（通过定位到屏幕外 + 透明度 0，避免影响布局）
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      // 添加到页面中
      document.body.appendChild(textArea)
      // 聚焦并全选其中的文本
      textArea.focus()
      textArea.select()
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 复制命令：把当前选中的文本复制到剪贴板
          const exec = document.execCommand('copy')
          if (exec) {
            handleCopied()
            resolve('')
          } else {
            reject(new Error)
          }
          //  清理 DOM
          textArea.remove()
        })
      })
    }
  }

  return {
    copy,
    copied,
    copyDuration
  }
}
