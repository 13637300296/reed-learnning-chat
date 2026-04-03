import { defineStore } from 'pinia'

import { sleep } from '@/utils/request'
import * as GlobalAPI from '@/api'


import * as TransformUtils from '@/components/MarkdownPreview/transform'

import { defaultModelName, modelMappingList } from '@/components/MarkdownPreview/models'

export interface BusinessState {
  systemModelName: string
}

export const useBusinessStore = defineStore('business-store', {
  state: (): BusinessState => {
    return {
      systemModelName: defaultModelName
    }
  },
  getters: {
    currentModelItem (state) {
      return modelMappingList.find(v => v.modelName === state.systemModelName)
    }
  },
  actions: {
    /**
     * Event Stream 调用大模型接口 
     * 告诉子组件“这个模型的 chunk 怎么解”
     */
    async createAssistantWriterStylized(data): Promise<{error: number
      reader: ReadableStreamDefaultReader<string> | null}> {

      // 调用当前模型的接口
      return new Promise((resolve) => {
        if (!this.currentModelItem?.chatFetch) {
          return {
            error: 1,
            reader: null
          }
        }
        // store 根据当前模型拿到 chatFetch，发起请求
        this.currentModelItem.chatFetch(data.text)
          .then((res) => {
            if (res.body) {
              // 响应流管道：
              const reader = res.body //字节流
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(TransformUtils.splitStream('\n'))
                .getReader()

              resolve({
                error: 0,
                reader
              })
            } else {
              resolve({
                error: 1,
                reader: null
              })
            }
          })
          .catch((err) => {
            resolve({
              error: 1,
              reader: null
            })
          })
      })
    }
  }
})
