# pnpm Workspace Demo — Zeabur 部署示例

使用 **pnpm workspace** 管理的 monorepo，包含三个子包，可分别部署到 [Zeabur](https://zeabur.com)。

## 项目结构

```
.
├── apps/
│   ├── api/          # Express + TypeScript 后端 API
│   └── web/          # Vite + React 前端
├── packages/
│   └── shared/       # 共享 TypeScript 类型（被 api 和 web 同时引用）
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

## 技术栈

| 包 | 技术 | 说明 |
|---|---|---|
| `@demo/shared` | TypeScript | 共享接口定义（`Todo`、`ApiResponse<T>` 等） |
| `@demo/api` | Express · TypeScript | REST API，监听 `PORT` 环境变量 |
| `@demo/web` | Vite · React · TypeScript | 前端 SPA，通过 `VITE_API_URL` 指向 API |

## 本地开发

```bash
# 安装依赖（一次性）
pnpm install

# 先编译 shared（api 和 web 都依赖它）
pnpm build:shared

# 同时启动 api 和 web（需要先安装 concurrently）
pnpm dev

# 或分开启动
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:5173  (自动代理 /api → :3000)
```

## 部署到 Zeabur

在 Zeabur 中为此 repository 创建 **两个独立服务**。

### 第一步：部署 API 服务

1. 在 Zeabur 项目中点击 **Add Service → Git**，选择本仓库
2. **App Directory** 设置为 `apps/api`
3. Zeabur 会自动读取 `apps/api/zbpack.json` 完成构建
4. 绑定一个域名，例如 `my-api.zeabur.app`

### 第二步：部署 Web 服务

1. 再次点击 **Add Service → Git**，选择同一仓库
2. **App Directory** 设置为 `apps/web`
3. 在 **Environment Variables** 中添加：
   ```
   VITE_API_URL = https://my-api.zeabur.app
   ```
4. Zeabur 会读取 `apps/web/zbpack.json`，自动构建并以静态站点方式托管

### zbpack.json 说明

| 文件 | 关键字段 | 作用 |
|---|---|---|
| `apps/api/zbpack.json` | `build_command` / `start_command` | 先构建 shared，再构建 api，用 node 启动 |
| `apps/web/zbpack.json` | `build_command` / `output_dir` | 先构建 shared，再构建 web，静态输出目录为 `apps/web/dist` |

## 关键文件一览

```
apps/api/zbpack.json      ← Zeabur API 服务构建配置
apps/web/zbpack.json      ← Zeabur Web 服务构建配置
apps/web/.env.example     ← 生产环境变量示例
packages/shared/src/index.ts  ← 跨包共享类型定义
```

## pnpm workspace 要点

- `pnpm-workspace.yaml` 声明了 `apps/*` 和 `packages/*` 为工作区包
- 子包之间互相引用使用 `"workspace:*"` 协议
- 根目录 `package.json` 的脚本通过 `pnpm --filter <name>` 定向执行子包任务
