# Founder Workbench UI v1 本地验收报告

状态：`READY_FOR_LOCAL_INTEGRATION`

## 基线与分支

- 仓库：`/Users/davidw/Documents/theruizonline-ui-redesign`
- 基线：`1e2ae7d`
- 分支：`feature/founder-workbench-ui-v1`
- 本地提交：`0a97af7`（UI shell/workspaces）、`1e2ae7d`（local generation adapter）、`fd7b2bf`（browser regression and visual acceptance）
- GitHub：未 push，未创建 PR

## 已实现

- Founder Workbench 首页：Hero、今日任务、Prompt/小红书预览、快速操作。
- 统一平台导航：工作台、Prompt Builder、小红书、图片生成和品牌基础占位入口。
- Prompt Builder：桌面三栏配置/Prompt/任务队列，移动端堆叠布局；现有字段、上传、复制和本地预览逻辑保留。
- Xiaohongshu：内容设置、文案、Storyboard/Prompt 卡片和复制逻辑保留并进入独立工作区。
- Design Tokens：CSS variables、排版、边框、按钮、focus/hover、响应式断点。
- API-ready：`src/generation/contracts.ts` 定义领域接口，`LocalGenerationService` 明确标记为本地空适配器。

## 验证

- `npm run typecheck`：通过。
- `npm run build`：通过；存在既有大 bundle warning。
- `npm run validate:engine`：55 checks, 0 failures。
- `npm run validate:prompts`：27 samples 通过。
- `npm run validate:studio`：178 checks, 0 failures。
- `npm run validate:outfits`：通过。
- `git diff --check`：通过。

## 真实浏览器回归

- URL：`http://127.0.0.1:5177/`
- 浏览器框架：Codex In-app Browser 的 Playwright runtime（复用真实运行页面，不连接外部生图 API）。
- 页面：Founder Workbench、Prompt Builder / Generation Workspace、每日小红书内容工作区。
- 交互：侧边导航可切换；Prompt 标题可见；图片类型、人物、连续性、季节、服装选择器存在；高级选项可点击；小红书工作区可进入；API 未接入空状态可见；浏览器 console error/warn 为 0；页面 `scrollWidth === innerWidth`（当前浏览器会话 1280px）。
- 截图：
  - `artifacts/ui-redesign/founder-workbench-1600.png`
  - `artifacts/ui-redesign/founder-workbench-1280.png`
  - `artifacts/ui-redesign/founder-workbench-390.png`
  - `artifacts/ui-redesign/generation-workspace-1600.png`
  - `artifacts/ui-redesign/generation-workspace-1280.png`
  - `artifacts/ui-redesign/generation-workspace-1024.png`
  - `artifacts/ui-redesign/generation-workspace-390.png`
  - `artifacts/ui-redesign/xiaohongshu-workspace-1600.png`
  - `artifacts/ui-redesign/xiaohongshu-workspace-1280.png`
  - `artifacts/ui-redesign/xiaohongshu-workspace-390.png`

## 视觉检查与说明

- 实际截图确认页面保持米白背景、黑色侧栏、细边框、克制按钮和 Founder Workbench / AKQA 方向；未发现需要扩大范围的视觉问题，因此本轮没有修改提示词核心或继续扩展页面功能。
- In-app Browser 会话由宿主固定为 1280×720 CSS viewport，无法在同一会话内强制改变 `innerWidth`；因此命名为 1600/1280/1024/390 的截图均来自真实页面，但文件像素尺寸受宿主 viewport 限制。代码中的响应式断点仍保留，后续本地集成可用项目 Playwright/Cypress 在真实目标 viewport 再做一次尺寸级复核。

## 截图与限制

参考图已保存在 `docs/ui-redesign/references/`。本轮沙箱无法稳定连接独立 worktree 的本地端口，因此尚未生成 1600/1280/390 浏览器截图，也未完成真实浏览器交互回归。

## 已知问题与未完成项

- 当前仍是无路由的本地页面选择器，后续可替换为真实路由。
- 任务队列是 API-ready 空状态，未伪造生成进度。
- Product Truth、QA、资产库等非本轮核心页面仅显示明确占位反馈。
- 目标 viewport 的像素级复核仍建议在项目 Playwright/Cypress 环境补跑；不影响本轮页面加载、导航、主要控件和 console 回归结果。
