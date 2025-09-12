## 电影海报搜索 APP（DMM 商品情報API）

基于 Next.js + Tailwind 构建的精美 UI。输入关键词，调用 DMM Web API（商品情報API），从结果中随机挑选一个条目，取其 `imageURL.large` 并在页面正中央显示海报。

## 环境变量

1) 复制 `.env.example` 为 `.env.local`

```
cp .env.example .env.local
```

2) 填入你的 DMM API 凭据：

- `DMM_API_ID`: 你的 API ID
- `DMM_AFFILIATE_ID`: 你的 Affiliate ID

注意：为保护密钥安全，密钥只保存在服务端 API 路由中使用，前端不会暴露。

## 本地运行

```
npm run dev
# 或 pnpm dev / yarn dev / bun dev
```

打开 `http://localhost:3000`，输入关键词点击“搜索”。

## 说明

- 服务端路由：`src/app/api/search/route.ts` 调用 DMM 商品情報API
- 前端页面：`src/app/page.tsx`，搜索后从 `items` 中随机取一条并展示 `imageURL.large`
- 为适配不同来源图片，页面使用普通 `<img>` 标签来避免远程域名配置限制

## 可调整项

- API 参数中的 `service`/`floor` 已设为 `digital` / `video`，可按需求调整；也可追加 `site` 改为其他可用值。
