/* Códex Jurídico: conteúdo. Cada diploma aparece em uma única área. */
const P = 'https://www.planalto.gov.br/ccivil_03/';
const OABSITE = 'https://www.oab.org.br/';

const RAMOS = {
  pub:  { nome: 'Direito Público' },
  pri:  { nome: 'Direito Privado' },
  pen:  { nome: 'Direito Penal' },
  proc: { nome: 'Direito Processual' },
  soc:  { nome: 'Direito Social' },
  base: { nome: 'Fundamentos e Profissão' }
};
const RAMO_ORDER = ['pub', 'pri', 'pen', 'proc', 'soc', 'base'];

/* d(sigla, nome, número, caminho no Planalto, o que regula, estrutura opcional) */
const d = (sig, nome, num, path, desc, est) => ({ sig, nome, num, url: path ? (path.startsWith('http') ? path : P + path) : '', desc, est });

const AREAS = [
  {
    id: 'cf', sig: 'CF', nome: 'Direito Constitucional', ramo: 'pub', oab: 6,
    fac: ['Teoria da Constituição', 'Direitos Fundamentais', 'Organização do Estado e dos Poderes', 'Controle de Constitucionalidade'],
    temas: ['Princípios fundamentais', 'Direitos e garantias', 'Repartição de competências', 'Processo legislativo', 'Controle de constitucionalidade', 'Remédios constitucionais'],
    dip: [
      d('CF/88', 'Constituição da República Federativa do Brasil', 'Constituição de 1988', 'constituicao/constituicao.htm', 'Norma fundamental: direitos, organização do Estado, dos Poderes, tributação e ordem social.', [
        ['Título I: Princípios fundamentais', 'arts. 1º a 4º'],
        ['Título II: Direitos e garantias fundamentais', 'arts. 5º a 17'],
        ['Título III: Organização do Estado', 'arts. 18 a 43'],
        ['Título IV: Organização dos Poderes', 'arts. 44 a 135'],
        ['Título V: Defesa do Estado e das instituições democráticas', 'arts. 136 a 144'],
        ['Título VI: Tributação e orçamento', 'arts. 145 a 169'],
        ['Título VII: Ordem econômica e financeira', 'arts. 170 a 192'],
        ['Título VIII: Ordem social', 'arts. 193 a 232'],
        ['Título IX: Disposições constitucionais gerais', 'arts. 233 a 250'],
        ['ADCT', 'disposições transitórias']
      ]),
      d('Lei da ADI', 'Ação direta de inconstitucionalidade e ação declaratória de constitucionalidade', 'Lei 9.868/1999', 'leis/l9868.htm', 'Processo e julgamento da ADI e da ADC no STF; modulação de efeitos (art. 27).'),
      d('Lei da ADPF', 'Arguição de descumprimento de preceito fundamental', 'Lei 9.882/1999', 'leis/l9882.htm', 'Processo da ADPF e seu caráter subsidiário (art. 4º, § 1º).'),
      d('Lei do MS', 'Mandado de segurança individual e coletivo', 'Lei 12.016/2009', '_ato2007-2010/2009/lei/l12016.htm', 'Proteção de direito líquido e certo; prazo de 120 dias (art. 23).'),
      d('Lei do MI', 'Mandado de injunção', 'Lei 13.300/2016', '_ato2015-2018/2016/lei/l13300.htm', 'Processo do mandado de injunção individual e coletivo.'),
      d('Lei do HD', 'Habeas data', 'Lei 9.507/1997', 'leis/l9507.htm', 'Acesso e retificação de informações pessoais em bancos de dados públicos.'),
      d('LAP', 'Ação popular', 'Lei 4.717/1965', 'leis/l4717.htm', 'Cidadão contra ato lesivo ao patrimônio público; elementos do ato administrativo (art. 2º).'),
      d('Lei da SV', 'Súmula vinculante', 'Lei 11.417/2006', '_ato2004-2006/2006/lei/l11417.htm', 'Edição, revisão e cancelamento de súmula vinculante pelo STF.'),
      d('Lei 1.079', 'Crimes de responsabilidade', 'Lei 1.079/1950', 'leis/l1079.htm', 'Define os crimes de responsabilidade e o processo de impeachment.')
    ]
  },
  {
    id: 'adm', sig: 'ADM', nome: 'Direito Administrativo', ramo: 'pub', oab: 5,
    fac: ['Regime jurídico-administrativo', 'Atos e poderes', 'Licitações e contratos', 'Agentes públicos', 'Responsabilidade do Estado'],
    temas: ['Princípios (LIMPE)', 'Ato administrativo', 'Poderes administrativos', 'Licitações e contratos', 'Improbidade', 'Servidores', 'Intervenção na propriedade'],
    dip: [
      d('LPA', 'Processo administrativo federal', 'Lei 9.784/1999', 'leis/l9784.htm', 'Processo administrativo na Administração federal; anulação e revogação (arts. 53 e 54).'),
      d('NLLC', 'Licitações e contratos administrativos', 'Lei 14.133/2021', '_ato2019-2022/2021/lei/l14133.htm', 'Modalidades, contratação direta, contratos e sanções.'),
      d('LIA', 'Improbidade administrativa', 'Lei 8.429/1992', 'leis/l8429.htm', 'Atos de improbidade e sanções; exige dolo após a Lei 14.230/2021.'),
      d('Lei 8.112', 'Regime jurídico dos servidores federais', 'Lei 8.112/1990', 'leis/l8112cons.htm', 'Provimento, vacância, direitos, deveres e processo disciplinar.'),
      d('Lei de Concessões', 'Concessão e permissão de serviços públicos', 'Lei 8.987/1995', 'leis/l8987cons.htm', 'Serviço adequado, direitos dos usuários, extinção da concessão.'),
      d('Lei das PPPs', 'Parcerias público-privadas', 'Lei 11.079/2004', '_ato2004-2006/2004/lei/l11079.htm', 'Concessão patrocinada e concessão administrativa.'),
      d('Lei Anticorrupção', 'Responsabilização de pessoas jurídicas', 'Lei 12.846/2013', '_ato2011-2014/2013/lei/l12846.htm', 'Responsabilidade objetiva de empresas por atos contra a Administração; acordo de leniência.'),
      d('LAI', 'Acesso à informação', 'Lei 12.527/2011', '_ato2011-2014/2011/lei/l12527.htm', 'Publicidade como regra, sigilo como exceção.'),
      d('MROSC', 'Parcerias com organizações da sociedade civil', 'Lei 13.019/2014', '_ato2011-2014/2014/lei/l13019.htm', 'Termo de colaboração, termo de fomento e acordo de cooperação.'),
      d('Lei das Estatais', 'Estatuto das empresas estatais', 'Lei 13.303/2016', '_ato2015-2018/2016/lei/l13303.htm', 'Empresas públicas e sociedades de economia mista: governança e licitações.'),
      d('Lei de Desapropriação', 'Desapropriação por utilidade pública', 'Decreto-Lei 3.365/1941', 'decreto-lei/del3365.htm', 'Procedimento expropriatório e indenização.'),
      d('Estatuto da Cidade', 'Política urbana', 'Lei 10.257/2001', 'leis/leis_2001/l10257.htm', 'Instrumentos urbanísticos; regulamenta os arts. 182 e 183 da CF.')
    ]
  },
  {
    id: 'trib', sig: 'TRIB', nome: 'Direito Tributário', ramo: 'pub', oab: 5,
    fac: ['Sistema Tributário Nacional', 'Obrigação e crédito tributário', 'Tributos em espécie', 'Processo tributário'],
    temas: ['Limitações ao poder de tributar', 'Obrigação tributária', 'Lançamento', 'Suspensão, extinção e exclusão do crédito', 'Responsabilidade tributária', 'Execução fiscal'],
    dip: [
      d('CTN', 'Código Tributário Nacional', 'Lei 5.172/1966', 'leis/l5172compilado.htm', 'Normas gerais de direito tributário; tem status de lei complementar.', [
        ['Livro Primeiro: Sistema Tributário Nacional', 'arts. 1º a 95'],
        ['Livro Segundo: Normas gerais de direito tributário', 'arts. 96 a 208'],
        ['Legislação tributária', 'arts. 96 a 112'],
        ['Obrigação tributária', 'arts. 113 a 138'],
        ['Crédito tributário', 'arts. 139 a 193'],
        ['Administração tributária', 'arts. 194 a 208'],
        ['Disposições finais e transitórias', 'arts. 209 a 218']
      ]),
      d('LEF', 'Lei de Execução Fiscal', 'Lei 6.830/1980', 'leis/l6830.htm', 'Cobrança judicial da dívida ativa da Fazenda Pública.'),
      d('Lei Kandir', 'ICMS', 'Lei Complementar 87/1996', 'leis/lcp/lcp87.htm', 'Normas gerais do ICMS.'),
      d('Lei do ISS', 'Imposto sobre serviços', 'Lei Complementar 116/2003', 'leis/lcp/lcp116.htm', 'Normas gerais do ISS e lista de serviços.'),
      d('Simples Nacional', 'Estatuto da microempresa e da empresa de pequeno porte', 'Lei Complementar 123/2006', 'leis/lcp/lcp123.htm', 'Regime tributário unificado e tratamento favorecido a ME e EPP.'),
      d('LC da Reforma', 'IBS, CBS e Imposto Seletivo', 'Lei Complementar 214/2025', 'leis/lcp/lcp214.htm', 'Regulamenta a reforma tributária do consumo (EC 132/2023).'),
      d('PAF', 'Processo administrativo fiscal federal', 'Decreto 70.235/1972', 'decreto/d70235cons.htm', 'Determinação e exigência de créditos tributários da União.')
    ]
  },
  {
    id: 'fin', sig: 'FIN', nome: 'Direito Financeiro', ramo: 'pub', oab: 2,
    fac: ['Orçamento público', 'Receita e despesa', 'Responsabilidade fiscal'],
    temas: ['PPA, LDO e LOA', 'Princípios orçamentários', 'Receita e despesa pública', 'Crédito público', 'Precatórios', 'Tribunais de Contas'],
    dip: [
      d('Lei 4.320', 'Normas gerais de direito financeiro', 'Lei 4.320/1964', 'leis/l4320.htm', 'Elaboração e controle dos orçamentos; estágios da despesa.'),
      d('LRF', 'Lei de Responsabilidade Fiscal', 'Lei Complementar 101/2000', 'leis/lcp/lcp101.htm', 'Limites de despesa com pessoal, endividamento e transparência.'),
      d('Regime Fiscal', 'Regime fiscal sustentável', 'Lei Complementar 200/2023', 'leis/lcp/lcp200.htm', 'Regras de crescimento da despesa primária da União.')
    ]
  },
  {
    id: 'elei', sig: 'ELEI', nome: 'Direito Eleitoral', ramo: 'pub', oab: 2,
    fac: ['Direitos políticos', 'Justiça Eleitoral', 'Processo eleitoral'],
    temas: ['Direitos políticos', 'Elegibilidade e inelegibilidade', 'Partidos políticos', 'Propaganda', 'Ações eleitorais', 'Crimes eleitorais'],
    nota: 'O projeto de novo Código Eleitoral (PLP 112/2021) seguia em tramitação no Senado em meados de 2026. Confira antes de estudar por ele.',
    dip: [
      d('CE', 'Código Eleitoral', 'Lei 4.737/1965', 'leis/l4737compilado.htm', 'Organização da Justiça Eleitoral, alistamento, eleições e crimes eleitorais.'),
      d('Lei das Eleições', 'Normas para as eleições', 'Lei 9.504/1997', 'leis/l9504.htm', 'Registro, propaganda, financiamento e condutas vedadas (art. 73).'),
      d('Lei de Inelegibilidade', 'Inelegibilidades', 'Lei Complementar 64/1990', 'leis/lcp/lcp64.htm', 'Casos de inelegibilidade; alterada pela Lei da Ficha Limpa (LC 135/2010).'),
      d('LPP', 'Partidos políticos', 'Lei 9.096/1995', 'leis/l9096.htm', 'Criação, funcionamento e fundo partidário.')
    ]
  },
  {
    id: 'amb', sig: 'AMB', nome: 'Direito Ambiental', ramo: 'pub', oab: 2,
    fac: ['Princípios ambientais', 'Responsabilidade ambiental', 'Licenciamento'],
    temas: ['Princípios (prevenção, precaução, poluidor-pagador)', 'Tríplice responsabilização', 'Licenciamento', 'Áreas protegidas', 'Competências'],
    dip: [
      d('PNMA', 'Política Nacional do Meio Ambiente', 'Lei 6.938/1981', 'leis/l6938.htm', 'SISNAMA, instrumentos e responsabilidade civil objetiva (art. 14, § 1º).'),
      d('LCA', 'Crimes e infrações ambientais', 'Lei 9.605/1998', 'leis/l9605.htm', 'Sanções penais e administrativas; responsabilidade da pessoa jurídica (art. 3º).'),
      d('Código Florestal', 'Proteção da vegetação nativa', 'Lei 12.651/2012', '_ato2011-2014/2012/lei/l12651.htm', 'APP, reserva legal e Cadastro Ambiental Rural.'),
      d('SNUC', 'Unidades de conservação', 'Lei 9.985/2000', 'leis/l9985.htm', 'Unidades de proteção integral e de uso sustentável.'),
      d('PNRS', 'Resíduos sólidos', 'Lei 12.305/2010', '_ato2007-2010/2010/lei/l12305.htm', 'Responsabilidade compartilhada e logística reversa.'),
      d('Lei das Águas', 'Recursos hídricos', 'Lei 9.433/1997', 'leis/l9433.htm', 'Política Nacional de Recursos Hídricos e outorga de uso.'),
      d('LC 140', 'Competências ambientais comuns', 'Lei Complementar 140/2011', 'leis/lcp/lcp140.htm', 'Cooperação entre União, estados e municípios; competência para licenciar.')
    ]
  },
  {
    id: 'int', sig: 'INT', nome: 'Direito Internacional', ramo: 'pub', oab: 2,
    fac: ['Direito Internacional Público', 'Direito Internacional Privado'],
    temas: ['Fontes e tratados', 'Sujeitos de DIP', 'Nacionalidade', 'Condição do migrante', 'Conflito de leis no espaço', 'Tribunais internacionais'],
    dip: [
      d('CVDT', 'Convenção de Viena sobre o Direito dos Tratados', 'Decreto 7.030/2009', '_ato2007-2010/2009/decreto/d7030.htm', 'Celebração, interpretação e extinção de tratados; pacta sunt servanda (art. 26).'),
      d('Carta da ONU', 'Carta das Nações Unidas', 'Decreto 19.841/1945', 'decreto/1930-1949/d19841.htm', 'Propósitos, órgãos da ONU e Estatuto da Corte Internacional de Justiça.'),
      d('Lei de Migração', 'Direitos e deveres do migrante', 'Lei 13.445/2017', '_ato2015-2018/2017/lei/l13445.htm', 'Vistos, residência, deportação, expulsão e extradição.'),
      d('Lei do Refúgio', 'Estatuto dos refugiados', 'Lei 9.474/1997', 'leis/l9474.htm', 'Reconhecimento da condição de refugiado; CONARE.'),
      d('Estatuto de Roma', 'Tribunal Penal Internacional', 'Decreto 4.388/2002', 'decreto/2002/d4388.htm', 'Crimes de genocídio, contra a humanidade, de guerra e de agressão.')
    ]
  },
  {
    id: 'dh', sig: 'DH', nome: 'Direitos Humanos', ramo: 'pub', oab: 2,
    fac: ['Teoria geral dos direitos humanos', 'Sistemas global e interamericano'],
    temas: ['Características e gerações', 'Sistema global (ONU)', 'Sistema interamericano', 'Hierarquia dos tratados', 'Grupos vulneráveis'],
    dip: [
      d('CADH', 'Convenção Americana sobre Direitos Humanos (Pacto de São José)', 'Decreto 678/1992', 'decreto/d0678.htm', 'Direitos civis e políticos; Comissão e Corte Interamericanas.'),
      d('PIDCP', 'Pacto Internacional sobre Direitos Civis e Políticos', 'Decreto 592/1992', 'decreto/1990-1994/d0592.htm', 'Direitos de liberdade no sistema global.'),
      d('PIDESC', 'Pacto Internacional sobre Direitos Econômicos, Sociais e Culturais', 'Decreto 591/1992', 'decreto/1990-1994/d0591.htm', 'Direitos sociais, de realização progressiva.'),
      d('CDPD', 'Convenção sobre os Direitos das Pessoas com Deficiência', 'Decreto 6.949/2009', '_ato2007-2010/2009/decreto/d6949.htm', 'Aprovada pelo rito do art. 5º, § 3º: tem status de emenda constitucional.'),
      d('Conv. Racismo', 'Convenção Interamericana contra o Racismo', 'Decreto 10.932/2022', '_ato2019-2022/2022/decreto/d10932.htm', 'Também aprovada com status de emenda constitucional.'),
      d('CEDAW', 'Convenção sobre a Eliminação da Discriminação contra a Mulher', 'Decreto 4.377/2002', 'decreto/2002/d4377.htm', 'Igualdade de gênero no sistema global.'),
      d('Conv. Tortura', 'Convenção contra a Tortura', 'Decreto 40/1991', 'decreto/1990-1994/d0040.htm', 'Proibição absoluta da tortura no sistema global.')
    ]
  },
  {
    id: 'civ', sig: 'CIV', nome: 'Direito Civil', ramo: 'pri', oab: 6,
    fac: ['Parte Geral', 'Obrigações', 'Contratos', 'Responsabilidade Civil', 'Coisas', 'Família', 'Sucessões'],
    temas: ['Pessoas e capacidade', 'Negócio jurídico', 'Prescrição e decadência', 'Obrigações', 'Contratos', 'Responsabilidade civil', 'Posse e propriedade', 'Família e sucessões'],
    nota: 'A reforma do Código Civil (PL 4/2025) seguia em tramitação no Senado em meados de 2026. O texto em vigor é o da Lei 10.406/2002.',
    dip: [
      d('CC', 'Código Civil', 'Lei 10.406/2002', 'leis/2002/l10406compilada.htm', 'Lei geral das relações privadas.', [
        ['Parte Geral, Livro I: Das pessoas', 'arts. 1º a 78'],
        ['Parte Geral, Livro II: Dos bens', 'arts. 79 a 103'],
        ['Parte Geral, Livro III: Dos fatos jurídicos', 'arts. 104 a 232'],
        ['Parte Especial, Livro I: Obrigações', 'arts. 233 a 965'],
        ['Parte Especial, Livro II: Direito de empresa', 'arts. 966 a 1.195'],
        ['Parte Especial, Livro III: Coisas', 'arts. 1.196 a 1.510-E'],
        ['Parte Especial, Livro IV: Família', 'arts. 1.511 a 1.783-A'],
        ['Parte Especial, Livro V: Sucessões', 'arts. 1.784 a 2.027'],
        ['Livro Complementar: disposições finais e transitórias', 'arts. 2.028 a 2.046']
      ]),
      d('LINDB', 'Lei de Introdução às Normas do Direito Brasileiro', 'Decreto-Lei 4.657/1942', 'decreto-lei/del4657compilado.htm', 'Vigência, aplicação e interpretação das leis; direito internacional privado; segurança jurídica na Administração (arts. 20 a 30).'),
      d('Lei do Inquilinato', 'Locação de imóveis urbanos', 'Lei 8.245/1991', 'leis/l8245.htm', 'Locação residencial e não residencial; ação de despejo e renovatória.'),
      d('Lei de Condomínios', 'Condomínio em edificações e incorporações imobiliárias', 'Lei 4.591/1964', 'leis/l4591.htm', 'Incorporação imobiliária; o condomínio edilício hoje é regido principalmente pelo CC (arts. 1.331 a 1.358).'),
      d('LRP', 'Registros públicos', 'Lei 6.015/1973', 'leis/l6015compilada.htm', 'Registro civil, de títulos e documentos e de imóveis.'),
      d('Lei de Alimentos', 'Ação de alimentos', 'Lei 5.478/1968', 'leis/l5478.htm', 'Rito especial da ação de alimentos.'),
      d('Alimentos Gravídicos', 'Alimentos à gestante', 'Lei 11.804/2008', '_ato2007-2010/2008/lei/l11804.htm', 'Alimentos devidos durante a gravidez.'),
      d('Lei 9.514', 'Alienação fiduciária de imóveis', 'Lei 9.514/1997', 'leis/l9514.htm', 'Sistema de Financiamento Imobiliário e propriedade fiduciária.'),
      d('Lei 6.766', 'Parcelamento do solo urbano', 'Lei 6.766/1979', 'leis/l6766.htm', 'Loteamento e desmembramento.'),
      d('EPD', 'Estatuto da Pessoa com Deficiência', 'Lei 13.146/2015', '_ato2015-2018/2015/lei/l13146.htm', 'Lei Brasileira de Inclusão; alterou o regime das incapacidades do CC.'),
      d('Estatuto da Pessoa Idosa', 'Direitos da pessoa idosa', 'Lei 10.741/2003', 'leis/2003/l10.741.htm', 'Direitos de quem tem 60 anos ou mais.'),
      d('LGPD', 'Lei Geral de Proteção de Dados Pessoais', 'Lei 13.709/2018', '_ato2015-2018/2018/lei/l13709.htm', 'Tratamento de dados pessoais; bases legais; ANPD.'),
      d('MCI', 'Marco Civil da Internet', 'Lei 12.965/2014', '_ato2011-2014/2014/lei/l12965.htm', 'Princípios, direitos e deveres para o uso da internet.')
    ]
  },
  {
    id: 'emp', sig: 'EMP', nome: 'Direito Empresarial', ramo: 'pri', oab: 4,
    fac: ['Direito de Empresa', 'Direito Societário', 'Títulos de Crédito', 'Falência e Recuperação', 'Propriedade Intelectual'],
    temas: ['Empresário e estabelecimento', 'Sociedades', 'Títulos de crédito', 'Recuperação e falência', 'Propriedade industrial', 'Contratos empresariais'],
    dip: [
      d('LSA', 'Lei das Sociedades por Ações', 'Lei 6.404/1976', 'leis/l6404consol.htm', 'Companhias abertas e fechadas; ações, órgãos e acionistas.'),
      d('LRF', 'Recuperação judicial, extrajudicial e falência', 'Lei 11.101/2005', '_ato2004-2006/2005/lei/l11101.htm', 'Crise da empresa; classificação dos créditos (art. 83).'),
      d('LPI', 'Propriedade industrial', 'Lei 9.279/1996', 'leis/l9279.htm', 'Patentes, desenhos industriais, marcas e concorrência desleal.'),
      d('LDA', 'Direitos autorais', 'Lei 9.610/1998', 'leis/l9610.htm', 'Direitos morais e patrimoniais do autor.'),
      d('Lei do Software', 'Proteção de programa de computador', 'Lei 9.609/1998', 'leis/l9609.htm', 'Propriedade intelectual de software.'),
      d('Lei das Duplicatas', 'Duplicatas', 'Lei 5.474/1968', 'leis/l5474.htm', 'Título causal de compra e venda mercantil ou prestação de serviços.'),
      d('Lei do Cheque', 'Cheque', 'Lei 7.357/1985', 'leis/l7357.htm', 'Emissão, apresentação e prescrição do cheque.'),
      d('LUG', 'Lei Uniforme de Genebra (letra de câmbio e nota promissória)', 'Decreto 57.663/1966', 'decreto/antigos/d57663.htm', 'Regime cambiário: aceite, endosso, aval e protesto.'),
      d('Lei de Liberdade Econômica', 'Declaração de direitos de liberdade econômica', 'Lei 13.874/2019', '_ato2019-2022/2019/lei/l13874.htm', 'Livre iniciativa; alterou a desconsideração da personalidade jurídica (CC, art. 50).'),
      d('Lei Antitruste', 'Defesa da concorrência', 'Lei 12.529/2011', '_ato2011-2014/2011/lei/l12529.htm', 'Sistema Brasileiro de Defesa da Concorrência; CADE.'),
      d('Lei 8.934', 'Registro público de empresas', 'Lei 8.934/1994', 'leis/l8934.htm', 'Juntas comerciais e registro mercantil.')
    ]
  },
  {
    id: 'cdc', sig: 'CDC', nome: 'Direito do Consumidor', ramo: 'pri', oab: 2,
    fac: ['Relação de consumo', 'Responsabilidade do fornecedor', 'Práticas e cláusulas abusivas'],
    temas: ['Consumidor e fornecedor', 'Direitos básicos', 'Fato e vício', 'Oferta e publicidade', 'Cláusulas abusivas', 'Superendividamento', 'Tutela coletiva'],
    dip: [
      d('CDC', 'Código de Defesa do Consumidor', 'Lei 8.078/1990', 'leis/l8078compilado.htm', 'Proteção do consumidor: direito material, penal e processual.', [
        ['Título I: Direitos do consumidor', 'arts. 1º a 60'],
        ['Responsabilidade pelo fato e pelo vício', 'arts. 12 a 27'],
        ['Práticas comerciais', 'arts. 29 a 45'],
        ['Proteção contratual', 'arts. 46 a 54'],
        ['Superendividamento', 'arts. 54-A a 54-G'],
        ['Título II: Infrações penais', 'arts. 61 a 80'],
        ['Título III: Defesa do consumidor em juízo', 'arts. 81 a 104-C']
      ]),
      d('Decreto do SNDC', 'Sistema Nacional de Defesa do Consumidor', 'Decreto 2.181/1997', 'decreto/d2181.htm', 'Organização do SNDC e sanções administrativas.'),
      d('Cadastro Positivo', 'Bancos de dados de adimplemento', 'Lei 12.414/2011', '_ato2011-2014/2011/lei/l12414.htm', 'Formação de histórico de crédito.'),
      d('Decreto do E-commerce', 'Contratação no comércio eletrônico', 'Decreto 7.962/2013', '_ato2011-2014/2013/decreto/d7962.htm', 'Informação clara, atendimento e direito de arrependimento on-line.'),
      d('Decreto do SAC', 'Serviço de atendimento ao consumidor', 'Decreto 11.034/2022', '_ato2019-2022/2022/decreto/d11034.htm', 'Regras do SAC nos serviços regulados.')
    ]
  },
  {
    id: 'pen', sig: 'PEN', nome: 'Direito Penal', ramo: 'pen', oab: 6,
    fac: ['Teoria Geral do Crime', 'Teoria Geral da Pena', 'Crimes em Espécie', 'Legislação Penal Especial'],
    temas: ['Aplicação da lei penal', 'Teoria do crime', 'Concurso de pessoas', 'Penas e regimes', 'Extinção da punibilidade', 'Crimes em espécie', 'Leis penais especiais'],
    dip: [
      d('CP', 'Código Penal', 'Decreto-Lei 2.848/1940', 'decreto-lei/del2848compilado.htm', 'Parte Geral (teoria do crime e da pena) e Parte Especial (crimes).', [
        ['Parte Geral, Título I: Aplicação da lei penal', 'arts. 1º a 12'],
        ['Título II: Do crime', 'arts. 13 a 25'],
        ['Título III: Imputabilidade penal', 'arts. 26 a 28'],
        ['Título IV: Concurso de pessoas', 'arts. 29 a 31'],
        ['Título V: Das penas', 'arts. 32 a 95'],
        ['Título VI: Medidas de segurança', 'arts. 96 a 99'],
        ['Título VII: Ação penal', 'arts. 100 a 106'],
        ['Título VIII: Extinção da punibilidade', 'arts. 107 a 120'],
        ['Parte Especial: crimes contra a pessoa', 'arts. 121 a 154-B'],
        ['Crimes contra o patrimônio', 'arts. 155 a 183'],
        ['Crimes contra a dignidade sexual', 'arts. 213 a 234-B'],
        ['Crimes contra a fé pública', 'arts. 289 a 311-A'],
        ['Crimes contra a Administração Pública', 'arts. 312 a 359-H'],
        ['Crimes contra o Estado Democrático de Direito', 'arts. 359-I a 359-T']
      ]),
      d('LCP', 'Lei das Contravenções Penais', 'Decreto-Lei 3.688/1941', 'decreto-lei/del3688.htm', 'Infrações penais de menor gravidade.'),
      d('Lei de Drogas', 'Sistema Nacional de Políticas sobre Drogas', 'Lei 11.343/2006', '_ato2004-2006/2006/lei/l11343.htm', 'Porte para consumo (art. 28) e tráfico (art. 33).'),
      d('Lei Maria da Penha', 'Violência doméstica e familiar contra a mulher', 'Lei 11.340/2006', '_ato2004-2006/2006/lei/l11340.htm', 'Formas de violência e medidas protetivas de urgência.'),
      d('Lei dos Crimes Hediondos', 'Crimes hediondos', 'Lei 8.072/1990', 'leis/l8072.htm', 'Rol de crimes hediondos e regime mais severo.'),
      d('Lei de Tortura', 'Crimes de tortura', 'Lei 9.455/1997', 'leis/l9455.htm', 'Tipos de tortura; crime equiparado a hediondo.'),
      d('Lei de Abuso de Autoridade', 'Crimes de abuso de autoridade', 'Lei 13.869/2019', '_ato2019-2022/2019/lei/l13869.htm', 'Exige finalidade específica de prejudicar ou beneficiar (art. 1º, § 1º).'),
      d('Lei das Organizações Criminosas', 'Organização criminosa', 'Lei 12.850/2013', '_ato2011-2014/2013/lei/l12850.htm', 'Conceito, colaboração premiada e meios de obtenção de prova.'),
      d('Lei de Lavagem', 'Lavagem de dinheiro', 'Lei 9.613/1998', 'leis/l9613.htm', 'Ocultação de bens, direitos e valores; COAF.'),
      d('Estatuto do Desarmamento', 'Armas de fogo', 'Lei 10.826/2003', 'leis/2003/l10.826.htm', 'Posse, porte e crimes relacionados a armas.'),
      d('Lei 8.137', 'Crimes contra a ordem tributária e as relações de consumo', 'Lei 8.137/1990', 'leis/l8137.htm', 'Sonegação fiscal; ver Súmula Vinculante 24.'),
      d('Lei do Racismo', 'Crimes de preconceito de raça ou cor', 'Lei 7.716/1989', 'leis/l7716.htm', 'Racismo e injúria racial (após a Lei 14.532/2023).'),
      d('CTB', 'Código de Trânsito Brasileiro', 'Lei 9.503/1997', 'leis/l9503compilado.htm', 'Crimes de trânsito nos arts. 291 a 312-B.')
    ]
  },
  {
    id: 'pc', sig: 'PC', nome: 'Direito Processual Civil', ramo: 'proc', oab: 6,
    fac: ['Teoria Geral do Processo', 'Processo de Conhecimento', 'Recursos', 'Execução', 'Procedimentos Especiais'],
    temas: ['Normas fundamentais', 'Competência', 'Sujeitos do processo', 'Tutela provisória', 'Procedimento comum', 'Provas', 'Sentença e coisa julgada', 'Recursos', 'Execução'],
    dip: [
      d('CPC', 'Código de Processo Civil', 'Lei 13.105/2015', '_ato2015-2018/2015/lei/l13105.htm', 'Lei geral do processo civil; aplica-se de forma supletiva e subsidiária a outros processos (art. 15).', [
        ['Parte Geral, Livro I: Normas processuais civis', 'arts. 1º a 15'],
        ['Livro II: Função jurisdicional', 'arts. 16 a 69'],
        ['Livro III: Sujeitos do processo', 'arts. 70 a 187'],
        ['Livro IV: Atos processuais', 'arts. 188 a 293'],
        ['Livro V: Tutela provisória', 'arts. 294 a 311'],
        ['Livro VI: Formação, suspensão e extinção do processo', 'arts. 312 a 317'],
        ['Parte Especial, Livro I: Conhecimento e cumprimento de sentença', 'arts. 318 a 770'],
        ['Livro II: Processo de execução', 'arts. 771 a 925'],
        ['Livro III: Processos nos tribunais e recursos', 'arts. 926 a 1.044'],
        ['Livro Complementar: disposições finais', 'arts. 1.045 a 1.072']
      ]),
      d('Lei dos Juizados', 'Juizados Especiais Cíveis e Criminais', 'Lei 9.099/1995', 'leis/l9099.htm', 'Causas cíveis até 40 salários mínimos; a parte criminal está nos arts. 60 a 92.'),
      d('JEF', 'Juizados Especiais Federais', 'Lei 10.259/2001', 'leis/leis_2001/l10259.htm', 'Causas federais até 60 salários mínimos.'),
      d('JEFP', 'Juizados Especiais da Fazenda Pública', 'Lei 12.153/2009', '_ato2007-2010/2009/lei/l12153.htm', 'Causas contra estados e municípios até 60 salários mínimos.'),
      d('LACP', 'Ação civil pública', 'Lei 7.347/1985', 'leis/l7347orig.htm', 'Tutela de direitos difusos e coletivos; inquérito civil e TAC.'),
      d('Lei de Arbitragem', 'Arbitragem', 'Lei 9.307/1996', 'leis/l9307.htm', 'Convenção de arbitragem e sentença arbitral.'),
      d('Lei de Mediação', 'Mediação', 'Lei 13.140/2015', '_ato2015-2018/2015/lei/l13140.htm', 'Mediação entre particulares e autocomposição na Administração.'),
      d('Lei do Processo Eletrônico', 'Informatização do processo judicial', 'Lei 11.419/2006', '_ato2004-2006/2006/lei/l11419.htm', 'Atos processuais por meio eletrônico.'),
      d('Lei 8.009', 'Impenhorabilidade do bem de família', 'Lei 8.009/1990', 'leis/l8009.htm', 'Proteção do imóvel residencial e suas exceções (art. 3º).')
    ]
  },
  {
    id: 'pp', sig: 'PP', nome: 'Direito Processual Penal', ramo: 'proc', oab: 6,
    fac: ['Inquérito e ação penal', 'Competência e provas', 'Prisões e medidas cautelares', 'Procedimentos e recursos', 'Execução penal'],
    temas: ['Inquérito policial', 'Ação penal', 'Competência', 'Provas', 'Prisão e liberdade', 'Procedimentos', 'Júri', 'Nulidades e recursos', 'Execução penal'],
    dip: [
      d('CPP', 'Código de Processo Penal', 'Decreto-Lei 3.689/1941', 'decreto-lei/del3689.htm', 'Lei geral do processo penal.', [
        ['Livro I: Do processo em geral', 'arts. 1º a 393'],
        ['Inquérito policial', 'arts. 4º a 23'],
        ['Ação penal', 'arts. 24 a 62'],
        ['Competência', 'arts. 69 a 91'],
        ['Prova', 'arts. 155 a 250'],
        ['Prisão, medidas cautelares e liberdade provisória', 'arts. 282 a 350'],
        ['Livro II: Dos processos em espécie', 'arts. 394 a 562'],
        ['Livro III: Nulidades e recursos', 'arts. 563 a 667'],
        ['Livro IV: Da execução (em grande parte substituído pela LEP)', 'arts. 668 a 779']
      ]),
      d('LEP', 'Lei de Execução Penal', 'Lei 7.210/1984', 'leis/l7210.htm', 'Cumprimento da pena: regimes, progressão, remição, direitos e deveres do preso.'),
      d('Lei de Interceptação', 'Interceptação telefônica', 'Lei 9.296/1996', 'leis/l9296.htm', 'Regulamenta o art. 5º, XII, da CF.'),
      d('Lei da Prisão Temporária', 'Prisão temporária', 'Lei 7.960/1989', 'leis/l7960.htm', 'Hipóteses e prazo de 5 dias, prorrogável.'),
      d('Lei 12.037', 'Identificação criminal', 'Lei 12.037/2009', '_ato2007-2010/2009/lei/l12037.htm', 'Identificação criminal do civilmente identificado.'),
      d('Lei 9.807', 'Proteção a vítimas e testemunhas', 'Lei 9.807/1999', 'leis/l9807.htm', 'Programas de proteção e réu colaborador.'),
      d('Lei 8.038', 'Processos nos tribunais superiores', 'Lei 8.038/1990', 'leis/l8038.htm', 'Ação penal originária no STF e no STJ.')
    ]
  },
  {
    id: 'pt', sig: 'PT', nome: 'Direito Processual do Trabalho', ramo: 'proc', oab: 5,
    fac: ['Organização da Justiça do Trabalho', 'Dissídio individual', 'Recursos trabalhistas', 'Execução trabalhista'],
    temas: ['Competência (CF, art. 114)', 'Reclamação trabalhista', 'Audiência', 'Provas', 'Recursos', 'Execução'],
    semLei: 'O processo do trabalho está, em sua maior parte, dentro da CLT (arts. 643 a 910), que mora em Direito do Trabalho. Aqui ficam só as leis processuais avulsas.',
    dip: [
      d('Lei 5.584', 'Normas de direito processual do trabalho', 'Lei 5.584/1970', 'leis/l5584.htm', 'Dissídios de alçada e assistência judiciária pelo sindicato.'),
      d('Lei 7.701', 'Especialização de turmas dos tribunais do trabalho', 'Lei 7.701/1988', 'leis/l7701.htm', 'Competência das seções do TST em dissídios individuais e coletivos.'),
      d('DL 779', 'Prerrogativas processuais da Fazenda Pública', 'Decreto-Lei 779/1969', 'decreto-lei/del0779.htm', 'Prazos e privilégios dos entes públicos no processo do trabalho.')
    ]
  },
  {
    id: 'trab', sig: 'TRAB', nome: 'Direito do Trabalho', ramo: 'soc', oab: 5,
    fac: ['Direito Individual do Trabalho', 'Direito Coletivo do Trabalho'],
    temas: ['Relação de emprego', 'Contrato de trabalho', 'Jornada', 'Remuneração', 'Férias e 13º', 'Extinção do contrato', 'Estabilidades', 'Direito coletivo'],
    dip: [
      d('CLT', 'Consolidação das Leis do Trabalho', 'Decreto-Lei 5.452/1943', 'decreto-lei/del5452.htm', 'Direito material e processual do trabalho em um só diploma.', [
        ['Título I: Introdução', 'arts. 1º a 12'],
        ['Título II: Normas gerais de tutela do trabalho', 'arts. 13 a 223'],
        ['Título II-A: Dano extrapatrimonial', 'arts. 223-A a 223-G'],
        ['Título III: Normas especiais de tutela', 'arts. 224 a 441'],
        ['Título IV: Contrato individual do trabalho', 'arts. 442 a 510'],
        ['Título V: Organização sindical', 'arts. 511 a 610'],
        ['Título VI: Convenções coletivas', 'arts. 611 a 625'],
        ['Título VIII: Justiça do Trabalho', 'arts. 643 a 735'],
        ['Título X: Processo judiciário do trabalho', 'arts. 763 a 910']
      ]),
      d('Lei de Greve', 'Direito de greve', 'Lei 7.783/1989', 'leis/l7783.htm', 'Exercício do direito de greve e serviços essenciais.'),
      d('Lei 6.019', 'Trabalho temporário e terceirização', 'Lei 6.019/1974', 'leis/l6019.htm', 'Terceirização de qualquer atividade (após a Lei 13.429/2017).'),
      d('LC dos Domésticos', 'Contrato de trabalho doméstico', 'Lei Complementar 150/2015', 'leis/lcp/lcp150.htm', 'Direitos do empregado doméstico.'),
      d('Lei do Trabalho Rural', 'Trabalho rural', 'Lei 5.889/1973', 'leis/l5889.htm', 'Normas reguladoras do trabalho rural.'),
      d('Lei do FGTS', 'Fundo de Garantia do Tempo de Serviço', 'Lei 8.036/1990', 'leis/l8036consol.htm', 'Depósitos, saque e multa de 40%.'),
      d('Lei do Estágio', 'Estágio de estudantes', 'Lei 11.788/2008', '_ato2007-2010/2008/lei/l11788.htm', 'Requisitos do estágio; não gera vínculo de emprego se observados.'),
      d('Lei do RSR', 'Repouso semanal remunerado', 'Lei 605/1949', 'leis/l0605.htm', 'Descanso semanal e feriados.'),
      d('Lei do 13º', 'Gratificação de Natal', 'Lei 4.090/1962', 'leis/l4090.htm', 'Institui o décimo terceiro salário.')
    ]
  },
  {
    id: 'prev', sig: 'PREV', nome: 'Direito Previdenciário', ramo: 'soc', oab: 2,
    fac: ['Seguridade social', 'Custeio', 'Benefícios'],
    temas: ['Seguridade social', 'Segurados e dependentes', 'Carência', 'Benefícios em espécie', 'Custeio', 'Reforma de 2019 (EC 103)'],
    dip: [
      d('PBPS', 'Planos de Benefícios da Previdência Social', 'Lei 8.213/1991', 'leis/l8213cons.htm', 'Segurados, dependentes e benefícios do RGPS.'),
      d('PCSS', 'Plano de Custeio da Seguridade Social', 'Lei 8.212/1991', 'leis/l8212cons.htm', 'Contribuições previdenciárias e financiamento.'),
      d('RPS', 'Regulamento da Previdência Social', 'Decreto 3.048/1999', 'decreto/d3048.htm', 'Regulamenta as Leis 8.212 e 8.213.'),
      d('LOAS', 'Organização da Assistência Social', 'Lei 8.742/1993', 'leis/l8742.htm', 'Benefício de prestação continuada (art. 20).'),
      d('LC 109', 'Previdência complementar', 'Lei Complementar 109/2001', 'leis/lcp/lcp109.htm', 'Entidades abertas e fechadas de previdência privada.')
    ]
  },
  {
    id: 'eca', sig: 'ECA', nome: 'Direito da Criança e do Adolescente', ramo: 'soc', oab: 2,
    fac: ['Doutrina da proteção integral', 'Medidas de proteção e socioeducativas'],
    temas: ['Proteção integral', 'Direitos fundamentais', 'Família substituta', 'Ato infracional', 'Medidas socioeducativas', 'Conselho Tutelar', 'Crimes contra a criança'],
    dip: [
      d('ECA', 'Estatuto da Criança e do Adolescente', 'Lei 8.069/1990', 'leis/l8069.htm', 'Proteção integral de crianças e adolescentes.', [
        ['Livro I, Parte Geral: direitos fundamentais e prevenção', 'arts. 1º a 85'],
        ['Família substituta: guarda, tutela e adoção', 'arts. 28 a 52-D'],
        ['Livro II, Parte Especial: política de atendimento', 'arts. 86 a 97'],
        ['Medidas de proteção', 'arts. 98 a 102'],
        ['Prática de ato infracional e medidas socioeducativas', 'arts. 103 a 128'],
        ['Conselho Tutelar', 'arts. 131 a 140'],
        ['Acesso à Justiça', 'arts. 141 a 224'],
        ['Crimes e infrações administrativas', 'arts. 225 a 258-C']
      ]),
      d('SINASE', 'Sistema Nacional de Atendimento Socioeducativo', 'Lei 12.594/2012', '_ato2011-2014/2012/lei/l12594.htm', 'Execução das medidas socioeducativas.'),
      d('Marco da Primeira Infância', 'Políticas para a primeira infância', 'Lei 13.257/2016', '_ato2015-2018/2016/lei/l13257.htm', 'Proteção dos primeiros seis anos de vida.'),
      d('Lei da Escuta Protegida', 'Escuta especializada e depoimento especial', 'Lei 13.431/2017', '_ato2015-2018/2017/lei/l13431.htm', 'Garantias da criança vítima ou testemunha de violência.'),
      d('Lei Henry Borel', 'Violência doméstica contra a criança e o adolescente', 'Lei 14.344/2022', '_ato2019-2022/2022/lei/l14344.htm', 'Medidas protetivas e mecanismos de prevenção.'),
      d('CDC/ONU', 'Convenção sobre os Direitos da Criança', 'Decreto 99.710/1990', 'decreto/1990-1994/d99710.htm', 'Tratado da ONU que inspira a proteção integral.')
    ]
  },
  {
    id: 'oab', sig: 'OAB', nome: 'Ética Profissional', ramo: 'base', oab: 8,
    fac: ['Deontologia jurídica', 'Estatuto da Advocacia'],
    temas: ['Atividade de advocacia', 'Prerrogativas', 'Inscrição', 'Sociedade de advogados', 'Honorários', 'Incompatibilidades e impedimentos', 'Infrações e sanções', 'Publicidade'],
    dip: [
      d('EAOAB', 'Estatuto da Advocacia e da OAB', 'Lei 8.906/1994', 'leis/l8906.htm', 'Atividade, direitos, inscrição, honorários, infrações e estrutura da OAB.'),
      d('CED', 'Código de Ética e Disciplina da OAB', 'Resolução CFOAB 02/2015', OABSITE, 'Deveres éticos, relação com o cliente, sigilo e publicidade.'),
      d('RGEAOAB', 'Regulamento Geral do Estatuto da Advocacia', 'Regulamento Geral (CFOAB, 1994)', OABSITE, 'Detalha o Estatuto: inscrição, sociedades, eleições.'),
      d('Prov. 205', 'Publicidade e informação da advocacia', 'Provimento CFOAB 205/2021', OABSITE, 'Marketing jurídico e uso de redes sociais.')
    ]
  },
  {
    id: 'fil', sig: 'FIL', nome: 'Fundamentos do Direito', ramo: 'base', oab: 2,
    fac: ['Introdução ao Estudo do Direito', 'Filosofia do Direito', 'Ciência Política e Teoria do Estado', 'Sociologia Jurídica', 'História do Direito', 'Hermenêutica'],
    temas: ['Norma e ordenamento', 'Fontes do direito', 'Jusnaturalismo e positivismo', 'Justiça (Aristóteles, Kant, Rawls)', 'Kelsen, Hart, Dworkin, Alexy', 'Interpretação e integração', 'Estado e poder'],
    semLei: 'Esta área se estuda por doutrina. Na OAB ela aparece como Filosofia do Direito. A lei que mais dialoga com ela, a LINDB, mora em Direito Civil.',
    dip: []
  }
];

/* Conexões: a, b, o que liga, por onde (normas-ponte) */
const EDGES = [
  { a: 'cf', b: 'adm', t: 'A Constituição fixa os princípios da Administração, o regime dos servidores e a responsabilidade do Estado.', n: 'CF, arts. 37 a 41' },
  { a: 'cf', b: 'trib', t: 'O sistema tributário nasce na Constituição: competências, espécies e limitações ao poder de tributar.', n: 'CF, arts. 145 a 162' },
  { a: 'cf', b: 'fin', t: 'Finanças públicas e orçamento têm capítulo próprio na Constituição.', n: 'CF, arts. 163 a 169' },
  { a: 'cf', b: 'elei', t: 'Direitos políticos, elegibilidade e partidos são matéria constitucional.', n: 'CF, arts. 14 a 17' },
  { a: 'cf', b: 'amb', t: 'O meio ambiente equilibrado é direito de todos; a Constituição prevê a tríplice responsabilização.', n: 'CF, art. 225' },
  { a: 'cf', b: 'int', t: 'Princípios das relações internacionais, nacionalidade e o caminho de incorporação dos tratados.', n: 'CF, arts. 4º, 12, 49, I, e 84, VIII' },
  { a: 'cf', b: 'dh', t: 'Tratados de direitos humanos podem ter status de emenda; os demais são supralegais.', n: 'CF, art. 5º, §§ 2º e 3º; STF, RE 466.343' },
  { a: 'cf', b: 'civ', t: 'Constitucionalização do direito civil: propriedade e sua função social, intimidade, família.', n: 'CF, arts. 5º, X, XXII e XXIII, e 226' },
  { a: 'cf', b: 'emp', t: 'A ordem econômica se funda na livre iniciativa e dá tratamento favorecido às pequenas empresas.', n: 'CF, arts. 170 e 179' },
  { a: 'cf', b: 'cdc', t: 'A defesa do consumidor é direito fundamental e princípio da ordem econômica.', n: 'CF, arts. 5º, XXXII, e 170, V; ADCT, art. 48' },
  { a: 'cf', b: 'pen', t: 'Legalidade, irretroatividade, individualização e limites das penas.', n: 'CF, art. 5º, XXXIX, XL e XLV a XLVII' },
  { a: 'cf', b: 'pc', t: 'Acesso à justiça, devido processo, contraditório e duração razoável; organização do Judiciário.', n: 'CF, arts. 5º, XXXV, LIV, LV e LXXVIII, e 92 a 126; CPC, art. 1º' },
  { a: 'cf', b: 'pp', t: 'Presunção de inocência, juiz natural, júri, regras de prisão e habeas corpus.', n: 'CF, art. 5º, XXXVIII, LIII, LVII e LXI a LXVIII' },
  { a: 'cf', b: 'pt', t: 'A competência da Justiça do Trabalho está na Constituição.', n: 'CF, arts. 111 a 116' },
  { a: 'cf', b: 'trab', t: 'Os direitos sociais dos trabalhadores e a liberdade sindical são constitucionais.', n: 'CF, arts. 7º a 11' },
  { a: 'cf', b: 'prev', t: 'Seguridade social, RGPS e regime próprio dos servidores.', n: 'CF, arts. 40, 194, 195, 201 e 202' },
  { a: 'cf', b: 'eca', t: 'Prioridade absoluta à criança e inimputabilidade penal dos menores de 18 anos.', n: 'CF, arts. 227 e 228' },
  { a: 'cf', b: 'oab', t: 'O advogado é indispensável à administração da justiça.', n: 'CF, art. 133' },
  { a: 'cf', b: 'fil', t: 'Poder constituinte, Estado de Direito e separação de poderes vêm da Teoria do Estado.', n: 'CF, arts. 1º e 2º' },

  { a: 'civ', b: 'emp', t: 'O Direito de Empresa está dentro do Código Civil: empresário, sociedades, estabelecimento. Os títulos de crédito também têm regras gerais ali.', n: 'CC, arts. 966 a 1.195 e 887 a 926' },
  { a: 'civ', b: 'cdc', t: 'Diálogo das fontes: o CDC não exclui direitos previstos em outras leis. Compare a responsabilidade civil nos dois diplomas.', n: 'CDC, arts. 7º e 12 a 14; CC, art. 927' },
  { a: 'civ', b: 'pc', t: 'O direito material pede o instrumento: prescrição, provas, ações de família e usucapião cruzam os dois códigos.', n: 'CC, arts. 189 a 232; CPC, arts. 373 e 693 a 699' },
  { a: 'civ', b: 'trab', t: 'O direito comum é fonte subsidiária do direito do trabalho.', n: 'CLT, art. 8º, § 1º; CC, arts. 593 a 609' },
  { a: 'civ', b: 'trib', t: 'A lei tributária não pode alterar conceitos de direito privado usados pela Constituição para definir competências.', n: 'CTN, arts. 109 e 110' },
  { a: 'civ', b: 'eca', t: 'Poder familiar está no CC; a adoção de crianças e adolescentes segue o ECA.', n: 'CC, arts. 1.618 e 1.630 a 1.638; ECA, arts. 39 a 52-D' },
  { a: 'civ', b: 'int', t: 'O direito internacional privado brasileiro está na LINDB: lei aplicável, competência e sentença estrangeira.', n: 'LINDB, arts. 7º a 19' },
  { a: 'civ', b: 'fil', t: 'Vigência, lacunas e interpretação das leis: a teoria geral do direito positivada.', n: 'LINDB, arts. 1º a 6º' },
  { a: 'civ', b: 'adm', t: 'A LINDB traz regras de segurança jurídica para decisões públicas; o Estado responde civilmente por seus agentes.', n: 'LINDB, arts. 20 a 30; CF, art. 37, § 6º; CC, art. 43' },
  { a: 'civ', b: 'amb', t: 'A propriedade deve respeitar sua função socioambiental; o dano ambiental gera responsabilidade objetiva.', n: 'CC, art. 1.228, § 1º; Lei 6.938/1981, art. 14, § 1º' },

  { a: 'emp', b: 'cdc', t: 'Duas teorias da desconsideração da personalidade jurídica: a maior (CC) e a menor (CDC).', n: 'CC, art. 50; CDC, art. 28' },
  { a: 'emp', b: 'trib', t: 'Simples Nacional, sucessão empresarial e responsabilidade de sócios e administradores.', n: 'LC 123/2006; CTN, arts. 133 e 135' },
  { a: 'emp', b: 'trab', t: 'Grupo econômico, sucessão de empregadores e o crédito trabalhista na falência.', n: 'CLT, arts. 2º, § 2º, 10 e 448-A; Lei 11.101/2005, art. 83, I' },
  { a: 'emp', b: 'adm', t: 'Estatais, lei anticorrupção e preferência de ME e EPP nas licitações.', n: 'Lei 13.303/2016; Lei 12.846/2013; LC 123/2006, arts. 42 a 49' },
  { a: 'emp', b: 'pen', t: 'Crimes falimentares e crimes contra a propriedade industrial.', n: 'Lei 11.101/2005, arts. 168 a 178; Lei 9.279/1996, arts. 183 a 195' },

  { a: 'pen', b: 'pp', t: 'O direito penal só se realiza pelo processo: a ação penal é tratada nos dois códigos, e a pena se cumpre conforme a LEP.', n: 'CP, arts. 100 a 106; CPP, arts. 24 a 62; LEP' },
  { a: 'pen', b: 'eca', t: 'Menor de 18 anos não comete crime, e sim ato infracional. O ECA também tipifica crimes contra crianças.', n: 'CP, art. 27; ECA, arts. 103 e 225 a 244-C' },
  { a: 'pen', b: 'trib', t: 'Crimes contra a ordem tributária dependem do lançamento definitivo do tributo.', n: 'Lei 8.137/1990, art. 1º; Súmula Vinculante 24' },
  { a: 'pen', b: 'amb', t: 'Crimes ambientais admitem a responsabilização penal da pessoa jurídica.', n: 'Lei 9.605/1998, art. 3º; CF, art. 225, § 3º' },
  { a: 'pen', b: 'adm', t: 'Crimes contra a Administração e improbidade correm em instâncias independentes.', n: 'CP, arts. 312 a 359-H; Lei 8.429/1992' },
  { a: 'pen', b: 'cdc', t: 'O CDC tem um título só de infrações penais.', n: 'CDC, arts. 61 a 80' },
  { a: 'pen', b: 'elei', t: 'Os crimes eleitorais estão no Código Eleitoral e são julgados pela Justiça Eleitoral.', n: 'Código Eleitoral, arts. 289 a 354-A' },
  { a: 'pen', b: 'dh', t: 'A tortura é vedada por tratado e punida por lei própria.', n: 'Decreto 40/1991; Lei 9.455/1997; CF, art. 5º, III e XLIII' },
  { a: 'pen', b: 'int', t: 'Extraterritorialidade da lei penal, extradição e Tribunal Penal Internacional.', n: 'CP, art. 7º; Lei 13.445/2017, arts. 81 a 99; Decreto 4.388/2002' },

  { a: 'pp', b: 'pc', t: 'O processo penal admite interpretação extensiva e analogia; os Juizados Criminais estão na mesma lei dos cíveis.', n: 'CPP, art. 3º; Lei 9.099/1995, arts. 60 a 92' },
  { a: 'pp', b: 'oab', t: 'Prerrogativas do advogado no inquérito e no processo: acesso aos autos e comunicação com o preso.', n: 'EAOAB, art. 7º; Súmula Vinculante 14' },
  { a: 'pc', b: 'pt', t: 'O CPC se aplica ao processo do trabalho nas omissões e no que for compatível.', n: 'CLT, art. 769; CPC, art. 15' },
  { a: 'trab', b: 'pt', t: 'A CLT reúne direito material e processo. Os títulos VIII a X são o processo do trabalho.', n: 'CLT, arts. 643 a 910' },
  { a: 'pt', b: 'trib', t: 'A execução trabalhista usa a Lei de Execução Fiscal de forma subsidiária.', n: 'CLT, art. 889' },
  { a: 'pc', b: 'trib', t: 'A execução fiscal segue a LEF e, no que faltar, o CPC. A CDA é título executivo extrajudicial.', n: 'Lei 6.830/1980, art. 1º; CPC, art. 784, IX; Súmula 393 do STJ' },
  { a: 'pc', b: 'adm', t: 'Fazenda Pública em juízo: prazos em dobro, remessa necessária e execução por precatório.', n: 'CPC, arts. 183, 496, 534, 535 e 910' },
  { a: 'pc', b: 'cdc', t: 'Microssistema de tutela coletiva (CDC e LACP) e inversão do ônus da prova.', n: 'CDC, arts. 6º, VIII, e 81 a 104; Lei 7.347/1985, art. 21' },
  { a: 'pc', b: 'oab', t: 'Deveres das partes e dos procuradores, litigância de má-fé e honorários.', n: 'CPC, arts. 77 a 81, 85 e 103 a 107; EAOAB, arts. 22 a 26' },
  { a: 'pc', b: 'eca', t: 'O ECA tem regras próprias de acesso à Justiça e usa o CPC de forma subsidiária.', n: 'ECA, arts. 141 a 152' },

  { a: 'adm', b: 'trib', t: 'O lançamento é atividade administrativa vinculada; o poder de polícia é fato gerador de taxa.', n: 'CTN, arts. 3º, 78 e 142' },
  { a: 'adm', b: 'fin', t: 'Toda despesa pública passa pelo orçamento e pelos limites da responsabilidade fiscal.', n: 'LC 101/2000, arts. 15 a 17; Lei 4.320/1964, arts. 58 a 64' },
  { a: 'adm', b: 'amb', t: 'Licenciamento e fiscalização ambiental são exercício do poder de polícia.', n: 'LC 140/2011; Lei 9.605/1998, arts. 70 a 76' },
  { a: 'adm', b: 'prev', t: 'Servidores titulares de cargo efetivo têm regime próprio de previdência.', n: 'CF, art. 40; Lei 8.112/1990, arts. 183 a 231' },
  { a: 'adm', b: 'elei', t: 'Condenação por improbidade pode gerar inelegibilidade; agentes públicos têm condutas vedadas em campanha.', n: 'LC 64/1990, art. 1º, I, l; Lei 9.504/1997, art. 73' },
  { a: 'trib', b: 'fin', t: 'O tributo é a principal receita pública derivada.', n: 'Lei 4.320/1964, art. 9º; CTN, art. 3º' },
  { a: 'trib', b: 'prev', t: 'As contribuições para a seguridade social têm natureza tributária.', n: 'CF, art. 195; Lei 8.212/1991' },
  { a: 'trib', b: 'int', t: 'Tratados internacionais em matéria tributária prevalecem sobre a legislação interna.', n: 'CTN, art. 98' },
  { a: 'trab', b: 'prev', t: 'Acidente do trabalho gera benefício previdenciário e estabilidade no emprego.', n: 'Lei 8.213/1991, arts. 19 a 23 e 118' },
  { a: 'dh', b: 'int', t: 'Os direitos humanos se internacionalizam por tratados e cortes internacionais.', n: 'Decreto 7.030/2009; Decreto 678/1992, arts. 33 a 69' },
  { a: 'dh', b: 'eca', t: 'A proteção integral vem da Convenção da ONU sobre os Direitos da Criança.', n: 'Decreto 99.710/1990; ECA, art. 1º' },
  { a: 'dh', b: 'fil', t: 'A dignidade da pessoa humana e o debate entre direito natural e direito positivo fundamentam os direitos humanos.', n: 'CF, art. 1º, III' },
  { a: 'oab', b: 'pen', t: 'Violar prerrogativa do advogado é crime; trair o cliente em juízo também.', n: 'EAOAB, art. 7º-B; CP, art. 355' },
  { a: 'oab', b: 'fil', t: 'A ética profissional é a deontologia aplicada à advocacia.', n: 'CED, arts. 1º e 2º' }
];

/* Peso na 2ª fase da OAB */
const OAB2 = ['adm', 'civ', 'cf', 'emp', 'pen', 'trab', 'trib'];

const FLASH = [
  { a: 'cf', q: 'Quais são os fundamentos da República Federativa do Brasil?', r: 'Soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa e pluralismo político.', f: 'CF, art. 1º, I a V' },
  { a: 'cf', q: 'O que não pode ser abolido por emenda constitucional?', r: 'A forma federativa de Estado; o voto direto, secreto, universal e periódico; a separação dos Poderes; os direitos e garantias individuais.', f: 'CF, art. 60, § 4º' },
  { a: 'cf', q: 'Quem pode propor ADI no STF?', r: 'Presidente da República; Mesas do Senado, da Câmara e de Assembleia Legislativa; Governador; Procurador-Geral da República; Conselho Federal da OAB; partido com representação no Congresso; confederação sindical ou entidade de classe de âmbito nacional.', f: 'CF, art. 103' },
  { a: 'adm', q: 'Quais são os princípios expressos da Administração Pública?', r: 'Legalidade, impessoalidade, moralidade, publicidade e eficiência.', f: 'CF, art. 37, caput' },
  { a: 'adm', q: 'Como o Estado responde por danos causados por seus agentes?', r: 'De forma objetiva (teoria do risco administrativo), com direito de regresso contra o agente em caso de dolo ou culpa.', f: 'CF, art. 37, § 6º' },
  { a: 'adm', q: 'Quais são as modalidades de licitação da Lei 14.133/2021?', r: 'Pregão, concorrência, concurso, leilão e diálogo competitivo.', f: 'Lei 14.133/2021, art. 28' },
  { a: 'trib', q: 'O que é tributo?', r: 'Prestação pecuniária compulsória, em moeda, que não constitua sanção de ato ilícito, instituída em lei e cobrada mediante atividade administrativa plenamente vinculada.', f: 'CTN, art. 3º' },
  { a: 'trib', q: 'O que suspende a exigibilidade do crédito tributário?', r: 'Moratória; depósito do montante integral; reclamações e recursos administrativos; liminar em mandado de segurança; liminar ou tutela antecipada em outras ações; parcelamento.', f: 'CTN, art. 151' },
  { a: 'trib', q: 'Em quanto tempo prescreve a ação de cobrança do crédito tributário?', r: 'Em cinco anos, contados da constituição definitiva do crédito.', f: 'CTN, art. 174' },
  { a: 'civ', q: 'Quem é absolutamente incapaz?', r: 'Somente os menores de 16 anos.', f: 'CC, art. 3º' },
  { a: 'civ', q: 'Quais são os requisitos de validade do negócio jurídico?', r: 'Agente capaz; objeto lícito, possível, determinado ou determinável; forma prescrita ou não defesa em lei.', f: 'CC, art. 104' },
  { a: 'civ', q: 'A solidariedade entre devedores se presume?', r: 'Não. Ela resulta da lei ou da vontade das partes.', f: 'CC, art. 265' },
  { a: 'civ', q: 'Qual é o prazo geral de prescrição? E o da reparação civil?', r: 'Dez anos quando a lei não fixar prazo menor; três anos para a pretensão de reparação civil.', f: 'CC, arts. 205 e 206, § 3º, V' },
  { a: 'emp', q: 'Quem é empresário?', r: 'Quem exerce profissionalmente atividade econômica organizada para a produção ou a circulação de bens ou de serviços.', f: 'CC, art. 966' },
  { a: 'emp', q: 'Há quanto tempo o devedor deve exercer a atividade para pedir recuperação judicial?', r: 'Há mais de dois anos, de forma regular, além dos demais requisitos legais.', f: 'Lei 11.101/2005, art. 48' },
  { a: 'cdc', q: 'Quais são os prazos para reclamar de vícios aparentes?', r: 'Trinta dias para produtos e serviços não duráveis; noventa dias para os duráveis.', f: 'CDC, art. 26' },
  { a: 'cdc', q: 'Em quanto tempo prescreve a reparação por fato do produto ou do serviço?', r: 'Em cinco anos, contados do conhecimento do dano e de sua autoria.', f: 'CDC, art. 27' },
  { a: 'pen', q: 'Quais são as causas legais de exclusão da ilicitude?', r: 'Estado de necessidade, legítima defesa, estrito cumprimento de dever legal e exercício regular de direito.', f: 'CP, art. 23' },
  { a: 'pen', q: 'Que teorias o Código Penal adota para o tempo e o lugar do crime?', r: 'Tempo: teoria da atividade. Lugar: teoria da ubiquidade.', f: 'CP, arts. 4º e 6º' },
  { a: 'pen', q: 'Como se define o regime inicial de cumprimento da pena?', r: 'Fechado para pena superior a 8 anos; semiaberto para pena acima de 4 e até 8 anos, se não reincidente; aberto para pena de até 4 anos, se não reincidente.', f: 'CP, art. 33, § 2º' },
  { a: 'pp', q: 'Qual é o prazo para concluir o inquérito policial?', r: 'Dez dias se o indiciado estiver preso; trinta dias se estiver solto.', f: 'CPP, art. 10' },
  { a: 'pp', q: 'Qual é o prazo para oferecer a denúncia?', r: 'Cinco dias com réu preso; quinze dias com réu solto.', f: 'CPP, art. 46' },
  { a: 'pp', q: 'Em quanto tempo o acusado apresenta a resposta à acusação?', r: 'Em dez dias, contados da citação.', f: 'CPP, art. 396' },
  { a: 'pc', q: 'Quais são os requisitos da tutela de urgência?', r: 'Probabilidade do direito e perigo de dano ou risco ao resultado útil do processo.', f: 'CPC, art. 300' },
  { a: 'pc', q: 'Qual é o prazo para contestar no procedimento comum?', r: 'Quinze dias úteis.', f: 'CPC, arts. 219 e 335' },
  { a: 'pc', q: 'Qual é o prazo geral dos recursos cíveis?', r: 'Quinze dias, salvo os embargos de declaração, que são de cinco dias.', f: 'CPC, arts. 1.003, § 5º, e 1.023' },
  { a: 'trab', q: 'Quais são os requisitos da relação de emprego?', r: 'Trabalho por pessoa física, pessoalidade, não eventualidade, onerosidade e subordinação.', f: 'CLT, arts. 2º e 3º' },
  { a: 'trab', q: 'Qual é o prazo prescricional dos créditos trabalhistas?', r: 'Cinco anos, até o limite de dois anos após a extinção do contrato.', f: 'CF, art. 7º, XXIX; CLT, art. 11' },
  { a: 'pt', q: 'Qual é o prazo do recurso ordinário?', r: 'Oito dias.', f: 'CLT, art. 895' },
  { a: 'pt', q: 'Que causas seguem o procedimento sumaríssimo?', r: 'Dissídios individuais de até quarenta salários mínimos.', f: 'CLT, art. 852-A' },
  { a: 'oab', q: 'Quais são as sanções disciplinares do Estatuto da Advocacia?', r: 'Censura, suspensão, exclusão e multa.', f: 'EAOAB, art. 35' },
  { a: 'oab', q: 'Quais atividades são privativas da advocacia?', r: 'A postulação a órgão do Poder Judiciário e aos juizados especiais, e as atividades de consultoria, assessoria e direção jurídicas.', f: 'EAOAB, art. 1º' },
  { a: 'eca', q: 'Quem é criança e quem é adolescente para o ECA?', r: 'Criança: até doze anos incompletos. Adolescente: entre doze e dezoito anos.', f: 'ECA, art. 2º' },
  { a: 'eca', q: 'Quais são as medidas socioeducativas?', r: 'Advertência, obrigação de reparar o dano, prestação de serviços à comunidade, liberdade assistida, semiliberdade e internação.', f: 'ECA, art. 112' },
  { a: 'amb', q: 'Como é a responsabilidade civil por dano ambiental?', r: 'Objetiva: o poluidor indeniza independentemente de culpa.', f: 'Lei 6.938/1981, art. 14, § 1º' },
  { a: 'dh', q: 'Quando um tratado de direitos humanos equivale a emenda constitucional?', r: 'Quando aprovado em cada Casa do Congresso, em dois turnos, por três quintos dos votos.', f: 'CF, art. 5º, § 3º' },
  { a: 'int', q: 'Quem celebra tratados em nome do Brasil?', r: 'O Presidente da República, com referendo do Congresso Nacional.', f: 'CF, arts. 84, VIII, e 49, I' },
  { a: 'elei', q: 'Quais são as idades mínimas para os cargos eletivos?', r: '35 anos: Presidente, Vice e Senador. 30: Governador e Vice. 21: Deputado, Prefeito, Vice e juiz de paz. 18: Vereador.', f: 'CF, art. 14, § 3º, VI' },
  { a: 'fin', q: 'Quais são as três leis orçamentárias?', r: 'Plano plurianual, lei de diretrizes orçamentárias e lei orçamentária anual.', f: 'CF, art. 165' },
  { a: 'prev', q: 'O que compõe a seguridade social?', r: 'Saúde, previdência social e assistência social.', f: 'CF, art. 194' },
  { a: 'fil', q: 'Quando a lei começa a vigorar se não disser nada?', r: 'Quarenta e cinco dias depois de publicada; no exterior, três meses.', f: 'LINDB, art. 1º, caput e § 1º' }
];

const MNEMO = [
  { a: 'cf', m: 'SO-CI-DI-VA-PLU', t: 'Fundamentos da República', x: 'SOberania, CIdadania, DIgnidade da pessoa humana, VAlores sociais do trabalho e da livre iniciativa, PLUralismo político.', f: 'CF, art. 1º' },
  { a: 'cf', m: 'CON-GA-ER-PRO', t: 'Objetivos fundamentais', x: 'CONstruir uma sociedade livre, justa e solidária; GArantir o desenvolvimento nacional; ERradicar a pobreza; PROmover o bem de todos.', f: 'CF, art. 3º' },
  { a: 'cf', m: 'CAPACETE DE PM', t: 'Competência privativa da União para legislar', x: 'Civil, Agrário, Penal, Aeronáutico, Comercial, Eleitoral, Trabalho, Espacial, Processual e Marítimo.', f: 'CF, art. 22, I' },
  { a: 'cf', m: 'PUFETO', t: 'Competência concorrente', x: 'Penitenciário, Urbanístico, Financeiro, Econômico, Tributário e Orçamento.', f: 'CF, art. 24, I e II' },
  { a: 'cf', m: 'MP3.COM', t: 'Cargos privativos de brasileiro nato', x: 'Ministro do STF; Presidente e Vice da República, Presidente da Câmara e Presidente do Senado (os três P); Carreira diplomática; Oficial das Forças Armadas; Ministro da Defesa.', f: 'CF, art. 12, § 3º' },
  { a: 'adm', m: 'LIMPE', t: 'Princípios da Administração', x: 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência.', f: 'CF, art. 37' },
  { a: 'adm', m: 'CO-FI-FO-M-OB', t: 'Elementos do ato administrativo', x: 'COmpetência, FInalidade, FOrma, Motivo e OBjeto.', f: 'Lei 4.717/1965, art. 2º' },
  { a: 'adm', m: 'PATI', t: 'Atributos do ato administrativo', x: 'Presunção de legitimidade, Autoexecutoriedade, Tipicidade, Imperatividade.', f: 'Doutrina' },
  { a: 'pen', m: 'LUTA', t: 'Lugar e tempo do crime', x: 'Lugar: Ubiquidade. Tempo: Atividade.', f: 'CP, arts. 6º e 4º' },
  { a: 'trib', m: 'MO-DE-RE-CO-PA', t: 'Suspensão do crédito tributário', x: 'MOratória, DEpósito integral, REclamações e recursos, COncessão de liminar ou tutela, PArcelamento.', f: 'CTN, art. 151' }
];

const GLOSS = [
  { t: 'Acórdão', d: 'Decisão colegiada de um tribunal.', f: 'CPC, art. 204' },
  { t: 'Ação rescisória', d: 'Ação para desfazer decisão de mérito já transitada em julgado, nas hipóteses legais, em até dois anos.', f: 'CPC, arts. 966 e 975' },
  { t: 'Agravo de instrumento', d: 'Recurso contra decisões interlocutórias listadas na lei, dirigido diretamente ao tribunal.', f: 'CPC, art. 1.015' },
  { t: 'Certidão de Dívida Ativa (CDA)', d: 'Título executivo extrajudicial que documenta o crédito inscrito da Fazenda Pública.', f: 'Lei 6.830/1980, art. 2º, §§ 5º e 6º' },
  { t: 'Citação', d: 'Ato que chama o réu, o executado ou o interessado para integrar o processo.', f: 'CPC, art. 238' },
  { t: 'Coisa julgada', d: 'Autoridade que torna imutável e indiscutível a decisão de mérito não mais sujeita a recurso.', f: 'CPC, art. 502' },
  { t: 'Contraditório', d: 'Direito de ser informado dos atos do processo e de influenciar a decisão.', f: 'CF, art. 5º, LV; CPC, arts. 9º e 10' },
  { t: 'Culpa', d: 'O agente causa o resultado por imprudência, negligência ou imperícia.', f: 'CP, art. 18, II' },
  { t: 'Data venia', d: 'Com a devida licença. Fórmula de cortesia para discordar.', f: 'Expressão latina' },
  { t: 'Decadência', d: 'Perda do próprio direito potestativo por não ter sido exercido no prazo.', f: 'CC, arts. 207 a 211' },
  { t: 'Dolo', d: 'O agente quer o resultado ou assume o risco de produzi-lo.', f: 'CP, art. 18, I' },
  { t: 'Erga omnes', d: 'Efeito que alcança a todos, e não só as partes.', f: 'Expressão latina' },
  { t: 'Ex nunc', d: 'Efeitos dali em diante, sem retroagir.', f: 'Expressão latina' },
  { t: 'Ex tunc', d: 'Efeitos retroativos, desde a origem.', f: 'Expressão latina' },
  { t: 'Exceção de pré-executividade', d: 'Defesa do executado, sem garantia do juízo, para matérias conhecíveis de ofício que não exijam produção de provas.', f: 'Súmula 393 do STJ' },
  { t: 'Fumus boni iuris', d: 'Fumaça do bom direito: probabilidade de o direito existir.', f: 'CPC, art. 300' },
  { t: 'Habeas corpus', d: 'Remédio contra violência ou coação ilegal à liberdade de locomoção.', f: 'CF, art. 5º, LXVIII' },
  { t: 'In dubio pro reo', d: 'Na dúvida, decide-se a favor do réu.', f: 'CPP, art. 386, VII' },
  { t: 'Inter partes', d: 'Efeito restrito às partes do processo.', f: 'Expressão latina' },
  { t: 'Intimação', d: 'Ato que dá ciência a alguém dos atos e termos do processo.', f: 'CPC, art. 269' },
  { t: 'Jurisprudência', d: 'Conjunto de decisões reiteradas dos tribunais sobre uma matéria.', f: 'CPC, art. 926' },
  { t: 'Lançamento tributário', d: 'Procedimento administrativo que constitui o crédito tributário.', f: 'CTN, art. 142' },
  { t: 'Lide', d: 'Conflito de interesses qualificado por uma pretensão resistida.', f: 'Doutrina (Carnelutti)' },
  { t: 'Litisconsórcio', d: 'Pluralidade de autores ou de réus no mesmo processo.', f: 'CPC, art. 113' },
  { t: 'Litispendência', d: 'Repetição de ação idêntica a outra que ainda está em curso.', f: 'CPC, art. 337, §§ 1º a 3º' },
  { t: 'Mora', d: 'Atraso culposo no cumprimento da obrigação, ou recusa do credor em recebê-la.', f: 'CC, art. 394' },
  { t: 'Ônus da prova', d: 'Encargo de provar: ao autor, o fato constitutivo; ao réu, o fato impeditivo, modificativo ou extintivo.', f: 'CPC, art. 373' },
  { t: 'Pacta sunt servanda', d: 'Os pactos devem ser cumpridos: força obrigatória dos contratos e dos tratados.', f: 'Decreto 7.030/2009, art. 26' },
  { t: 'Periculum in mora', d: 'Perigo na demora: risco de dano se a decisão tardar.', f: 'CPC, art. 300' },
  { t: 'Preclusão', d: 'Perda da faculdade de praticar um ato processual.', f: 'CPC, art. 507' },
  { t: 'Prescrição', d: 'Extinção da pretensão pelo decurso do prazo sem que o titular a exerça.', f: 'CC, art. 189' },
  { t: 'Revelia', d: 'Situação do réu que não contesta; em regra, presumem-se verdadeiros os fatos alegados pelo autor.', f: 'CPC, art. 344' },
  { t: 'Sucumbência', d: 'Derrota no processo, que impõe ao vencido o pagamento de despesas e honorários.', f: 'CPC, arts. 82 e 85' },
  { t: 'Súmula vinculante', d: 'Enunciado do STF que obriga os demais órgãos do Judiciário e a Administração Pública.', f: 'CF, art. 103-A' },
  { t: 'Trânsito em julgado', d: 'Momento em que a decisão não admite mais recurso.', f: 'LINDB, art. 6º, § 3º' },
  { t: 'Tutela provisória', d: 'Decisão não definitiva, fundada em urgência ou em evidência.', f: 'CPC, art. 294' },
  { t: 'Usucapião', d: 'Aquisição da propriedade pela posse prolongada, com os requisitos legais.', f: 'CC, arts. 1.238 a 1.244' },
  { t: 'Vacatio legis', d: 'Intervalo entre a publicação da lei e o início de sua vigência.', f: 'LINDB, art. 1º' }
];

const TIMELINES = [
  { id: 'cpc', nome: 'Procedimento comum cível', base: 'CPC (Lei 13.105/2015)', area: 'pc', passos: [
    { t: 'Petição inicial', n: 'art. 319', d: 'O autor apresenta fatos, fundamentos e pedido.' },
    { t: 'Audiência de conciliação ou de mediação', n: 'art. 334', d: 'Marcada com pelo menos trinta dias de antecedência; o réu é citado com vinte dias.' },
    { t: 'Contestação', n: 'art. 335', d: 'Quinze dias úteis para o réu concentrar toda a sua defesa.' },
    { t: 'Réplica', n: 'arts. 350 e 351', d: 'O autor responde, em quinze dias, a preliminares e fatos novos.' },
    { t: 'Saneamento e organização do processo', n: 'art. 357', d: 'O juiz resolve questões pendentes, fixa os pontos controvertidos e distribui o ônus da prova.' },
    { t: 'Audiência de instrução e julgamento', n: 'arts. 358 a 368', d: 'Produção da prova oral: peritos, depoimentos pessoais e testemunhas.' },
    { t: 'Sentença', n: 'arts. 485, 487 e 489', d: 'Extinção sem ou com resolução do mérito, com relatório, fundamentos e dispositivo.' },
    { t: 'Apelação', n: 'arts. 1.009 e 1.003, § 5º', d: 'Recurso contra a sentença, em quinze dias úteis.' },
    { t: 'Cumprimento de sentença', n: 'art. 523', d: 'Quinze dias para pagar; depois, multa de dez por cento e honorários de dez por cento.' }
  ] },
  { id: 'cpp', nome: 'Procedimento comum ordinário penal', base: 'CPP (Decreto-Lei 3.689/1941)', area: 'pp', passos: [
    { t: 'Inquérito policial', n: 'arts. 4º a 23', d: 'Apuração do fato e da autoria; dez dias com preso, trinta com solto.' },
    { t: 'Denúncia ou queixa', n: 'art. 41', d: 'Exposição do fato criminoso, qualificação do acusado, classificação do crime e rol de testemunhas.' },
    { t: 'Recebimento e citação', n: 'art. 396', d: 'O juiz recebe a acusação e manda citar o acusado.' },
    { t: 'Resposta à acusação', n: 'arts. 396 e 396-A', d: 'Dez dias para a defesa arguir preliminares, juntar documentos e arrolar testemunhas.' },
    { t: 'Absolvição sumária', n: 'art. 397', d: 'O juiz absolve desde logo se houver excludente manifesta, fato atípico ou punibilidade extinta.' },
    { t: 'Audiência de instrução e julgamento', n: 'art. 400', d: 'Em até sessenta dias: ofendido, testemunhas, peritos e, por último, o interrogatório.' },
    { t: 'Alegações finais', n: 'art. 403', d: 'Orais, por vinte minutos, ou por memoriais em cinco dias.' },
    { t: 'Sentença', n: 'arts. 381 a 392', d: 'Absolvição (art. 386) ou condenação (art. 387).' },
    { t: 'Apelação', n: 'art. 593', d: 'Cinco dias para interpor o recurso.' }
  ] },
  { id: 'clt', nome: 'Reclamação trabalhista, rito ordinário', base: 'CLT (Decreto-Lei 5.452/1943)', area: 'pt', passos: [
    { t: 'Reclamação', n: 'art. 840', d: 'Escrita ou verbal, com pedido certo, determinado e com indicação de valor.' },
    { t: 'Notificação do reclamado', n: 'art. 841', d: 'Audiência marcada com intervalo mínimo de cinco dias.' },
    { t: 'Comparecimento à audiência', n: 'arts. 843 e 844', d: 'Ausência do reclamante arquiva o processo; a do reclamado gera revelia.' },
    { t: 'Primeira tentativa de conciliação', n: 'art. 846', d: 'O juiz propõe acordo logo na abertura.' },
    { t: 'Defesa', n: 'art. 847', d: 'Oral, em vinte minutos, ou escrita pelo sistema eletrônico até a audiência.' },
    { t: 'Instrução', n: 'arts. 818 a 830 e 848', d: 'Depoimentos e até três testemunhas por parte.' },
    { t: 'Razões finais e nova tentativa de conciliação', n: 'art. 850', d: 'Dez minutos para cada parte; o juiz renova a proposta de acordo.' },
    { t: 'Sentença', n: 'arts. 831 e 832', d: 'Decisão proferida depois de rejeitada a conciliação.' },
    { t: 'Recurso ordinário', n: 'arts. 895 e 899', d: 'Oito dias, com depósito recursal quando houver condenação.' }
  ] },
  { id: 'lef', nome: 'Execução fiscal', base: 'LEF (Lei 6.830/1980)', area: 'trib', passos: [
    { t: 'Inscrição em dívida ativa', n: 'art. 2º, § 3º', d: 'Controle administrativo da legalidade do crédito.' },
    { t: 'Certidão de Dívida Ativa', n: 'arts. 2º, §§ 5º e 6º, e 3º', d: 'Título com presunção relativa de certeza e liquidez.' },
    { t: 'Petição inicial', n: 'art. 6º', d: 'Simples, instruída com a CDA. Para dívidas de baixo valor, o STF exige antes tentativa de solução administrativa e protesto (Tema 1.184).' },
    { t: 'Citação', n: 'art. 8º', d: 'Cinco dias para pagar ou garantir a execução.' },
    { t: 'Penhora', n: 'arts. 10 e 11', d: 'Recai sobre bens na ordem legal, com o dinheiro em primeiro lugar.' },
    { t: 'Embargos do executado', n: 'art. 16', d: 'Trinta dias, e só depois de garantida a execução.' },
    { t: 'Impugnação da Fazenda', n: 'art. 17', d: 'Trinta dias para responder aos embargos.' },
    { t: 'Alienação dos bens', n: 'arts. 23 e 24', d: 'Leilão público ou adjudicação pela Fazenda.' },
    { t: 'Suspensão e prescrição intercorrente', n: 'art. 40', d: 'Sem bens ou sem devedor, suspende-se por um ano; depois correm cinco anos (Súmula 314 e Tema 566 do STJ).' }
  ] }
];

const PIRAMIDE = [
  { t: 'Constituição', d: 'Constituição de 1988, emendas constitucionais e tratados de direitos humanos aprovados pelo rito qualificado.', f: 'CF, arts. 5º, § 3º, e 60' },
  { t: 'Normas supralegais', d: 'Tratados de direitos humanos aprovados sem o rito qualificado: abaixo da Constituição, acima das leis.', f: 'STF, RE 466.343' },
  { t: 'Leis', d: 'Leis complementares, ordinárias e delegadas, medidas provisórias, decretos legislativos e resoluções. Entre lei complementar e lei ordinária não há hierarquia: muda a matéria reservada e o quórum de maioria absoluta.', f: 'CF, arts. 59 e 69' },
  { t: 'Decretos regulamentares', d: 'Atos do chefe do Executivo para a fiel execução da lei. Não podem inovar.', f: 'CF, art. 84, IV' },
  { t: 'Atos normativos internos', d: 'Portarias, instruções normativas e resoluções administrativas.', f: 'Doutrina' }
];

const FONTES_AV = [
  { n: 'TV Justiça', d: 'Sessões do STF ao vivo e programas de aulas.', u: 'https://www.tvjustica.jus.br/' },
  { n: 'Rádio Justiça', d: 'Programação jurídica em áudio.', u: 'https://www.radiojustica.jus.br/' },
  { n: 'Supremo Tribunal Federal', d: 'Notícias, informativos e julgamentos.', u: 'https://portal.stf.jus.br/' },
  { n: 'Superior Tribunal de Justiça', d: 'Notícias, informativos e podcasts.', u: 'https://www.stj.jus.br/' },
  { n: 'Tribunal Superior do Trabalho', d: 'Jurisprudência e conteúdo em vídeo.', u: 'https://www.tst.jus.br/' },
  { n: 'Portal do Exame de Ordem', d: 'Editais, provas anteriores e gabaritos.', u: 'https://oab.fgv.br/' }
];
