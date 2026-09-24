import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent JSON file store on server (accessible from any browser or device)
const DB_FILE = path.join(__dirname, 'server_db.json');

const DEFAULT_USERS_SERVER = [
  {
    id: 'user-admin-1',
    username: 'admin',
    name: 'Administrador Geral',
    password: 'admin',
    role: 'admin',
    createdAt: '2026-01-01',
    color: '#C8102E',
  },
  {
    id: 'user-aluno-1',
    username: 'aluno',
    name: 'Estudante Focado',
    password: '123',
    role: 'aluno',
    createdAt: '2026-01-02',
    color: '#0D134C',
  },
];

interface ServerDB {
  users: any[];
  userData: Record<
    string,
    {
      concursos?: any[];
      activeConcursoId?: string;
      progress?: Record<string, any>;
      historico?: any[];
      revisoes?: any[];
    }
  >;
  customApiKey?: string | null;
}

function readServerDB(): ServerDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler DB do servidor:', e);
  }
  return {
    users: DEFAULT_USERS_SERVER,
    userData: {},
    customApiKey: null,
  };
}

let serverDBState: ServerDB = readServerDB();
let writeTimeout: NodeJS.Timeout | null = null;

function saveServerDB(db: ServerDB) {
  serverDBState = db;
  if (writeTimeout) clearTimeout(writeTimeout);
  writeTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(serverDBState, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar DB do servidor:', e);
    }
  }, 100);
}

// Endpoints for Cross-Browser Multi-User Data Synchronization
app.get('/api/db/users', (_req, res) => {
  res.json({ success: true, users: serverDBState.users });
});

app.post('/api/db/users', (req, res) => {
  const { users } = req.body;
  if (Array.isArray(users)) {
    serverDBState.users = users;
    saveServerDB(serverDBState);
    return res.json({ success: true, users: serverDBState.users });
  }
  return res.status(400).json({ error: 'Lista de usuários inválida.' });
});

app.get('/api/db/user-data/:userId', (req, res) => {
  const { userId } = req.params;
  const data = serverDBState.userData[userId] || null;
  res.json({ success: true, data });
});

app.post('/api/db/user-data/:userId', (req, res) => {
  const { userId } = req.params;
  const { concursos, activeConcursoId, progress, historico, revisoes } = req.body;

  const current = serverDBState.userData[userId] || {};
  serverDBState.userData[userId] = {
    concursos: concursos !== undefined ? concursos : current.concursos,
    activeConcursoId: activeConcursoId !== undefined ? activeConcursoId : current.activeConcursoId,
    progress: progress !== undefined ? progress : current.progress,
    historico: historico !== undefined ? historico : current.historico,
    revisoes: revisoes !== undefined ? revisoes : current.revisoes,
  };

  saveServerDB(serverDBState);
  res.json({ success: true });
});

// Admin Gemini API Key Management
app.get('/api/admin/gemini-status', (_req, res) => {
  const customKey = serverDBState.customApiKey?.trim() || '';
  const envKey = process.env.GEMINI_API_KEY?.trim() || '';
  const activeKey = customKey || envKey;

  let masked = '';
  if (activeKey.length > 8) {
    masked = `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}`;
  } else if (activeKey) {
    masked = '********';
  }

  res.json({
    success: true,
    hasKey: !!activeKey,
    isCustom: !!customKey,
    maskedKey: masked,
    source: customKey ? 'custom' : (envKey ? 'environment' : 'none'),
  });
});

app.post('/api/admin/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (typeof apiKey === 'string') {
    const trimmed = apiKey.trim();
    serverDBState.customApiKey = trimmed ? trimmed : null;
    saveServerDB(serverDBState);
    return res.json({ success: true, customSet: !!trimmed });
  }
  return res.status(400).json({ error: 'Formato de chave inválido.' });
});

app.post('/api/admin/test-gemini', async (_req, res) => {
  try {
    const ai = getAiClient();
    const result = await generateContentWithRetryAndFallback(ai, {
      contents: 'Olá Gemini! Por favor, responda apenas: CONEXAO_OK',
    });
    return res.json({
      success: true,
      message: 'Conexão com o Gemini estabelecida com sucesso!',
      response: result.text?.trim() || 'CONEXAO_OK',
    });
  } catch (err: any) {
    console.error('Erro no teste do Gemini:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao conectar com o modelo Gemini.',
    });
  }
});

// Shared Google GenAI client
const getAiClient = () => {
  const apiKey = serverDBState.customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave do Gemini não configurada. Adicione no painel Admin ou nas variáveis de ambiente.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Robust generator with automatic retries and fallback models for 503 (high demand) / 429
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  options: {
    contents: string | any;
    config?: any;
  }
) {
  // Candidate models: primary fast model, followed by latest flash alias and flash lite
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    // Up to 2 attempts per model if transient error
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const status = err?.status || err?.statusCode || (msg.includes('503') ? 503 : msg.includes('429') ? 429 : 500);
        const isTransient =
          status === 503 ||
          status === 429 ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('overloaded');

        console.warn(`[Gemini API] Tentativa ${attempt} no modelo '${model}' retornou erro (${status}): ${msg}`);

        if (isTransient) {
          // Wait briefly with jitter before retry or trying next model
          const delayMs = attempt * 1200 + Math.floor(Math.random() * 500);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // If fatal validation error (not high demand/rate limit), abort loop
          break;
        }
      }
    }
  }

  throw lastError;
}

// API: Parse raw edital text into structured format
app.post('/api/ai/parse-edital', async (req, res) => {
  try {
    const { rawText, fallbackInfo } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Texto do edital não fornecido.' });
    }

    const ai = getAiClient();

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

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'Você é um assistente sênior especialista em concursos públicos e editais verticalizados no Brasil. Retorne apenas JSON estruturado.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concurso: { type: Type.STRING, description: 'Nome do órgão ou concurso (ex: Prefeitura de Salvador - BA, PRF, etc.)' },
            cargo: { type: Type.STRING, description: 'Cargo ou função (ex: Guarda Civil Municipal, Agente Administrativo)' },
            banca: { type: Type.STRING, description: 'Banca organizadora (ex: FGV, Cebraspe, FCC, Vunesp, etc.)' },
            dataProva: { type: Type.STRING, description: 'Data da prova estimada no formato AAAA-MM-DD se houver, ou string vazia' },
            disciplinas: {
              type: Type.ARRAY,
              description: 'Lista de disciplinas encontradas no edital',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'ID em slug minúsculo sem acentos (ex: lingua-portuguesa)' },
                  nome: { type: Type.STRING, description: 'Nome em caixa alta da disciplina (ex: LÍNGUA PORTUGUESA)' },
                  grupos: {
                    type: Type.ARRAY,
                    description: 'Grupos ou eixos temáticos lógicos da disciplina',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        nome: { type: Type.STRING, description: 'Nome do grupo temático (ex: Ortografia e Morfossintaxe)' },
                        topicos: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: 'Lista de tópicos específicos'
                        }
                      },
                      required: ['nome', 'topicos']
                    }
                  }
                },
                required: ['id', 'nome', 'grupos']
              }
            }
          },
          required: ['concurso', 'cargo', 'disciplinas']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (fallbackInfo) {
      if (!parsed.concurso && fallbackInfo.concurso) parsed.concurso = fallbackInfo.concurso;
      if (!parsed.cargo && fallbackInfo.cargo) parsed.cargo = fallbackInfo.cargo;
      if (!parsed.banca && fallbackInfo.banca) parsed.banca = fallbackInfo.banca;
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Erro em /api/ai/parse-edital:', error);
    const msg = String(error?.message || '');
    const isOverloaded = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429');
    const userMsg = isOverloaded
      ? 'A IA está com alta demanda de processamento temporária. O sistema tentou modelos alternativos automaticamente. Por favor, tente novamente em alguns segundos.'
      : (error.message || 'Erro ao processar edital com a IA.');
    return res.status(isOverloaded ? 503 : 500).json({
      error: userMsg,
    });
  }
});

// API: Generate weekly adaptive schedule and categorized learning plan based on proficiency
app.post('/api/ai/generate-schedule', async (req, res) => {
  try {
    const {
      concursoInfo,
      disciplinas,
      proficiencia, // { [discNome]: 'iniciante' | 'intermediario' | 'avancado' }
      horasSemanais, // number, e.g. 20
      diasDisponiveis, // ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      horasPorDia, // optional number
      focoDesejado // optional text notes
    } = req.body;

    if (!disciplinas || !Array.isArray(disciplinas) || disciplinas.length === 0) {
      return res.status(400).json({ error: 'Nenhuma disciplina fornecida para análise.' });
    }

    const ai = getAiClient();

    // Prepare concise summary of the syllabus
    const editalSummary = disciplinas.map(d => {
      const topicosCount = d.grupos ? d.grupos.reduce((acc: number, g: any) => acc + (g.topicos?.length || 0), 0) : 0;
      const prof = proficiencia?.[d.nome] || proficiencia?.[d.id] || 'intermediario';
      const gruposPreview = d.grupos ? d.grupos.map((g: any) => `${g.nome} (${g.topicos?.length || 0} tópicos)`).join(', ') : '';
      return `- ${d.nome} [Nível do Aluno: ${prof.toUpperCase()}] (${topicosCount} tópicos no total): Grupos: ${gruposPreview}`;
    }).join('\n');

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
1. DIAGNÓSTICO ESTRATÉGICO: Avalie a proporção do edital, o peso típico da banca (${concursoInfo?.banca || 'banca organizadora'}) e cruze com a proficiência do aluno (Iniciante precisa de base teórica sólida + fixação; Intermediário foca em lei seca + questões de média complexidade; Avançado foca em refinamento por questões da banca + jurisprudência/simulados reversos).
2. CATEGORIAS DE ESTUDO PERSONALIZADAS: Agrupe os assuntos/disciplinas em 3 a 5 categorias estratégicas (ex: Alta Relevância & Base Teórica, Disciplinas Jurídicas & Lei Seca, Conhecimentos Específicos Práticos, etc.), recomendando a distribuição de tempo ideal (% Teoria, % Questões, % Revisão).
3. CRONOGRAMA SEMANAL ADAPTATIVO COMPLETO: Crie uma grade diária cobrindo cada um dos dias disponíveis (${(diasDisponiveis || []).join(', ')}), dividida em blocos de estudo de 30 a 90 minutos, balanceando matérias para evitar saturação mental (alternar exatas/raciocínio com direito/leitura), com indicações exatas do que fazer em cada bloco.
4. METAS SEMANAIS RECOMENDADAS: Horas semanais, meta de questões resolvidas e simulados.

Retorne em formato JSON estrito conforme o schema.`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'Você é um mentor especialista em preparação para concursos públicos. Responda em português brasileiro com rigor metodológico e gere JSON estrito e completo.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnostico: {
              type: Type.STRING,
              description: 'Parecer pedagógico detalhado analisando a proficiência do aluno em relação ao edital e à banca.'
            },
            categorias: {
              type: Type.ARRAY,
              description: 'Categorias de estudos personalizadas criadas para este edital e aluno',
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING, description: 'Nome da categoria (ex: Eixo Jurídico Principal)' },
                  prioridade: { type: Type.STRING, description: 'Alta, Média ou Baixa' },
                  disciplinas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Disciplinas pertencentes a esta categoria' },
                  horasSugeridasSemana: { type: Type.NUMBER, description: 'Carga horária semanal sugerida nesta categoria' },
                  percentualTeoria: { type: Type.NUMBER, description: 'Porcentagem de tempo em Teoria (0 a 100)' },
                  percentualQuestoes: { type: Type.NUMBER, description: 'Porcentagem de tempo em Questões (0 a 100)' },
                  percentualRevisao: { type: Type.NUMBER, description: 'Porcentagem de tempo em Revisão/Lei Seca (0 a 100)' },
                  estrategiaRecomendada: { type: Type.STRING, description: 'Como estudar os tópicos desta categoria de acordo com o nível' }
                },
                required: ['nome', 'prioridade', 'disciplinas', 'horasSugeridasSemana', 'percentualTeoria', 'percentualQuestoes', 'percentualRevisao', 'estrategiaRecomendada']
              }
            },
            cronogramaSemanal: {
              type: Type.ARRAY,
              description: 'Planejamento detalhado para os dias da semana selecionados',
              items: {
                type: Type.OBJECT,
                properties: {
                  dia: { type: Type.STRING, description: 'Nome do dia (ex: Segunda-feira, Terça-feira...)' },
                  totalHorasDia: { type: Type.NUMBER, description: 'Total de horas no dia' },
                  blocos: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        blocoNum: { type: Type.INTEGER, description: 'Número de ordem do bloco no dia (1, 2, 3...)' },
                        disciplina: { type: Type.STRING, description: 'Nome da disciplina' },
                        duracaoMinutos: { type: Type.INTEGER, description: 'Duração em minutos (ex: 60, 45, 90)' },
                        tipoEstudo: { type: Type.STRING, description: 'Teoria, Questões, Simulado, Lei Seca ou Revisão' },
                        topicosFoco: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tópicos ou assuntos prioritários a focar' },
                        orientacao: { type: Type.STRING, description: 'Instrução prática para o bloco' }
                      },
                      required: ['blocoNum', 'disciplina', 'duracaoMinutos', 'tipoEstudo', 'topicosFoco', 'orientacao']
                    }
                  }
                },
                required: ['dia', 'totalHorasDia', 'blocos']
              }
            },
            metasSugeridas: {
              type: Type.OBJECT,
              properties: {
                horasSemanais: { type: Type.NUMBER, description: 'Total de horas por semana' },
                questoesSemana: { type: Type.INTEGER, description: 'Meta de questões recomendada para a semana' },
                aproveitamentoMinimoDesejado: { type: Type.INTEGER, description: 'Meta percentual de acertos (ex: 75)' },
                frequenciaRevisoes: { type: Type.STRING, description: 'Regime de revisões recomendado (ex: 24h, 7d, 21d)' }
              },
              required: ['horasSemanais', 'questoesSemana', 'aproveitamentoMinimoDesejado', 'frequenciaRevisoes']
            },
            dicasPraticas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recomendações táticas para aumentar a retenção e o rendimento'
            }
          },
          required: ['diagnostico', 'categorias', 'cronogramaSemanal', 'metasSugeridas', 'dicasPraticas']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Erro em /api/ai/generate-schedule:', error);
    const msg = String(error?.message || '');
    const isOverloaded = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429');
    const userMsg = isOverloaded
      ? 'A IA está com alta demanda de processamento temporária. O sistema tentou modelos alternativos automaticamente. Por favor, tente novamente em alguns segundos.'
      : (error.message || 'Erro ao gerar cronograma semanal adaptativo com a IA.');
    return res.status(isOverloaded ? 503 : 500).json({
      error: userMsg,
    });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
