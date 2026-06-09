# SGC-丰盛有鱼

SGC-丰盛有鱼是一个本地静态网页版闲置物品分享平台。用户可以浏览闲置、发布自己的闲置或心愿、查看物品详情、进入发布者主页，并通过“聊一聊”和发布者沟通。

当前版本使用浏览器 `localStorage` 模拟后端数据和微信登录，方便本地演示和后续对接真实服务。

## 本地运行

在项目目录下启动静态服务：

```bash
python3 -m http.server 4173
```

浏览器打开：

```text
http://localhost:4173
```

## 页面结构

- `index.html`：首页，仅展示滚动海报
- `idle.html`：闲置列表、筛选、搜索、发布闲置
- `wish.html`：心愿池列表、筛选、搜索、发布心愿
- `detail.html`：物品/心愿详情，只读展示
- `publisher.html`：发布者主页
- `chat.html`：聊天页面
- `messages.html`：消息列表
- `profile.html`：我的主页、登录、退出、本地数据管理

## 脚本结构

- `src/core/common.js`：公共数据、分类、工具函数、本地数据读取保存
- `src/core/api.js`：统一接口层，目前用 `localStorage` 模拟后端
- `src/pages/home.js`：首页海报轮播
- `src/pages/list-page.js`：闲置页和心愿池页共用的列表、筛选、发布逻辑
- `src/pages/detail.js`：详情页渲染
- `src/pages/publisher.js`：发布者主页渲染
- `src/pages/chat.js`：聊天页渲染和发送消息
- `src/pages/messages.js`：消息列表渲染
- `src/pages/profile.js`：我的主页、登录、退出、导出和清空数据

## 样式

所有页面共用 `styles/styles.css`。目前“我的主页”和“其他用户主页”复用同一套 `publisher-profile` 样式，以保持视觉一致。

## 资源与文档

- `assets/images/`：图片资源
- `docs/API_CONTRACT.md`：接口文档
- `docs/TESTING.md`：测试文档

## 当前功能

- 首页海报轮播
- 闲置列表展示
- 心愿池列表展示
- 分类、城市和关键字筛选
- 发布闲置和心愿
- 上传图片并在本地预览
- 查看详情页
- 查看发布者主页
- 发起聊天
- 查看消息列表
- 我的主页
- 模拟微信扫码登录
- 退出登录
- 导出本地数据
- 清空本地演示数据

## 微信登录说明

当前微信登录是本地模拟流程。真实接入需要后端支持：

- 微信开放平台或公众号 `AppID`
- 授权回调域名
- 后端接收微信授权 `code`
- 后端换取 `access_token`
- 后端获取并保存 `openid` / `unionid` / 用户资料
- 后端创建登录态

具体接口约定见 [API_CONTRACT.md](./docs/API_CONTRACT.md)。

## 数据存储

当前演示数据保存在浏览器 `localStorage` 中：

- `sgc-items`：闲置和心愿
- `sgc-chats`：聊天会话
- `sgc-user`：当前登录用户
- `sgc-users`：发布者/用户资料

清空浏览器站点数据或点击“我的”页的“清空演示数据”会恢复到示例数据。

## 维护建议

- 新页面尽量使用独立 HTML 和独立 JS 文件
- 跨页面逻辑放入 `src/core/api.js` 或 `src/core/common.js`
- 不要让页面直接读写复杂数据，优先通过 `SgcApi`
- 接真实后端时优先替换 `src/core/api.js`，保持页面脚本不变
