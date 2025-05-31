import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "u-space-后端技术文档",
    description: "u-space后端详细技术文档",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
        ],

        sidebar: [
            {
                text: '项目介绍',
                items: [
                    {text: '介绍', link: '/home'},
                    {text: '二次开发要求', link: '/second'},
                ]
            },
            {
                text: '通用模块详接',
                items: [
                    {text: '通用模块详接', link: '/common'},
                ]
            },
            {
                text: '业务模块详接',
                items: [
                    {text: 'xiaou-bbs模块', link: '/bbs'},
                    {text: 'xiaou-ai模块', link: '/ai'},
                    {text: 'xiaou-onlineexam模块', link: '/exam'},
                ]
            }
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/vuejs/vitepress'}
        ]
    }
})
