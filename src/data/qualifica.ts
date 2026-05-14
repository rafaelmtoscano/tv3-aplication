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

// Thumbnails curadas no Unsplash (licença gratuita para uso comercial).
// URLs servidas direto pelo CDN images.unsplash.com com transformação on-the-fly.
const UNSPLASH_PARAMS = 'w=896&h=496&fit=crop&q=80&auto=format';
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?${UNSPLASH_PARAMS}`;

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
    thumbnail: photo('1526379095098-d400fd0bf935'),
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
    thumbnail: photo('1620712943543-bcc4688e7485'),
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
    thumbnail: photo('1542831371-29b0f74f9713'),
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
    thumbnail: photo('1563013544-824ae1b704d3'),
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
    thumbnail: photo('1551288049-bebda4e38f71'),
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
    thumbnail: photo('1621905251189-08b45d6a269e'),
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
    thumbnail: photo('1504917595217-d4dc5ebe6122'),
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
    thumbnail: photo('1530124566582-a618bc2615dc'),
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
    thumbnail: photo('1553413077-190dd305871c'),
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
    thumbnail: photo('1565043666747-69f6646db940'),
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
    thumbnail: photo('1586528116311-ad8dd3c8310d'),
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
    thumbnail: photo('1521791136064-7986c2920216'),
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
    thumbnail: photo('1481437156560-3205f6a55735'),
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
    thumbnail: photo('1551632436-cbf8dd35adfa'),
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
    thumbnail: photo('1449965408869-eaa3f722e40d'),
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
    thumbnail: photo('1556761175-5973dc0f32e7'),
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
    thumbnail: photo('1606811971618-4486d14f3f99'),
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
    thumbnail: photo('1503454537195-1dcabb73ffb9'),
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
    thumbnail: photo('1544161515-4ab6ce6db874'),
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
    thumbnail: photo('1631549916768-4119b2e5f926'),
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
    thumbnail: photo('1497032628192-86f99bcd76bc'),
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
    thumbnail: photo('1573497019940-1c28c88b4f3e'),
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
    thumbnail: photo('1554224155-6726b3ff858f'),
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
    thumbnail: photo('1611926653458-09294b3142bf'),
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
    thumbnail: photo('1542744173-8e7e53415bb0'),
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
    thumbnail: photo('1556742049-0cfed4f6a45d'),
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
    thumbnail: photo('1454165804606-c3d57bc86b40'),
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
    thumbnail: photo('1604719312566-8912e9227c6a'),
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
    thumbnail: photo('1579621970590-9d624316904b'),
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
    thumbnail: photo('1531403009284-440f080d1e12'),
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
