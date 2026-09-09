const { Module } = require("../main");
const config = require("../config");
const { setVar } = require("./manage");

// ============================================================
// AUTO REPLY PLUGIN
// Raganork-MD v6.3.0
// ============================================================

// Chats where auto-reply has been enabled
const enabledChats = new Set();

// Global settings
let enabledForGroups = false;
let enabledForDMs = false;

// ------------------------------------------------------------
// Default automatic replies
// You can edit these messages to your own replies.
// ------------------------------------------------------------

const autoReplies = {
"hi": "Hello 👋 Welcome! How can I help you?",
"hello": "Hello 👋 Welcome! How can I help you?",
"hey": "Hey 👋 How can I help you?",

"good morning": "Good morning 🌅! How can we help you today?",
"good afternoon": "Good afternoon 😊! How can we help you?",
"good evening": "Good evening 🌆! How can we help you?",

"thanks": "You're welcome 😊",
"thank you": "You're most welcome ❤️",

"price": "Please send me the item you're interested in and we'll give you the price.",
"prices": "Please send me the item you're interested in and we'll give you the price.",

"location": "we are located at kasarani sunton stage 📍.",
"where are you": "we are located at kasarani sunton stage 📍.",

"available": "Please send the name or photo of the item you are looking for and we'll check availability.",

"help": "Hello 👋 Please tell us what you need help with and we'll assist you."
};

// ------------------------------------------------------------
// Load saved settings
// ------------------------------------------------------------

function loadSettings() {
try {
if (config.AUTOREPLY_CHATS) {
const chats = JSON.parse(config.AUTOREPLY_CHATS);

if (Array.isArray(chats)) {
chats.forEach((jid) => enabledChats.add(jid));
}
}

enabledForGroups =
String(config.AUTOREPLY_GROUPS || "").toLowerCase() === "true";

enabledForDMs =
String(config.AUTOREPLY_DMS || "").toLowerCase() === "true";

} catch (error) {
console.log("AutoReply settings could not be loaded:", error.message);
}
}

loadSettings();

// ------------------------------------------------------------
// Save enabled chats
// ------------------------------------------------------------

async function saveSettings() {
try {
await setVar(
"AUTOREPLY_CHATS",
JSON.stringify(Array.from(enabledChats))
);

await setVar(
"AUTOREPLY_GROUPS",
String(enabledForGroups)
);

await setVar(
"AUTOREPLY_DMS",
String(enabledForDMs)
);

} catch (error) {
console.log("AutoReply settings could not be saved:", error.message);
}
}

// ------------------------------------------------------------
// Check if auto-reply is enabled for this chat
// ------------------------------------------------------------

function isEnabled(message) {
const jid = message.jid;
const isGroup = message.isGroup;

if (enabledChats.has(jid)) {
return true;
}

if (isGroup && enabledForGroups) {
return true;
}

if (!isGroup && enabledForDMs) {
return true;
}

return false;
}

// ------------------------------------------------------------
// Find matching automatic reply
// ------------------------------------------------------------

function getAutoReply(text) {
if (!text) return null;

const messageText = text.toLowerCase().trim();

for (const keyword of Object.keys(autoReplies)) {
const key = keyword.toLowerCase();

// Exact match
if (messageText === key) {
return autoReplies[keyword];
}

// Match phrases such as:
// "hello there"
// "hi bro"
// "what is the price"
if (
messageText.startsWith(key + " ") ||
messageText.endsWith(" " + key) ||
messageText.includes(" " + key + " ")
) {
return autoReplies[keyword];
}
}

return null;
}

// ============================================================
// COMMAND: .autoreply
// ============================================================

Module(
{
pattern: "autoreply ?(.*)",
fromMe: true,
desc: "Manage automatic replies",
usage:
".autoreply on/off/status/list | .autoreply on groups | .autoreply on dms"
},
async (message, match) => {
try {
const input = (match || "").trim().toLowerCase();
const jid = message.jid;

// ------------------------------------------------------
// Help
// ------------------------------------------------------

if (!input) {
return await message.sendReply(
`🤖 *AUTO REPLY*

Commands:

• .autoreply on
Enable auto-reply in this chat.

• .autoreply off
Disable auto-reply in this chat.

• .autoreply on groups
Enable auto-reply in all groups.

• .autoreply off groups
Disable auto-reply in all groups.

• .autoreply on dms
Enable auto-reply in all private chats.

• .autoreply off dms
Disable auto-reply in private chats.

• .autoreply status
Show current settings.

• .autoreply list
Show automatic replies.`
);
}

// ------------------------------------------------------
// ON
// ------------------------------------------------------

if (input === "on") {
enabledChats.add(jid);
await saveSettings();

return await message.sendReply(
"✅ Auto-reply has been *enabled* for this chat."
);
}

// ------------------------------------------------------
// OFF
// ------------------------------------------------------

if (input === "off") {
enabledChats.delete(jid);
await saveSettings();

return await message.sendReply(
"❌ Auto-reply has been *disabled* for this chat."
);
}

// ------------------------------------------------------
// GROUPS
// ------------------------------------------------------

if (input === "on groups") {
enabledForGroups = true;
await saveSettings();

return await message.sendReply(
"✅ Auto-reply is now enabled for *all groups*."
);
}

if (input === "off groups") {
enabledForGroups = false;
await saveSettings();

return await message.sendReply(
"❌ Auto-reply has been disabled for *all groups*."
);
}

// ------------------------------------------------------
// DMS
// ------------------------------------------------------

if (input === "on dms") {
enabledForDMs = true;
await saveSettings();

return await message.sendReply(
"✅ Auto-reply is now enabled for *all private chats*."
);
}

if (input === "off dms") {
enabledForDMs = false;
await saveSettings();

return await message.sendReply(
"❌ Auto-reply has been disabled for *all private chats*."
);
}

// ------------------------------------------------------
// STATUS
// ------------------------------------------------------

if (input === "status") {
const currentChat = enabledChats.has(jid);

return await message.sendReply(
`🤖 *AUTO REPLY STATUS*

Current chat:
${currentChat ? "✅ Enabled" : "❌ Disabled"}

All groups:
${enabledForGroups ? "✅ Enabled" : "❌ Disabled"}

All DMs:
${enabledForDMs ? "✅ Enabled" : "❌ Disabled"}`
);
}

// ------------------------------------------------------
// LIST
// ------------------------------------------------------

if (input === "list") {
let list = "🤖 *AUTO REPLY KEYWORDS*\n\n";

for (const keyword of Object.keys(autoReplies)) {
list += `• ${keyword}\n`;
}

return await message.sendReply(list);
}

return await message.sendReply(
"❌ Unknown command.\n\nUse `.autoreply` to see the available commands."
);

} catch (error) {
console.error("AutoReply command error:", error);

await message.sendReply(
"❌ An error occurred while managing auto-reply."
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
// Never reply to the bot's own messages
if (message.fromMe) return;

// Check whether this chat has auto-reply enabled
if (!isEnabled(message)) return;

const text = message.text;

if (!text) return;

// Don't respond to commands
if (
text.startsWith(".") ||
text.startsWith("!") ||
text.startsWith("#")
) {
return;
}

// Find matching reply
const reply = getAutoReply(text);

// No matching keyword
if (!reply) return;

// Send automatic reply
await message.sendReply(reply);

} catch (error) {
console.error("AutoReply message error:", error);
}
}
);
