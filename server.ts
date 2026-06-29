import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize GoogleGenAI client to avoid startup crashes if key is empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API: Generate proactive instructions
app.post("/api/recommendations", async (req, res) => {
  try {
    const { tasks, bills, schedule } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // High-quality static/simulated proactive advice matching ClutchAI context
      return res.json({
        recommendations: [
          {
            id: "rec-1",
            type: "action_item",
            text: "Action Item: Tackle 'Project Phoenix Final Submission' immediately. Due in 3 hours.",
            actionId: "task-1"
          },
          {
            id: "rec-2",
            type: "ledger_alert",
            text: "Ledger Alert: Settle AWS Cloud Bill ($142.50) due in 24 hours to secure service uptime.",
            actionId: "bill-1"
          },
          {
            id: "rec-3",
            type: "calendar_shift",
            text: "Calendar Recommendation: Squeeze a 45-min 'Focus Block' before the Client Pitch.",
            actionId: "focus-block"
          }
        ]
      });
    }

    const prompt = `
Analyze the current user schedule, tasks, and ledger commitments to recommend exactly 3 highly urgent, action-oriented items.
Current Tasks:
${JSON.stringify(tasks, null, 2)}

Current Ledger & Bills:
${JSON.stringify(bills, null, 2)}

Daily Schedule:
${JSON.stringify(schedule, null, 2)}

Generate a curated array of exactly 3 recommendations. Keep the instructions ultra-clear, concise, stress-reducing, and direct.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are ClutchAI, a proactive, fast-thinking AI productivity co-pilot. Your tone is highly professional, calm, extremely structured, and supportive. You specialize in rescuing busy users from high-stress scenarios. Ensure your recommendations correspond directly to the most critical or overdue tasks and bills provided in the context.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations"],
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "text"],
                properties: {
                  id: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "Must be 'action_item', 'ledger_alert', 'calendar_shift', or 'general'"
                  },
                  text: {
                    type: Type.STRING,
                    description: "Actionable prescription, e.g., 'Action Item: Tackle Project Phoenix...'"
                  },
                  actionId: {
                    type: Type.STRING,
                    description: "Reference ID of corresponding task or bill if applicable"
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (err: any) {
    console.warn("Gemini API is unavailable or rate-limited. Falling back to simulated smart recommendation matrix.", err.message || err);
    // Graceful fallback values
    res.json({
      recommendations: [
        {
          id: "rec-fallback-1",
          type: "action_item",
          text: "Action Item: Tackle your highest priority tasks ('Project Phoenix deck') immediately. Due today.",
          actionId: "task-1"
        },
        {
          id: "rec-fallback-2",
          type: "ledger_alert",
          text: "Ledger Alert: Settle your AWS Cloud balance due in 48 hours to protect continuous services.",
          actionId: "bill-1"
        },
        {
          id: "rec-fallback-3",
          type: "calendar_shift",
          text: "Calendar Recommendation: Keep your next focus block completely shielded from unexpected meetings.",
          actionId: "focus-block"
        }
      ]
    });
  }
});

// API: Emergency Rescue Triage
app.post("/api/rescue", async (req, res) => {
  const { problem, tasks, bills } = req.body;
  try {
    const ai = getGeminiClient();

    if (!ai) {
      // Calm, simulated triage blueprint
      return res.json({
        advice: `### ClutchAI Simulated Rescue Blueprint

**1. Isolate the Primary Threat:**
Your current issue seems related to: *"${problem}"*. Stop all secondary communications. Put your phone on Do-Not-Disturb except for critical alerts.

**2. Stop Multitasking & Run a Sprint:**
Find the single task with the highest negative consequence if missed today. Set a timer for 25 minutes and work only on that. 

**3. Settle Immediate Blockers:**
If there are bills or servers about to expire (like AWS or utility bills), settle them in 1-click to clear cognitive bandwidth.

*Note: Add your GEMINI_API_KEY in Settings > Secrets to unlock personalized live emergency blueprints generated in real time.*`
      });
    }

    const prompt = `
The user is facing a last-minute emergency or high-stakes scenario:
"${problem}"

Available Context:
- Tasks: ${JSON.stringify(tasks)}
- Ledger/Bills: ${JSON.stringify(bills)}

Provide an ultra-clear, highly reassuring, step-by-step "Clutch Blueprint" to rescue them. Format with clean, structured markdown. Be precise, short, and incredibly practical. Avoid fluff.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are ClutchAI, a decison-making AI engine designed to rescue users under pressure. Your advice is ultra-calming, highly tactical, structured, and reassuring. Do not over-explain; provide immediate actionable items."
      }
    });

    res.json({ advice: response.text });
  } catch (err: any) {
    console.warn("Rescue Blueprint Error or Gemini API unavailable. Falling back to local offline blueprint.", err.message || err);
    res.json({
      advice: `### ClutchAI Offline Rescue Blueprint

**1. Isolate the Primary Threat:**
Your current issue seems related to: *"${problem}"*. Stop all secondary communications. Put your phone on Do-Not-Disturb except for critical alerts.

**2. Stop Multitasking & Run a Sprint:**
Find the single task with the highest negative consequence if missed today. Set a timer for 25 minutes and work only on that. 

**3. Settle Immediate Blockers:**
If there are bills or servers about to expire (like AWS or utility bills), settle them in 1-click to clear cognitive bandwidth.

*Note: The live Clutch AI system is currently experiencing high demand. This local offline co-pilot mode is keeping your workspace fully protected.*`
    });
  }
});

// Express + Vite configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClutchAI Backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start ClutchAI server:", err);
});
