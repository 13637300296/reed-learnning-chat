// 处理SSE格式的数据
/**
 * 作用：服务端推送的 data: 格式消息，可能一个连接发送多条。
 * 输入：buffer：字符串，当前累积的未处理数据。
 *      controller：TransformStreamDefaultController 对象，用于向流中输出已处理的数据块。
 *      splitOn：字符串，消息之间的分隔符（例如 \n\n）
 * 输出：返回一个字符串，即 最后一个不完整的部分（可能是一个消息的前半部分），需要与后续数据拼接后再处理。
 */
const processSSE = (buffer, controller, splitOn) => {
  // 得到完整消息数组 parts 和最后一个不完整片段lastPart
  const parts = buffer.split(splitOn)
  const lastPart = parts.pop()

  for (const part of parts) {
    const trimmedPart = part.trim()
    if (!trimmedPart) continue

    if (trimmedPart.startsWith('data:')) {
      // 如果以 data: 开头，则提取 data: 后面的内容（去掉 data: 前缀），并去除空白。
      const content = trimmedPart.replace(/^data: /, '').trim()
      if (content) {
        // 对提取的内容尝试 JSON.parse（但这里只解析不保存结果，主要是为了校验是否是 JSON），
        // 无论是否为 JSON 都通过 controller.enqueue() 发送。
        try {
          JSON.parse(content)
          controller.enqueue(content)
        } catch (e) {
          // 不是JSON，发送原文本
          controller.enqueue(content)
        }
      }
    } else {
      controller.enqueue(trimmedPart)
    }
  }
  // 返回 lastPart（未完成的部分）供下次累积。
  return lastPart
}

// 处理可能包含多个JSON对象的数据
/**
 * 作用：多个 JSON 对象被拼接在一起，需要逐个解析。
 * @param buffer ：字符串，当前累积的未处理数据。
 * @param controller ：TransformStreamDefaultController 对象，用于输出提取到的完整 JSON 对象（作为字符串）
 * @returns ：返回一个字符串，即 无法识别为完整 JSON 的剩余部分。如果成功提取了至少一个 JSON，则返回剩余部分；如果完全没有提取到，则返回原始 buffer
 */
const processJSON = (buffer, controller) => {
  let remaining = buffer
  let processed = false

  // 尝试找出所有完整的JSON对象
  while (remaining.trim() !== '') {
    let validJSON = ''
    let validJSONEndIndex = -1

    // 寻找第一个有效的JSON对象
    for (let i = 0; i <= remaining.length; i++) {
      try {
        const possibleJSON = remaining.substring(0, i)
        if (possibleJSON.endsWith('}')) {
          JSON.parse(possibleJSON)
          validJSON = possibleJSON
          validJSONEndIndex = i
          break
        }
      } catch (e) {
        // 继续尝试
      }
    }

    if (validJSON) {
      try {
        JSON.parse(validJSON)
        controller.enqueue(validJSON)
        remaining = remaining.substring(validJSONEndIndex).trim()
        processed = true
      } catch (e) {
        // 如果最终解析出错，跳出循环
        break
      }
    } else {
      // 没找到有效JSON，退出循环
      break
    }
  }

  return processed ? remaining : buffer
}
/**
 * 作用：返回一个 TransformStream，用于处理从上游（如 fetch 响应流）接收的文本块，
 *       并根据内容的格式自动选择 processSSE 或 processJSON 进行分割，
 *       最终向下游输出一个个独立的数据单元（字符串）
 * 输入：上游推入的每个 chunk 都是字符串（通常是 TextDecoderStream 解码后的文本片段）
 * 输出：下游收到的每个 value 都是处理后的独立数据单元（如一条 SSE 消息内容，或一个完整的 JSON 字符串）。
 * 
 */
export const splitStream = (splitOn) => {
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk
      // 移除字符串开头和结尾的空白字符
      const trimmedBuffer = buffer.trim()

      // 根据内容格式选择处理方法
      // data: 开头 → 视为 SSE 格式
      if (trimmedBuffer.startsWith('data:')) {
        // SSE格式
        buffer = processSSE(buffer, controller, splitOn)
      } 
      // 以 { 开头，且含 "model"、"message"、"done" 等→ 为 JSON 格式
      else if (trimmedBuffer.startsWith('{') && (
        trimmedBuffer.includes('"model"') ||
          trimmedBuffer.includes('"message"') ||
          trimmedBuffer.includes('"done"'))) {
        const newBuffer = processJSON(buffer, controller)

        // 如果JSON处理没有成功，当作普通文本处理
        if (newBuffer === buffer) {
          // 将一个数据块放入流的内部队列
          controller.enqueue(chunk)
          buffer = ''
        } else {
          buffer = newBuffer
        }
      } 
      else {
        // 普通文本格式
        controller.enqueue(chunk)
        buffer = ''
      }
    },
    // 处理收尾数据工作
    flush(controller) {
      if (buffer.trim() !== '') {
        // 最后尝试处理为JSON
        try {
          controller.enqueue(buffer.trim())
        } catch (e) {
          // 不是JSON，发送原文本
          controller.enqueue(buffer)
        }
      }
    }
  })
}
