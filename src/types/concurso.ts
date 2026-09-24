export interface Grupo {
  nome: string;
  topicos: string[];
}

export interface Disciplina {
  id: string;
  nome: string;
  grupos: Grupo[];
}

export interface MetasConcurso {
  horasSemana: number;
  questoesSemana: number;
  conclusaoEdital: number;
  aproveitamento: number;
}

export interface AICategoriaEstudo {
  nome: string;
  prioridade: string;
  disciplinas: string[];
  horasSugeridasSemana: number;
  percentualTeoria: number;
  percentualQuestoes: number;
  percentualRevisao: number;
  estrategiaRecomendada: string;
}

export interface AIBlocoEstudo {
  blocoNum: number;
  disciplina: string;
  duracaoMinutos: number;
  tipoEstudo: string;
  topicosFoco: string[];
  orientacao: string;
}

export interface AIDiaCronograma {
  dia: string;
  totalHorasDia: number;
  blocos: AIBlocoEstudo[];
}

export interface AICronogramaResult {
  diagnostico: string;
  categorias: AICategoriaEstudo[];
  cronogramaSemanal: AIDiaCronograma[];
  metasSugeridas: {
    horasSemanais: number;
    questoesSemana: number;
    aproveitamentoMinimoDesejado: number;
    frequenciaRevisoes: string;
  };
  dicasPraticas: string[];
  geradoEm?: string;
}

export interface Concurso {
  id: string;
  nome: string;
  cargo: string;
  banca: string;
  dataProva: string;
  disciplinas: Disciplina[];
  metas: MetasConcurso;
  proficiencias: Record<string, 'iniciante' | 'intermediario' | 'avancado'>;
  cronogramaIA?: AICronogramaResult | null;
}

export interface TopicProgress {
  done: boolean;
  datetime?: string | null;
  acertos?: number;
  erros?: number;
  questoes?: number;
}

export interface HistoricoRegistro {
  id: number;
  concursoId: string;
  date: string; // YYYY-MM-DD
  disc: string;
  topic: string;
  tipo: string;
  horas: number;
  questoes: number;
  acertos: number;
  erros: number;
  obs: string;
  origem: 'cronômetro' | 'manual' | 'modal' | 'cronograma-ia';
}

export interface RevisaoItem {
  id: string | number;
  concursoId: string;
  disc: string;
  topic: string;
  studyDate: string;
  revDate: string;
  days: number;
  done: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  role: 'admin' | 'aluno';
  createdAt: string;
  color?: string;
}
