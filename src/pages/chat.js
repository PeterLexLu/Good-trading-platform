// 聊天页支持两种入口：chat=已有会话，item=从物品详情新建/获取会话。
const chatSession = sgcLoad();
if (!chatSession.user) {
  sgcRedirectToLogin(sgcCurrentPath());
} else {

  const params = new URLSearchParams(window.location.search);
  let chat = null;
  let item = null;

  const chatHeader = document.getElementById("chatHeader");
  const thread = document.getElementById("messageThread");
  const form = document.getElementById("messageForm");
  const input = document.getElementById("messageInput");

  async function loadChat() {
    if (params.get("chat")) {
      const result = await SgcApi.getChat(params.get("chat"));
      chat = result;
      item = result?.item || null;
    } else if (params.get("item")) {
      const result = await SgcApi.ensureChatForItem(params.get("item"));
      chat = result.chat;
      item = result.item;
    }
    renderThread();
  }

  function renderThread() {
    if (!chat || !item) {
      chatHeader.innerHTML = "<strong>聊天不存在</strong>";
      thread.innerHTML = `<div class="empty-wide">没有找到聊天记录。你可以回到闲置列表重新点开“聊一聊”。</div>`;
      form.classList.add("hidden");
      return;
    }

    document.title = `聊一聊：${item.title} - SGC-丰盛有鱼`;
    chatHeader.innerHTML = `
      ${sgcImage(item, "chat-thumb")}
      <div>
        <strong>${sgcEscape(item.title)}</strong>
        <span>${sgcEscape(item.owner)} · ${sgcEscape(item.city)}</span>
      </div>
    `;
    thread.innerHTML = chat.messages.map((message) => {
      const mine = message.from === "mine";
      return `<div class="bubble ${mine ? "mine" : ""}">${sgcEscape(message.text)}</div>`;
    }).join("");
    thread.scrollTop = thread.scrollHeight;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || !chat) return;
    const result = await SgcApi.sendMessage(chat.id, text);
    chat = result.chat;
    input.value = "";
    renderThread();
  });

  loadChat();
}
