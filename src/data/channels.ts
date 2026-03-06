// TODO: substituir por chamada à API

export interface Program {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration?: string;
  category?: string;
  description?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  logoFull: string;
  backgroundColor: string;
  streamUrl?: string;
  programs?: Program[];
}

// TODO: substituir por chamada à API
export const channels: Channel[] = [
  {
    id: 'tv-mec',
    name: 'TV MEC',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F9e0a62eeec2a4e2aaa1fe8ab565197bc?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F9e0a62eeec2a4e2aaa1fe8ab565197bc?format=webp&width=480&height=192',
    backgroundColor: '#3A2452',
    streamUrl: '',
    programs: [
      { id: 'tv-mec-1', title: '#TVdoMEC | Toda Matemática - EP 08', thumbnail: 'https://i.ytimg.com/vi/sPnSXbh7Fwc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=sPnSXbh7Fwc', category: 'Educação' },
      { id: 'tv-mec-2', title: '#TVdoMEC | Toda Matemática - EP 09', thumbnail: 'https://i.ytimg.com/vi/qbsWB133gXs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=qbsWB133gXs', category: 'Educação' },
      { id: 'tv-mec-3', title: '#TVdoMEC | Toda Matemática - EP 06', thumbnail: 'https://i.ytimg.com/vi/SZ_N2QBnaGc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=SZ_N2QBnaGc', category: 'Educação' },
      { id: 'tv-mec-4', title: '#TVdoMEC | Toda Matemática - EP 05', thumbnail: 'https://i.ytimg.com/vi/pZqmvnMzQ-U/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=pZqmvnMzQ-U', category: 'Educação' },
      { id: 'tv-mec-5', title: '#TVdoMEC | Toda Matemática - EP 04', thumbnail: 'https://i.ytimg.com/vi/X_c4BXOCTm4/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=X_c4BXOCTm4', category: 'Educação' },
      { id: 'tv-mec-6', title: '#TVdoMEC | Toda Matemática - EP 03', thumbnail: 'https://i.ytimg.com/vi/UQ-NHhipRXU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=UQ-NHhipRXU', category: 'Educação' },
      { id: 'tv-mec-7', title: '#TVdoMEC | Toda Matemática - EP 02', thumbnail: 'https://i.ytimg.com/vi/DvlfkXkPDbg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=DvlfkXkPDbg', category: 'Educação' },
      { id: 'tv-mec-8', title: '#TVdoMEC | Toda Matemática - EP 01', thumbnail: 'https://i.ytimg.com/vi/fjiwwei3tmI/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=fjiwwei3tmI', category: 'Educação' },
    ],
  },
  {
    id: 'tv-camara',
    name: 'TV Câmara',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F42f9421675e545838eedabcd6fe2da8b?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F64a9563fa6b74e149a27e7d4b91da1c1?format=webp&width=800&height=450',
    backgroundColor: '#FFFFFF',
    streamUrl: 'https://stream3.camara.gov.br/tv1/manifest.m3u8',
    programs: [
      { id: 'tv-camara-1', title: 'Câmara aprova política de capacitação digital para pessoas idosas - 27/02/26', thumbnail: 'https://i.ytimg.com/vi/b7QbtVgLheQ/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=b7QbtVgLheQ', category: 'Política' },
      { id: 'tv-camara-2', title: 'Aprovado projeto que determina acesso de idosos a tecnologias de comunicação - 27/02/2026', thumbnail: 'https://i.ytimg.com/vi/gQH2OODFdJQ/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=gQH2OODFdJQ', category: 'Política' },
      { id: 'tv-camara-3', title: 'Alice Portugal apresenta prioridades da Comissão de Direitos Humanos para 2026 - 26/02/26', thumbnail: 'https://i.ytimg.com/vi/v3BOh7Rmkds/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=v3BOh7Rmkds', category: 'Política' },
      { id: 'tv-camara-4', title: 'Comissão aprova protocolo para pessoas com deficiência em caso de desastre - 26/02/26', thumbnail: 'https://i.ytimg.com/vi/89CDuEpszNU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=89CDuEpszNU', category: 'Política' },
      { id: 'tv-camara-5', title: 'Criação de Mobilização Nacional de Resposta a Desastres é aprovado em comissão - 26/02/2026', thumbnail: 'https://i.ytimg.com/vi/_w0aev5Td0Y/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_w0aev5Td0Y', category: 'Política' },
      { id: 'tv-camara-6', title: 'Aprovado projeto que destina maquinário apreendido em garimpo para uso social - 26/02/2026', thumbnail: 'https://i.ytimg.com/vi/zviXmCNTFDA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=zviXmCNTFDA', category: 'Política' },
      { id: 'tv-camara-7', title: 'Acordo comercial entre Mercosul e União Europeia é aprovado na Câmara - 25/02/26', thumbnail: 'https://i.ytimg.com/vi/CYTAeHUTopE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=CYTAeHUTopE', category: 'Política' },
      { id: 'tv-camara-8', title: 'Audiência debate Política Nacional de Prevenção e Controle do Câncer - 25/02/2026', thumbnail: 'https://i.ytimg.com/vi/mwotgXrURus/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mwotgXrURus', category: 'Política' },
      { id: 'tv-camara-9', title: 'Ministro do Trabalho debate com parlamentares mudanças no seguro-defeso - 25/02/2026', thumbnail: 'https://i.ytimg.com/vi/Aaq1NTccS98/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Aaq1NTccS98', category: 'Política' },
      { id: 'tv-camara-10', title: 'Livro didático para alunos cegos é tema de debate na Câmara - 24/02/26', thumbnail: 'https://i.ytimg.com/vi/pfJ_8Hea6uk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=pfJ_8Hea6uk', category: 'Política' },
    ],
  },
  {
    id: 'tv-brasil',
    name: 'TV Brasil',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F40e646594c6c430a94ef7b5ff7f589c0?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F5c8223094974421f98bc81f062e7b025?format=webp&width=800&height=450',
    backgroundColor: '#EEBE08',
    streamUrl: 'https://tvbrasil-stream.ebc.com.br/EBC_HD-avc1_3000000=10004.m3u8',
    programs: [
      { id: 'tv-brasil-manual', title: 'Manual de Sobrevivência da Literatura Brasileira', thumbnail: 'https://i.ytimg.com/vi/tu0fMZNKQQs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=tu0fMZNKQQs', category: 'Jornalismo' },
      { id: 'tv-brasil-1', title: 'BRASIL NO MUNDO | Eduardo Serra, professor de Relações Internacionais', thumbnail: 'https://i.ytimg.com/vi/tu0fMZNKQQs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=tu0fMZNKQQs', category: 'Jornalismo' },
      { id: 'tv-brasil-2', title: 'Quando o esquecimento chega: Alzheimer e outras demências | Caminhos da Reportagem', thumbnail: 'https://i.ytimg.com/vi/dcyFeAErXdg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=dcyFeAErXdg', category: 'Jornalismo' },
      { id: 'tv-brasil-3', title: 'Sem Censura | Tatiana Sampaio explica como funciona o tratamento da tetraplegia com polilaminina', thumbnail: 'https://i.ytimg.com/vi/9rzXNAO8UJs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=9rzXNAO8UJs', category: 'Jornalismo' },
      { id: 'tv-brasil-4', title: 'Olhar Brasil | Chapada dos Veadeiros: Um Paraíso no Coração do Brasil', thumbnail: 'https://i.ytimg.com/vi/EA8UNjRfFXg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=EA8UNjRfFXg', category: 'Jornalismo' },
      { id: 'tv-brasil-5', title: 'SEM CENSURA | A ALEGRIA É COISA SÉRIA | ANTÔNIO CARLOS & JOCAFI E MORAES MOREIRA', thumbnail: 'https://i.ytimg.com/vi/obAlpll5VzY/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=obAlpll5VzY', category: 'Jornalismo' },
      { id: 'tv-brasil-6', title: 'Olhar Brasil | Canindé de São Francisco: O Oásis no sertão nordestino', thumbnail: 'https://i.ytimg.com/vi/-FpmgoHgsqI/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=-FpmgoHgsqI', category: 'Jornalismo' },
      { id: 'tv-brasil-7', title: 'Olhar Brasil | Turismo Comunitário no Quilombo Kalunga: Resistência e Sustentabilidade', thumbnail: 'https://i.ytimg.com/vi/Z2iDSTaGMYg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Z2iDSTaGMYg', category: 'Jornalismo' },
      { id: 'tv-brasil-8', title: 'Delegação brasileira leva 14 atletas para os Jogos de Inverno Milão-Cortina 2026', thumbnail: 'https://i.ytimg.com/vi/J00rb9EctZE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=J00rb9EctZE', category: 'Jornalismo' },
      { id: 'tv-brasil-9', title: 'Copa Delas | Diretora de futebol da Ferroviária, Nuty Silveira comenta planos para a temporada 2026', thumbnail: 'https://i.ytimg.com/vi/Jx603TFQdqM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=Jx603TFQdqM', category: 'Jornalismo' },
      { id: 'tv-brasil-10', title: 'Stadium | Parque Nacional de Sete Cidades recebe turma do rally Cerapió', thumbnail: 'https://i.ytimg.com/vi/ok5jksQ-Kr8/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=ok5jksQ-Kr8', category: 'Jornalismo' },
    ],
  },
  {
    id: 'canal-gov',
    name: 'Canal Gov',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F655d4a3ff4a041e490aa5ba1378906bd?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fa6eaef1fb7db406593cd2e64dfafb0a5?format=webp&width=800&height=450',
    backgroundColor: '#0D448C',
    streamUrl: 'https://canalgov-stream.ebc.com.br/GOV-avc1_1800000=10000.m3u8',
    programs: [
      { id: 'canal-gov-1', title: 'SUS terá novo teste de DNA para diagnóstico de doenças raras', thumbnail: 'https://i.ytimg.com/vi/mu7heQQ3ekU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mu7heQQ3ekU', category: 'Governo' },
      { id: 'canal-gov-2', title: 'Luz do povo garante gratuidade e desconto para milhões de famílias', thumbnail: 'https://i.ytimg.com/vi/-igsD2VQZkE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=-igsD2VQZkE', category: 'Governo' },
      { id: 'canal-gov-3', title: 'Combate às drogas e ao crime organizado: Brasil lidera iniciativa junto com a Interpol', thumbnail: 'https://i.ytimg.com/vi/zBCIThuYt50/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=zBCIThuYt50', category: 'Governo' },
      { id: 'canal-gov-4', title: 'Minha Casa, Minha Vida atinge 2 milhões de contratos', thumbnail: 'https://i.ytimg.com/vi/sZZWHuMZNac/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=sZZWHuMZNac', category: 'Governo' },
      { id: 'canal-gov-5', title: 'Programa "Agora tem Especialistas" leva atendimento à caminhoneiros', thumbnail: 'https://i.ytimg.com/vi/ricnqTWC7xU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=ricnqTWC7xU', category: 'Governo' },
      { id: 'canal-gov-6', title: 'SUS oferece imunobiológico contra a bronquilolite', thumbnail: 'https://i.ytimg.com/vi/X5yCbNURbYM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=X5yCbNURbYM', category: 'Governo' },
      { id: 'canal-gov-7', title: 'Crescimento do setor de serviços foi de 2,8% em relação a 2024', thumbnail: 'https://i.ytimg.com/vi/xye1jN9LcM8/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=xye1jN9LcM8', category: 'Governo' },
      { id: 'canal-gov-8', title: 'Brasil contra fake: nada muda para o microempreendedor individual com a reforma tributária', thumbnail: 'https://i.ytimg.com/vi/mJLhPLdy454/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mJLhPLdy454', category: 'Governo' },
      { id: 'canal-gov-9', title: 'Programa Move Brasil tem R$ 1,9 bi em créditos aprovados no primeiro mês', thumbnail: 'https://i.ytimg.com/vi/I1RSF4YgAX0/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=I1RSF4YgAX0', category: 'Governo' },
      { id: 'canal-gov-10', title: 'Operação "Tô de Olho – Abastecimento Seguro" fiscaliza fraudes em postos de combustíveis', thumbnail: 'https://i.ytimg.com/vi/OSwyDZTzJXg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=OSwyDZTzJXg', category: 'Governo' },
    ],
  },
  {
    id: 'tv-justica',
    name: 'TV Justiça',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Ff721c15dcde24ceeba9ee7e1152d9921?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F8c6042eefaa9409593860cbbde83aad5?format=webp&width=800&height=450',
    backgroundColor: '#084987',
    streamUrl: '',
    programs: [
      { id: 'tv-justica-1', title: 'JJ – Supremo Tribunal Federal completa 135 anos', thumbnail: 'https://i.ytimg.com/vi/g1HEMB-9fXM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=g1HEMB-9fXM', category: 'Direito' },
      { id: 'tv-justica-2', title: 'JJ – Poder Judiciário lança a campanha De Olho Nas Emendas', thumbnail: 'https://i.ytimg.com/vi/6SJXwIgk9mM/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=6SJXwIgk9mM', category: 'Direito' },
      { id: 'tv-justica-3', title: 'JJ – STF começa a julgar adicional de ICMS sobre telecomunicações na Paraíba', thumbnail: 'https://i.ytimg.com/vi/RHPYpH_q3Cs/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=RHPYpH_q3Cs', category: 'Direito' },
      { id: 'tv-justica-4', title: 'Direito sem Fronteiras - Ratificação do acordo Mercosul-UE', thumbnail: 'https://i.ytimg.com/vi/idrRfcqm_Zk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=idrRfcqm_Zk', category: 'Direito' },
      { id: 'tv-justica-5', title: 'Sessão Plenária TSE – 19/02/2026', thumbnail: 'https://i.ytimg.com/vi/l36FAGFmQ2E/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=l36FAGFmQ2E', category: 'Direito' },
      { id: 'tv-justica-6', title: 'Academia - Lucas Orsi Rossi', thumbnail: 'https://i.ytimg.com/vi/TyJoEHRJNBA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=TyJoEHRJNBA', category: 'Direito' },
      { id: 'tv-justica-7', title: 'JJ – CNJ decide pela aposentadoria compulsória de ex-desembargador do TJGO por assédio sexual', thumbnail: 'https://i.ytimg.com/vi/D9U70oCtvj4/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=D9U70oCtvj4', category: 'Direito' },
      { id: 'tv-justica-8', title: 'Plenárias – STF invalida lei municipal que criou o programa Escola Sem Partido | 20/02/26', thumbnail: 'https://i.ytimg.com/vi/jSxUmZFtuec/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=jSxUmZFtuec', category: 'Direito' },
      { id: 'tv-justica-9', title: 'JJ – Supremo derruba lei municipal que instituiu o chamado Programa Escola Sem Partido', thumbnail: 'https://i.ytimg.com/vi/z7sl02rSJBU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=z7sl02rSJBU', category: 'Direito' },
    ],
  },
  {
    id: 'tv-senado',
    name: 'TV Senado',
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2Fefb11e9bb9114a46b23813f61e4f1df8?format=webp&width=480&height=192',
    logoFull: 'https://cdn.builder.io/api/v1/image/assets%2F8decac7d217b4e02a090384b68b42488%2F71bea8998b7d494ea2da48d509a33111?format=webp&width=800&height=450',
    backgroundColor: '#FFFFFF',
    streamUrl: '',
    programs: [
      { id: 'tv-senado-1', title: 'Senado aprova redução de tributos para a indústria química e petroquímica', thumbnail: 'https://i.ytimg.com/vi/C2m7YOXnA4o/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=C2m7YOXnA4o', category: 'Política' },
      { id: 'tv-senado-2', title: 'CDH approve medidas de proteção a mulheres em viagens e institui Agenda Transversal', thumbnail: 'https://i.ytimg.com/vi/iSouHkfOypE/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=iSouHkfOypE', category: 'Política' },
      { id: 'tv-senado-3', title: 'Indicados a embaixadas na Austrália, Nova Zelândia, Coreia do Norte e Quênia são aprovados na CRE', thumbnail: 'https://i.ytimg.com/vi/_xXFu4k3WRU/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_xXFu4k3WRU', category: 'Política' },
      { id: 'tv-senado-4', title: 'Proficiência em Medicina: Comissão aprova exame para recém-formados', thumbnail: 'https://i.ytimg.com/vi/SCmQlxfIRLc/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=SCmQlxfIRLc', category: 'Política' },
      { id: 'tv-senado-5', title: 'Senado aprova medidas que garantem descanso nas rodovias para motoristas profissionais', thumbnail: 'https://i.ytimg.com/vi/UUn05qqJdQg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=UUn05qqJdQg', category: 'Política' },
      { id: 'tv-senado-6', title: 'Comissão aprova acordo Mercosul–União Europeia com críticas de setores produtivos', thumbnail: 'https://i.ytimg.com/vi/aShqP_MDagw/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=aShqP_MDagw', category: 'Política' },
      { id: 'tv-senado-7', title: 'Mulheres de destaque na política são homenageadas; senadora lamenta violência de gênero', thumbnail: 'https://i.ytimg.com/vi/3po6QyN0f9A/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=3po6QyN0f9A', category: 'Política' },
      { id: 'tv-senado-8', title: 'CPMI do INSS l Três depoentes são esperados na próxima segunda (2)', thumbnail: 'https://i.ytimg.com/vi/_xNNCQQR4Tk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=_xNNCQQR4Tk', category: 'Política' },
      { id: 'tv-senado-9', title: 'CPMI do INSS deve recorrer ao STF para garantir oitiva de Edson Cunha', thumbnail: 'https://i.ytimg.com/vi/bJSeZt-qLkA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=bJSeZt-qLkA', category: 'Política' },
    ],
  },
];
