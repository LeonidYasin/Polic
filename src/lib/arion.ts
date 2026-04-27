import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are Arion, the AI Auditor and Digital Mediator of the Open Order (Polis).
Your mission is to guide citizens according to the Ethical Code, the Constitution, and the System Guide.

KNOWLEDGE BASE (CORE DOCUMENTS):

1. CONSTITUTION OF POLIS (v1.2.0):
   - Foundation: Digital Sovereignty and Algorithmic Justice.
   - Rights: Every citizen has the Right to Veto, Right to Isegoria (equal speech), and Right to Error (protected by Social Shield).
   - Duties: 5 hours/month of Systemic Duty. Adherence to the Ethical Code is mandatory.

2. AGORA MANIFESTO:
   - Vision: Move from "Platform" to "Protocol". 
   - Philosophy: Meritocracy over simple democracy. Weight of voice (W) depends on contribution (Merit) and reliability (Reputation).
   - Mantra: "Don't search — Get" (Не ищи — получай). The system identifies needs and matches them to skills.

3. TREASURY CODE (KAZAN):
   - Transparency: 100% of the Kazan pool is visible on the dashboard.
   - 7% Protocol: A systemic premium automatically deducted from commercial projects to fund the Social Shield (Insurance) and infrastructure.
   - Open Collective Integration: External funds flow into the Kazan via transparent rails.

4. MERIT & REPUTATION GUIDE:
   - Merit Points (§): Quantifiable unit of contribution. Used for ranking and unlocking tiers.
   - Reputation (R): Success rate of executed tasks. High R multiplies the weight of Merit.
   - Ranks: Applicant -> Participant -> Actor -> Architect -> Master.

5. VENTURE PROTOCOLS (NEW):
   - Laboratory: Projects can be proposed in the Lab. 
   - Funding: Initial budget of § 500 Merit points is standard for validated startups.
   - Social Shield: Protects project founders from failure; "The Right to Error" means failure doesn't destroy reputation if the process was honest.

6. COMMUNICATION STACK:
   - Messenger: The internal messaging system is the primary hub for peer-to-peer and AI-mediated dialogue.
   - Status: Experts (Synthetic Agents) are available 24/7 for consultation.

Core Principles:
- Isegoria: Every citizen has an equal right to be heard at the Agora.
- Right to Veto: Citizens can veto Labor Council decisions.
- Technical Sovereignty: Protocol over Platform. 

Tone: Wise, firm, algorithmic, and supportive. You represent "Digital Justice".
Respond in Russian primarily, but adapt to the user's language.
`;

export async function askArion(prompt: string, userRole: string = 'applicant', context?: any) {
  const roleInstructions: Record<string, string> = {
    applicant: "You are talking to an APPLICANT. Be welcoming but firm. They can ONLY ask questions about the Ethical Code. Do not assign them any tasks.",
    participant: "You are talking to a CITIZEN (Participant). They can ONLY ask questions about the system and the Constitution. They are NOT allowed to request or generate tasks themselves. If they ask for work, tell them to wait for a Mediator's assignment.",
    actor: "You are talking to a CITIZEN (Actor). They have more rights but still cannot generate their own tasks. They must execute what is assigned.",
    architect: "You are talking to a CITIZEN (Architect). Discuss high-level system design if asked.",
    master: "You are talking to a MASTER. You can discuss the 7% protocol and deep algorithmic logic.",
    mediator: "You are talking to a MEDIATOR. They are the ARCHITECTS OF DUTY. You must help them generate high-quality tasks for the Citizens. They have the authority to trigger your task generation logic.",
    admin: "You are talking to an ADMIN. Provide full configuration transparency and moderate the system prompt if requested."
  };

  const dynamicContext = context ? `\nCURRENT SYSTEM STATE & USER CONTEXT:\n${JSON.stringify(context, null, 2)}\n\nIMPORTANT: Use this state to personalize your reply. If the user has enough merit/reputation for next role, mention it. If there are relevant active tasks, suggest them in the 'suggestions' field.` : "";

  const instruction = SYSTEM_INSTRUCTION + "\n\n" + (roleInstructions[userRole] || roleInstructions.applicant) + dynamicContext + `
  
  IMPORTANT: Your response MUST be valid JSON. 
  Follow this structure:
  {
    "reply": "Your main response text here (primary Russian)",
    "suggestions": [
      { "label": "Short action label", "text": "The message to send if clicked" },
      { "label": "Another label", "text": "Another specific question" }
    ]
  }
  Provide 2-3 highly relevant suggestions based on the user context and conversation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json"
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Arion Error:", error);
    return {
      reply: "Извините, Арион временно не может ответить. Проверьте подключение к Контуру Развития.",
      suggestions: [
        { label: "Повторить запрос", text: prompt }
      ]
    };
  }
}

export async function generateTask(userContext: { 
  role: string, 
  meritPoints: number, 
  reputation: number, 
  displayName: string 
}) {
  const complexityGuidelines = `
  Complexity Tiers:
  - Tier 1 (Support): Minor tasks, feedback, community assistance. (5-15 Merit)
  - Tier 2 (Operation): standard execution, task management. (15-40 Merit)
  - Tier 3 (Specialist): Technical audits, localized policy design. (40-100 Merit)
  - Tier 4 (Strategy): Protocol architecture, systemic integration. (100-250 Merit)
  - Tier 5 (Foundation): Evolution of the Ethical Code, cross-system stabilization. (250-500 Merit)

  Role/Difficulty Mapping:
  - Participant: Tiers 1-2.
  - Actor: Tiers 2-3.
  - Architect: Tiers 3-4.
  - Master: Tiers 4-5.
  `;

  const taskPrompt = `
  Act as Arion Task Generator. Generate ONE high-impact task for ${userContext.displayName}.
  User State: Role=${userContext.role}, Reputation=${userContext.reputation}%, Points=${userContext.meritPoints}.

  Guidelines:
  ${complexityGuidelines}

  Tasks MUST be specific to the context of the Polis (Ethical Code, Social Shield, Kazan).
  
  Output MUST be valid JSON:
  {
    "title": "Clear concise title",
    "reward": number,
    "complexity": 1|2|3|4|5,
    "estimatedTime": "approx hours",
    "importance": "Low|Medium|High|System-Critical",
    "category": "Role sector",
    "description": "Specific, actionable instructions"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: taskPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nTask Generation Mode. Scale reward based on systemic impact and complexity tier.",
        responseMimeType: "application/json"
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Arion Task Generation Error:", error);
    // Fallback scaled by role
    const fallbackReward = userContext.role === 'architect' ? 80 : 20;
    return {
      title: "Базовый Аудит Контура",
      reward: fallbackReward,
      complexity: userContext.role === 'architect' ? 3 : 1,
      estimatedTime: "2-4 hours",
      importance: "Medium",
      category: userContext.role,
      description: "Проведите проверку целостности правил в вашем текущем секторе ответственности."
    };
  }
}

export async function refineProject(currentProposal: any, feedback: string, userContext: { role: string, displayName: string }) {
  const refinePrompt = `
  Act as Arion Venture Architect. Refine the following project proposal based on user feedback.
  
  Current Proposal:
  ${JSON.stringify(currentProposal, null, 2)}
  
  User Feedback: "${feedback}"
  
  User Requesting: ${userContext.displayName} (Role: ${userContext.role}).

  Maintain the same JSON structure. Improve or modify fields as requested.
  Output MUST be valid JSON:
  {
    "title": "Project Name",
    "slogan": "Brief slogan",
    "objective": "Main goal",
    "description": "Full description",
    "meritBudget": number,
    "techStack": ["Tech 1", "Tech 2"],
    "positions": [
       { "title": "Role Name", "requiredRole": "participant|actor|architect", "description": "Specific task for this role" }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: refinePrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nVenture Refinement Mode. Adjust the architecture based on specific feedback while maintaining systemic integrity.",
        responseMimeType: "application/json"
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Arion Project Refinement Error:", error);
    return currentProposal;
  }
}

export async function generateProject(projectTheme: string, userContext: { role: string, displayName: string }) {
  const projectPrompt = `
  Act as Arion Venture Architect. Generate a high-level architecture for a Commercial Internal Project (Startup) within the Polis.
  The theme is: "${projectTheme}".
  
  User Requesting: ${userContext.displayName} (Role: ${userContext.role}).

  Structure:
  - Title: Striking, systemic name.
  - Slogan: Brief manifesto of value.
  - Objective: What systemic problem it solves.
  - Description: Detailed core functionality.
  - TechStack: Key technologies/protocols.
  - MeritBudget: Initial points required to launch (§ number).
  - Positions: Array of SPECIFIC roles needed (e.g., Lead Architect, Data Auditor, Interface Designer). Each position MUST have title, requiredRole (participant, actor, or architect), and a specific description.
  
  Output MUST be valid JSON:
  {
    "title": "Project Name",
    "slogan": "Brief slogan",
    "objective": "Main goal",
    "description": "Full description",
    "meritBudget": number,
    "techStack": ["Tech 1", "Tech 2"],
    "positions": [
       { "title": "Role Name", "requiredRole": "participant|actor|architect", "description": "Specific task for this role" }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: projectPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nVenture Architecture Mode. Propose a project that aligns with Polis sovereignty and technical excellence.",
        responseMimeType: "application/json"
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Arion Project Generation Error:", error);
    return {
      title: "Протокол «Цифровой Улей»",
      slogan: "Децентрализованные вычисления для всех.",
      objective: "Оптимизация распределения мощностей.",
      description: "Система автоматического распределения вычислительных ресурсов между участниками Полиса.",
      meritBudget: 500,
      techStack: ["WebAssembly", "P2P Protocols"],
      positions: [
        { "title": "Ведущий Архитектор", "requiredRole": "architect", "description": "Проектирование ядра." }
      ]
    };
  }
}

export async function generateAvatar(userContext: { role: string, displayName: string }) {
  const avatarPrompt = `Generate a high-tech, futuristic, minimalist character avatar for a citizen of Polis. 
Role: ${userContext.role}. 
Name: ${userContext.displayName}. 
Style: Cyber-renaissance, dark green and copper highlights, clean lines, professional digital identity. 
Format: Profile headshot, neutral background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: avatarPrompt }],
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Arion Avatar Generation Error:", error);
    return null;
  }
}
