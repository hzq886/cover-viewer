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
