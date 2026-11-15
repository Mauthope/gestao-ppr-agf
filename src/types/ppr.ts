export type ChaveIndicadorCalculo =
  | "eficiencia_setor_agf"
  | "eficiencia_geral_agf"
  | "eficiencia_operacional_agf"
  | "qualidade_retrabalho"
  | "controle_horas_extras"
  | "frequencia_faltas"
  | "frequencia_atrasos"
  | "gestao_organizacao_5s";

export type ModeloPPR = "mensal" | "semestral";

export interface FaixaEficiencia {
  eficiencia: number; // 72 a 93 (80 = Referência Antigo 100% AGF)
  premio: number;
  destaque?: boolean;
  nota?: string;
}

export interface FaixaModulador {
  id: string;
  label: string;
  min?: number;
  max?: number;
  ajustePct: number; // ex: -10, -7.5, 0, +5, +10
  isReferencia?: boolean;
}

export interface RegraIndicadorModulador {
  chave: Exclude<
    ChaveIndicadorCalculo,
    "eficiencia_setor_agf" | "eficiencia_geral_agf" | "eficiencia_operacional_agf"
  >;
  nome: string;
  unidade: "%" | "pts";
  direcaoMelhor: "menor" | "maior";
  faixas: FaixaModulador[];
}

export interface DesafioPPR {
  id: string;
  setorId: string;
  nome: string;
  subtitulo: string;
  perfil: "lider_setor" | "lider_geral" | "operacional";
  corAccent: "amber" | "cyan" | "emerald" | "violet";
  chaveEficiencia: "eficiencia_setor_agf" | "eficiencia_geral_agf" | "eficiencia_operacional_agf";
  eficienciaReferencia: number; // 80%
  ganhoMaximoPct: number; // +40
  perdaMaximaPct: number; // -40
  faixasEficiencia: FaixaEficiencia[];
  moduladores: RegraIndicadorModulador[];
}

export interface IntegracaoIndicadorDW {
  ativa: boolean;
  tipoFonte: "manual" | "view_dw" | "banco_sql" | "supabase";
  conexaoNome: string;
  schema: string;
  objetoNome: string;
  colunaValor: string;
  colunaTurno?: string;
  agregacao: "AVG" | "SUM" | "LAST" | "MAX" | "MIN";
  filtroSetor?: string;
  queryCustomizada?: string;
  sincronizacaoAutomatica: boolean;
  ultimaSincronizacao?: string;
}

export interface IndicadorCanvas {
  id: string;
  setorId: string;
  chave: ChaveIndicadorCalculo;
  nome: string;
  valorApurado: number;
  unidade: "%" | "pts";
  metaReferenciaLabel: string;
  integracaoDW?: IntegracaoIndicadorDW;
  position: { x: number; y: number };
}

export interface Setor {
  id: string;
  nome: string;
  codigo: string;
  descricao: string;
  position: { x: number; y: number };
}

export interface RegistroSemestralMes {
  mesIndex: number; // 1..6
  competencia: string;
  eficienciaApurada: number;
  premioBase: number;
  ajusteTotalPct: number;
  premioFinalBase100: number;
  fechadoEm: string;
}

export interface Classe {
  id: string;
  setorId: string;
  nome: string;
  corAccent: "amber" | "emerald" | "violet" | "cyan";
  modeloPPR: ModeloPPR;
  desafioId: string;
  turnos: string[];
  historicoSemestral: RegistroSemestralMes[];
  position: { x: number; y: number };
}

export interface Colaborador {
  id: string;
  classeId: string;
  setorId: string;
  nome: string;
  cargo: string;
  turno: string;
  horasPrevistasMes: number;
  horasTrabalhadasMes: number;
  ajusteIndividualPct?: number;
  ajusteIndividualJustificativa?: string;
  position: { x: number; y: number };
}

export interface FechamentoPPRRegistro {
  id: string;
  competencia: string;
  mesSemestralIndex: number;
  fechadoEm: string;
  totalPagarGeral: number;
  totalColaboradores: number;
  resumoClasses: Array<{
    classeId: string;
    classeNome: string;
    setorNome: string;
    modeloPPR: ModeloPPR;
    eficiencia: number;
    premioBase100: number;
    totalEquipe: number;
  }>;
}

export interface PPRDatabaseState {
  empresa: string;
  versaoModelo: string;
  setores: Setor[];
  desafios: DesafioPPR[];
  indicadores: IndicadorCanvas[];
  classes: Classe[];
  colaboradores: Colaborador[];
  fechamentos: FechamentoPPRRegistro[];
}

export interface ResultadoModuladorDetalhe {
  chave: ChaveIndicadorCalculo;
  nome: string;
  valorApurado: number;
  unidade: string;
  ajustePct: number;
  faixaAtingida: string;
}

export interface ResultadoCalculoDesafio {
  eficienciaApurada: number;
  faixaEficienciaLabel: string;
  premioBaseEficiencia: number;
  somaAjustesBrutaPct: number;
  somaAjustesLimitadaPct: number;
  valorAjustes: number;
  premioFinalBase100: number;
  detalhesModuladores: ResultadoModuladorDetalhe[];
  comparativoModeloAntigoAGF: {
    producaoAntigaPct: number; // Reverso: 80% novo equivale a 100% antigo
    premioProducaoAntigo: number;
    premioHorasExtrasAntigo: number;
    premioFrequenciaAntigo: number;
    premioQualidadeAntigo: number;
    premioGestaoAntigo: number;
    totalAntigoAGF: number;
    diferencaValor: number;
  };
}
