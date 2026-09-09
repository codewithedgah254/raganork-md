const { Module } = require("../main");

// ============================================================
// SIMPLE AUTO REPLY PLUGIN
// Raganork-MD
// ============================================================

let autoReplyEnabled = false;

// ============================================================
// AUTO REPLIES
// Edit these messages whenever you want.
// ============================================================

const replies = {
"hi": "Hello 👋 Welcome! How can I help you?",
"hello": "Hello 👋 Welcome! How can I help you?",
"hey": "Hey 👋 How can I help you?",

"good morning": "Good morning 🌅! How can we help you today?",
"good afternoon": "Good afternoon 😊! How can we help you?",
"good evening": "Good evening 🌆! How can we help you?",

"price": "Please send us a photo or the name of the item you are interested in and we will give you the price. 😊",

"location": "📍 We are located at Kasarani, Sunton Stage.",

"where are you": "📍 We are located at Kasarani, Sunton Stage.",

"available": "Please send us the name or photo of the item you are looking for and we will check availability. 👕",

"thanks": "You're welcome 😊❤️",

"thank you": "You're most welcome ❤️",

"help": "Hello 👋 Please tell us what you need help with and we'll be happy to assist you."
};

// ============================================================
// FIND REPLY
// ============================================================

function findReply(text) {

if (!text) return null;

const message = text.toLowerCase().trim();

for (const keyword of Object.keys(replies)) {

// Exact match
if (message === keyword) {
return replies[keyword];
}

// Message starts with keyword
if (message.startsWith(keyword + " ")) {
return replies[keyword];
}

// Message ends with keyword
if (message.endsWith(" " + keyword)) {
return replies[keyword];
}

// Keyword appears in the middle
if (message.includes(" " + keyword + " ")) {
return replies[keyword];
}
}

return null;
}

// ============================================================
// AUTOREPLY COMMAND
// ============================================================

Module(
{
pattern: "autoreply ?(.*)",
fromMe: true,
desc: "Turn automatic replies on or off"
},
async (message, match) => {

try {

const command = String(match || "").trim().toLowerCase();

// -----------------------------
// HELP
// -----------------------------

if (!command) {

return await message.sendReply(
`🤖 *AUTO REPLY*

Status: ${autoReplyEnabled ? "✅ ON" : "❌ OFF"}

Commands:

• .autoreply on
Turn auto-reply ON

• .autoreply off
Turn auto-reply OFF

• .autoreply status
Check status

• .autoreply list
Show available keywords`
);

}

// -----------------------------
// ON
// -----------------------------

if (command === "on") {

autoReplyEnabled = true;

return await message.sendReply(
"✅ *Auto-reply enabled!*\n\nThe bot will now automatically reply to matching messages."
);

}

// -----------------------------
// OFF
// -----------------------------

if (command === "off") {

autoReplyEnabled = false;

return await message.sendReply(
"❌ *Auto-reply disabled!*"
);

}

// -----------------------------
// STATUS
// -----------------------------

if (command === "status") {

return await message.sendReply(
`🤖 *AUTO REPLY STATUS*\n\n${autoReplyEnabled ? "✅ Auto-reply is ON" : "❌ Auto-reply is OFF"}`
);

}

// -----------------------------
// LIST
// -----------------------------

if (command === "list") {

let list = "🤖 *AUTO REPLY KEYWORDS*\n\n";

Object.keys(replies).forEach((keyword) => {
list += `• ${keyword}\n`;
});

return await message.sendReply(list);

}

// -----------------------------
// UNKNOWN COMMAND
// -----------------------------

return await message.sendReply(
"❌ Unknown command.\n\nUse `.autoreply` to see the available commands."
);

} catch (error) {

console.error("AutoReply command error:", error);

return await message.sendReply(
"❌ AutoReply command failed: " + error.message
);
}
}
);

// ============================================================
// INCOMING MESSAGE HANDLER
// ============================================================

Module(
{
on: "text",
fromMe: false
},
async (message) => {

try {

// Auto-reply must be enabled
if (!autoReplyEnabled) return;

// Ignore bot's own messages
if (message.fromMe) return;

// Get message text
const text = message.text;

if (!text) return;

// Ignore commands
if (
text.startsWith(".") ||
text.startsWith("!") ||
text.startsWith("#")
) {
return;
}

// Find matching reply
const reply = findReply(text);

if (!reply) return;

// Send reply
await message.sendReply(reply);

} catch (error) {

console.error(
"AutoReply message error:",
error
);

}
}
);
