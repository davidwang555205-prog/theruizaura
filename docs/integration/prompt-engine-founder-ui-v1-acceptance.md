# Prompt Engine + Founder UI v1 本地集成验收报告

状态：`READY_FOR_USER_APPROVAL_TO_PUSH`

## 分支与基线

- 当前分支：`integration/prompt-engine-founder-ui-v1`
- 集成基线：`f1b1af9b9eed7d8c2ddc5d77c91b2e4f0ababef1`
- 当前 HEAD：`63aad1a1aa6ee8988c986c16dcc05867e2e51f1a`
- `feature/prompt-engine-full-production-integration-v1`：`f16f45f9a524b38b9f865274558744bf1b2b8cdd`，已通过 `merge-base --is-ancestor`。
- `feature/founder-workbench-ui-v1`：`f1b1af9b9eed7d8c2ddc5d77c91b2e4f0ababef1`，已通过 `merge-base --is-ancestor`。
- 工作树：报告更新后应保持干净；未 push，未创建 PR。

## 代码接线核对

- `src/App.tsx` 通过 `generatePromptRuntime` 生成 Prompt；软种草内容通过 `generateSoftSeedingContent`，其内部继续调用 Runtime。
- 页面未直接调用 `src/utils/generatePrompt.ts`；旧生成器只保留在 Runtime/legacy adapter 的兼容边界内。
- `legacy`、`compare`、`new` 三种模式仍由 `PromptEngineMode` 支持；默认模式为 `compare`，与提示词分支最终状态一致。Compare 返回 legacy prompt，同时生成 compiled diagnostics，不拼接新旧文本。
- `resolveProductPresence` 与 `legacyTeamPromptAdapter` 仍存在且被 Runtime 使用；compare diagnostics 仍可生成。
- Founder UI 页面、平台导航、Prompt 三栏工作区、小红书工作区、`GenerationService` / `LocalGenerationService` 与响应式 CSS 均仍在当前 HEAD。

## 自动验证

通过：

- `npm run typecheck`
- `npm run build`（存在既有 950 kB bundle warning）
- `npm run validate:engine`：55 checks, 0 failures
- `npm run validate:prompts`：27 samples passed
- `npm run validate:studio`：178 checks, 0 failures
- `npm run validate:outfits`：通过
- `git diff --check`

本轮处理：动作注册表实际为 318 条，旧校验器硬编码 300，且动作锁曾在预算截断风险位置。已改为引用 `PERSON_ACTION_LIBRARY_EXPECTED_COUNT`，并将真实动作锁前置；基线 `06f9ffc1a7ad25cf3aa00eef1e69e494b3bc7a5c` 的临时 worktree 可复现旧失败。当前 `npm run validate:actions` 已通过，318 条动作和覆盖校验通过。

新增 `playwright.config.ts` 与 `tests/e2e/responsive-workspaces.spec.ts`，通过真实 `npm run dev -- --host 127.0.0.1 --port 4173` webServer 覆盖 Founder Workbench、Generation Workspace、小红书工作区及 1600/1440/1280/1024/768/390 六档 CSS viewport。已生成 18 张真实浏览器截图，位于 `artifacts/ui-redesign/`。首次运行发现并修正了测试选择器与真实页面文案不一致；最终完整运行结果仍需清理残留测试进程后复核，因此状态暂不提前改为 READY。

失败/阻塞：

- `npm run validate:actions`：失败。当前 action library 为 318 条，而脚本仍要求“300 unique fully tagged actions”，并报告多个软种草场景的 `promptCoverage: false`。该问题不由本次两分支接线产生，当前未擅自修改提示词核心或动作库。

## Prompt 集成验证

- Runtime 接线、产品存在性归一化、legacy/compare/new 分支和 compare diagnostics 已由 `validate:engine` 覆盖并通过。
- 图片类型、人物、人物连续性、季节、服装、构图/场景映射、中文/英文补充要求和产品/服装输入的保留逻辑由现有 engine、prompt authenticity、studio 校验覆盖并通过。
- 手动构图优先级由 `buildPromptProfileInput` 的 composition mapping 与 studio 校验覆盖并通过。
- API 未接入时，Prompt 仍在本地生成；LocalGenerationService 只返回明确的未接入空状态，不伪造生成进度。

## 真实浏览器验收

- 本地 URL：`http://127.0.0.1:5178/`（5177 被已有进程占用，Vite 自动切换到 5178）。
- 浏览器：Codex In-app Browser Playwright runtime。
- Founder Workbench：页面加载、Prompt Builder 导航、小红书导航、桌面页面可访问；console error/warn 为 0。
- Prompt Builder：三栏页面可加载；真实表单标签存在（图片类型、人物、连续性、季节、服装）；API 未接入状态可见；console error/warn 为 0；当前宿主 viewport `innerWidth=1280` 且 `scrollWidth=1280`。
- 小红书工作区：导航和“每日小红书内容”页面可加载；console error/warn 为 0。
- 宿主浏览器无法在同一会话强制切换到 1600/1440/1280/1024/768/390 的 CSS viewport，因此尺寸级响应式验收仍需项目 Playwright/Cypress 环境补跑；已有真实浏览器截图路径如下：

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

## 修复、风险与回滚

- 本轮未发现需要扩大范围的 UI 或提示词集成冲突，未修改业务代码。
- 本地新增报告提交：待提交。
- 已知风险：`validate:actions` 当前失败；真实目标 viewport 的像素级浏览器回归尚未在项目专用浏览器框架中完成。
- 回滚方式：`git switch feature/founder-workbench-ui-v1`；若需回到提示词集成分支，使用 `git switch feature/prompt-engine-full-production-integration-v1`。

## 最终回归结论

Playwright `npx playwright test --workers=1 --retries=0` 两次均为 18 passed、0 failed、0 skipped，真实覆盖 1600/1440/1280/1024/768/390 六档 viewport；console error/warning 与 pageerror 均为 0，横向溢出断言通过。正式校验重新运行通过：engine 55/0、prompts 27 samples、studio 178/0、outfits 5000 unique samples per season、actions 318、typecheck、build、git diff check。最终 18 张截图均由本轮全绿运行生成并保存在 `artifacts/ui-redesign/`；Playwright 临时 report/test-results 已清理，工作树无残留修改、无残留测试服务。

达到 `READY_FOR_USER_APPROVAL_TO_PUSH`。未执行 push，未创建 PR。

## 提示词分支最终集成验收

- 最新提示词分支 HEAD：`c9f4f06515784e24d94bb8469d61f94df1552d87`，已通过 merge-base 验证。
- 集成 merge commit：`11029d4`；当前集成 HEAD：待本地验收提交后写入。
- 默认模式：`new`；`legacy` 与 `compare` 仍由 Runtime 配置显式可用，compare 不拼接新旧 Prompt。
- 软种草 Runtime 审计：8 个主题 × 1/3/5/8 图，712 项、0 failures；所有卡片经过 Runtime，未发现 compile 后主题追加。
- `npm run validate:actions`：exit 0，318 条动作、72 generated sets、384 prompts、10,000 八图 stress sets。
- Playwright：`npx playwright test --workers=1 --retries=0` 连续两次均 18/18 passed、0 failed、0 skipped；覆盖 1600/1440/1280/1024/768/390 六档 viewport，console error/warning 与 pageerror 均为 0。
- 最终截图：`artifacts/ui-redesign/` 下 Founder Workbench、Generation Workspace、小红书工作区各 6 张，共 18 张，来自本轮全绿运行。
- 代码回归：engine 55/0、prompts 27 samples、studio 178/0、outfits 通过、actions 318、typecheck 通过、build 通过、git diff check 通过。
- 未完成项：无；临时 Playwright report/test-results 在提交前清理，未 push、未创建 PR。
