# 部署指南

本博客基于 Astro + Cloudflare Workers（SSR）+ D1 数据库部署。

## 前提

- Node.js >= 20、pnpm（本地调试用）
- 一个 Cloudflare 账号
- 一个 GitHub 账号

## 部署步骤

### 1. 配置博客信息

编辑 `src/config.ts`，修改博客名称、简介、社交链接等。

### 2. 创建 D1 数据库

打开 [Cloudflare Dashboard → D1](https://dash.cloudflare.com/?to=d1)，点击「创建数据库」，命名为 `blog-stats`。创建后复制数据库 ID。

### 3. 配置 database_id

打开 `wrangler.jsonc`，将 `d1_databases` 中的 `database_id` 替换为上一步复制的 ID。

### 4. 推送到 GitHub

```sh
git push
```

### 5. 接入 Cloudflare Workers

1. 打开 [Cloudflare Dashboard → Workers 和 Pages](https://dash.cloudflare.com/?to=workers-and-pages)
2. 点击「创建」→「Pages」→「连接到 Git」
3. 授权 GitHub，选择你的仓库
4. 构建设置保持默认，点击「开始设置」
5. 部署完成后会生成一个 `<项目名>.pages.dev` 域名

### 6. 绑定 D1 数据库

1. 在 Pages 项目页面，进入「设置」→「函数」→「D1 数据库绑定」
2. 点击「添加绑定」，变量名称填 `DB`，选择你创建的 `blog-stats` 数据库
3. 保存

### 7. 添加环境变量（如有）

如果你的分支需要用到 `TSHOCK_TOKEN` 等密钥：

1. 在 Pages 项目「设置」→「环境变量」中添加
2. 敏感变量记得勾选「加密」

### 8. 重新部署

在 Pages 项目页面点击「部署」→「全部重新部署」，或推送新的提交到 GitHub 自动触发部署。

## 本地开发

```sh
pnpm install
pnpm dev        # 启动开发服务器 http://localhost:4321
pnpm check      # 类型检查
```
