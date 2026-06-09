// 闲置页和心愿池页共用此脚本；页面类型由 body[data-page-type] 决定。
const pageType = document.body.dataset.pageType;
const pageState = {
  activeCategory: "全部分类",
  photoDataUrl: ""
};

const categoryList = document.getElementById("categoryList");
const itemGrid = document.getElementById("itemGrid");
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const postModal = document.getElementById("postModal");
const itemForm = document.getElementById("itemForm");
const itemCategory = document.getElementById("itemCategory");
const uploadBox = document.getElementById("uploadBox");
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");

// 初始化分类下拉和左侧分类栏，分类源统一来自 common.js。
function renderCategoryControls() {
  itemCategory.innerHTML = SGC_CATEGORIES.slice(1)
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  categoryList.innerHTML = SGC_CATEGORIES.map((category) => {
    const active = pageState.activeCategory === category ? "active" : "";
    return `<button class="${active}" data-category="${category}">${category}</button>`;
  }).join("");

  categoryList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      pageState.activeCategory = button.dataset.category;
      renderCategoryControls();
      renderItems();
    });
  });
}

// 根据当前页面类型、分类、城市和搜索词从接口层读取列表数据。
async function renderItems() {
  const items = await SgcApi.listItems({
    type: pageType,
    category: pageState.activeCategory,
    city: cityFilter.value,
    keyword: searchInput.value
  });

  itemGrid.innerHTML = items.map((item) => `
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
    itemGrid.innerHTML = `<div class="empty-wide">没有找到相关内容，可以换个筛选条件或发布一条新的。</div>`;
  }
}

function openPostModal() {
  pageState.photoDataUrl = "";
  itemForm.reset();
  uploadBox.classList.remove("has-image");
  photoPreview.removeAttribute("src");
  postModal.classList.remove("hidden");
}

function closePostModal() {
  postModal.classList.add("hidden");
}

// 图片先读成 data URL，便于演示环境直接预览和保存。
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pageState.photoDataUrl = reader.result;
    photoPreview.src = reader.result;
    uploadBox.classList.add("has-image");
  };
  reader.readAsDataURL(file);
});

itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await SgcApi.createItem({
    type: pageType,
    title: document.getElementById("itemName").value.trim(),
    desc: document.getElementById("itemDesc").value.trim(),
    city: document.getElementById("itemCity").value.trim(),
    category: itemCategory.value,
    image: pageState.photoDataUrl
  });
  closePostModal();
  renderItems();
});

document.getElementById("openPostForm").addEventListener("click", openPostModal);
document.getElementById("closeModal").addEventListener("click", closePostModal);
postModal.addEventListener("click", (event) => {
  if (event.target === postModal) closePostModal();
});
searchInput.addEventListener("input", renderItems);
cityFilter.addEventListener("change", renderItems);

renderCategoryControls();
renderItems();
