// SgcApi 是页面和数据之间的唯一接口层。
// 当前演示环境使用 localStorage 模拟后端；接真实后端时优先替换这里的方法。
const SgcApi = {
  // -------- 账号 / 微信登录 --------
  async getSession() {
    const data = sgcLoad();
    return {
      user: data.user,
      isLoggedIn: Boolean(data.user),
      loginProvider: data.user?.provider || null
    };
  },

  async startWechatLogin() {
    return {
      loginId: `wx-login-${Date.now()}`,
      qrUrl: "local-demo://wechat-qrcode",
      expiresIn: 300,
      note: "演示二维码。真实接入时这里由后端返回微信 OAuth/扫码登录地址。"
    };
  },

  async completeWechatLogin() {
    const data = sgcLoad();
    const user = {
      id: "wechat-user",
      name: "微信用户",
      avatar: "",
      city: "上海市",
      bio: "通过微信扫码登录的演示账号。",
      provider: "wechat-demo",
      loginAt: sgcNowText()
    };
    data.user = user;
    data.users = upsertById(data.users, user);
    sgcSave(data);
    return { user };
  },

  async logout() {
    localStorage.removeItem("sgc-user");
    return { ok: true };
  },

  // -------- 当前账号资料 --------
  async getAccountProfile() {
    const data = sgcLoad();
    if (!data.user) return { user: null, stats: getEmptyStats() };
    return {
      user: data.user,
      stats: getStatsForOwner(data, data.user.id)
    };
  },

  async updateAccountProfile(patch) {
    const data = sgcLoad();
    if (!data.user) throw new Error("未登录，无法更新账号资料。");
    data.user = { ...data.user, ...patch };
    data.users = upsertById(data.users, data.user);
    sgcSave(data);
    return { user: data.user };
  },

  // -------- 发布者资料 --------
  async getPublisher(publisherId) {
    const data = sgcLoad();
    const user = data.users.find((entry) => entry.id === publisherId) || inferPublisher(data, publisherId);
    return {
      publisher: user,
      stats: getStatsForOwner(data, publisherId),
      items: data.items.filter((item) => item.ownerId === publisherId)
    };
  },

  // -------- 闲置 / 心愿 --------
  async listItems(filters = {}) {
    const data = sgcLoad();
    return data.items.filter((item) => {
      const typeMatch = !filters.type || item.type === filters.type;
      const ownerMatch = !filters.ownerId || item.ownerId === filters.ownerId;
      const categoryMatch = !filters.category || filters.category === "全部分类" || item.category === filters.category;
      const cityMatch = !filters.city || filters.city === "全部区域" || item.city === filters.city;
      const keyword = (filters.keyword || "").trim().toLowerCase();
      const keywordMatch = !keyword || `${item.title}${item.desc}${item.city}${item.category}${item.owner}`.toLowerCase().includes(keyword);
      return typeMatch && ownerMatch && categoryMatch && cityMatch && keywordMatch;
    });
  },

  async getItem(id) {
    const data = sgcLoad();
    return data.items.find((item) => item.id === id) || null;
  },

  async createItem(payload) {
    const data = sgcLoad();
    if (!data.user) throw new Error("请先登录后再发布。");
    const owner = data.user;
    const item = {
      id: `${payload.type}-${Date.now()}`,
      type: payload.type,
      title: payload.title,
      desc: payload.desc,
      city: payload.city,
      category: payload.category,
      owner: owner.name,
      ownerId: owner.id,
      time: sgcNowText(),
      image: payload.image || "",
      color: payload.color || "linear-gradient(140deg, #7ab6d9, #70b991)",
      local: true
    };
    data.items.unshift(item);
    data.users = upsertById(data.users, owner);
    sgcSave(data);
    return { item };
  },

  // -------- 聊天 / 消息 --------
  async listChats() {
    const data = sgcLoad();
    return data.chats.map((chat) => ({
      ...chat,
      item: data.items.find((item) => item.id === chat.itemId) || null
    }));
  },

  async getChat(chatId) {
    const data = sgcLoad();
    const chat = data.chats.find((entry) => entry.id === chatId);
    if (!chat) return null;
    return {
      ...chat,
      item: data.items.find((item) => item.id === chat.itemId) || null
    };
  },

  async ensureChatForItem(itemId) {
    const data = sgcLoad();
    if (!data.user) throw new Error("请先登录后再聊天。");
    const item = data.items.find((entry) => entry.id === itemId);
    if (!item) throw new Error("物品不存在，无法创建聊天。");
    const chat = sgcEnsureChat(data, item);
    return { chat, item };
  },

  async sendMessage(chatId, text) {
    const data = sgcLoad();
    if (!data.user) throw new Error("请先登录后再发送消息。");
    const chat = data.chats.find((entry) => entry.id === chatId);
    if (!chat) throw new Error("聊天不存在。");
    const message = {
      id: `msg-${Date.now()}`,
      from: "mine",
      text,
      time: sgcNowText()
    };
    chat.messages.push(message);
    sgcSave(data);
    return { chat, message };
  },

  // -------- 演示数据管理 --------
  async exportLocalData() {
    const data = sgcLoad();
    return {
      items: data.items,
      chats: data.chats,
      user: data.user,
      users: data.users
    };
  },

  async resetLocalData() {
    localStorage.removeItem("sgc-items");
    localStorage.removeItem("sgc-chats");
    localStorage.removeItem("sgc-user");
    localStorage.removeItem("sgc-users");
    return sgcLoad();
  }
};

function upsertById(list, item) {
  const next = [...(list || [])];
  const index = next.findIndex((entry) => entry.id === item.id);
  if (index >= 0) next[index] = { ...next[index], ...item };
  else next.push(item);
  return next;
}

function inferPublisher(data, publisherId) {
  const item = data.items.find((entry) => entry.ownerId === publisherId);
  if (!item) return null;
  return {
    id: publisherId,
    name: item.owner,
    avatar: "",
    city: item.city,
    bio: "这个发布者还没有填写个人简介。",
    provider: "inferred"
  };
}

function getEmptyStats() {
  return {
    sharedIdle: 0,
    receivedIdle: 0,
    fulfilledWishes: 0,
    wishList: 0
  };
}

function getStatsForOwner(data, ownerId) {
  return {
    sharedIdle: data.items.filter((item) => item.ownerId === ownerId && item.type === "idle").length,
    receivedIdle: 0,
    fulfilledWishes: 0,
    wishList: data.items.filter((item) => item.ownerId === ownerId && item.type === "wish").length
  };
}
