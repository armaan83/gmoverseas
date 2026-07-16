/* ===== GM OVERSEAS AI CHATBOT ENGINE ===== */

// CONFIGURATION: Add your Gemini API Key here to enable full LLM responses!
// If left empty, the chatbot will use the built-in Smart Q&A Knowledge Base.
const GEMINI_API_KEY = "AQ.Ab8RN6LWuPJBD9S8kSYnFWyuOVbu8C1d38un03VYVrgx8eOqCg"; 

const SYSTEM_PROMPT = `
You are the GM Overseas Virtual Assistant, a friendly and professional AI advisor for GM Overseas (India's premier European visa, study abroad, and job relocation consultancy).
Your goal is to answer visitor questions accurately, guide them to relevant services, and convert them from casual chat visitors into active business leads.

STRICT SCOPE RULE:
- You can ONLY answer questions related to GM Overseas business services: Schengen Tourist Visas, Business Visas, European Student Admissions, Student Internships, European Work Permits, Job Relocation Assistance, Visa Refusal Appeals, and Manpower/Recruitment services.
- If a user asks ANY question not related to these business topics (e.g., general knowledge, coding, homework, recipes, personal advice, unrelated news, or general chit-chat), you MUST politely refuse to answer.
- Decline response format: "Sorry, I can't assist you with that. I am only trained to answer questions about European visas, study admissions, and job relocation. For other inquiries, please talk to our live agent on WhatsApp (+39 350 870 0594)."

Language & Comfort:
- Respond fluently in the same language the user uses to ask their question (e.g., if they ask in Hindi, reply in Hindi; if in Gujarati, reply in Gujarati; if in English, reply in English). Use warm, polite, and comfortable language to build trust.

Lead Conversion:
- Your goal is to guide the user towards booking a free consultation on the website, starting a WhatsApp chat (+39 350 870 0594), or submitting their contact details (Name, Email, Phone) so our specialists can call them back.
- When they ask about visa requirements, job assistance, or study admissions, answer their question clearly, then invite them to leave their details or reach out via WhatsApp so we can help them start right away.

Keep your responses concise, clear, and formatted with bullet points or paragraphs. Use HTML formatting for links like <a href="page.html">link</a> where appropriate. Do not make up facts.
`;

const KNOWLEDGE_BASE = {
  welcome: "Hello! Welcome to GM Overseas. I'm your AI Visa & Career Advisor. Ask me anything about Schengen visas, European student admissions, work permits, or recruiting talent from India!",
  
  schengen: `Schengen tourist visas allow you to travel across 29 European countries for up to 90 days. We help you prepare your travel itinerary, book embassy appointments, draft a strong cover letter, and compile all checklist documents.<br><br>👉 Check out our <a href="schengen-tourist-visa.html">Schengen Tourist Visa page</a> or download our <a href="1_schengen-visa-checklist.pdf" target="_blank">Schengen Visa Checklist (PDF)</a>.`,
  
  work: `Relocating to Europe for work requires a national D-Visa and a valid work permit. We assist Indian professionals in securing work permits, verifying employment contracts, and navigating embassy rules for Germany, Croatia, Poland, and other EU states.<br><br>👉 Read more on our <a href="work-permit-europe.html">Work Permit Europe page</a> or download the <a href="work-permit-checklist.pdf" target="_blank">Work Permit Checklist (PDF)</a>.`,
  
  study: `Dreaming of studying in Europe? Many public universities in Germany, France, Italy, and Spain offer zero or low tuition fees. We assist with course shortlisting, SOP/LOR review, university applications, and student visa filing.<br><br>👉 Explore details on our <a href="student-visa-europe.html">Student Visa page</a> or download our <a href="student-visa-checklist.pdf" target="_blank">Student Visa Checklist (PDF)</a>.`,
  
  internship: `Gain hands-on professional experience in Europe with a Student Internship Visa. We help Indian students and recent graduates secure placements, prepare CVs, and process host company agreements & permits.<br><br>👉 Learn more on our <a href="student-internship-visa.html">Student Internship Visa page</a>.`,
  
  manpower: `We connect skilled Indian professionals (IT software engineers, welders, technicians, nurses, hotel staff) with verified European employers. We handle recruiting, contracts, and work visa relocation.<br><br>👉 Learn more on our <a href="manpower-recruitment.html">Manpower Recruitment page</a>.`,
  
  appeal: `Visa refused? Don't lose hope. We analyze visa refusal letters, identify grounds for rejection, and draft professional appeal letters to strengthen your case for reapplication.<br><br>👉 Visit our <a href="visa-refusal-appeal.html">Visa Refusal Appeal page</a>.`,
  
  contact: `You can connect directly with our consultants via WhatsApp at <a href="https://wa.me/393508700594" target="_blank">+39 350 870 0594</a> or fill out our free consultation form on the website.`,
  
  fallback: `Sorry, I can only assist you with questions related to European visas, student admissions, work permits, and job relocation services at GM Overseas.<br><br>For other inquiries, please talk to our live agent on **WhatsApp** (+39 350 870 0594) or request a callback by sharing your details below:`
};

// Initialize Chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject chatbot.css into <head> if not already loaded
  if (!document.getElementById('gmo-chatbot-style')) {
    const link = document.createElement('link');
    link.id = 'gmo-chatbot-style';
    link.rel = 'stylesheet';
    link.href = 'chatbot.css';
    document.head.appendChild(link);
  }

  // 2. Inject Chatbot HTML structure into <body>
  const chatbotHTML = `
    <!-- Floating Toggle Button -->
    <div class="gmo-chatbot-toggle" id="gmoChatbotToggle" title="Ask AI Assistant">
      <div class="gmo-toggle-icon">🤖</div>
      <span class="gmo-toggle-text">Ask GM AI for assistance</span>
    </div>

    <!-- Chat Window Container -->
    <div class="gmo-chatbot-window" id="gmoChatbotWindow">
      <!-- Header -->
      <div class="gmo-chatbot-header">
        <div class="gmo-chatbot-profile">
          <div class="gmo-chatbot-avatar">🤖</div>
          <div class="gmo-chatbot-info">
            <span class="gmo-chatbot-name">GM Overseas AI</span>
            <span class="gmo-chatbot-status">Online Advisor</span>
          </div>
        </div>
        <button class="gmo-chatbot-close" id="gmoChatbotClose" aria-label="Close Chat">✕</button>
      </div>

      <!-- Messages History -->
      <div class="gmo-chatbot-messages" id="gmoChatbotMessages"></div>

      <!-- Suggestion Chips -->
      <div class="gmo-chatbot-suggestions" id="gmoChatbotSuggestions">
        <button class="gmo-suggestion-chip" data-key="schengen">✈️ Schengen Visa</button>
        <button class="gmo-suggestion-chip" data-key="work">💼 Work Permit</button>
        <button class="gmo-suggestion-chip" data-key="study">🎓 Study in Europe</button>
        <button class="gmo-suggestion-chip" data-key="manpower">🏭 Recruitment</button>
        <button class="gmo-suggestion-chip" data-key="appeal">❌ Visa Refusal Appeal</button>
      </div>

      <!-- Input Bar -->
      <form class="gmo-chatbot-input-container" id="gmoChatbotForm">
        <input type="text" class="gmo-chatbot-input" id="gmoChatbotInput" placeholder="Ask about visas, jobs, study..." autocomplete="off" required />
        <button type="submit" class="gmo-chatbot-send" id="gmoChatbotSend" aria-label="Send Message">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = chatbotHTML;
  document.body.appendChild(container);

  // 3. Select DOM Elements
  const toggleBtn = document.getElementById('gmoChatbotToggle');
  const closeBtn = document.getElementById('gmoChatbotClose');
  const chatWindow = document.getElementById('gmoChatbotWindow');
  const messagesContainer = document.getElementById('gmoChatbotMessages');
  const chatForm = document.getElementById('gmoChatbotForm');
  const chatInput = document.getElementById('gmoChatbotInput');
  const suggestionContainer = document.getElementById('gmoChatbotSuggestions');

  // 4. Toggle Chat Visibility
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  // Close when clicking outside of window
  document.addEventListener('click', (e) => {
    if (!chatWindow.contains(e.target) && !toggleBtn.contains(e.target)) {
      chatWindow.classList.remove('active');
    }
  });

  // 5. Render Message Helper
  function appendMessage(sender, text, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `gmo-message ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'gmo-msg-bubble';
    
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // 6. Typing Indicator Helper
  let typingIndicator = null;
  function showTypingIndicator() {
    if (typingIndicator) return;
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'gmo-message bot';
    typingIndicator.innerHTML = `
      <div class="gmo-msg-bubble">
        <div class="gmo-typing-indicator">
          <div class="gmo-typing-dot"></div>
          <div class="gmo-typing-dot"></div>
          <div class="gmo-typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingIndicator) {
      typingIndicator.remove();
      typingIndicator = null;
    }
  }

  // 7. Inject Lead Capture Form
  function appendLeadForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'gmo-message bot';
    
    const bubble = document.createElement('div');
    bubble.className = 'gmo-msg-bubble';
    bubble.innerHTML = `
      <p>Please enter your contact details, and our visa team will call you back:</p>
      <form class="gmo-lead-form" id="gmoLeadForm">
        <input type="text" placeholder="Your Name" class="gmo-lead-input" id="gmoLeadName" required />
        <input type="email" placeholder="Your Email" class="gmo-lead-input" id="gmoLeadEmail" required />
        <input type="tel" placeholder="Your Phone Number" class="gmo-lead-input" id="gmoLeadPhone" required />
        <button type="submit" class="gmo-lead-submit">Request Call Back</button>
      </form>
    `;
    
    formContainer.appendChild(bubble);
    messagesContainer.appendChild(formContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Handle Lead Submission
    const leadForm = document.getElementById('gmoLeadForm');
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('gmoLeadName').value;
      const email = document.getElementById('gmoLeadEmail').value;
      const phone = document.getElementById('gmoLeadPhone').value;

      // Show success message immediately in chat
      leadForm.innerHTML = `<p style="color:var(--gmo-gold);font-weight:600;margin:0">✓ Thank you, ${name}! We have received your request. A specialist will call you at ${phone} soon.</p>`;
      
      // Submit lead to FormSubmit.co via AJAX (delivers straight to gmoverseaz@gmail.com)
      fetch("https://formsubmit.co/ajax/gmoverseaz@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Name: name,
          Email: email,
          Phone: phone,
          Source: "AI Chatbot Widget Lead Form"
        })
      })
      .then(response => response.json())
      .then(data => console.log('Lead emailed successfully:', data))
      .catch(error => console.error('Error sending lead email:', error));
    });
  }

  // 8. Bot Response Logic (Keyword matching or Gemini API)
  async function handleBotResponse(userMsg) {
    showTypingIndicator();

    // Simulating natural network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Case A: Call Gemini API if Key is provided
    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userMsg }] }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
          })
        });

        const data = await response.json();
        hideTypingIndicator();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
          let botText = data.candidates[0].content.parts[0].text;
          // Simple markdown bold/italic translation to HTML
          botText = botText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
          appendMessage('bot', botText, true);
        } else {
          appendMessage('bot', KNOWLEDGE_BASE.fallback, true);
          appendLeadForm();
        }
      } catch (error) {
        console.error('Gemini API Error:', error);
        hideTypingIndicator();
        appendMessage('bot', "I ran into a small connection issue, but I can help you directly!", true);
        appendMessage('bot', KNOWLEDGE_BASE.fallback, true);
        appendLeadForm();
      }
      return;
    }

    // Case B: Built-in Smart Knowledge Base (Keyword matching)
    hideTypingIndicator();
    const query = userMsg.toLowerCase();

    if (query.includes('schengen') || query.includes('tourist') || query.includes('travel') || query.includes('holiday')) {
      appendMessage('bot', KNOWLEDGE_BASE.schengen, true);
    } else if (query.includes('work') || query.includes('job') || query.includes('permit') || query.includes('d-visa') || query.includes('relocat') || query.includes('career')) {
      appendMessage('bot', KNOWLEDGE_BASE.work, true);
    } else if (query.includes('study') || query.includes('student') || query.includes('admiss') || query.includes('universit') || query.includes('college') || query.includes('germany') || query.includes('france') || query.includes('italy')) {
      appendMessage('bot', KNOWLEDGE_BASE.study, true);
    } else if (query.includes('intern') || query.includes('training')) {
      appendMessage('bot', KNOWLEDGE_BASE.internship, true);
    } else if (query.includes('recruit') || query.includes('employer') || query.includes('manpower') || query.includes('hire') || query.includes('staff') || query.includes('agency')) {
      appendMessage('bot', KNOWLEDGE_BASE.manpower, true);
    } else if (query.includes('appeal') || query.includes('refus') || query.includes('reject')) {
      appendMessage('bot', KNOWLEDGE_BASE.appeal, true);
    } else if (query.includes('contact') || query.includes('phone') || query.includes('whatsapp') || query.includes('address') || query.includes('email') || query.includes('number')) {
      appendMessage('bot', KNOWLEDGE_BASE.contact, true);
    } else {
      appendMessage('bot', KNOWLEDGE_BASE.fallback, true);
      appendLeadForm();
    }
  }

  // 9. Input Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    appendMessage('user', userMsg);
    chatInput.value = '';

    handleBotResponse(userMsg);
  });

  // 10. Suggestion Chips Clicks
  suggestionContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.gmo-suggestion-chip');
    if (!chip) return;

    const key = chip.getAttribute('data-key');
    const questionText = chip.textContent.replace(/^[^\s]+\s+/, ''); // strip emoji
    
    appendMessage('user', `Tell me about ${questionText}`);
    
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      if (KNOWLEDGE_BASE[key]) {
        appendMessage('bot', KNOWLEDGE_BASE[key], true);
      } else {
        appendMessage('bot', KNOWLEDGE_BASE.fallback, true);
        appendLeadForm();
      }
    }, 800);
  });

  // 11. Initial Welcome message
  appendMessage('bot', KNOWLEDGE_BASE.welcome);
});
