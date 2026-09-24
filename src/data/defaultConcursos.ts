import { Concurso } from '../types/concurso';

export const DISC_CORES = [
  '#C8102E', // Rust Gran
  '#0D134C', // Navy
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#16a34a', // Green
  '#b45309', // Amber
  '#2563eb', // Blue
  '#db2777', // Pink
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Yellow-amber
  '#0284c7', // Sky
];

export const DEFAULT_CONCURSOS: Concurso[] = [
  {
    id: 'gran-prefeitura-de-salvador-ba',
    nome: 'Prefeitura de Salvador - BA',
    cargo: 'Guarda Civil Municipal',
    banca: 'FGV',
    dataProva: '2027-01-17',
    metas: {
      horasSemana: 20,
      questoesSemana: 150,
      conclusaoEdital: 100,
      aproveitamento: 75,
    },
    proficiencias: {
      'LÍNGUA PORTUGUESA': 'intermediario',
      'RACIOCÍNIO LÓGICO-MATEMÁTICO': 'iniciante',
      'INFORMÁTICA': 'intermediario',
      'NOÇÕES DE DIREITO CONSTITUCIONAL': 'intermediario',
      'NOÇÕES DE DIREITO CIVIL': 'iniciante',
      'NOÇÕES DE DIREITO PENAL': 'intermediario',
      'NOÇÕES DE DIREITO PROCESSUAL PENAL': 'intermediario',
      'NOÇÕES DE ADMINISTRAÇÃO': 'intermediario',
      'NOÇÔES DE POLÍTICAS PÚBLICAS': 'iniciante',
      'CONHECIMENTOS NA ÁREA DE ATUAÇÃO': 'avancado',
      'LEGISLAÇÃO GERAL': 'intermediario',
      'LEGISLAÇÃO ESPECÍFICA': 'iniciante',
      'LEI ORGÂNICA DO MUNICÍPIO DE SALVADOR': 'iniciante',
    },
    disciplinas: [
      {
        id: 'lingua-portuguesa',
        nome: 'LÍNGUA PORTUGUESA',
        grupos: [
          {
            nome: 'Compreensão, Interpretação e Textualidade',
            topicos: [
              '1. Interpretação de textos argumentativos, com destaque para métodos de raciocínio e tipologia argumentativa',
              '2. Processos de construção textual',
              '3. A progressão textual',
              '4. As marcas de textualidade: a coesão, a coerência e a intertextualidade',
              '5. Reescritura de frases em busca da melhor expressão escrita',
              '6. Domínio vocabular e sua importância na construção do sentido do texto',
              '10. A variação linguística e sua adequação às diversas situações comunicativas',
              '11. A linguagem denotativa e a conotativa',
            ],
          },
          {
            nome: 'Gramática, Léxico e Ortografia',
            topicos: [
              '7. A presença dos estrangeirismos em nosso léxico',
              '8. Os diversos usos das várias classes de palavras',
              '9. A organização sintática e o emprego dos sinais de pontuação',
              '12. A nova ortografia',
            ],
          },
        ],
      },
      {
        id: 'raciocinio-logico-matematico',
        nome: 'RACIOCÍNIO LÓGICO-MATEMÁTICO',
        grupos: [
          {
            nome: 'Lógica Proposicional e Problemas Lógicos',
            topicos: [
              '1. Proposições, valor-verdade, negação, conjunção, disjunção, implicação, equivalência, proposições compostas',
              '2. Equivalências lógicas',
              '3. Problemas de raciocínio: deduzir informações de relações arbitrárias entre objetos, lugares, pessoas e/ou eventos fictícios dados',
              '4. Diagramas lógicos, tabelas e gráficos',
            ],
          },
          {
            nome: 'Conjuntos, Números e Álgebra',
            topicos: [
              '5. Conjuntos e suas operações',
              '6. Números naturais, inteiros, racionais, reais e suas operações',
              '7. Representação na reta',
              '8. Unidades de medida: distância, massa e tempo',
              '9. Representação de pontos no plano cartesiano',
              '10. Álgebra básica: equações, sistemas e problemas do primeiro grau',
              '11. Porcentagem e proporcionalidade direta e inversa',
              '12. Sequências, reconhecimento de padrões, progressões aritmética e geométrica',
              '13. Juros',
            ],
          },
          {
            nome: 'Geometria, Medidas e Probabilidade',
            topicos: [
              '14. Geometria básica: distâncias e ângulos, polígonos, circunferência, perímetro e área',
              '15. Semelhança e relações métricas no triângulo retângulo',
              '16. Medidas de comprimento, área e volume',
              '17. Princípios de contagem e noção de probabilidade',
            ],
          },
        ],
      },
      {
        id: 'informatica',
        nome: 'INFORMÁTICA',
        grupos: [
          {
            nome: 'Sistemas Operacionais e Arquivos Digitais',
            topicos: [
              '1. Arquivos digitais: documentos, planilhas, imagens, sons, vídeos; principais padrões e características',
              '2. Arquivos PDF',
              '3. Sistema operacional Windows XP, 7 e 8: manipulação de janelas, programas e arquivos; telas de controle e menus típicos; mecanismos de ajuda; mecanismos de busca',
            ],
          },
          {
            nome: 'Editores de Texto e Planilhas Eletrônicas',
            topicos: [
              '4. Editores de texto: formatação, configuração de páginas, impressão, títulos, fontes, tabelas, corretores ortográficos, manipulação de figuras, cabeçalhos, rodapés, anotações e outras funcionalidades de formatação',
              '5. Comandos de localização e substituição',
              '6. Manipulação de arquivos: leitura e gravação; controle de alterações; uso de senhas para proteção; formatos para gravação; inserção de objetos; macros; impressão; criação e manipulação de formulários; integração com planilhas; MS Word 2010 BR ou superior',
              '7. Planilhas: criação, manipulação de dados, fórmulas, cópia e recorte de dados, formatação de dados e outras funcionalidades para operação; manipulação de arquivos: leitura e gravação; integração com outras planilhas; filtros; ordenação; macros; controle de exibição; recursos para impressão; importação e exportação de dados; controle de alterações; proteção de dados e planilhas; MS Excel 2010 BR ou superior',
            ],
          },
          {
            nome: 'Internet e Segurança da Informação',
            topicos: [
              '8. Internet: conceitos gerais e funcionamento; endereçamento de recursos; navegação segura: cuidados no uso da Internet; ameaças; uso de senhas e criptografia; tokens e outros dispositivos de segurança; senhas fracas e fortes; navegadores (browsers) e suas principais funções; sites e links; buscas; transferência de arquivos e dados: upload, download, banda, velocidades de transmissão',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-direito-constitucional',
        nome: 'NOÇÕES DE DIREITO CONSTITUCIONAL',
        grupos: [
          {
            nome: 'Teoria Geral, Direitos Fundamentais e Organização do Estado',
            topicos: [
              '1. Constituição: conceito, classificações e princípios fundamentais.',
              '2. Direitos e garantias fundamentais: direitos e deveres individuais e coletivos, direitos sociais, nacionalidade, cidadania, direitos políticos e partidos políticos.',
              '3. Organização político-administrativa: União, Estados, Distrito Federal, Municípios e Territórios.',
              '4. Administração pública: disposições gerais e servidores públicos.',
            ],
          },
          {
            nome: 'Poder Judiciário e Funções Essenciais à Justiça',
            topicos: [
              '5. Poder Judiciário: disposições gerais e órgãos do Poder Judiciário, competências e estrutura.',
              '6. Conselho Nacional de Justiça (CNJ): composição e competência.',
              '7. Funções essenciais à Justiça: Ministério Público, advocacia e defensoria pública.',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-direito-civil',
        nome: 'NOÇÕES DE DIREITO CIVIL',
        grupos: [
          {
            nome: 'LINDB, Pessoas, Bens e Fatos Jurídicos',
            topicos: [
              '1. Aplicação da Lei no Tempo e no Espaço.',
              '1.1 Interpretação da Lei.',
              '1.2 Analogia.',
              '1.3 Princípios Gerais do Direito e Equidade.',
              '1.4 Lei de Introdução às Normas do Direito Brasileiro.',
              '2. Das pessoas.',
              '2.1 Das pessoas naturais.',
              '2.2 Das pessoas jurídicas.',
              '2.3 Do domicílio. Capacidade civil e direitos inerentes à personalidade.',
              '2.4 Emancipação.',
              '3. Dos bens.',
              '3.1 Dos bens considerados em si mesmos.',
              '3.2 Dos bens reciprocamente considerados.',
              '3.3 Dos bens públicos.',
              '4. Dos fatos jurídicos. 4.1 Do negócio jurídico.',
              '4.2 Dos atos jurídicos lícitos.',
              '4.3 Dos atos ilícitos.',
              '4.4 Da prescrição e da decadência.',
              '4.5 Da prova.',
            ],
          },
          {
            nome: 'Obrigações, Responsabilidade Civil e Jurisprudência',
            topicos: [
              '5. Do direito das obrigações.',
              '5.1 Das modalidades das obrigações.',
              '5.2 Da transmissão das obrigações.',
              '5.3 Do adimplemento e extinção das obrigações.',
              '5.4 Do inadimplemento das obrigações.',
              '6. Da responsabilidade civil.',
              '6.1 Das preferências e privilégios creditórios.',
              '6.2 Da indenização por dano moral.',
              '6.3 Responsabilidade civil por perda de uma chance.',
              '6.4 Desconsideração da Personalidade Jurídica.',
              '6.5 Da preservação e da reparação de danos (da proteção à saúde e segurança).',
              '6.6 Da decadência e da prescrição.',
              '6.7 Da desconsideração da personalidade jurídica.',
              '7. Jurisprudência e Súmulas do Supremo Tribunal Federal, Superior Tribunal de Justiça e Tribunal de Justiça do Estado da Bahia.',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-direito-penal',
        nome: 'NOÇÕES DE DIREITO PENAL',
        grupos: [
          {
            nome: 'Parte Geral do Direito Penal',
            topicos: [
              '1. Conceito do Direito Penal. Fontes do Direito Penal;',
              '2. Interpretação e integração da Lei Penal. Analogia; Princípio da Reserva Legal. Lei penal no tempo e no espaço;',
              '3. Classificação das Infrações Penais. Fato Típico. Conduta. Resultado. Relação de Causalidade. Crime Doloso. Crime Culposo. Crime Preterdoloso; Consumação e Tentativa. Desistência voluntária. Arrependimento eficaz. Arrependimento Posterior. Crime impossível;',
              '4. Ilicitude e suas causas excludentes. Culpabilidade e suas causas excludentes; Concurso de Pessoas;',
              '5. Sanções penais. Penas Privativas de Liberdade. Penas Restritivas de Direitos. Pena de Multa. Medidas de Segurança; Concurso de Crimes;',
              '6. Suspensão Condicional da Execução da Pena (“sursis”). Livramento Condicional;',
              '7. Causas Extintivas da Punibilidade;',
            ],
          },
          {
            nome: 'Crimes em Espécie do Código Penal',
            topicos: [
              '8. Crimes contra Pessoa; Crimes contra o Patrimônio; Crimes contra a Dignidade Sexual, conforme a legislação penal vigente;',
              '9. Crimes contra a Honra; Crimes contra a Fé Pública;',
              '10. Crimes contra a Administração Pública;',
              '11. Crimes contra a Administração da Justiça;',
            ],
          },
          {
            nome: 'Legislação Penal Especial',
            topicos: [
              '12. Crimes previstos na Lei de Abuso de Autoridade (Lei nº 13.869/2019);',
              '13. Crimes previstos no Estatuto da Criança e do Adolescente (Lei nº 8.069/90);',
              '14. Crimes hediondos (Lei nº 8.072/90);',
              '15. Crimes em licitações e contratos administrativos, previstos na Lei nº 14.133/21 e nos arts. 337-E a 337-P do Código Penal;',
              '16. Crimes previstos na Lei de Tortura (Lei nº 9.455/1997);',
              '17. Crimes previstos no Código Brasileiro de Trânsito (Lei nº 9.503/97);',
              '18. Crimes previstos na Lei do Meio Ambiente (Lei nº 9.605/1998);',
              '19. Crimes previstos na Lei de “lavagem” ou ocultação de bens, direitos e valores (Lei 9.613/1998);',
              '20. Crimes previstos na Lei Geral do Esporte (Lei nº 14.597/2023);',
              '21. Lei nº 10.826/2003 (Estatuto do Desarmamento);',
              '22. Crimes previstos na lei de Recuperação Judicial, Extrajudicial e Falência (Lei nº 11.101/05);',
              '23. Crimes e disposições penais da Lei 11.340/06 (Lei “Maria da Penha”);',
              '24. Crimes previstos na Lei nº 11.343/2006 (Lei de Drogas);',
              '25. Crimes previstos na Lei nº 12.850/2013 (Lei das Organizações Criminosas);',
              '26. Crimes previstos na Lei nº 7.853/1989 e na Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência);',
              '27. Crimes contra a ordem tributária e econômica, contra o consumidor e as relações de consumo (Lei nº 8.078/1990 e Lei nº 8.137/1990).',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-direito-processual-penal',
        nome: 'NOÇÕES DE DIREITO PROCESSUAL PENAL',
        grupos: [
          {
            nome: 'Sistemas, Princípios, Aplicação da Lei e Inquérito',
            topicos: [
              '1 Processo Penal Brasileiro. Processo Penal Constitucional.',
              '2 Sistemas e Princípios Fundamentais.',
              '3 Aplicação da lei processual penal no tempo, no espaço e em relação às pessoas.',
              '3.1 Disposições preliminares do Código de Processo Penal.',
              '4 Inquérito policial.',
            ],
          },
          {
            nome: 'Processo, Ação Penal, Provas e Sujeitos',
            topicos: [
              '5 Processo, procedimento e relação jurídica processual.',
              '5.1 Princípios gerais e informadores do processo.',
              '5.2 Pretensão punitiva.',
              '6 Ação penal.',
              '7 Prova. Lei nº 9.296/1996 (Lei de Interceptação Telefônica) e suas alterações.',
              '8 Sujeitos do Processo.',
            ],
          },
          {
            nome: 'Prisões, Procedimentos, Prazos, Nulidades e Jurisprudência',
            topicos: [
              '9 Prisão, medidas cautelares e liberdade provisória. Lei nº 7.960/1989 (Prisão Temporária) e suas alterações.',
              '10 Lei nº 9.099/1995 e Lei nº 10.259/2001 (Leis dos Juizados Especiais Cíveis e Criminais).',
              '11 Prazos. 11.1 Características, princípios e contagem.',
              '12 Nulidades.',
              '13 Jurisprudência aplicada dos tribunais superiores.',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-administracao',
        nome: 'NOÇÕES DE ADMINISTRAÇÃO',
        grupos: [
          {
            nome: 'Teoria Geral e Funções Administrativas',
            topicos: [
              '1: Introdução à Administração: definição e importância da administração, história e evolução da administração',
              '2: Funções administrativas: Planejamento, Organização, Direção e Controle;',
              '3: Teorias da Administração: teoria clássica, teoria das relações humanas, teoria comportamental, teoria da contingência, Abordagens modernas: Gestão por Competências, Gestão de Projetos',
            ],
          },
          {
            nome: 'Estruturas, Estratégia e Operações de Gestão',
            topicos: [
              '4: Estruturas Organizacionais: Funcional, Matricial, Projetos, Cultura organizacional, liderança e Planejamento Estratégico (SWOT)',
              '5: Marketing e Vendas: fundamentos de marketing, 4 Ps, estratégias de vendas',
              '6: Gestão Financeira: conceitos básicos, orçamento empresarial, fluxo de caixa',
              '7: Recursos Humanos: recrutamento, seleção, treinamento, avaliação e motivação',
              '8: Empreendedorismo: processo empreendedor, inovação e planos de negócios',
              '9: Ética e Responsabilidade social corporativa e sustentabilidade.',
            ],
          },
        ],
      },
      {
        id: 'nocoes-de-politicas-publicas',
        nome: 'NOÇÔES DE POLÍTICAS PÚBLICAS',
        grupos: [
          {
            nome: 'Ciclo, Governança e Análise de Políticas Públicas',
            topicos: [
              'Conceitos fundamentais: 1. Definição e evolução.',
              '2. Ciclo de Políticas Públicas (formulação, implementação, avaliação).',
              '3. Ferramentas de análise.',
              'Governança e Relações Intragovernamentais: Federalismo e capacidades estatais.',
              'Bases Quantitativas: Estatística, economia aplicada e análise de impacto.',
              'Gestão e Avaliação de Políticas: Análise ex ante/ex post e gestão de riscos.',
            ],
          },
        ],
      },
      {
        id: 'conhecimentos-na-area-de-atuacao',
        nome: 'CONHECIMENTOS NA ÁREA DE ATUAÇÃO',
        grupos: [
          {
            nome: 'Relações Humanas, Defesa Pessoal e Gestão da Informação',
            topicos: [
              '1. Qualidade no atendimento e comunicação interpessoal.',
              '2. Trabalho em equipe e Noções de Defesa Pessoal.',
              '3. Análise de Riscos, contingências e gerenciamento de crises.',
              '4. Discrição, graus de sigilo e segurança da informação.',
            ],
          },
          {
            nome: 'Proteção, Escoltas e Segurança Física Patrimonial',
            topicos: [
              '1. Planejamento de proteção pessoal, comitivas, rotas e pontos sensíveis.',
              '2. Formações em deslocamentos e procedimentos de varredura.',
              '3. Condução operacional e estratégica de veículos.',
              '4. Proteção de áreas críticas, controle de acessos e monitoramento eletrônico.',
            ],
          },
          {
            nome: 'Gestão de Incidentes, Incêndio, Socorrismo e Inteligência',
            topicos: [
              '1. Incidentes críticos, cadeia de comando e negociação policial.',
              '2. Prevenção e combate a incêndio (NR-23, extintores e abandono).',
              '3. Condutas de socorrista e Atendimento Pré-Hospitalar (APH Básico).',
              '4. Noções de Inteligência: finalidade, fontes de coleta e produção do conhecimento.',
            ],
          },
        ],
      },
      {
        id: 'legislacao-geral',
        nome: 'LEGISLAÇÃO GERAL',
        grupos: [
          {
            nome: 'Leis Federais Especializadas',
            topicos: [
              '1. Lei Federal nº 11.340/2006 (Lei Maria da Penha).',
              '2. Lei nº 11.343/2006 (Lei de Drogas) e Lei nº 7.716/1989 (Crimes de preconceito).',
              '3. Lei nº 8.069/1990 (ECA) e Lei nº 9.605/1998 (Crimes Ambientais).',
              '4. Lei nº 9.503/1997 (Código de Trânsito Brasileiro).',
              '5. Lei nº 10.826/2003 (Estatuto do Desarmamento).',
              '6. Lei nº 13.869/2019 (Lei de Abuso de Autoridade).',
              '7. Lei nº 14.133/2021 (Nova Lei de Licitações e Contratos).',
            ],
          },
        ],
      },
      {
        id: 'legislacao-especifica',
        nome: 'LEGISLAÇÃO ESPECÍFICA',
        grupos: [
          {
            nome: 'Estatuto e Regimento da Guarda Civil Municipal de Salvador',
            topicos: [
              '8. Lei Complementar nº 1/1991 (Regime Jurídico dos Servidores de Salvador).',
              '9. Lei Ordinária nº 9.640/2022 (Plano de Carreira e Vencimentos da GCM Salvador).',
              '10. Lei nº 13.022/2014 (Estatuto Geral das Guardas Municipais).',
              '11. Decreto nº 27.731/2016 (Regimento da GCM Salvador).',
              '12. Lei nº 9.273/2017 (Regime Disciplinar da GCM Salvador).',
            ],
          },
        ],
      },
      {
        id: 'lei-organica-do-municipio-de-salvador',
        nome: 'LEI ORGÂNICA DO MUNICÍPIO DE SALVADOR',
        grupos: [
          {
            nome: 'Organização do Município e Administração Pública',
            topicos: [
              '14. Princípios fundamentais, Poder Legislativo e Executivo Municipal, bens e servidores públicos.',
              '15. Estrutura e funcionamento da Administração Direta e Indireta de Salvador.',
            ],
          },
          {
            nome: 'Tributos, Serviços Públicos e Direitos do Cidadão',
            topicos: [
              '16. Código Tributário de Salvador (Lei nº 7.186/2006) e normas de transparência e ética.',
              '17. Direitos e deveres dos cidadãos perante a administração municipal.',
              '18. Exercício das atribuições dos agentes públicos de Salvador.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'policia-federal-agente',
    nome: 'Polícia Federal',
    cargo: 'Agente de Polícia Federal',
    banca: 'Cebraspe',
    dataProva: '2026-11-29',
    metas: {
      horasSemana: 25,
      questoesSemana: 250,
      conclusaoEdital: 100,
      aproveitamento: 80,
    },
    proficiencias: {
      'LÍNGUA PORTUGUESA': 'avancado',
      'INFORMÁTICA E CIÊNCIA DE DADOS': 'iniciante',
      'CONTABILIDADE GERAL': 'iniciante',
      'RACIOCÍNIO LÓGICO': 'intermediario',
      'NOÇÕES DE DIREITO PENAL E PROCESSUAL PENAL': 'avancado',
      'NOÇÕES DE DIREITO ADMINISTRATIVO E CONSTITUCIONAL': 'avancado',
      'LEGISLAÇÃO ESPECIAL': 'intermediario',
    },
    disciplinas: [
      {
        id: 'pf-informatica',
        nome: 'INFORMÁTICA E CIÊNCIA DE DADOS',
        grupos: [
          {
            nome: 'Banco de Dados, Redes e Sistemas',
            topicos: [
              '1. Conceito e arquitetura de banco de dados: SGBDs, Modelo Relacional, SQL (SELECT, INSERT, UPDATE, DELETE)',
              '2. Redes de computadores: topologias, protocolos TCP/IP, DNS, DHCP, HTTP, HTTPS, VPN',
              '3. Segurança da informação: criptografia simétrica e assimétrica, assinaturas digitais, malwares, firewall',
              '4. Nuvem (Cloud Computing) e virtualização',
            ],
          },
          {
            nome: 'Programação e Ciência de Dados',
            topicos: [
              '5. Noções de Python e R para análise de dados: estruturas condicionais, laços, bibliotecas básicas',
              '6. Aprendizado de máquina (Machine Learning) e Big Data: conceitos, mineração de dados',
              '7. Metadados e tratamento de arquivos digitais',
            ],
          },
        ],
      },
      {
        id: 'pf-contabilidade',
        nome: 'CONTABILIDADE GERAL',
        grupos: [
          {
            nome: 'Teoria, Escrituração e Demonstrações Contábeis',
            topicos: [
              '1. Conceito, objeto, finalidade e princípios fundamentais de contabilidade',
              '2. Patrimônio: Ativo, Passivo e Patrimônio Líquido; Equação fundamental',
              '3. Fatos contábeis e respectivas escriturações: contas de débito e crédito',
              '4. Balanço Patrimonial e Demonstração do Resultado do Exercício (DRE)',
              '5. Ajustes e depreciação, amortização e exaustão',
            ],
          },
        ],
      },
      {
        id: 'pf-portugues',
        nome: 'LÍNGUA PORTUGUESA',
        grupos: [
          {
            nome: 'Compreensão e Gramática Textual (Padrão Cebraspe)',
            topicos: [
              '1. Compreensão e interpretação de textos de gêneros variados',
              '2. Reconhecimento de tipos e gêneros textuais',
              '3. Domínio da ortografia oficial e acentuação',
              '4. Domínio da morfossintaxe do período: crase, concordância e regência verbal e nominal',
              '5. Pontuação e reescrita de frases com manutenção do sentido e correção',
            ],
          },
        ],
      },
      {
        id: 'pf-rlm',
        nome: 'RACIOCÍNIO LÓGICO',
        grupos: [
          {
            nome: 'Lógica e Matemática Financeira / Estatística Básica',
            topicos: [
              '1. Estruturas lógicas de relações arbitrárias',
              '2. Lógica de proposições, conectivos, equivalências e negações',
              '3. Diagramas lógicos e conjuntos',
              '4. Princípio de contagem e probabilidade',
            ],
          },
        ],
      },
      {
        id: 'pf-direito-penal-processo',
        nome: 'NOÇÕES DE DIREITO PENAL E PROCESSUAL PENAL',
        grupos: [
          {
            nome: 'Direito Penal e Processual Aplicados',
            topicos: [
              '1. Aplicação da lei penal; Tipicidade, ilicitude e culpabilidade',
              '2. Crimes contra o patrimônio e crimes contra a administração pública',
              '3. Inquérito Policial: características, instauração, prazos e conclusão',
              '4. Provas no Processo Penal: busca e apreensão, perícias',
              '5. Prisões em flagrante, preventiva e temporária (Lei 7.960/89)',
            ],
          },
        ],
      },
      {
        id: 'pf-direito-adm-const',
        nome: 'NOÇÕES DE DIREITO ADMINISTRATIVO E CONSTITUCIONAL',
        grupos: [
          {
            nome: 'Constituição e Regime Jurídico Administrativo',
            topicos: [
              '1. Direitos e deveres individuais e coletivos (Art. 5º CF)',
              '2. Segurança pública (Art. 144 CF) e competências da Polícia Federal',
              '3. Princípios expressos e implícitos da Administração Pública (LIMPE)',
              '4. Atos administrativos: requisitos, atributos, anulação e revogação',
              '5. Poderes da Administração: poder de polícia, discricionariedade e vinculação',
              '6. Lei nº 8.112/1990 (Regime dos Servidores Civis da União)',
            ],
          },
        ],
      },
      {
        id: 'pf-legislacao-especial',
        nome: 'LEGISLAÇÃO ESPECIAL',
        grupos: [
          {
            nome: 'Leis Federais Criminais',
            topicos: [
              '1. Lei de Drogas (Lei nº 11.343/2006)',
              '2. Crimes Hediondos (Lei nº 8.072/1990)',
              '3. Organizações Criminosas (Lei nº 12.850/2013)',
              '4. Lavagem de Dinheiro (Lei nº 9.613/1998)',
              '5. Estatuto do Desarmamento (Lei nº 10.826/2003)',
              '6. Abuso de Autoridade (Lei nº 13.869/2019)',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'inss-tecnico-seguro-social',
    nome: 'INSS',
    cargo: 'Técnico do Seguro Social',
    banca: 'Cebraspe',
    dataProva: '2026-10-18',
    metas: {
      horasSemana: 18,
      questoesSemana: 180,
      conclusaoEdital: 100,
      aproveitamento: 85,
    },
    proficiencias: {
      'SEGURIDADE SOCIAL': 'iniciante',
      'LÍNGUA PORTUGUESA': 'avancado',
      'DIREITO CONSTITUCIONAL': 'intermediario',
      'DIREITO ADMINISTRATIVO': 'intermediario',
      'RACIOCÍNIO LÓGICO': 'intermediario',
      'INFORMÁTICA': 'avancado',
      'ÉTICA NO SERVIÇO PÚBLICO': 'avancado',
    },
    disciplinas: [
      {
        id: 'inss-seguridade-social',
        nome: 'SEGURIDADE SOCIAL',
        grupos: [
          {
            nome: 'Previdência Social, Custeio e Benefícios',
            topicos: [
              '1. Seguridade Social na CF/88: conceito, princípios e diretrizes',
              '2. Regime Geral de Previdência Social (RGPS): segurados obrigatórios e facultativos',
              '3. Dependência e inscrição previdenciária',
              '4. Financiamento da Seguridade Social: receitas, contribuições dos segurados e empresas',
              '5. Salário de contribuição e salário de benefício',
              '6. Benefícios em espécie: Aposentadorias, Auxílio por incapacidade temporária, Pensão por morte, Salário-maternidade',
              '7. Benefício de Prestação Continuada (BPC/LOAS - Lei 8.742/93)',
              '8. Crimes contra a Seguridade Social (arts. 168-A e 337-A do CP)',
            ],
          },
        ],
      },
      {
        id: 'inss-portugues',
        nome: 'LÍNGUA PORTUGUESA',
        grupos: [
          {
            nome: 'Interpretação e Gramática',
            topicos: [
              '1. Compreensão e interpretação de textos',
              '2. Tipologia e redação oficial (Manual da Presidência)',
              '3. Coesão, coerência, pontuação, crase e sintaxe',
            ],
          },
        ],
      },
      {
        id: 'inss-direito-adm',
        nome: 'DIREITO ADMINISTRATIVO',
        grupos: [
          {
            nome: 'Regime Jurídico e Lei 8.112/90',
            topicos: [
              '1. Princípios constitucionais da Administração Pública',
              '2. Lei 8.112/90: provimento, vacância, direitos e deveres dos servidores federais',
              '3. Processo Administrativo Federal (Lei nº 9.784/1999)',
              '4. Lei de Improbidade Administrativa (Lei nº 8.429/1992 com alterações)',
            ],
          },
        ],
      },
      {
        id: 'inss-direito-const',
        nome: 'DIREITO CONSTITUCIONAL',
        grupos: [
          {
            nome: 'Direitos Fundamentais e Ordem Social',
            topicos: [
              '1. Direitos e garantias fundamentais (Art. 5º)',
              '2. Direitos sociais e nacionalidade',
              '3. Da Ordem Social: Disposição geral e Seguridade Social (arts. 194 a 204)',
            ],
          },
        ],
      },
      {
        id: 'inss-etica',
        nome: 'ÉTICA NO SERVIÇO PÚBLICO',
        grupos: [
          {
            nome: 'Código de Ética do Servidor Federal',
            topicos: [
              '1. Decreto nº 1.171/1994 (Código de Ética Profissional do Servidor Público Civil do Poder Executivo Federal)',
              '2. Decreto nº 6.029/2007 (Sistema de Gestão da Ética do Poder Executivo Federal)',
            ],
          },
        ],
      },
    ],
  },
];
