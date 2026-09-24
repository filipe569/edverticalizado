import { GoogleGenAI, Type } from '@google/genai';

// Key storage identifier
const LOCAL_STORAGE_GEMINI_KEY = 'gemini_custom_api_key';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
    }
  } catch (e) {
    console.warn('Erro ao salvar chave localmente:', e);
  }
}

/**
 * Formats raw Gemini errors (including 503 UNAVAILABLE or JSON strings) into friendly user messages.
 */
export function formatGeminiErrorMessage(err: any): string {
  let rawMsg = '';
  if (typeof err === 'string') {
    rawMsg = err;
  } else if (err?.message) {
    rawMsg = err.message;
  } else {
    rawMsg = String(err || '');
  }

  // If the error is a raw JSON string like {"error":{"code":503,"message":"..."}}
  try {
    const trimmed = rawMsg.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.error?.message) {
        rawMsg = parsed.error.message;
      }
    }
  } catch {}

  const is503 =
    rawMsg.includes('503') ||
    rawMsg.includes('high demand') ||
    rawMsg.includes('UNAVAILABLE') ||
    rawMsg.includes('overloaded');

  if (is503) {
    return 'Os servidores do Google Gemini estão com alta demanda temporária (503). O sistema tenta modelos alternativos automaticamente; aguarde alguns segundos e tente novamente.';
  }

  const is429 =
    rawMsg.includes('429') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('rate limit');

  if (is429) {
    return 'Limite de requisições por minuto atingido (429). Por favor, aguarde cerca de 30 segundos.';
  }

  const isApiKeyInvalid =
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('API key not valid') ||
    rawMsg.includes('invalid API key');

  if (isApiKeyInvalid) {
    return 'Chave de API do Gemini inválida. Por favor, verifique a chave inserida no Painel Admin.';
  }

  return rawMsg || 'Falha ao processar com o Google Gemini.';
}

// Fallback client-side generator with candidate models and automatic retry
async function runClientSideGemini(prompt: string, config?: any): Promise<string> {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) {
    throw new Error(
      'Chave do Google Gemini não encontrada. No Netlify ou ambiente estático, vá em Painel Admin > Chave Gemini & IA e salve sua chave gratuita do Google AI Studio.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  // Candidate models: if gemini-3.8-flash has a 503 spike, flash-lite and pro provide immediate fallbacks!
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-pro-preview',
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });
        return response.text || '';
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isTransient =
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('overloaded');

        console.warn(`[Client Gemini] Tentativa ${attempt} no modelo '${model}' falhou: ${msg}`);

        if (isTransient && attempt === 1) {
          // Brief pause before retry on transient error
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          // Try next candidate model
          break;
        }
      }
    }
  }

  throw new Error(formatGeminiErrorMessage(lastError));
}

/**
 * Parses raw edital text with AI.
 * Tries server endpoint first. If on Netlify / static host (where /api/* is 404 or returns index.html),
 * it transparently falls back to client-side Gemini generation.
 */
export async function parseEditalWithAI(rawText: string, fallbackInfo?: any): Promise<any> {
  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/ai/parse-edital', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, fallbackInfo }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } else if (contentType.includes('application/json')) {
      const errJson = await res.json();
      if (errJson.error) {
        // If server responded with an error, throw formatted message
        throw new Error(formatGeminiErrorMessage(errJson.error));
      }
    }
  } catch (e: any) {
    const msg = e?.message || '';
    if (msg.includes('503') || msg.includes('demanda') || msg.includes('UNAVAILABLE')) {
      // Proceed to client-side fallback
      console.log('[GeminiService] Servidor com 503, tentando via navegador com modelos alternativos...');
    } else {
      console.log('[GeminiService] Servidor inacessível, alternando para execução direta no navegador (Netlify):', e);
    }
  }

  // 2. Client-side fallback (Netlify / Static Hosting)
  const prompt = `Você é um especialista em concursos públicos brasileiros e estruturação de editais verticalizados.
Analise o texto bruto a seguir, que contém o conteúdo programático ou edital de um concurso público.
Extraia e estruture com máxima fidelidade em disciplinas, grupos temáticos e tópicos numerados/específicos.
Limpe ruídos, cabeçalhos de página e numerações soltas.
Mantenha a terminologia original das leis e tópicos.

Texto fornecido:
"""
${rawText.slice(0, 45000)}
"""

Retorne em formato JSON seguindo rigorosamente o esquema.`;

  const config = {
    systemInstruction:
      'Você é um assistente sênior especialista em concursos públicos e editais verticalizados no Brasil. Retorne apenas JSON estruturado.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        concurso: { type: Type.STRING, description: 'Nome do órgão ou concurso' },
        cargo: { type: Type.STRING, description: 'Cargo ou função' },
        banca: { type: Type.STRING, description: 'Banca organizadora' },
        dataProva: { type: Type.STRING, description: 'Data da prova estimada (AAAA-MM-DD) ou vazia' },
        disciplinas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'ID em slug minúsculo sem acento' },
              nome: { type: Type.STRING, description: 'Nome em caixa alta da disciplina' },
              grupos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING, description: 'Nome do grupo temático' },
                    topicos: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Lista de tópicos específicos',
                    },
                  },
                  required: ['nome', 'topicos'],
                },
              },
            },
            required: ['id', 'nome', 'grupos'],
          },
        },
      },
      required: ['concurso', 'cargo', 'disciplinas'],
    },
  };

  const responseText = await runClientSideGemini(prompt, config);
  const parsed = JSON.parse(responseText || '{}');

  if (fallbackInfo) {
    if (!parsed.concurso && fallbackInfo.concurso) parsed.concurso = fallbackInfo.concurso;
    if (!parsed.cargo && fallbackInfo.cargo) parsed.cargo = fallbackInfo.cargo;
    if (!parsed.banca && fallbackInfo.banca) parsed.banca = fallbackInfo.banca;
  }

  return parsed;
}

/**
 * Generates an adaptive weekly study schedule.
 * Tries server endpoint first. Falls back to client-side generation on Netlify / static hosts.
 */
export async function generateScheduleWithAI(payload: {
  concursoInfo: any;
  disciplinas: any[];
  proficiencia: Record<string, string>;
  horasSemanais: number;
  diasDisponiveis: string[];
  focoDesejado?: string;
}): Promise<any> {
  const { concursoInfo, disciplinas, proficiencia, horasSemanais, diasDisponiveis, focoDesejado } = payload;

  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/ai/generate-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json.data) {
        return json.data;
      }
    } else if (contentType.includes('application/json')) {
      const errJson = await res.json();
      if (errJson.error) {
        throw new Error(formatGeminiErrorMessage(errJson.error));
      }
    }
  } catch (e: any) {
    const msg = e?.message || '';
    if (msg.includes('503') || msg.includes('demanda') || msg.includes('UNAVAILABLE')) {
      console.log('[GeminiService] Servidor com 503, tentando via navegador com modelos alternativos...');
    } else {
      console.log('[GeminiService] Servidor inacessível, alternando para execução direta no navegador (Netlify):', e);
    }
  }

  // 2. Client-side fallback (Netlify / Static Hosting)
  const editalSummary = disciplinas
    .map((d) => {
      const topicosCount = d.grupos ? d.grupos.reduce((acc: number, g: any) => acc + (g.topicos?.length || 0), 0) : 0;
      const prof = proficiencia?.[d.nome] || proficiencia?.[d.id] || 'intermediario';
      const gruposPreview = d.grupos
        ? d.grupos.map((g: any) => `${g.nome} (${g.topicos?.length || 0} tópicos)`).join(', ')
        : '';
      return `- ${d.nome} [Nível do Aluno: ${prof.toUpperCase()}] (${topicosCount} tópicos no total): Grupos: ${gruposPreview}`;
    })
    .join('\n');

  const prompt = `Você é o maior mentor de aprovação em concursos públicos do Brasil (metodologia de ciclos de estudo, repetição espaçada, resolução de questões por banca e estudo adaptativo).

O aluno está se preparando para o concurso:
- Concurso: ${concursoInfo?.concurso || 'Concurso Público'}
- Cargo: ${concursoInfo?.cargo || 'Geral'}
- Banca: ${concursoInfo?.banca || 'Não especificada'}
- Data da Prova: ${concursoInfo?.dataProva || 'A definir'}
- Carga horária semanal disponível: ${horasSemanais || 20} horas
- Dias disponíveis: ${(diasDisponiveis || ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']).join(', ')}
${focoDesejado ? `- Observações / Foco do Aluno: ${focoDesejado}` : ''}

Disciplinas do Edital e Níveis de Proficiência informados pelo aluno:
${editalSummary}

SUAS TAREFAS:
1. DIAGNÓSTICO ESTRATÉGICO: Avalie a proporção do edital, o peso típico da banca (${concursoInfo?.banca || 'banca organizadora'}) e cruze com a proficiência do aluno.
2. CATEGORIAS DE ESTUDO PERSONALIZADAS: Agrupe os assuntos/disciplinas em 3 a 5 categorias estratégicas (% Teoria, % Questões, % Revisão).
3. CRONOGRAMA SEMANAL ADAPTATIVO COMPLETO: Crie uma grade diária cobrindo cada um dos dias disponíveis (${(diasDisponiveis || []).join(', ')}).
4. METAS SEMANAIS RECOMENDADAS: Horas semanais, meta de questões resolvidas e simulados.

Retorne em formato JSON estrito conforme o schema.`;

  const config = {
    systemInstruction:
      'Você é um mentor especialista em preparação para concursos públicos. Responda em português brasileiro com rigor metodológico e gere JSON estrito e completo.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        diagnostico: {
          type: Type.STRING,
          description: 'Parecer pedagógico detalhado analisando a proficiência do aluno em relação ao edital e à banca.',
        },
        categorias: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING },
              prioridade: { type: Type.STRING },
              disciplinas: { type: Type.ARRAY, items: { type: Type.STRING } },
              horasSugeridasSemana: { type: Type.NUMBER },
              percentualTeoria: { type: Type.NUMBER },
              percentualQuestoes: { type: Type.NUMBER },
              percentualRevisao: { type: Type.NUMBER },
              estrategiaRecomendada: { type: Type.STRING },
            },
            required: [
              'nome',
              'prioridade',
              'disciplinas',
              'horasSugeridasSemana',
              'percentualTeoria',
              'percentualQuestoes',
              'percentualRevisao',
              'estrategiaRecomendada',
            ],
          },
        },
        cronogramaSemanal: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dia: { type: Type.STRING },
              totalHorasDia: { type: Type.NUMBER },
              blocos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    blocoNum: { type: Type.INTEGER },
                    disciplina: { type: Type.STRING },
                    duracaoMinutos: { type: Type.INTEGER },
                    tipoEstudo: { type: Type.STRING },
                    topicosFoco: { type: Type.ARRAY, items: { type: Type.STRING } },
                    orientacao: { type: Type.STRING },
                  },
                  required: ['blocoNum', 'disciplina', 'duracaoMinutos', 'tipoEstudo', 'topicosFoco', 'orientacao'],
                },
              },
            },
            required: ['dia', 'totalHorasDia', 'blocos'],
          },
        },
        metasSugeridas: {
          type: Type.OBJECT,
          properties: {
            horasSemanais: { type: Type.NUMBER },
            questoesSemana: { type: Type.INTEGER },
            aproveitamentoMinimoDesejado: { type: Type.INTEGER },
            simuladosPorMes: { type: Type.INTEGER },
          },
          required: ['horasSemanais', 'questoesSemana', 'aproveitamentoMinimoDesejado', 'simuladosPorMes'],
        },
      },
      required: ['diagnostico', 'categorias', 'cronogramaSemanal', 'metasSugeridas'],
    },
  };

  const responseText = await runClientSideGemini(prompt, config);
  return JSON.parse(responseText || '{}');
}

/**
 * Tests Gemini connection across candidate models with automatic fallback.
 */
export async function testGeminiConnection(keyToTest?: string): Promise<{
  success: boolean;
  message: string;
  response?: string;
  source: 'server' | 'browser-direct';
}> {
  // 1. Try server test first (if running on Node.js)
  try {
    const res = await fetch('/api/admin/test-gemini', { method: 'POST' });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Conexão com Gemini validada no servidor!',
          response: data.response,
          source: 'server',
        };
      } else if (!res.ok) {
        // If server failed (e.g. 503 or 404), fall through to browser test with fallback models
        console.warn('[testGeminiConnection] Servidor retornou:', data?.error);
      }
    }
  } catch (e) {
    // Server not reached, fallback to browser test
  }

  // 2. Direct browser test with candidate models and fallbacks (ideal for Netlify and 503 handling)
  const key = keyToTest?.trim() || getStoredGeminiKey();
  if (!key) {
    throw new Error('Nenhuma chave fornecida para teste. Insira sua chave do Gemini.');
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-pro-preview',
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Olá Gemini! Por favor responda apenas: CONECTADO_OK',
      });
      return {
        success: true,
        message: `Conectado com sucesso via ${model} (compatível com Netlify e Servidor)!`,
        response: response.text?.trim() || 'CONECTADO_OK',
        source: 'browser-direct',
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[testGeminiConnection] Modelo ${model} indisponível:`, err?.message || err);
      // Wait slightly before trying next model
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  throw new Error(formatGeminiErrorMessage(lastError));
}
