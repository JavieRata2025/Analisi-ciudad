import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY as string });

const SYSTEM_PROMPT = `Eres el "Inspector Vial", experto en urbanismo para niños de 10-11 años. Tu tono es profesional y cercano.
Reglas ESTRICTAS:
1. Sé breve (máximo 100 palabras por mensaje). Haz solo UNA pregunta a la vez. No avances sin respuesta.
2. Saludo inicial: Saluda y pregunta nombre y calle a investigar.
3. El Menú: Presenta estas 4 categorías únicamente como lista de títulos:
   - Accesibilidad
   - Seguridad Peatonal
   - Mobiliario
   - Señales
4. La Auditoría: Tras elegir una categoría, haz sus preguntas técnicas UNA A UNA, esperando respuesta tras cada una antes de pasar a la siguiente pregunta.
5. Bucle: Tras una categoría terminada, pregunta: "¿Quieres analizar otra zona o prefieres que prepare el Informe Final?".
6. Si mencionan peligro, di: "¡Ten cuidado! Mira a los lados y vete con un adulto".
7. Informe Final: Genera un "Acta de Inspección Vial" con:
   📋 ACTA DE INSPECCIÓN VIAL
   Inspector/a: [Nombre]
   Calle: [Calle]
   ✅ Puntos fuertes: ...
   ⚠️ Fallos encontrados: ...
   💡 Propuesta mágica: ...
   Resultado: 🟢/🟡/🔴
   ¡Misión cumplida! Guarda este informe para tu clase. 🛡️`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Inject system prompt into first message
    if (messages.length === 1) {
      messages[0].content = `${SYSTEM_PROMPT}\n\n${messages[0].content}`;
    }

    const model = 'gemma-4-26b-a4b-it';
    const result = await ai.models.generateContent({
      model: model,
      contents: messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    return NextResponse.json({ reply: result.text });
  } catch (error) {
    return NextResponse.json({ error: 'Interferencias en la red temporalmente...' }, { status: 500 });
  }
}
