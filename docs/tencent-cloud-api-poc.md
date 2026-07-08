# 腾讯云 API 可行性验证说明

这个分支只做最小可行验证：证明 THERUIZ AURA Prompt Builder 可以通过服务器安全中转调用图片生成 API。

## 当前结论

- 当前项目是 Vite + React 静态前端，不是 Next.js。
- Vite 前端不能安全保存 API Key。
- API Key 必须放在腾讯云服务器环境变量里，由服务端接口调用模型。
- 本分支新增了一个 Node.js 轻量服务端接口：`POST /api/generate-image`。

## 本地或腾讯云服务器测试

```bash
npm install
cp .env.example .env
```

把 `.env` 里的 `OPENAI_API_KEY` 改成真实 Key。不要把真实 Key 提交到 GitHub。

### 方式一：命令行 smoke test

```bash
export OPENAI_API_KEY="你的真实key"
npm run api:test
```

成功后会生成：

```text
tmp/theruiz-aura-api-test.png
```

### 方式二：启动 API 服务

```bash
export OPENAI_API_KEY="你的真实key"
npm run api:server
```

健康检查：

```bash
curl http://127.0.0.1:8787/health
```

调用生成：

```bash
curl -X POST http://127.0.0.1:8787/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt":"A premium THERUIZ AURA German trainer product photo on a warm linen studio backdrop, cream white and soft beige tones, realistic stitching and laces.",
    "size":"1024x1024",
    "quality":"low"
  }'
```

接口会返回 `imageDataUrl` 和 `imageBase64`。前端后续可以把 `imageDataUrl` 放进 `<img>` 预览，并提供下载。

## 腾讯云部署建议

测试阶段可以用：

```bash
npm run build
pm2 start server/api-server.mjs --name theruiz-aura-image-api
pm2 save
```

Nginx 可以把 `/api/` 反向代理到 `127.0.0.1:8787`，前端静态页面继续部署 Vite build 后的 `dist/`。

示例：

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:8787/api/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## 下一步

验证成功后，再做第二步：把 `src/App.tsx` 里的“图片生成预留区”按钮改成真正调用 `/api/generate-image`，并显示生成图片。

如果要给几十家婚纱店使用，不建议只停留在这个 POC，需要继续增加：

- 登录系统
- 店铺账号管理
- 生图次数扣减
- 成功才扣次数，失败不扣次数
- 生成记录
- 队列和并发限制
- 腾讯云 COS 图片存储
- 后台管理系统
