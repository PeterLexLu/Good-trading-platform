// 我的主页使用和 publisher.html 一致的资料头图与内容列表，只多出账号操作按钮。
const loginModal = document.getElementById("loginModal");
const myProfile = document.getElementById("myProfile");
const myItems = document.getElementById("myItems");

function openLogin() {
  loginModal.classList.remove("hidden");
}

function closeLogin() {
  loginModal.classList.add("hidden");
}

function renderProfileHeader(user, stats) {
  const name = user?.name || "未登录";
  const bio = user
    ? user.bio || "这个账号还没有填写个人简介。"
    : "可以先用演示账号体验；真实微信扫码需要公众号/开放平台配置。";
  const city = user?.city || "未设置城市";

  myProfile.innerHTML = `
    <div class="avatar publisher-avatar"></div>
    <div>
      <span class="type-badge">${user ? "我的主页" : "账号未登录"}</span>
      <h1>${sgcEscape(name)}</h1>
      <p>${sgcEscape(bio)}</p>
      <div class="publisher-meta">
        <span>${sgcEscape(city)}</span>
        <span>已分享闲置 ${stats.sharedIdle}</span>
        <span>已领取闲置 ${stats.receivedIdle}</span>
        <span>已成全心愿 ${stats.fulfilledWishes}</span>
        <span>心愿 ${stats.wishList}</span>
      </div>
    </div>
  `;
}

function renderMyItems(items) {
  myItems.innerHTML = items.map((item) => `
    <article class="item-card">
      <a href="./detail.html?id=${encodeURIComponent(item.id)}">
        ${sgcImage(item)}
        <div>
          <h3>${sgcEscape(item.title)}</h3>
          <p>${sgcEscape(item.desc)}</p>
          <span>${sgcEscape(item.city)} · ${sgcEscape(item.category)}</span>
        </div>
      </a>
    </article>
  `).join("");

  if (!items.length) {
    myItems.innerHTML = `<div class="empty-wide">这里会展示你发布的闲置和心愿。</div>`;
  }
}

async function renderProfile() {
  const { user, stats } = await SgcApi.getAccountProfile();
  const myPublishedItems = user ? await SgcApi.listItems({ ownerId: user.id }) : [];
  renderProfileHeader(user, stats);
  renderMyItems(myPublishedItems);
  document.getElementById("profileLogin").classList.toggle("hidden", Boolean(user));
  document.getElementById("logoutBtn").classList.toggle("hidden", !user);
  document.getElementById("openLogin").classList.toggle("hidden", Boolean(user));
}

document.getElementById("openLogin").addEventListener("click", openLogin);
document.getElementById("profileLogin").addEventListener("click", openLogin);
document.getElementById("closeLogin").addEventListener("click", closeLogin);
loginModal.addEventListener("click", (event) => {
  if (event.target === loginModal) closeLogin();
});

document.getElementById("mockWechatLogin").addEventListener("click", async () => {
  await SgcApi.completeWechatLogin();
  closeLogin();
  renderProfile();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await SgcApi.logout();
  renderProfile();
});

document.getElementById("exportData").addEventListener("click", async () => {
  const data = await SgcApi.exportLocalData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sgc-local-data.json";
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById("clearDemoData").addEventListener("click", async () => {
  await SgcApi.resetLocalData();
  renderProfile();
});

renderProfile();
