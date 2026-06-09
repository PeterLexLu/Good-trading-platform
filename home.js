// 旧版本曾用 index.html#idle 这类锚点切页面；拆成独立页面后做一次兼容跳转。
const legacyRoutes = {
  "#idle": "./idle.html",
  "#wish": "./wish.html",
  "#messages": "./messages.html",
  "#profile": "./profile.html"
};

if (legacyRoutes[window.location.hash]) {
  window.location.replace(legacyRoutes[window.location.hash]);
}

// 首页脚本只负责海报轮播，避免和列表、账号、聊天逻辑混在一起。
let posterIndex = 0;
const posterTrack = document.getElementById("posterTrack");
const posterDots = [...document.querySelectorAll("#posterDots span")];

setInterval(() => {
  posterIndex = (posterIndex + 1) % posterDots.length;
  posterTrack.style.transform = `translateX(-${posterIndex * 100}%)`;
  posterDots.forEach((dot, index) => dot.classList.toggle("active", index === posterIndex));
}, 3600);
