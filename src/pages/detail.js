// 详情页是只读页面：根据 URL 中的 id 读取物品，并展示发布者和聊天入口。
const data = sgcLoad();
const params = new URLSearchParams(window.location.search);
const item = data.items.find((entry) => entry.id === params.get("id"));
const detailCard = document.getElementById("detailCard");
const chatLink = document.getElementById("chatAboutItem");
const shareButton = document.getElementById("shareItem");
const shareStatus = document.getElementById("shareStatus");

if (!item) {
  detailCard.innerHTML = `
    <div class="empty-wide">
      没有找到这个内容。可能是演示数据被清空，或者链接已经失效。
      <p><a href="./index.html">返回首页</a></p>
    </div>
  `;
  chatLink.classList.add("disabled");
  shareButton.classList.add("hidden");
} else {
  document.title = `${item.title} - SGC-丰盛有鱼`;
  detailCard.innerHTML = `
    <div class="detail-media">${sgcImage(item)}</div>
    <div class="detail-info">
      <span class="type-badge">${item.type === "idle" ? "闲置分享" : "心愿"}</span>
      <h1>${sgcEscape(item.title)}</h1>
      <p>${sgcEscape(item.desc)}</p>
      <dl>
        <div><dt>分类</dt><dd>${sgcEscape(item.category)}</dd></div>
        <div><dt>城市</dt><dd>${sgcEscape(item.city)}</dd></div>
        <div><dt>发布者</dt><dd><a class="text-link" href="./publisher.html?id=${encodeURIComponent(item.ownerId)}">${sgcEscape(item.owner)}</a></dd></div>
        <div><dt>发布时间</dt><dd>${sgcEscape(item.time)}</dd></div>
      </dl>
    </div>
  `;
  const chatPath = `chat.html?item=${encodeURIComponent(item.id)}`;
  chatLink.href = data.user ? `./${chatPath}` : sgcLoginUrl(chatPath);
  shareButton.addEventListener("click", async () => {
    const shareUrl = sgcBuildItemShareUrl(item.id);
    const copied = await sgcCopyText(shareUrl);
    shareStatus.textContent = copied ? "分享链接已复制" : shareUrl;
  });
}
