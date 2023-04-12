# 2023.04.12

- 版本号：1.2.1
- 添加了 History
- 完善了文档
- bugs
  - 屏幕大小变化时 Prompt-hint 位置不更新
- option page
  - History 页面，History 页面支持批量导出所有记录
- 其他
  - 记录每次选择的 reg-prompt group

# 2023.04.10

- 版本号：1.2.0
- 其他
  - 切换了[基于 vite 的脚手架](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite)
- bug
  - 修复了多级列表转换失败的问题
- 内嵌页面
  - 新增复制和导出功能
  - 编辑框输入 `/` 弹出 Prompt 菜单
  - 在 ChatGPT 页面新增复制与导出功能
- 新增管理后台（插件按钮右键 -> 选项(Option) 进入）
  - 支持多正则匹配组，并在后台编辑功能放在后台，主页面仅保留预览和切换功能
  - 支持 Prompt 管理

![](./images/options-preview-1.png)

![](./images/options-preview-2.png)

![](./images/type-ptompt.png)

![](./images/sidebar-preview.png)
