# SGC-丰盛有鱼接口文档

本文档描述前端期望的后端接口。当前演示环境由 [src/core/api.js](../src/core/api.js) 中的 `SgcApi` 使用 `localStorage` 模拟这些接口。后续接入真实后端时，建议保持返回结构一致，页面脚本无需大改。

## 通用约定

## 登录访问规则

- 可匿名访问：首页、闲置列表、心愿池、详情页、发布者主页、分享链接。
- 需要登录：发布闲置/心愿、聊一聊、聊天页、消息页。
- 未登录用户触发受保护功能时，前端跳转到 `profile.html?redirect=...`。
- 登录成功后，前端按 `redirect` 参数回到原本要访问的页面或操作。

### Base URL

演示环境无真实 Base URL。真实后端建议：

```text
/api
```

### 返回格式

成功：

```json
{
  "data": {}
}
```

或直接返回本文档中的对象结构。当前前端模拟层直接返回对象，不包 `data`。

失败：

```json
{
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "物品不存在"
  }
}
```

### 核心数据模型

#### User

```json
{
  "id": "wechat-user",
  "name": "微信用户",
  "avatar": "https://example.com/avatar.png",
  "city": "上海市",
  "bio": "SGC 丰盛有鱼用户",
  "provider": "wechat",
  "loginAt": "2026-06-10 14:30"
}
```

#### Item

`type` 为 `idle` 表示闲置，`wish` 表示心愿。

```json
{
  "id": "idle-1",
  "type": "idle",
  "title": "收纳小包",
  "desc": "两个格纹收纳小包，适合放数据线、口红、钥匙等小物。",
  "city": "上海市",
  "category": "服装鞋包",
  "owner": "微信用户",
  "ownerId": "wechat-user",
  "time": "2026-06-09 13:21",
  "image": "https://example.com/item.png",
  "color": "linear-gradient(140deg, #3a8d73, #f2c65a)"
}
```

#### Chat

```json
{
  "id": "chat-001",
  "itemId": "idle-1",
  "publisherId": "wechat-user",
  "viewerId": "current-user",
  "messages": [
    {
      "id": "msg-001",
      "from": "mine",
      "text": "你好，这个物品还可以领取吗？",
      "time": "2026-06-10 14:30"
    }
  ]
}
```

## 账号与微信登录

### 获取当前登录态

```http
GET /api/session
```

返回：

```json
{
  "user": {
    "id": "wechat-user",
    "name": "微信用户",
    "avatar": "",
    "city": "上海市",
    "bio": "通过微信扫码登录的账号。",
    "provider": "wechat"
  },
  "isLoggedIn": true,
  "loginProvider": "wechat"
}
```

未登录：

```json
{
  "user": null,
  "isLoggedIn": false,
  "loginProvider": null
}
```

### 开始微信扫码登录

```http
POST /api/auth/wechat/start
```

返回：

```json
{
  "loginId": "wx-login-1780000000000",
  "qrUrl": "https://open.weixin.qq.com/connect/qrconnect?...",
  "expiresIn": 300
}
```

说明：

- `loginId` 用于轮询扫码状态或校验回调
- `qrUrl` 用于生成二维码
- `expiresIn` 单位为秒

### 微信授权回调

```http
POST /api/auth/wechat/callback
```

请求：

```json
{
  "code": "wechat_oauth_code",
  "state": "csrf_state"
}
```

返回：

```json
{
  "user": {
    "id": "wechat-user",
    "name": "微信用户",
    "avatar": "https://example.com/avatar.png",
    "city": "上海市",
    "bio": "通过微信扫码登录的账号。",
    "provider": "wechat"
  }
}
```

### 退出登录

```http
POST /api/logout
```

返回：

```json
{ "ok": true }
```

## 我的账号

### 获取我的主页资料

```http
GET /api/account/profile
```

返回：

```json
{
  "user": {
    "id": "wechat-user",
    "name": "微信用户",
    "avatar": "",
    "city": "上海市",
    "bio": "通过微信扫码登录的账号。",
    "provider": "wechat"
  },
  "stats": {
    "sharedIdle": 2,
    "receivedIdle": 0,
    "fulfilledWishes": 0,
    "wishList": 1
  }
}
```

### 更新我的资料

```http
PATCH /api/account/profile
```

请求：

```json
{
  "name": "新的昵称",
  "city": "上海市",
  "bio": "新的简介",
  "avatar": "https://example.com/avatar.png"
}
```

返回：

```json
{
  "user": {}
}
```

## 发布者

### 获取发布者主页

```http
GET /api/publishers/:publisherId
```

返回：

```json
{
  "publisher": {
    "id": "wechat-user",
    "name": "微信用户",
    "avatar": "",
    "city": "上海市",
    "bio": "SGC 丰盛有鱼用户"
  },
  "stats": {
    "sharedIdle": 6,
    "receivedIdle": 0,
    "fulfilledWishes": 0,
    "wishList": 3
  },
  "items": []
}
```

## 闲置与心愿

### 查询列表

```http
GET /api/items
```

查询参数：

- `type`: `idle` 或 `wish`
- `ownerId`: 发布者 ID
- `category`: 分类，例如 `服装鞋包`
- `city`: 城市，例如 `上海市`
- `keyword`: 搜索关键词

示例：

```http
GET /api/items?type=idle&city=上海市&keyword=书包
```

返回：

```json
[
  {
    "id": "idle-3",
    "type": "idle",
    "title": "书包",
    "desc": "轻便运动书包，容量适中。",
    "city": "上海市",
    "category": "学生专区",
    "owner": "微信用户",
    "ownerId": "wechat-user",
    "time": "2026-06-09 13:26",
    "image": ""
  }
]
```

### 获取详情

```http
GET /api/items/:id
```

返回：

```json
{
  "id": "idle-1",
  "type": "idle",
  "title": "收纳小包",
  "desc": "两个格纹收纳小包...",
  "city": "上海市",
  "category": "服装鞋包",
  "owner": "微信用户",
  "ownerId": "wechat-user",
  "time": "2026-06-09 13:21",
  "image": ""
}
```

### 发布闲置或心愿

```http
POST /api/items
```

请求：

```json
{
  "type": "idle",
  "title": "测试杯子",
  "desc": "状态良好，可自取。",
  "city": "上海市",
  "category": "家具家居",
  "image": "data:image/png;base64,..."
}
```

返回：

```json
{
  "item": {
    "id": "idle-1780000000000",
    "type": "idle",
    "title": "测试杯子",
    "desc": "状态良好，可自取。",
    "city": "上海市",
    "category": "家具家居",
    "owner": "微信用户",
    "ownerId": "wechat-user",
    "time": "2026-06-10 14:30",
    "image": "data:image/png;base64,..."
  }
}
```

## 聊天

### 获取聊天列表

```http
GET /api/chats
```

返回：

```json
[
  {
    "id": "chat-001",
    "itemId": "idle-1",
    "publisherId": "wechat-user",
    "viewerId": "current-user",
    "messages": [],
    "item": {}
  }
]
```

### 创建或复用物品聊天

```http
POST /api/chats/ensure
```

请求：

```json
{
  "itemId": "idle-1"
}
```

返回：

```json
{
  "chat": {},
  "item": {}
}
```

### 获取聊天详情

```http
GET /api/chats/:chatId
```

返回：

```json
{
  "id": "chat-001",
  "itemId": "idle-1",
  "publisherId": "wechat-user",
  "viewerId": "current-user",
  "messages": [],
  "item": {}
}
```

### 发送消息

```http
POST /api/chats/:chatId/messages
```

请求：

```json
{
  "text": "你好，这个物品还可以领取吗？"
}
```

返回：

```json
{
  "chat": {},
  "message": {
    "id": "msg-1780000000000",
    "from": "mine",
    "text": "你好，这个物品还可以领取吗？",
    "time": "2026-06-10 14:30"
  }
}
```

## 演示数据管理

这些接口目前只用于演示环境，真实后端可以不提供，或改成管理员/开发工具接口。

### 导出数据

```http
GET /api/dev/export
```

返回：

```json
{
  "items": [],
  "chats": [],
  "user": {},
  "users": []
}
```

### 重置数据

```http
POST /api/dev/reset
```

返回：

```json
{
  "items": [],
  "chats": [],
  "user": null,
  "users": []
}
```

## 前端接口映射

`src/core/api.js` 中的方法与后端接口建议对应如下：

- `SgcApi.getSession()` -> `GET /api/session`
- `SgcApi.startWechatLogin()` -> `POST /api/auth/wechat/start`
- `SgcApi.completeWechatLogin()` -> `POST /api/auth/wechat/callback`
- `SgcApi.logout()` -> `POST /api/logout`
- `SgcApi.getAccountProfile()` -> `GET /api/account/profile`
- `SgcApi.updateAccountProfile()` -> `PATCH /api/account/profile`
- `SgcApi.getPublisher(id)` -> `GET /api/publishers/:publisherId`
- `SgcApi.listItems(filters)` -> `GET /api/items`
- `SgcApi.getItem(id)` -> `GET /api/items/:id`
- `SgcApi.createItem(payload)` -> `POST /api/items`
- `SgcApi.listChats()` -> `GET /api/chats`
- `SgcApi.getChat(id)` -> `GET /api/chats/:chatId`
- `SgcApi.ensureChatForItem(itemId)` -> `POST /api/chats/ensure`
- `SgcApi.sendMessage(chatId, text)` -> `POST /api/chats/:chatId/messages`
