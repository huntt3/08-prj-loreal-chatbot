/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Store the conversation history
const messages = [];

// Reference for appending messages (use chatWindow for simplicity)
const chatbotMessages = chatWindow;

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Helper function to add messages to the chat window
function addMessageToChat(sender, message) {
  // Create a new div for the message
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "user-message" : "assistant-message";
  msgDiv.innerHTML =
    sender === "user"
      ? `<strong>You:</strong> ${message}`
      : `<strong>Smart Product Advisor:</strong> ${message}`;
  chatbotMessages.appendChild(msgDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message !== "") {
    sendMessageToOpenAI(message);
    userInput.value = "";
  }
});

// Function to send user input to OpenAI and get a response
async function sendMessageToOpenAI(userInput) {
  // Add the user's message to the chat window
  addMessageToChat("user", userInput);

  // Add the user's message to the messages array
  messages.push({ role: "user", content: userInput });

  // Add 'Thinking...' animation
  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "assistant-message";
  thinkingDiv.id = "thinking-message";
  thinkingDiv.innerHTML =
    '<strong>Smart Product Advisor:</strong> <span class="thinking-dots">Thinking<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>';
  chatbotMessages.appendChild(thinkingDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  // Prepare the API request
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`, // Use your API key from secrets.js
  };
  const body = {
    model: "gpt-4o",
    messages: messages, // Send the full conversation history
    temperature: 0.8, // Make the assistant more creative
    max_tokens: 300, // Keep responses short and focused
  };

  try {
    // Send the request to OpenAI
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    // Parse the response as JSON
    const data = await response.json();
    // Remove 'Thinking...' animation
    const thinkingMsg = document.getElementById("thinking-message");
    if (thinkingMsg) thinkingMsg.remove();
    // Get the assistant's reply
    const assistantReply = data.choices && data.choices[0].message.content;
    // Add the assistant's reply to the chat window
    addMessageToChat("assistant", assistantReply);
    // Add the assistant's reply to the messages array
    messages.push({ role: "assistant", content: assistantReply });
  } catch (error) {
    // Remove 'Thinking...' animation
    const thinkingMsg = document.getElementById("thinking-message");
    if (thinkingMsg) thinkingMsg.remove();
    // Show an error message if something goes wrong
    addMessageToChat("assistant", "Sorry, there was an error.");
    console.error(error);
  }
}
