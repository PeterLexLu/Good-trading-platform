const SGC_CATEGORIES = [
  "全部分类",
  "数码家电",
  "服装鞋包",
  "母婴用品",
  "家具家居",
  "美妆个护",
  "图书音像",
  "运动户外",
  "车品/配件",
  "办公用品",
  "乐器",
  "学生专区",
  "宠物用品"
];

const SGC_SAMPLE_ITEMS = [
  {
    id: "idle-1",
    type: "idle",
    title: "收纳小包",
    desc: "两个格纹收纳小包，适合放数据线、口红、钥匙等小物。状态干净，线下自取。",
    city: "上海市",
    category: "服装鞋包",
    owner: "微信用户",
    time: "2026-06-09 13:21",
    image: "",
    color: "linear-gradient(140deg, #3a8d73, #f2c65a)"
  },
  {
    id: "idle-2",
    type: "idle",
    title: "丝巾",
    desc: "波点丝巾一条，几乎未使用，可搭配衬衫或包包。",
    city: "上海市",
    category: "服装鞋包",
    owner: "微信用户",
    time: "2026-06-09 13:24",
    image: "",
    color: "linear-gradient(140deg, #f4f4f4, #202938)"
  },
  {
    id: "idle-3",
    type: "idle",
    title: "书包",
    desc: "轻便运动书包，容量适中，适合学生或短途出行。",
    city: "上海市",
    category: "学生专区",
    owner: "微信用户",
    time: "2026-06-09 13:26",
    image: "",
    color: "linear-gradient(140deg, #dfe5ed, #315fbd 55%, #ff7338)"
  },
  {
    id: "idle-4",
    type: "idle",
    title: "血压计",
    desc: "电子血压计，可正常开机使用，家中闲置。",
    city: "上海市",
    category: "数码家电",
    owner: "微信用户",
    time: "2026-06-09 13:28",
    image: "",
    color: "linear-gradient(140deg, #e9edf4, #9aa3b4 50%, #f7c54d)"
  },
  {
    id: "idle-5",
    type: "idle",
    title: "儿童绘本",
    desc: "几本适合低龄儿童阅读的绘本，页面完整。",
    city: "上海市",
    category: "图书音像",
    owner: "微信用户",
    time: "2026-06-09 13:32",
    image: "",
    color: "linear-gradient(140deg, #8dd6a5, #f6e08a 52%, #d26666)"
  },
  {
    id: "idle-6",
    type: "idle",
    title: "小花罐",
    desc: "小罐子一个，可做桌面装饰或收纳。",
    city: "上海市",
    category: "家具家居",
    owner: "微信用户",
    time: "2026-06-09 13:35",
    image: "",
    color: "linear-gradient(140deg, #f7f1df, #e790aa 60%, #93c179)"
  },
  {
    id: "wish-1",
    type: "wish",
    title: "许愿一台电脑，最好是独显的，不是独显也可以",
    desc: "希望领取一台能学习和办公的电脑，可接受旧电脑。",
    city: "上海市",
    category: "数码家电",
    owner: "微信用户",
    time: "2026-06-09 14:02",
    image: "",
    color: "linear-gradient(140deg, #f5f7fb, #6ab6c5)"
  },
  {
    id: "wish-2",
    type: "wish",
    title: "想要一款女生的蓝牙耳机，不求品牌",
    desc: "通勤听课使用，能正常连接即可。",
    city: "上海市",
    category: "数码家电",
    owner: "微信用户",
    time: "2026-06-09 14:05",
    image: "",
    color: "linear-gradient(140deg, #2c2d33, #a9adb8)"
  },
  {
    id: "wish-3",
    type: "wish",
    title: "想要一辆女生骑的运动自行车，不挑品牌",
    desc: "周末骑行使用，能正常骑行和刹车即可。",
    city: "上海市",
    category: "运动户外",
    owner: "微信用户",
    time: "2026-06-09 14:14",
    image: "",
    color: "linear-gradient(140deg, #9ac4d7, #5d775f 48%, #25252b)"
  }
];

const SGC_SAMPLE_USERS = [
  {
    id: "wechat-user",
    name: "微信用户",
    avatar: "",
    city: "上海市",
    bio: "SGC 丰盛有鱼用户，愿意分享闲置，也愿意成全心愿。",
    provider: "wechat-demo"
  },
  {
    id: "me",
    name: "我",
    avatar: "",
    city: "上海市",
    bio: "演示账号。",
    provider: "local-demo"
  }
];

function sgcOwnerId(name) {
  if (name === "我") return "me";
  if (name === "微信用户") return "wechat-user";
  return `publisher-${encodeURIComponent(name || "unknown")}`;
}

function sgcLoad() {
  const items = JSON.parse(localStorage.getItem("sgc-items") || "null") || SGC_SAMPLE_ITEMS;
  const users = JSON.parse(localStorage.getItem("sgc-users") || "null") || SGC_SAMPLE_USERS;
  const user = JSON.parse(localStorage.getItem("sgc-user") || "null");
  const normalizedItems = items.map((item) => ({
    ...item,
    ownerId: item.ownerId || sgcOwnerId(item.owner)
  }));

  return {
    items: normalizedItems,
    chats: JSON.parse(localStorage.getItem("sgc-chats") || "[]"),
    user,
    users
  };
}

function sgcSave(data) {
  localStorage.setItem("sgc-items", JSON.stringify(data.items));
  localStorage.setItem("sgc-chats", JSON.stringify(data.chats));
  if (data.users) localStorage.setItem("sgc-users", JSON.stringify(data.users));
  if (data.user) localStorage.setItem("sgc-user", JSON.stringify(data.user));
}

function sgcEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sgcImage(item, className = "") {
  if (item.image) {
    return `<img class="${className}" src="${item.image}" alt="${sgcEscape(item.title)}" />`;
  }
  return `<div class="placeholder-img ${className}" style="background:${item.color || "linear-gradient(140deg,#7fb4d7,#dfc27d)"}">${sgcEscape(item.title.slice(0, 1))}</div>`;
}

function sgcNowText() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function sgcEnsureChat(data, item) {
  let chat = data.chats.find((entry) => entry.itemId === item.id);
  if (!chat) {
    chat = {
      id: `chat-${Date.now()}`,
      itemId: item.id,
      publisherId: item.ownerId || sgcOwnerId(item.owner),
      viewerId: data.user?.id || "guest",
      messages: [
        { from: "system", text: `你正在咨询“${item.title}”。` },
        { from: "mine", text: "你好，这个物品还可以领取吗？" }
      ]
    };
    data.chats.unshift(chat);
    sgcSave(data);
  }
  return chat;
}
