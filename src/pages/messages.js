// 消息页只展示会话入口，具体聊天窗口由 chat.html 处理。
if (!sgcLoad().user) {
  sgcRedirectToLogin(sgcCurrentPath());
} else {

  const emptyMessages = document.getElementById("emptyMessages");
  const chatList = document.getElementById("chatList");

  async function renderMessages() {
    const chats = await SgcApi.listChats();
    emptyMessages.classList.toggle("hidden", chats.length > 0);

    chatList.innerHTML = chats.map((chat) => {
      if (!chat.item) return "";
      const last = chat.messages.at(-1)?.text || "我想了解这个物品";
      return `
        <a class="chat-row" href="./chat.html?chat=${encodeURIComponent(chat.id)}">
          ${sgcImage(chat.item, "chat-thumb")}
          <span>
            <strong>${sgcEscape(chat.item.owner)} · ${sgcEscape(chat.item.title)}</strong>
            <span>${sgcEscape(last)}</span>
          </span>
        </a>`;
    }).join("");
  }

  renderMessages();
}
