// 发布者主页：展示发布者资料、统计，以及 TA 发布的闲置/心愿列表。
const params = new URLSearchParams(window.location.search);
const publisherId = params.get("id");
const profile = document.getElementById("publisherProfile");
const itemsGrid = document.getElementById("publisherItems");

SgcApi.getPublisher(publisherId).then(({ publisher, stats, items }) => {
  if (!publisher) {
    profile.innerHTML = `<div class="empty-wide">没有找到这个发布者。</div>`;
    itemsGrid.innerHTML = "";
    return;
  }

  document.title = `${publisher.name} - 发布者主页 - SGC-丰盛有鱼`;
  profile.innerHTML = `
    <div class="avatar publisher-avatar"></div>
    <div>
      <span class="type-badge">发布者</span>
      <h1>${sgcEscape(publisher.name)}</h1>
      <p>${sgcEscape(publisher.bio || "这个发布者还没有填写个人简介。")}</p>
      <div class="publisher-meta">
        <span>${sgcEscape(publisher.city || "未知城市")}</span>
        <span>已分享闲置 ${stats.sharedIdle}</span>
        <span>心愿 ${stats.wishList}</span>
      </div>
    </div>
  `;

  itemsGrid.innerHTML = items.map((item) => `
    <article class="item-card">
      <a href="./detail.html?id=${encodeURIComponent(item.id)}">
        ${sgcImage(item)}
        <div>
          <h3>${sgcEscape(item.title)}</h3>
          <p>${sgcEscape(item.desc)}</p>
          <span>${sgcEscape(item.city)} · ${sgcEscape(item.category)}</span>
        </div>
      </a>
      <div class="card-actions">
        <button class="secondary-btn share-card" data-item-id="${sgcEscape(item.id)}">分享</button>
      </div>
    </article>
  `).join("");

  if (!items.length) {
    itemsGrid.innerHTML = `<div class="empty-wide">TA 还没有发布内容。</div>`;
  }
});

itemsGrid.addEventListener("click", async (event) => {
  const shareButton = event.target.closest(".share-card");
  if (!shareButton) return;
  const shareUrl = sgcBuildItemShareUrl(shareButton.dataset.itemId);
  const copied = await sgcCopyText(shareUrl);
  shareButton.textContent = copied ? "已复制" : "复制失败";
  setTimeout(() => {
    shareButton.textContent = "分享";
  }, 1400);
});
