// TODO: substituir por chamada à API do MTE / QualificaPro quando o acesso oficial for liberado.
// Origem dos dados: curadoria manual feita a partir de servicos.mte.gov.br/qualificacao
// Os IDs dos cursos seguem a convenção `qp-{categoria}-{ordem}` apenas para mock.
// `qualificaUrl` aponta para a busca do título no QualificaPro como deep link provisório.

export type QualificaModalidade = 'EAD' | 'Presencial' | 'Híbrido';

export interface QualificaCategoria {
  id: string;
  nome: string;
  icone?: string; // nome do ícone no src/icons/index.tsx (opcional)
}

export interface QualificaCurso {
  id: string;
  titulo: string;
  instituicao: string;
  categoriaId: string;
  modalidade: QualificaModalidade;
  cargaHoraria: number; // em horas
  thumbnail: string;
  descricao: string;
  qualificaUrl: string;
  // Dados de mercado (CAGED/eSocial) — opcional, vem do QualificaPro
  vagasMercado?: number;
  salarioMedio?: number;
  // Hero/destaque
  destaque?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CATEGORIAS — primeira é sempre "todos"
// Ordem reflete o que aparece nos chips de filtro
// ────────────────────────────────────────────────────────────────────────────
export const qualificaCategorias: QualificaCategoria[] = [
  { id: 'todos', nome: 'Todos' },
  { id: 'tecnologia', nome: 'Tecnologia' },
  { id: 'industria', nome: 'Indústria' },
  { id: 'comercio-servicos', nome: 'Comércio e Serviços' },
  { id: 'saude', nome: 'Saúde' },
  { id: 'gestao', nome: 'Gestão e Negócios' },
  { id: 'empreendedorismo', nome: 'Empreendedorismo' },
];

// Helper para gerar URL de busca no QualificaPro
const qpUrl = (titulo: string) =>
  `https://servicos.mte.gov.br/qualificacao/#/busca?q=${encodeURIComponent(titulo)}`;

// Placeholder de thumbnail (Builder.io CDN — padrão do projeto)
// Substituir por imagens reais quando disponíveis
const thumb = (seed: string) =>
  `https://cdn.builder.io/api/v1/image/assets/placeholder?seed=${seed}&format=webp&width=896&height=496`;

// ────────────────────────────────────────────────────────────────────────────
// CURSOS — 30 cursos distribuídos entre as 6 categorias
// Curadoria baseada em ofertas reais do QualificaPro (Senai, Senac, Sebrae,
// SEST SENAT, Institutos Federais, Escola do Trabalhador 4.0).
// ────────────────────────────────────────────────────────────────────────────
export const qualificaCursos: QualificaCurso[] = [
  // ── TECNOLOGIA ──────────────────────────────────────────────────────────
  {
    id: 'qp-tec-01',
    titulo: 'Introdução à Programação com Python',
    instituicao: 'Escola do Trabalhador 4.0',
    categoriaId: 'tecnologia',
    modalidade: 'EAD',
    cargaHoraria: 60,
    thumbnail: thumb('python'),
    descricao:
      'Aprenda os fundamentos da linguagem Python: variáveis, estruturas de decisão, laços e funções. Curso voltado para quem nunca programou.',
    qualificaUrl: qpUrl('Python'),
    vagasMercado: 12480,
    salarioMedio: 4200,
    destaque: true,
  },
  {
    id: 'qp-tec-02',
    titulo: 'Fundamentos de Inteligência Artificial',
    instituicao: 'Escola do Trabalhador 4.0',
    categoriaId: 'tecnologia',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('ia'),
    descricao:
      'Conceitos de IA, machine learning e suas aplicações no mercado de trabalho. Inclui ferramentas gratuitas de IA generativa.',
    qualificaUrl: qpUrl('Inteligência Artificial'),
    vagasMercado: 8930,
    salarioMedio: 5800,
    destaque: true,
  },
  {
    id: 'qp-tec-03',
    titulo: 'Desenvolvimento Web Front-end',
    instituicao: 'SENAI',
    categoriaId: 'tecnologia',
    modalidade: 'EAD',
    cargaHoraria: 120,
    thumbnail: thumb('frontend'),
    descricao: 'HTML, CSS e JavaScript do básico ao desenvolvimento de páginas responsivas e interativas.',
    qualificaUrl: qpUrl('Desenvolvimento Web'),
    vagasMercado: 15200,
    salarioMedio: 4500,
  },
  {
    id: 'qp-tec-04',
    titulo: 'Segurança da Informação para Iniciantes',
    instituicao: 'Escola do Trabalhador 4.0',
    categoriaId: 'tecnologia',
    modalidade: 'EAD',
    cargaHoraria: 30,
    thumbnail: thumb('seginfo'),
    descricao: 'Boas práticas para proteger dados pessoais e profissionais, criar senhas seguras e reconhecer golpes online.',
    qualificaUrl: qpUrl('Segurança da Informação'),
    vagasMercado: 6740,
    salarioMedio: 5200,
  },
  {
    id: 'qp-tec-05',
    titulo: 'Excel Avançado e Análise de Dados',
    instituicao: 'SENAC',
    categoriaId: 'tecnologia',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('excel'),
    descricao: 'Fórmulas avançadas, tabelas dinâmicas, gráficos e introdução à análise de dados com Excel.',
    qualificaUrl: qpUrl('Excel'),
    vagasMercado: 22300,
    salarioMedio: 3400,
  },

  // ── INDÚSTRIA ───────────────────────────────────────────────────────────
  {
    id: 'qp-ind-01',
    titulo: 'Eletricista Industrial',
    instituicao: 'SENAI',
    categoriaId: 'industria',
    modalidade: 'Presencial',
    cargaHoraria: 240,
    thumbnail: thumb('eletricista'),
    descricao:
      'Formação para atuar na manutenção e instalação de sistemas elétricos industriais. Curso reconhecido em todo o país.',
    qualificaUrl: qpUrl('Eletricista Industrial'),
    vagasMercado: 9850,
    salarioMedio: 3800,
    destaque: true,
  },
  {
    id: 'qp-ind-02',
    titulo: 'Soldador MIG/MAG',
    instituicao: 'SENAI',
    categoriaId: 'industria',
    modalidade: 'Presencial',
    cargaHoraria: 200,
    thumbnail: thumb('soldador'),
    descricao: 'Técnicas de soldagem MIG/MAG aplicadas à indústria metalmecânica. Inclui prática em oficina.',
    qualificaUrl: qpUrl('Soldador'),
    vagasMercado: 7200,
    salarioMedio: 3500,
  },
  {
    id: 'qp-ind-03',
    titulo: 'Mecânico de Manutenção Industrial',
    instituicao: 'SENAI',
    categoriaId: 'industria',
    modalidade: 'Presencial',
    cargaHoraria: 320,
    thumbnail: thumb('mecanico'),
    descricao: 'Manutenção preventiva e corretiva de máquinas industriais, leitura de desenho técnico e metrologia.',
    qualificaUrl: qpUrl('Mecânico de Manutenção'),
    vagasMercado: 6480,
    salarioMedio: 3900,
  },
  {
    id: 'qp-ind-04',
    titulo: 'Operador de Empilhadeira',
    instituicao: 'SEST SENAT',
    categoriaId: 'industria',
    modalidade: 'Presencial',
    cargaHoraria: 16,
    thumbnail: thumb('empilhadeira'),
    descricao: 'NR-11 — Habilitação para operação segura de empilhadeira. Certificado válido em todo território nacional.',
    qualificaUrl: qpUrl('Operador de Empilhadeira'),
    vagasMercado: 14200,
    salarioMedio: 2800,
  },
  {
    id: 'qp-ind-05',
    titulo: 'Operador de CNC',
    instituicao: 'SENAI',
    categoriaId: 'industria',
    modalidade: 'Presencial',
    cargaHoraria: 160,
    thumbnail: thumb('cnc'),
    descricao: 'Programação e operação de máquinas CNC (Comando Numérico Computadorizado) para usinagem.',
    qualificaUrl: qpUrl('Operador CNC'),
    vagasMercado: 4900,
    salarioMedio: 4100,
  },

  // ── COMÉRCIO E SERVIÇOS ─────────────────────────────────────────────────
  {
    id: 'qp-com-01',
    titulo: 'Auxiliar de Logística',
    instituicao: 'SEST SENAT',
    categoriaId: 'comercio-servicos',
    modalidade: 'EAD',
    cargaHoraria: 80,
    thumbnail: thumb('logistica'),
    descricao: 'Rotinas de recebimento, armazenagem, expedição e controle de estoque. Curso 100% online.',
    qualificaUrl: qpUrl('Auxiliar de Logística'),
    vagasMercado: 18900,
    salarioMedio: 2400,
    destaque: true,
  },
  {
    id: 'qp-com-02',
    titulo: 'Atendimento ao Cliente',
    instituicao: 'SENAC',
    categoriaId: 'comercio-servicos',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('atendimento'),
    descricao: 'Técnicas de comunicação, empatia, resolução de conflitos e fidelização do cliente.',
    qualificaUrl: qpUrl('Atendimento ao Cliente'),
    vagasMercado: 32400,
    salarioMedio: 2200,
  },
  {
    id: 'qp-com-03',
    titulo: 'Vendedor de Comércio Varejista',
    instituicao: 'SENAC',
    categoriaId: 'comercio-servicos',
    modalidade: 'EAD',
    cargaHoraria: 60,
    thumbnail: thumb('vendedor'),
    descricao: 'Estratégias de venda, abordagem ao cliente, conhecimento de produtos e fechamento.',
    qualificaUrl: qpUrl('Vendedor Comércio'),
    vagasMercado: 28700,
    salarioMedio: 2300,
  },
  {
    id: 'qp-com-04',
    titulo: 'Recepcionista',
    instituicao: 'SENAC',
    categoriaId: 'comercio-servicos',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('recepcionista'),
    descricao: 'Rotinas de recepção, agenda, atendimento telefônico e postura profissional.',
    qualificaUrl: qpUrl('Recepcionista'),
    vagasMercado: 11400,
    salarioMedio: 2100,
  },
  {
    id: 'qp-com-05',
    titulo: 'Motorista de Aplicativo',
    instituicao: 'SEST SENAT',
    categoriaId: 'comercio-servicos',
    modalidade: 'EAD',
    cargaHoraria: 30,
    thumbnail: thumb('motorista-app'),
    descricao: 'Direção defensiva, atendimento ao passageiro e gestão financeira para motoristas de aplicativo.',
    qualificaUrl: qpUrl('Motorista de Aplicativo'),
    vagasMercado: 9800,
    salarioMedio: 2800,
  },

  // ── SAÚDE ───────────────────────────────────────────────────────────────
  {
    id: 'qp-sau-01',
    titulo: 'Cuidador de Idosos',
    instituicao: 'SENAC',
    categoriaId: 'saude',
    modalidade: 'Híbrido',
    cargaHoraria: 160,
    thumbnail: thumb('cuidador'),
    descricao: 'Cuidados básicos de saúde, higiene, alimentação e primeiros socorros voltados ao idoso.',
    qualificaUrl: qpUrl('Cuidador de Idosos'),
    vagasMercado: 13200,
    salarioMedio: 2400,
    destaque: true,
  },
  {
    id: 'qp-sau-02',
    titulo: 'Auxiliar em Saúde Bucal',
    instituicao: 'SENAC',
    categoriaId: 'saude',
    modalidade: 'Presencial',
    cargaHoraria: 300,
    thumbnail: thumb('saude-bucal'),
    descricao: 'Apoio ao dentista em procedimentos, esterilização de instrumentos e atendimento ao paciente.',
    qualificaUrl: qpUrl('Auxiliar Saúde Bucal'),
    vagasMercado: 4800,
    salarioMedio: 2300,
  },
  {
    id: 'qp-sau-03',
    titulo: 'Cuidador Infantil',
    instituicao: 'SENAC',
    categoriaId: 'saude',
    modalidade: 'Híbrido',
    cargaHoraria: 120,
    thumbnail: thumb('cuidador-infantil'),
    descricao: 'Desenvolvimento infantil, primeiros socorros, alimentação saudável e estímulos pedagógicos.',
    qualificaUrl: qpUrl('Cuidador Infantil'),
    vagasMercado: 6700,
    salarioMedio: 2200,
  },
  {
    id: 'qp-sau-04',
    titulo: 'Massoterapia',
    instituicao: 'SENAC',
    categoriaId: 'saude',
    modalidade: 'Presencial',
    cargaHoraria: 240,
    thumbnail: thumb('massoterapia'),
    descricao: 'Técnicas de massagem terapêutica, anatomia básica e atendimento em SPA, clínica e domicílio.',
    qualificaUrl: qpUrl('Massoterapia'),
    vagasMercado: 3400,
    salarioMedio: 2700,
  },
  {
    id: 'qp-sau-05',
    titulo: 'Auxiliar de Farmácia',
    instituicao: 'SENAC',
    categoriaId: 'saude',
    modalidade: 'EAD',
    cargaHoraria: 80,
    thumbnail: thumb('aux-farmacia'),
    descricao: 'Rotinas de farmácia, organização de medicamentos, atendimento ao cliente e legislação básica.',
    qualificaUrl: qpUrl('Auxiliar de Farmácia'),
    vagasMercado: 7900,
    salarioMedio: 2200,
  },

  // ── GESTÃO E NEGÓCIOS ───────────────────────────────────────────────────
  {
    id: 'qp-ges-01',
    titulo: 'Assistente Administrativo',
    instituicao: 'SENAC',
    categoriaId: 'gestao',
    modalidade: 'EAD',
    cargaHoraria: 160,
    thumbnail: thumb('admin'),
    descricao: 'Rotinas administrativas, atendimento, organização de arquivos, redação oficial e Excel básico.',
    qualificaUrl: qpUrl('Assistente Administrativo'),
    vagasMercado: 24600,
    salarioMedio: 2600,
    destaque: true,
  },
  {
    id: 'qp-ges-02',
    titulo: 'Departamento Pessoal e Folha de Pagamento',
    instituicao: 'SENAC',
    categoriaId: 'gestao',
    modalidade: 'EAD',
    cargaHoraria: 60,
    thumbnail: thumb('dp'),
    descricao: 'CLT, admissões, demissões, férias, 13º, INSS e FGTS. Inclui prática com folha de pagamento.',
    qualificaUrl: qpUrl('Departamento Pessoal'),
    vagasMercado: 5800,
    salarioMedio: 3200,
  },
  {
    id: 'qp-ges-03',
    titulo: 'Gestão Financeira para Pequenos Negócios',
    instituicao: 'SEBRAE',
    categoriaId: 'gestao',
    modalidade: 'EAD',
    cargaHoraria: 30,
    thumbnail: thumb('financ'),
    descricao: 'Fluxo de caixa, formação de preço, controle de despesas e separação das finanças pessoais.',
    qualificaUrl: qpUrl('Gestão Financeira'),
    vagasMercado: 4200,
    salarioMedio: 3400,
  },
  {
    id: 'qp-ges-04',
    titulo: 'Marketing Digital',
    instituicao: 'SEBRAE',
    categoriaId: 'gestao',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('mkt-digital'),
    descricao: 'Redes sociais, anúncios pagos, e-mail marketing e métricas para divulgar produtos e serviços.',
    qualificaUrl: qpUrl('Marketing Digital'),
    vagasMercado: 11800,
    salarioMedio: 3600,
  },
  {
    id: 'qp-ges-05',
    titulo: 'Gestão de Pessoas e Liderança',
    instituicao: 'SENAC',
    categoriaId: 'gestao',
    modalidade: 'EAD',
    cargaHoraria: 40,
    thumbnail: thumb('lideranca'),
    descricao: 'Comunicação, feedback, gestão de conflitos e formação de equipes de alta performance.',
    qualificaUrl: qpUrl('Liderança'),
    vagasMercado: 3700,
    salarioMedio: 4200,
  },

  // ── EMPREENDEDORISMO ────────────────────────────────────────────────────
  {
    id: 'qp-emp-01',
    titulo: 'Como ser um MEI – Microempreendedor Individual',
    instituicao: 'SEBRAE',
    categoriaId: 'empreendedorismo',
    modalidade: 'EAD',
    cargaHoraria: 20,
    thumbnail: thumb('mei'),
    descricao: 'Tudo sobre o MEI: como abrir, obrigações mensais, emissão de notas fiscais e benefícios previdenciários.',
    qualificaUrl: qpUrl('MEI'),
    vagasMercado: 0,
    salarioMedio: 0,
    destaque: true,
  },
  {
    id: 'qp-emp-02',
    titulo: 'Plano de Negócios para Empreendedores',
    instituicao: 'SEBRAE',
    categoriaId: 'empreendedorismo',
    modalidade: 'EAD',
    cargaHoraria: 30,
    thumbnail: thumb('plano-neg'),
    descricao: 'Como estruturar um plano de negócios completo: análise de mercado, plano operacional e financeiro.',
    qualificaUrl: qpUrl('Plano de Negócios'),
  },
  {
    id: 'qp-emp-03',
    titulo: 'Vendas para Pequenos Negócios',
    instituicao: 'SEBRAE',
    categoriaId: 'empreendedorismo',
    modalidade: 'EAD',
    cargaHoraria: 24,
    thumbnail: thumb('vendas-pp'),
    descricao: 'Prospecção, abordagem, técnicas de fechamento e pós-venda para donos de pequenos negócios.',
    qualificaUrl: qpUrl('Vendas Pequenos Negócios'),
  },
  {
    id: 'qp-emp-04',
    titulo: 'Educação Financeira para Empreendedores',
    instituicao: 'SEBRAE',
    categoriaId: 'empreendedorismo',
    modalidade: 'EAD',
    cargaHoraria: 16,
    thumbnail: thumb('edu-financ'),
    descricao: 'Separação de finanças pessoais e da empresa, controle de fluxo de caixa e planejamento de investimentos.',
    qualificaUrl: qpUrl('Educação Financeira'),
  },
  {
    id: 'qp-emp-05',
    titulo: 'Empreendedorismo Digital',
    instituicao: 'SEBRAE',
    categoriaId: 'empreendedorismo',
    modalidade: 'EAD',
    cargaHoraria: 30,
    thumbnail: thumb('emp-digital'),
    descricao: 'Como criar e vender produtos digitais, divulgar online e operar um negócio sem ponto físico.',
    qualificaUrl: qpUrl('Empreendedorismo Digital'),
  },
];

// ────────────────────────────────────────────────────────────────────────────
// HELPERS — usados pela página Qualifica
// ────────────────────────────────────────────────────────────────────────────

/** Cursos em destaque (usados no hero rotativo ou em rail "Para você") */
export const qualificaDestaques = qualificaCursos.filter((c) => c.destaque);

/** Filtra cursos por categoria (ou retorna todos se 'todos') */
export function filtrarCursos(categoriaId: string): QualificaCurso[] {
  if (categoriaId === 'todos') return qualificaCursos;
  return qualificaCursos.filter((c) => c.categoriaId === categoriaId);
}

/** Conta total de cursos disponíveis — usado no título do hero */
export const totalCursos = qualificaCursos.length;