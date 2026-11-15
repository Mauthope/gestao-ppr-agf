import type {
  ChaveIndicadorCalculo,
  IndicadorCanvas,
  IntegracaoIndicadorDW,
} from "@/types/ppr";

export interface ViewDWTemplate {
  chave: ChaveIndicadorCalculo;
  titulo: string;
  schema: string;
  objetoNome: string;
  colunaValor: string;
  agregacao: IntegracaoIndicadorDW["agregacao"];
  descricao: string;
  valoresDemo: Record<string, number>;
}

export const CATALOGO_VIEWS_DW_AGF: Record<
  ChaveIndicadorCalculo,
  ViewDWTemplate
> = {
  eficiencia_setor_agf: {
    chave: "eficiencia_setor_agf",
    titulo: "DW Eficiência Produtiva Setor AGF (Base 80%)",
    schema: "dw_agf_producao",
    objetoNome: "vw_dw_agf_eficiencia_setor",
    colunaValor: "pct_eficiencia_reancorada",
    agregacao: "AVG",
    descricao:
      "Consolida ordens de produção de portas e rodapés já na escala reancorada (antigo 100% = 80%).",
    valoresDemo: {
      setor_usinagem: 84,
      setor_acabamento: 81,
    },
  },
  eficiencia_geral_agf: {
    chave: "eficiencia_geral_agf",
    titulo: "DW Eficiência Global Fábrica AGF",
    schema: "dw_agf_producao",
    objetoNome: "vw_dw_agf_eficiencia_planta_geral",
    colunaValor: "pct_eficiencia_global",
    agregacao: "AVG",
    descricao:
      "Média ponderada do atingimento integrado de todos os setores da planta AGF.",
    valoresDemo: {
      setor_geral: 83,
    },
  },
  eficiencia_operacional_agf: {
    chave: "eficiencia_operacional_agf",
    titulo: "DW Eficiência Operacional Linha AGF",
    schema: "dw_agf_producao",
    objetoNome: "vw_dw_agf_eficiencia_operacional",
    colunaValor: "pct_eficiencia_linha",
    agregacao: "AVG",
    descricao:
      "Eficiência operacional das linhas de montagem, prensa e pintura UV.",
    valoresDemo: {
      setor_usinagem: 84,
      setor_acabamento: 81,
    },
  },
  qualidade_retrabalho: {
    chave: "qualidade_retrabalho",
    titulo: "DW Qualidade & Retrabalho AGF (RNC)",
    schema: "dw_agf_qualidade",
    objetoNome: "vw_dw_agf_indice_retrabalho_setor",
    colunaValor: "pct_retrabalho_volume",
    agregacao: "AVG",
    descricao:
      "Relação entre peças retrabalhadas/descartadas originadas no setor e volume total produzido.",
    valoresDemo: {
      setor_usinagem: 2.15,
      setor_acabamento: 2.38,
      setor_geral: 2.25,
    },
  },
  controle_horas_extras: {
    chave: "controle_horas_extras",
    titulo: "DW Ponto Eletrônico — Índice de Horas Extras",
    schema: "dw_agf_rh",
    objetoNome: "vw_dw_agf_indice_horas_extras",
    colunaValor: "pct_he_sobre_normais",
    agregacao: "AVG",
    descricao:
      "Calcula (Total de Horas Extras ÷ Horas Normais Previstas) × 100 por centro de custo.",
    valoresDemo: {
      setor_usinagem: 1.85,
      setor_acabamento: 2.4,
      setor_geral: 2.1,
    },
  },
  frequencia_faltas: {
    chave: "frequencia_faltas",
    titulo: "DW Frequência — Faltas Injustificadas",
    schema: "dw_agf_rh",
    objetoNome: "vw_dw_agf_pct_colaboradores_falta",
    colunaValor: "pct_colab_falta_injustificada",
    agregacao: "LAST",
    descricao:
      "Percentual de colaboradores ativos do setor com pelo menos uma falta injustificada no mês.",
    valoresDemo: {
      setor_usinagem: 0,
      setor_acabamento: 1.2,
      setor_geral: 0.5,
    },
  },
  frequencia_atrasos: {
    chave: "frequencia_atrasos",
    titulo: "DW Frequência — Atrasos Injustificados",
    schema: "dw_agf_rh",
    objetoNome: "vw_dw_agf_pct_jornadas_atraso",
    colunaValor: "pct_jornadas_atraso",
    agregacao: "AVG",
    descricao:
      "Percentual de jornadas previstas com atraso injustificado acima da tolerância legal.",
    valoresDemo: {
      setor_usinagem: 0.45,
      setor_acabamento: 0.9,
      setor_geral: 0.75,
    },
  },
  gestao_organizacao_5s: {
    chave: "gestao_organizacao_5s",
    titulo: "DW Auditoria Lean — Gestão, Quadro & 5S",
    schema: "dw_agf_lean",
    objetoNome: "vw_dw_agf_auditoria_gestao_5s",
    colunaValor: "nota_auditoria_pct",
    agregacao: "LAST",
    descricao:
      "Nota consolidada dos 4 critérios AGF (Quadro de metas, Planejamento, 5S e Plano de ações).",
    valoresDemo: {
      setor_usinagem: 96,
      setor_acabamento: 92,
      setor_geral: 94,
    },
  },
};

export function gerarSqlPreviewDW(
  config: IntegracaoIndicadorDW,
  nomeSetor: string
): string {
  const filtro =
    config.filtroSetor?.trim() || `ds_setor = '${nomeSetor}'`;
  return `SELECT ${config.agregacao}(${config.colunaValor}) AS vlr_apurado\nFROM ${config.schema}.${config.objetoNome}\nWHERE ${filtro}\n  AND dt_competencia = DATE_TRUNC('month', CURRENT_DATE);`;
}

export function simularSincronizacaoDW(
  indicador: IndicadorCanvas
): { novoValor: number; timestamp: string } {
  const template = CATALOGO_VIEWS_DW_AGF[indicador.chave];
  const base =
    template?.valoresDemo[indicador.setorId] ?? indicador.valorApurado;
  // Pequena variação realista de coleta para demonstrar atualização ao vivo
  const isEficiencia = indicador.chave.startsWith("eficiencia_");
  const delta = isEficiencia ? 1 : indicador.chave === "gestao_organizacao_5s" ? 1 : -0.05;
  const raw = Math.max(0, Number((base + delta).toFixed(2)));
  return {
    novoValor: isEficiencia ? Math.min(93, Math.round(raw)) : raw,
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}
