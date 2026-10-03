const conversations = [
  {
    id: "maya",
    name: "Maya Chen",
    initials: "MC",
    color: "rose",
    time: "9:41 AM",
    preview: "That sounds like the perfect plan!",
    tag: "Today",
    unread: true,
    starred: true,
    online: true,
    messages: [
      {
        incoming: true,
        text: "Hey! Are we still on for coffee this weekend?",
        time: "9:32 AM",
      },
      {
        incoming: false,
        text: "Absolutely. I found a little place near the park that looks lovely.",
        time: "9:36 AM",
      },
      {
        incoming: true,
        text: "That sounds like the perfect plan!",
        time: "9:41 AM",
      },
    ],
  },
  {
    id: "daniel",
    name: "Daniel Brooks",
    initials: "DB",
    color: "blue",
    time: "8:56 AM",
    preview: "Sent you the photos from yesterday 📸",
    tag: "Today",
    unread: true,
    starred: false,
    online: true,
    messages: [
      {
        incoming: true,
        text: "Sent you the photos from yesterday 📸",
        time: "8:56 AM",
      },
    ],
  },
  {
    id: "sunday",
    name: "Sunday dinner",
    initials: "SD",
    color: "yellow",
    time: "Yesterday",
    preview: "Nora: I can bring dessert!",
    tag: "Group · 4 people",
    unread: false,
    starred: false,
    group: true,
    online: false,
    messages: [
      { incoming: true, text: "Nora: I can bring dessert!", time: "Yesterday" },
    ],
  },
  {
    id: "nora",
    name: "Nora Patel",
    initials: "NP",
    color: "lilac",
    time: "Yesterday",
    preview: "Thank you, you made my day 🌷",
    tag: "Yesterday",
    unread: false,
    starred: false,
    online: false,
    messages: [
      {
        incoming: true,
        text: "Thank you, you made my day 🌷",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "leo",
    name: "Leo Martinez",
    initials: "LM",
    color: "green",
    time: "Mon",
    preview: "Let me know when you get home.",
    tag: "Monday",
    unread: false,
    starred: false,
    online: true,
    messages: [
      {
        incoming: true,
        text: "Let me know when you get home.",
        time: "Monday",
      },
    ],
  },
];

const listElement = document.querySelector("#conversation-list");
const emptyElement = document.querySelector("#chat-empty");
const chatView = document.querySelector("#chat-view");
const searchInput = document.querySelector("#search-input");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const messageStream = document.querySelector("#message-stream");
let activeId = null;
let activeTab = "all";
let toastTimer;

function renderConversations() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = conversations.filter((conversation) => {
    const matchesQuery = `${conversation.name} ${conversation.preview}`
      .toLowerCase()
      .includes(query);
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && conversation.unread) ||
      (activeTab === "groups" && conversation.group) ||
      (activeTab === "starred" && conversation.starred) ||
      (activeTab === "archived" && conversation.archived);
    return matchesQuery && matchesTab;
  });

  listElement.replaceChildren();
  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = query
      ? "No messages match your search."
      : "Nothing here just yet.";
    listElement.append(empty);
    return;
  }

  filtered.forEach((conversation, index) => {
    const item = document.createElement("article");
    item.className = `conversation-item${conversation.id === activeId ? " selected" : ""}`;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      `Open conversation with ${conversation.name}`,
    );
    item.style.animationDelay = `${index * 35}ms`;
    const avatar = document.createElement("span");
    avatar.className = `avatar ${conversation.color}${conversation.online ? "" : " no-presence"}`;
    avatar.textContent = conversation.initials;
    const copy = document.createElement("span");
    copy.className = "conversation-copy";
    const top = document.createElement("span");
    top.className = "conversation-top";
    const name = document.createElement("span");
    name.className = "conversation-name";
    name.textContent = conversation.name;
    const time = document.createElement("span");
    time.className = "conversation-time";
    time.textContent = conversation.time;
    top.append(name, time);
    const preview = document.createElement("span");
    preview.className = "conversation-preview";
    preview.textContent = conversation.preview;
    const bottom = document.createElement("span");
    bottom.className = "conversation-bottom";
    const tag = document.createElement("span");
    tag.className = "conversation-tag";
    tag.textContent = conversation.tag;
    bottom.append(tag);
    if (conversation.unread) {
      const unread = document.createElement("span");
      unread.className = "unread-dot";
      unread.setAttribute("aria-label", "Unread");
      bottom.append(unread);
    }
    copy.append(top, preview, bottom);
    item.append(avatar, copy);
    item.addEventListener("click", () => openConversation(conversation.id));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openConversation(conversation.id);
      }
    });
    listElement.append(item);
  });
}

function openConversation(id) {
  activeId = id;
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) return;
  conversation.unread = false;
  emptyElement.hidden = true;
  chatView.hidden = false;
  document.body.classList.add("chat-open");
  const avatar = chatView.querySelector(".chat-avatar");
  avatar.className = `avatar chat-avatar ${conversation.color}${conversation.online ? "" : " no-presence"}`;
  avatar.textContent = conversation.initials;
  chatView.querySelector(".chat-person-copy strong").textContent =
    conversation.name;
  chatView.querySelector(".chat-person-copy small").textContent =
    conversation.online ? "Active now" : conversation.tag;
  renderMessages(conversation);
  renderConversations();
}

function renderMessages(conversation) {
  messageStream.replaceChildren();
  const divider = document.createElement("div");
  divider.className = "date-divider";
  divider.textContent = "TODAY";
  messageStream.append(divider);
  conversation.messages.forEach((message) => {
    const row = document.createElement("div");
    row.className = `message-row${message.incoming ? "" : " sent"}`;
    if (message.incoming) {
      const avatar = document.createElement("span");
      avatar.className = `avatar message-avatar ${conversation.color} no-presence`;
      avatar.textContent = conversation.initials;
      row.append(avatar);
    }
    const wrap = document.createElement("div");
    wrap.className = "message-bubble-wrap";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;
    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = message.time;
    wrap.append(bubble, time);
    row.append(wrap);
    messageStream.append(row);
  });
  messageStream.scrollTop = messageStream.scrollHeight;
}

function showToast(text) {
  const toast = document.querySelector("#toast");
  toast.textContent = text;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function startConversation() {
  const firstContact = conversations[0];
  openConversation(firstContact.id);
  messageInput.focus();
}

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll(".filter-tab").forEach((button) => {
      const selected = button === tab;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    renderConversations();
  });
});

document.querySelectorAll(".nav-item[data-filter]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    activeTab = item.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const selected = tab.dataset.tab === activeTab;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    renderConversations();
  });
});

searchInput.addEventListener("input", renderConversations);
document
  .querySelector("#compose-button")
  .addEventListener("click", startConversation);
document
  .querySelector("#empty-compose")
  .addEventListener("click", startConversation);
document
  .querySelector(".mobile-menu")
  .addEventListener("click", () => showToast("Your inbox is right here."));
document
  .querySelector(".chat-back")
  .addEventListener("click", () => document.body.classList.remove("chat-open"));
document.querySelector(".emoji-button").addEventListener("click", () => {
  messageInput.value += " 😊";
  messageInput.focus();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  const conversation = conversations.find((item) => item.id === activeId);
  if (!text || !conversation) return;
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  conversation.messages.push({ incoming: false, text, time });
  conversation.preview = text;
  conversation.time = time;
  conversation.tag = "Today";
  messageInput.value = "";
  renderMessages(conversation);
  renderConversations();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    document.activeElement !== searchInput &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") searchInput.blur();
});

renderConversations();
