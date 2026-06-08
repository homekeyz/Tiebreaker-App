import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load local environmental variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI client to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please add it to your secrets in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ⚖️ PROS AND CONS SCHEMA DEFINITION
const prosConsSchema = {
  type: Type.OBJECT,
  properties: {
    pros: {
      type: Type.ARRAY,
      description: "A list of strong, distinct reasons to go ahead with this decision.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The concise core argument point." },
          impact: { type: Type.INTEGER, description: "The weight/severity of this pro, from 1 (minor plus) to 5 (critical champion)." },
          explanation: { type: Type.STRING, description: "A one-sentence explanation of why/how this factors in." }
        },
        required: ["text", "impact", "explanation"]
      }
    },
    cons: {
      type: Type.ARRAY,
      description: "A list of strong, distinct pitfalls or reasons to avoid this decision.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The concise pitfall or drawback point." },
          impact: { type: Type.INTEGER, description: "The weight/severity of this con, from 1 (minor nuisance) to 5 (critical dealbreaker)." },
          explanation: { type: Type.STRING, description: "A one-sentence explanation of the hazard or cost." }
        },
        required: ["text", "impact", "explanation"]
      }
    },
    conclusion: {
      type: Type.STRING,
      description: "An authentic, expert summary breaking the tie. Be descriptive, realistic, and advise which way the scale leans."
    },
    tiebreakerScore: {
      type: Type.INTEGER,
      description: "The visual calculated balance. Generates a number from -100 (complete cons/avoid) to +100 (complete pros/proceed). Zero represents a pure deadlock."
    },
    confidenceRating: {
      type: Type.INTEGER,
      description: "A rating from 0 to 100 denoting how confident the assessment is based on the specificity of the details provided."
    }
  },
  required: ["pros", "cons", "conclusion", "tiebreakerScore", "confidenceRating"]
};

// 📊 COMPARISON TABLE SCHEMA DEFINITION
const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The names of the 2-3 options compared."
    },
    criteria: {
      type: Type.ARRAY,
      description: "Key categories used to rate each option side-by-side.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The criterion, e.g. Cost, Speed, Long-term Value, Stress." },
          scores: {
            type: Type.ARRAY,
            description: "An array mapping each option to its score out of 10.",
            items: {
              type: Type.OBJECT,
              properties: {
                option: { type: Type.STRING, description: "The option name." },
                score: { type: Type.INTEGER, description: "Rating score from 1 to 10." }
              },
              required: ["option", "score"]
            }
          },
          details: {
            type: Type.ARRAY,
            description: "An array mapping each option to its custom explanatory detail note.",
            items: {
              type: Type.OBJECT,
              properties: {
                option: { type: Type.STRING, description: "The option name." },
                detail: { type: Type.STRING, description: "Brief factor explanation (e.g., '$200/mo', 'Takes 6 months')." }
              },
              required: ["option", "detail"]
            }
          }
        },
        required: ["name", "scores", "details"]
      }
    },
    conclusion: {
      type: Type.STRING,
      description: "An incredibly clear winner decision narrative. Analyzes trade-offs and names the champion option based on criteria profiles."
    },
    finalScores: {
      type: Type.ARRAY,
      description: "Overall calculated score from 0 to 100 for each option.",
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          score: { type: Type.INTEGER }
        },
        required: ["option", "score"]
      }
    },
    confidenceRating: {
      type: Type.INTEGER,
      description: "Assessment confidence from 0 to 100."
    }
  },
  required: ["options", "criteria", "conclusion", "finalScores", "confidenceRating"]
};

// 🎯 SWOT SCHEMA DEFINITION
const swotSchema = {
  type: Type.OBJECT,
  properties: {
    strengths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING, description: "Internal positive attribute." },
          significance: { type: Type.STRING, description: "Direct competitive edge or leverage achieved." }
        },
        required: ["point", "significance"]
      }
    },
    weaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING, description: "Internal negative limit." },
          significance: { type: Type.STRING, description: "Main vulnerability or risk exposure." }
        },
        required: ["point", "significance"]
      }
    },
    opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING, description: "External tailwind or market growth chance." },
          strategy: { type: Type.STRING, description: "How to actively seize this opportunity." }
        },
        required: ["point", "strategy"]
      }
    },
    threats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          point: { type: Type.STRING, description: "External headwind or failure catalyst." },
          mitigation: { type: Type.STRING, description: "Defensive buffer or workaround plan." }
        },
        required: ["point", "mitigation"]
      }
    },
    conclusion: {
      type: Type.STRING,
      description: "Strategic synthesis summary. Weighs internal factors against external landscape forces."
    },
    strategicAction: {
      type: Type.STRING,
      description: "A single, highly specific priority next move or focal project that unites the SWOT insight (e.g., 'Execute pre-sale validation before developers start')."
    },
    confidenceRating: {
      type: Type.INTEGER,
      description: "Confidence from 0 to 100 based on the depth of the dilemma data."
    }
  },
  required: ["strengths", "weaknesses", "opportunities", "threats", "conclusion", "strategicAction", "confidenceRating"]
};

// CORE API ANALYZE ENDPOINT
app.post("/api/analyze", async (req: Request, res: Response) => {
  try {
    const { title, context, type, options: requestOptions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "A decision title or dilemma question is required." });
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are "The Tiebreaker", an elite decision-theory strategist and unbiased AI coach. 
Your single goal is to help users break deadlocks, resolve dilemmas, and execute clean strategic weighing. 
Be sharp, realistic, practical, and show genuine logical reasoning in your responses. Avoid flowery corporate jargon or generic recommendations. 
Provide highly contextual metrics and specific observations. Avoid repeating generic truths. Use the user's specific context values completely.`;

    let userPrompt = "";
    let activeSchema: any = null;

    if (type === "pros-cons") {
      activeSchema = prosConsSchema;
      userPrompt = `Please analyze the following decision dilemma by listing key factors for and against:
Dilemma Title: "${title}"
${context ? `Extra Context / Background: "${context}"` : ""}

Assess at least 3-5 critical pros and 3-5 critical cons. Ensure each pro/con has a realistic weighted impact score (1 to 5) and a solid explanation. Output a definitive verdict conclusion and a tiebreaker score representing the scale tilt.`;
    } 
    else if (type === "comparison-table") {
      activeSchema = comparisonSchema;
      
      // Handle option parsing
      let optionsList = requestOptions && Array.isArray(requestOptions) && requestOptions.filter(o => o.trim()).length >= 2
        ? requestOptions.map(o => o.trim())
        : ["Option A", "Option B"];

      userPrompt = `Please compare the following option pathways side-by-side using criteria:
Dilemma Question: "${title}"
${context ? `Situation Details: "${context}"` : ""}
Options proposed: ${optionsList.map(o => `"${o}"`).join(", ")}

Generate a list of 4-6 comparison criteria categories. For each category, grade each option on a scale of 1-10 and write exact supporting details. Compute final scores (0-100) and synthesize an expert conclusion describing why the winner is the superior path.`;
    } 
    else if (type === "swot") {
      activeSchema = swotSchema;
      userPrompt = `Please perform an elite SWOT analysis for this strategic project or decision path:
Theme under question: "${title}"
${context ? `Background / Parameters: "${context}"` : ""}

Conduct a deep audit of:
- Internal Strengths (and why they represent an edge)
- Internal Weaknesses (and the core vulnerability)
- External Opportunities (and a strategy to seize them)
- External Threats (and a solid defense or mitigation)

Provide a sharp synthesis of the quadrant intersection, and write a high-priority "strategicAction" next step.`;
    } 
    else {
      return res.status(400).json({ error: "Invalid analysis type. Choose 'pros-cons', 'comparison-table', or 'swot'." });
    }

    // Call the Gemini-3.5-flash model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.15, // Keep reasoning highly logical, clear and structured
        responseMimeType: "application/json",
        responseSchema: activeSchema
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response returned from the AI model.");
    }

    // Parse safety layer
    const rawResult = JSON.parse(textOutput.trim());

    // Format adaptation for standard Typescript schema on Client Side
    if (type === "comparison-table") {
      // client expects Record<string, number> for scores and Record<string, string> for details
      // But Gemini Schema returns list array: { option, score } / { option, detail }. 
      // Let's restructure the response seamlessly!
      const nativeCriteria = rawResult.criteria.map((c: any) => {
        const scoresObj: Record<string, number> = {};
        const detailsObj: Record<string, string> = {};
        
        c.scores.forEach((s: any) => {
          scoresObj[s.option] = s.score;
        });

        c.details.forEach((d: any) => {
          detailsObj[d.option] = d.detail;
        });

        return {
          name: c.name,
          scores: scoresObj,
          details: detailsObj
        };
      });

      const finalScoresObj: Record<string, number> = {};
      rawResult.finalScores.forEach((fs: any) => {
        finalScoresObj[fs.option] = fs.score;
      });

      const formattedResult = {
        options: rawResult.options,
        criteria: nativeCriteria,
        conclusion: rawResult.conclusion,
        finalScores: finalScoresObj,
        confidenceRating: rawResult.confidenceRating
      };

      return res.json({ result: formattedResult });
    }

    return res.json({ result: rawResult });

  } catch (error: any) {
    console.error("Analysis Exception Error:", error);
    return res.status(500).json({ 
      error: error.message || "An issue occurred while analyzing your decision. Please verify your input or try again." 
    });
  }
});

// START EXPRESS/VITE PIPELINE
async function startServer() {
  // Vite Development Dev Server Setup or Static Production Asset Handlers
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev middlewares
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist folder in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // PORT Binding - ALWAYS uses port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[THE TIEBREAKER] Server booted and running on http://localhost:${PORT}`);
  });
}

startServer();
