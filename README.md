## API可调整项

- API 参数中的 `service`/`floor` 已设为 `digital` / `video`，可按需求调整；也可追加 `site` 改为其他可用值。

## 开发环境快速配置

首先执行执行 `./scripts/setup.sh`

```bash
# 执行校验脚本
npm run type-check
npm run lint
# 修复问题后
npm run format
```

## 登录（Firebase 邮件链接）

- 本项目支持使用 Firebase Authentication 的邮件链接（免密码）登录。
- 在 Firebase 控制台创建 Web 应用，开启 Email link (passwordless) 登录方式，并将站点域名加入 Authorized domains。
- 将以下环境变量填入 `.env.local`（也可参考 `.env.example`）：
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - 可选：`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

使用方式：
- 进入 `/login` 页面输入邮箱，点击“发送登录链接”。
- 在收到的邮件中点击链接即可完成登录；登录完成后会自动跳回首页。
- 右上角可查看登录状态并登出。
