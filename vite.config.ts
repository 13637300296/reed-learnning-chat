import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import raw from 'vite-raw-plugin'

import UnoCSS from 'unocss/vite'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_ROUTER_MODE === 'hash'
      ? ''
      : '/',
    server: {
      port: 2048,
      proxy: {
        '/spark': {
          target: 'https://spark-api-open.xf-yun.com',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/spark/, '')
        },
        '/siliconflow': {
          target: 'https://api.siliconflow.cn',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/siliconflow/, '')
        },
        '/moonshot': {
          target: 'https://api.moonshot.cn',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/moonshot/, '')
        },
        '/deepseek': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/deepseek/, '')
        }
      }
    },
    plugins: [
      UnoCSS(),//高性能的原子化 CSS 引擎,替代 TailwindCSS
      vue(),
      raw({
        fileRegex: /\.md$/ //将匹配 .md 后缀的文件当作原始字符串导入（不经过编译）
      }),
      vueJsx(),
      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue\??/
        ],
        imports: [
          // 值导入（运行时可用）
          'vue',  // 自动导入 ref, reactive, computed 等
          'vue-router', // 自动导入 useRouter, useRoute
          '@vueuse/core',// 自动导入 useMouse, useStorage 等
          //  类型导入（仅 TypeScript 类型检查）
          {
            'vue': [
              'createVNode',
              'render'
            ],
            'vue-router': [
              'createRouter',
              'createWebHistory',
              'useRouter',
              'useRoute'
            ],
            'uuid': [['v4', 'uuidv4']],
            'lodash-es': [
              ['*', '_']
            ],
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          },
          //  类型导入（仅 TypeScript 类型检查）
          {
            from: 'vue',
            imports: [
              'App',
              'VNode',
              'ComponentInternalInstance',
              'GlobalComponents',
              'SetupContext',
              'PropType'
            ],
            type: true // ← 关键！只用于类型，不打包到 JS
          },
          {
            from: 'vue-router',
            imports: [
              'RouteRecordRaw',
              'RouteLocationRaw'
            ],
            type: true
          }
        ],
        // 按需自动解析 Naive UI 组件（生产环境启用，开发环境可能为了 HMR 稳定性关闭）。
        // 结合后面的 Components 插件，实现 “用到才引入”，减小包体积。
        resolvers:
          mode === 'development'
            ? []
            : [NaiveUiResolver()],
        // 自动扫描这些目录下的函数，也支持自动导入。
        dirs: [
          './src/hooks',
          './src/store/business',
          './src/store/transform'
        ],
        //自动生成 TypeScript 声明文件，让 IDE 能智能提示自动导入的函数。
        dts: './auto-imports.d.ts',
        // 自动生成 ESLint 规则，防止你重复手动 import（会报错）
        eslintrc: {
          enabled: true
        },
        //允许在 Vue 模板中直接使用自动导入的函数
        vueTemplate: true
      }),
      Components({
        directoryAsNamespace: true, // 目录名作为命名空间（如 components/layout/Header.vue → LayoutHeader）
        collapseSamePrefixes: true, // 合并相同前缀（如 IconUser, IconSetting → Icon.User, Icon.Setting）
        resolvers: [
          IconsResolver({
            prefix: 'auto-icon'
          }),
          NaiveUiResolver()
        ]
      }),
      // Auto use Iconify icon
      Icons({
        autoInstall: true, // 自动安装缺失的图标集（如 @iconify/json）
        compiler: 'vue3',
        scale: 1.2,
        defaultStyle: '',
        defaultClass: 'unplugin-icon',
        jsx: 'react'
      })
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.less', '.css'],
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        }
      ]
    },
    //将环境变量注入代码，在运行时可通过 process.env.VITE_ROUTER_MODE 访问（Vite 特有，非 Node.js 的 process）
    define: {
      'process.env.VITE_ROUTER_MODE': JSON.stringify(env.VITE_ROUTER_MODE)
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          //全局注入 SCSS 变量，所有 .scss 文件都能直接使用  $ primary-color 等变量，无需 @import。
          additionalData: `@use '@/styles/naive-variables.scss' as *;`
        }
      }
    }
  }
})
