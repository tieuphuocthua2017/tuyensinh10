import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, TopicCategory, Difficulty, EXAM_MATRIX } from '../types';

// Define the response schema for Gemini
const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Nhận biết", "Thông hiểu", "Vận dụng"] },
          content: { type: Type.STRING, description: "Question text. Use LaTeX for math, wrapped in $...$." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exactly 4 options."
          },
          correctAnswer: { type: Type.INTEGER, description: "Index 0-3" },
          explanation: { type: Type.STRING, description: "Detailed step-by-step solution." },
          solutionMethod2: { type: Type.STRING, description: "Alternative method for complex problems (VD/TH)." },
          geometrySvg: { type: Type.STRING, description: "Simple SVG code (without <?xml...>) for geometry figures. Viewbox 0 0 200 200." }
        },
        required: ["topic", "difficulty", "content", "options", "correctAnswer", "explanation"]
      }
    }
  }
};

const createPrompt = (category: string, topics: string[], counts: {nb: number, th: number, vd: number}) => {
  return `
    Create a list of multiple-choice math questions for a Grade 10 Entrance Exam in Vietnam (Thi tuyển sinh vào lớp 10).
    
    CRITICAL CONSTRAINT: Use strictly Vietnam GRADE 9 MATH CURRICULUM (Kiến thức Toán Lớp 9).
    - Do NOT use Grade 10+ topics (Vectors, Trigonometric Circles, Sets, etc.).
    - Focus on: Square roots, Linear functions, Systems of linear equations, Quadratic functions (y=ax^2), Quadratic equations, Circle geometry, Inscribed quadrilaterals, Cylinder/Cone/Sphere.
    
    Category: ${category}
    Topics: ${topics.join(", ")}
    
    Quantity Distribution:
    - Difficulty 'Nhận biết' (Knowing): ${counts.nb} questions
    - Difficulty 'Thông hiểu' (Understanding): ${counts.th} questions
    - Difficulty 'Vận dụng' (Applying): ${counts.vd} questions
    
    Requirements:
    1. Language: Vietnamese.
    2. Math formatting: Use LaTeX wrapped in single dollar signs (e.g., $x^2 + 2x$) for equations.
    3. Geometry: For geometry questions, try to provide a simple SVG string in 'geometrySvg' property illustrating the problem.
    4. Multiple Solutions: For 'Thông hiểu' and 'Vận dụng' questions where possible, provide a second solving method in 'solutionMethod2'.
    5. Ensure options are plausible distractors.
    6. Return strictly valid JSON.
  `;
};

export const generateExamQuestions = async (): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-3-flash-preview"; 

  // We split requests to avoid output token limits and ensure higher quality
  const promises = EXAM_MATRIX.map(async (part) => {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: createPrompt(part.category, part.topics, part.difficultyDist),
        config: {
          responseMimeType: "application/json",
          responseSchema: questionSchema,
          temperature: 0.7, // Slight creativity for variety
          thinkingConfig: { thinkingBudget: 1024 } // Give it some budget to think about math correctness
        }
      });

      const text = response.text;
      if (!text) return [];

      const data = JSON.parse(text);
      const rawQuestions = data.questions || [];

      // Map and sanitize
      return rawQuestions.map((q: any, index: number) => ({
        id: `${part.category}-${index}-${Date.now()}`,
        category: part.category,
        topic: q.topic,
        difficulty: q.difficulty as Difficulty,
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        solutionMethod2: q.solutionMethod2,
        geometrySvg: q.geometrySvg
      }));

    } catch (error) {
      console.error(`Error generating ${part.category}:`, error);
      // Return empty array to not crash the whole app, allow partial exams if needed
      return [];
    }
  });

  const results = await Promise.all(promises);
  const flatQuestions = results.flat();

  // Shuffle the final array so topics are mixed (standard for exams)
  return flatQuestions.sort(() => Math.random() - 0.5);
};