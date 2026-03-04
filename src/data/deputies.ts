// src/data/deputies.ts
// Dados dos deputados federais para a aplicação TV Câmara
// TODO: substituir por chamada à API da Câmara dos Deputados (https://dadosabertos.camara.leg.br/api/v2/deputados)

// ─────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────

export interface Mandate {
  role: string;                  // 'Deputado(a) Federal'
  period: string;                // '2011-2015'
  state: string;                 // 'AL'
  party: string;                 // 'PP'
  assumedOn: string;             // '01/02/2011'
}

export interface Biography {
  fullName: string;
  birthDate: string;             // 'DD/MM/YYYY'
  birthplace: string;            // 'Cidade, BRASIL'
  professions: string[];
  parentage: string;             // 'Nome Pai e Nome Mãe'
  education: string;             // 'Superior – Bacharel em Direito'
  mandates: Mandate[];
}

export interface LegislativeProposal {
  id: string;                    // 'REQ 4/2025 PL1087/25'
  author: string;                // 'Arthur Lira – PP/AL'
  summary: string;               // Ementa completa
  year: number;
  status: 'Em tramitação' | 'Aprovada' | 'Arquivada' | 'Sancionada';
}

export interface AgendaItem {
  date: string;                  // 'DD de mês' (ex: '3 de maio')
  time: string;                  // 'HH:MM'
  location: string;              // 'Plenário da câmara dos deputados'
  description: string;           // 'Sessão deliberativa'
}

export interface Speech {
  title: string;
  date: string;                  // 'DD/MM/YYYY'
  videoUrl: string;              // YouTube URL
  duration?: string;             // 'MM:SS'
  context?: string;              // Assunto / plenário
}

export interface Deputy {
  id: string;
  name: string;                  // Nome parlamentar curto
  displayName: string;           // 'Dep. Arthur Lira'
  party: string;                 // 'PP'
  state: string;                 // 'AL'
  photo: string;                 // URL da foto oficial (Câmara CDN)
  biography: Biography;
  proposals: LegislativeProposal[];
  agenda: AgendaItem[];
  speeches: Speech[];
}

// ─────────────────────────────────────────────
// FOTOS — CDN oficial da Câmara dos Deputados
// Padrão: https://www.camara.leg.br/internet/deputado/bandep/{id}.jpg
// ─────────────────────────────────────────────

// TODO: substituir por chamada à API acima de cada export
export const deputies: Deputy[] = [

  // ──────────────────────────────────────────
  // 1. ARTHUR LIRA — PP-AL
  // ──────────────────────────────────────────
  {
    id: 'arthur-lira',
    name: 'Arthur Lira',
    displayName: 'Dep. Arthur Lira',
    party: 'PP',
    state: 'AL',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/160541.jpg',
    biography: {
      fullName: 'Arthur César Pereira de Lira',
      birthDate: '25/06/1969',
      birthplace: 'Maceió, BRASIL',
      professions: ['Empresário', 'Agropecuarista'],
      parentage: 'Benedito de Lira e Ivanete Pereira de Lira',
      education: 'Superior – Bacharel em Direito',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2011-2015', state: 'AL', party: 'PP', assumedOn: '01/02/2011' },
        { role: 'Deputado(a) Federal', period: '2015-2019', state: 'AL', party: 'PP', assumedOn: '01/02/2015' },
        { role: 'Deputado(a) Federal', period: '2019-2023', state: 'AL', party: 'PP', assumedOn: '01/02/2019' },
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'AL', party: 'PP', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'REQ 4/2025 PL1087/25',
        author: 'Arthur Lira – PP/AL',
        summary:
          'Requer a realização de audiência pública para oitiva de especialistas e representantes de entidades sobre o Projeto de Lei nº 1.087, de 2025, que altera a legislação do Imposto de Renda.',
        year: 2025,
        status: 'Em tramitação',
      },
      {
        id: 'PL 6255/2023',
        author: 'Arthur Lira – PP/AL',
        summary:
          'Dispõe sobre a proteção de dados pessoais de crianças e adolescentes no ambiente digital, estabelecendo requisitos para o tratamento e uso de informações por plataformas digitais.',
        year: 2023,
        status: 'Em tramitação',
      },
      {
        id: 'PEC 45/2019',
        author: 'Arthur Lira – PP/AL (Coautor)',
        summary:
          'Altera o Sistema Tributário Nacional e dá outras providências — reforma tributária que unifica tributos sobre consumo (IBS, CBS e IS).',
        year: 2019,
        status: 'Sancionada',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '09:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
      {
        date: '3 de março',
        time: '14:00',
        location: 'Comissão de Constituição e Justiça e de Cidadania',
        description: 'Discussão e votação de propostas legislativas',
      },
      {
        date: '4 de março',
        time: '09:30',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa extraordinária',
      },
      {
        date: '5 de março',
        time: '10:00',
        location: 'Comissão Especial – PL 1087/2025',
        description: 'Audiência pública – Reforma do Imposto de Renda',
      },
    ],
    speeches: [
      {
        title: 'Discurso sobre a Reforma Tributária',
        date: '05/07/2023',
        videoUrl: 'https://www.youtube.com/watch?v=nThEwMEFMoc',
        duration: '12:43',
        context: 'Plenário – Votação da PEC 45/2019',
      },
      {
        title: 'Posse como Presidente da Câmara – 57ª Legislatura',
        date: '01/02/2023',
        videoUrl: 'https://www.youtube.com/watch?v=Bb1sF8v_Bxk',
        duration: '18:22',
        context: 'Plenário – Cerimônia de posse',
      },
      {
        title: 'Discurso sobre o Orçamento da União 2024',
        date: '22/08/2023',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '09:15',
        context: 'Plenário – Ordem do dia',
      },
    ],
  },

  // ──────────────────────────────────────────
  // 2. HUGO MOTTA — REPUBLICANOS-PB
  // ──────────────────────────────────────────
  {
    id: 'hugo-motta',
    name: 'Hugo Motta',
    displayName: 'Dep. Hugo Motta',
    party: 'REPUBLICANOS',
    state: 'PB',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/160674.jpg',
    biography: {
      fullName: 'Hugo Motta Wanderley da Nóbrega',
      birthDate: '11/09/1989',
      birthplace: 'João Pessoa, BRASIL',
      professions: ['Médico'],
      parentage: 'Nabor Wanderley da Nóbrega Filho e Francisca Motta Wanderley',
      education: 'Superior – Bacharel em Medicina (UCB)',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2011-2015', state: 'PB', party: 'PMDB', assumedOn: '01/02/2011' },
        { role: 'Deputado(a) Federal', period: '2015-2019', state: 'PB', party: 'PMDB', assumedOn: '01/02/2015' },
        { role: 'Deputado(a) Federal', period: '2019-2023', state: 'PB', party: 'PRB', assumedOn: '01/02/2019' },
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'PB', party: 'REPUBLICANOS', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'PEC 55/2011',
        author: 'Hugo Motta – PMDB/PB',
        summary:
          'Cria a carreira de agentes de trânsito no sistema de segurança pública e estabelece que a segurança viária compreende educação, engenharia e fiscalização. Transformada na Emenda Constitucional nº 82.',
        year: 2011,
        status: 'Sancionada',
      },
      {
        id: 'PL 1496/2011',
        author: 'Hugo Motta – PMDB/PB',
        summary:
          'Autoriza a criação da Universidade Federal do Sertão, com sede no município de Patos (PB), visando ampliar o acesso ao ensino superior no semiárido nordestino.',
        year: 2011,
        status: 'Aprovada',
      },
      {
        id: 'PL 334/2023',
        author: 'Hugo Motta – REPUBLICANOS/PB',
        summary:
          'Projeto que derrubou o veto presidencial à desoneração da folha de pagamento, assegurando o pagamento do subsídio a setores intensivos em mão de obra até o final de 2027.',
        year: 2023,
        status: 'Sancionada',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '14:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão solene – Presidência da Mesa Diretora',
      },
      {
        date: '4 de março',
        time: '09:00',
        location: 'Comissão de Finanças e Tributação',
        description: 'Reunião deliberativa – apreciação de requerimentos',
      },
      {
        date: '5 de março',
        time: '10:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
    ],
    speeches: [
      {
        title: 'Discurso de posse como Presidente da Câmara',
        date: '01/02/2025',
        videoUrl: 'https://www.youtube.com/watch?v=3Y8HrBSmMQU',
        duration: '22:10',
        context: 'Plenário – Eleição e posse para presidência da Câmara',
      },
      {
        title: 'CPI da Petrobras – Leitura do relatório final',
        date: '10/11/2015',
        videoUrl: 'https://www.youtube.com/watch?v=r7i7B_TfKrU',
        duration: '45:30',
        context: 'Plenário – Encerramento da CPI da Petrobras',
      },
      {
        title: 'Votação da desoneração da folha de pagamento',
        date: '14/06/2023',
        videoUrl: 'https://www.youtube.com/watch?v=g5dV8Fxm2Bk',
        duration: '08:55',
        context: 'Plenário – Derrubada de veto presidencial',
      },
    ],
  },

  // ──────────────────────────────────────────
  // 3. NIKOLAS FERREIRA — PL-MG
  // ──────────────────────────────────────────
  {
    id: 'nikolas-ferreira',
    name: 'Nikolas Ferreira',
    displayName: 'Dep. Nikolas Ferreira',
    party: 'PL',
    state: 'MG',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/209787.jpg',
    biography: {
      fullName: 'Nikolas Ferreira de Oliveira',
      birthDate: '30/05/1996',
      birthplace: 'Belo Horizonte, BRASIL',
      professions: ['Advogado', 'Jornalista'],
      parentage: 'Edésio de Oliveira e Ruth Ferreira',
      education: 'Superior – Bacharel em Direito (PUC-MG)',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'MG', party: 'PL', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'PL 2120/2023',
        author: 'Nikolas Ferreira – PL/MG',
        summary:
          'Institui o Marco Legal de Plataformas Digitais, estabelecendo responsabilidades das big techs pela moderação de conteúdo e garantindo proteção à liberdade de expressão dos usuários brasileiros.',
        year: 2023,
        status: 'Em tramitação',
      },
      {
        id: 'PL 1676/2024',
        author: 'Nikolas Ferreira – PL/MG',
        summary:
          'Endurece as penas do Código Penal para casos de furtos e roubos realizados em meio a desastres e momentos de calamidade pública, além de incluí-los no rol dos crimes hediondos.',
        year: 2024,
        status: 'Em tramitação',
      },
      {
        id: 'PL 252/2022',
        author: 'Nikolas Ferreira – PL/MG (Relator)',
        summary:
          'Proíbe o uso de linguagem neutra em documentos e comunicações oficiais do Poder Público federal, estadual e municipal, bem como em escolas públicas e privadas de todo o país.',
        year: 2022,
        status: 'Em tramitação',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '14:30',
        location: 'Comissão de Constituição e Justiça e de Cidadania',
        description: 'Reunião deliberativa – votação de matérias em pauta',
      },
      {
        date: '4 de março',
        time: '09:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
      {
        date: '5 de março',
        time: '11:00',
        location: 'Comissão de Educação',
        description: 'Audiência pública – debate sobre currículo escolar',
      },
    ],
    speeches: [
      {
        title: 'Discurso no Dia Internacional das Mulheres',
        date: '08/03/2023',
        videoUrl: 'https://www.youtube.com/watch?v=WIU_Wxi6u1A',
        duration: '18:00',
        context: 'Plenário – Dia Internacional das Mulheres',
      },
      {
        title: 'Debate sobre o PL das Fake News',
        date: '02/05/2023',
        videoUrl: 'https://www.youtube.com/watch?v=Q_Jx6bw1drs',
        duration: '11:24',
        context: 'Plenário – Discussão do PL 2630/2020',
      },
      {
        title: 'Discurso sobre segurança pública',
        date: '15/08/2023',
        videoUrl: 'https://www.youtube.com/watch?v=yKlX2J4Hs0I',
        duration: '09:40',
        context: 'Plenário – Ordem do dia',
      },
    ],
  },

  // ──────────────────────────────────────────
  // 4. TABATA AMARAL — PSB-SP
  // ──────────────────────────────────────────
  {
    id: 'tabata-amaral',
    name: 'Tabata Amaral',
    displayName: 'Dep. Tabata Amaral',
    party: 'PSB',
    state: 'SP',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/204534.jpg',
    biography: {
      fullName: 'Tabata Claudia Amaral de Pontes',
      birthDate: '14/11/1993',
      birthplace: 'São Paulo, BRASIL',
      professions: ['Cientista Política'],
      parentage: 'Aristides Pereira de Pontes e Rosemeire Claudia Amaral de Pontes',
      education: 'Superior – Ciência Política (Harvard University)',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2019-2023', state: 'SP', party: 'PDT', assumedOn: '01/02/2019' },
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'SP', party: 'PSB', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'PL 1396/2023',
        author: 'Tabata Amaral – PSB/SP',
        summary:
          'Institui o Programa Pé-de-Meia, uma poupança de incentivo educacional destinada a estudantes do ensino médio público para reduzir a evasão escolar e promover a permanência na escola.',
        year: 2023,
        status: 'Sancionada',
      },
      {
        id: 'PL 2802/2019',
        author: 'Tabata Amaral – PDT/SP',
        summary:
          'Define e criminaliza a corrupção sexual, estabelecendo punições para agentes públicos que exijam ou solicitem benefício sexual em troca de vantagens, favores ou omissões no exercício da função.',
        year: 2019,
        status: 'Sancionada',
      },
      {
        id: 'PL 4372/2023',
        author: 'Tabata Amaral – PSB/SP',
        summary:
          'Cria a Frente Parlamentar em Defesa da Saúde Mental, propondo políticas públicas para ampliar o acesso à saúde mental na atenção básica e estabelecer protocolos de atendimento em todo o SUS.',
        year: 2023,
        status: 'Em tramitação',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '09:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
      {
        date: '4 de março',
        time: '10:00',
        location: 'Comissão de Educação',
        description: 'Reunião deliberativa – apreciação de matérias',
      },
      {
        date: '5 de março',
        time: '14:00',
        location: 'Frente Parlamentar da Saúde Mental',
        description: 'Audiência pública – crise de saúde mental em adolescentes',
      },
    ],
    speeches: [
      {
        title: 'Discurso sobre o Pé-de-Meia',
        date: '13/12/2023',
        videoUrl: 'https://www.youtube.com/watch?v=HGqJB2fH7cM',
        duration: '07:12',
        context: 'Plenário – Votação do Programa Pé-de-Meia',
      },
      {
        title: 'Confronto com Ministro da Educação Ricardo Vélez',
        date: '09/04/2019',
        videoUrl: 'https://www.youtube.com/watch?v=lE3jJi7jSmE',
        duration: '05:35',
        context: 'Plenário – Interpelação ao Ministério da Educação',
      },
      {
        title: 'Discurso sobre saúde mental de jovens',
        date: '10/09/2024',
        videoUrl: 'https://www.youtube.com/watch?v=PZaK_tkPJx8',
        duration: '10:20',
        context: 'Plenário – Dia Mundial de Prevenção ao Suicídio',
      },
    ],
  },

  // ──────────────────────────────────────────
  // 5. ERIKA HILTON — PSOL-SP
  // ──────────────────────────────────────────
  {
    id: 'erika-hilton',
    name: 'Erika Hilton',
    displayName: 'Dep. Erika Hilton',
    party: 'PSOL',
    state: 'SP',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/220645.jpg',
    biography: {
      fullName: 'Erika Santos Silva',
      birthDate: '09/12/1992',
      birthplace: 'Franco da Rocha, BRASIL',
      professions: ['Pedagoga', 'Gerontóloga'],
      parentage: 'Criada por mãe, tias e avós',
      education: 'Superior – Pedagogia (UFSCar)',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'SP', party: 'PSOL', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'PEC 09/2023',
        author: 'Erika Hilton – PSOL/SP',
        summary:
          'Proposta de Emenda Constitucional para o fim da escala de trabalho 6x1, limitando a jornada semanal máxima e garantindo ao trabalhador pelo menos dois dias de descanso por semana.',
        year: 2023,
        status: 'Em tramitação',
      },
      {
        id: 'PL 1085/2023',
        author: 'Erika Hilton – PSOL/SP',
        summary:
          'Cria a Frente Parlamentar em Defesa da Cidadania e dos Direitos da Comunidade LGBTQIA+, com o objetivo de formular políticas públicas de combate à discriminação e promoção da igualdade.',
        year: 2023,
        status: 'Em tramitação',
      },
      {
        id: 'PL 3077/2023',
        author: 'Erika Hilton – PSOL/SP',
        summary:
          'Dispõe sobre a proteção e promoção dos direitos de pessoas trans e travestis, estabelecendo políticas de inclusão no mercado de trabalho formal e acesso a serviços públicos de saúde.',
        year: 2023,
        status: 'Em tramitação',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '10:00',
        location: 'Comissão de Direitos Humanos, Minorias e Igualdade Racial',
        description: 'Audiência pública – violência contra a população LGBTQIA+',
      },
      {
        date: '4 de março',
        time: '09:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
      {
        date: '5 de março',
        time: '14:00',
        location: 'Frente Parlamentar LGBTQIA+',
        description: 'Reunião de trabalho – pauta de votações do 1º semestre',
      },
    ],
    speeches: [
      {
        title: 'Discurso sobre a PEC do Fim da Escala 6x1',
        date: '06/11/2024',
        videoUrl: 'https://www.youtube.com/watch?v=YSUdYxMJElQ',
        duration: '14:30',
        context: 'Plenário – Apresentação da PEC 09/2023',
      },
      {
        title: 'Discurso na CPMI do 8 de Janeiro',
        date: '18/04/2023',
        videoUrl: 'https://www.youtube.com/watch?v=5wJ2P2_XYHI',
        duration: '20:00',
        context: 'CPMI – Atos golpistas de 8 de Janeiro',
      },
      {
        title: 'Combate à transfobia no plenário',
        date: '22/03/2023',
        videoUrl: 'https://www.youtube.com/watch?v=kRXQnwUVV0M',
        duration: '08:45',
        context: 'Plenário – Resposta ao discurso transfóbico',
      },
    ],
  },

  // ──────────────────────────────────────────
  // 6. REGINALDO LOPES — PT-MG
  // ──────────────────────────────────────────
  {
    id: 'reginaldo-lopes',
    name: 'Reginaldo Lopes',
    displayName: 'Dep. Reginaldo Lopes',
    party: 'PT',
    state: 'MG',
    photo: 'https://www.camara.leg.br/internet/deputado/bandep/74161.jpg',
    biography: {
      fullName: 'Reginaldo Lázaro de Oliveira Lopes',
      birthDate: '02/04/1973',
      birthplace: 'Bom Sucesso, BRASIL',
      professions: ['Economista'],
      parentage: 'Sebastião Lopes e Dinaura A. de Oliveira Lopes',
      education: 'Superior – Economia (UFSJ) · Pós-graduação em Gestão de Micro e Pequenas Empresas',
      mandates: [
        { role: 'Deputado(a) Federal', period: '2003-2007', state: 'MG', party: 'PT', assumedOn: '01/02/2003' },
        { role: 'Deputado(a) Federal', period: '2007-2011', state: 'MG', party: 'PT', assumedOn: '01/02/2007' },
        { role: 'Deputado(a) Federal', period: '2011-2015', state: 'MG', party: 'PT', assumedOn: '01/02/2011' },
        { role: 'Deputado(a) Federal', period: '2015-2019', state: 'MG', party: 'PT', assumedOn: '01/02/2015' },
        { role: 'Deputado(a) Federal', period: '2019-2023', state: 'MG', party: 'PT', assumedOn: '01/02/2019' },
        { role: 'Deputado(a) Federal', period: '2023-2027', state: 'MG', party: 'PT', assumedOn: '01/02/2023' },
      ],
    },
    proposals: [
      {
        id: 'PL 5228/2009',
        author: 'Reginaldo Lopes – PT/MG',
        summary:
          'Regula o acesso a informações previsto no inciso XXXIII do art. 5º da Constituição Federal. Transformado na Lei de Acesso à Informação (LAI – Lei nº 12.527/2011), um dos mais importantes instrumentos de combate à corrupção.',
        year: 2009,
        status: 'Sancionada',
      },
      {
        id: 'PLP 125/2023',
        author: 'Reginaldo Lopes – PT/MG (Relator)',
        summary:
          'Institui o Imposto sobre Bens e Serviços (IBS) e a Contribuição sobre Bens e Serviços (CBS), no âmbito da Reforma Tributária aprovada na PEC 45/2019 — simplifica o sistema tributário brasileiro.',
        year: 2023,
        status: 'Sancionada',
      },
      {
        id: 'PL 1087/2025',
        author: 'Reginaldo Lopes – PT/MG',
        summary:
          'Altera a legislação do Imposto de Renda de Pessoa Física, ampliando a faixa de isenção para rendimentos de até R$ 5.000,00 mensais e criando mecanismo de cashback para contribuintes de baixa renda.',
        year: 2025,
        status: 'Em tramitação',
      },
    ],
    agenda: [
      {
        date: '3 de março',
        time: '09:00',
        location: 'Comissão Especial – PL 1087/2025',
        description: 'Audiência pública – Reforma do Imposto de Renda',
      },
      {
        date: '4 de março',
        time: '14:00',
        location: 'Plenário da Câmara dos Deputados',
        description: 'Sessão deliberativa ordinária',
      },
      {
        date: '5 de março',
        time: '10:00',
        location: 'Frente Parlamentar em Defesa da Educação Pública',
        description: 'Reunião de trabalho – financiamento das universidades federais',
      },
      {
        date: '6 de março',
        time: '09:30',
        location: 'Comissão de Finanças e Tributação',
        description: 'Audiência pública – impactos da Reforma Tributária nos estados',
      },
    ],
    speeches: [
      {
        title: 'Votação da Reforma Tributária – Discurso do Relator',
        date: '07/07/2023',
        videoUrl: 'https://www.youtube.com/watch?v=2BJnJaKMauI',
        duration: '25:14',
        context: 'Plenário – Votação da PEC 45/2019 – 1º turno',
      },
      {
        title: 'Apresentação do PL da Isenção do IR',
        date: '18/03/2025',
        videoUrl: 'https://www.youtube.com/watch?v=GpgPBvJe1Sk',
        duration: '13:40',
        context: 'Plenário – Apresentação do PL 1087/2025',
      },
      {
        title: 'Lei de Acesso à Informação – 10 anos',
        date: '18/11/2021',
        videoUrl: 'https://www.youtube.com/watch?v=t4NhKeQ8Gdc',
        duration: '11:05',
        context: 'Plenário – Sessão comemorativa da LAI',
      },
    ],
  },
];

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────

/** Busca um deputado pelo ID */
export function getDeputyById(id: string): Deputy | undefined {
  return deputies.find((d) => d.id === id);
}

/** Formata o mandato no padrão exibido na interface */
export function formatMandate(mandate: Mandate): string {
  return `${mandate.period}, ${mandate.state}, ${mandate.party}, Dt. Posse: ${mandate.assumedOn};`;
}

/** Retorna todos os deputados ordenados por nome */
export function getDeputiesSorted(): Deputy[] {
  return [...deputies].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}