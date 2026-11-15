"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileDown,
  Scale,
  Sliders,
  TrendingUp,
} from "lucide-react";
import {
  FAIXAS_EFICIENCIA_LIDER_GERAL_AGF,
  FAIXAS_EFICIENCIA_LIDER_SETOR_AGF,
  FAIXAS_EFICIENCIA_OPERACIONAL_AGF,
  MODULADORES_PADRAO_AGF,
} from "@/data/agfSeedData";
import { calcularDesafioPPR } from "@/services/pprCalculator";
import { formatBRL, formatPct } from "@/lib/utils";
import type { DesafioPPR, IndicadorCanvas } from "@/types/ppr";

const PRINCIPAIS_ALTERACOES = [
  {
    num: 1,
    titulo: "Reancoragem da Meta (100% Atual → Novo 80,00%)",
    antes: "Meta travada em 100% (R$ 400). Produzir 105% ou 115% não gera prêmio extra.",
    depois:
      "O antigo 100% passa a ser 80,00% de eficiência (R$ 900 base Setor), abrindo 13 faixas até 93% (R$ 2.600).",
    ganho: "Destrava margem real de crescimento produtivo na planta.",
  },
  {
    num: 2,
    titulo: "De Soma Isolada para Moduladores Compostos (±40%)",
    antes: "5 blocos independentes; mesmo com baixa produção ainda recebia até R$ 450.",
    depois:
      "Qualidade, HE, Faltas, Atrasos e 5S aplicam acréscimo/redução (-40% a +40%) sobre a Base Eficiência.",
    ganho: "O prêmio se autofinancia: produtividade + qualidade multiplica o ganho.",
  },
  {
    num: 3,
    titulo: "Escala Contínua de 22 Faixas Sem Sobreposição",
    antes: "5 faixas largas com sobreposição textual (95–96,9% e 96–97,9%) e saltos de R$ 100.",
    depois: "22 faixas de 1% em 1% (72% a 93%), eliminando lacunas ou degraus bruscos.",
    ganho: "Cada +1% de eficiência gera recompensa previsível e auditável.",
  },
  {
    num: 4,
    titulo: "Horas Extras: Meta Técnica Universal + Bônus Top 3",
    antes: "Ranking excludente: apenas os 3 melhores ganham; do 4º setor em diante zera.",
    depois: "Régua objetiva de Índice HE (Ref. 2,51–3,00% = 0%) variando de -10% a +10%.",
    ganho: "Engaja 100% dos setores na redução de HE sem desmotivar o 4º lugar.",
  },
  {
    num: 5,
    titulo: "Qualidade & Retrabalho com Régua Numérica por Volume",
    antes: "Critérios subjetivos ('pontuais' vs. 'reincidências') sujeitos a atrito.",
    depois: "7 faixas por % de Retrabalho sobre volume produzido (Ref. 2,46–2,50% = 0%).",
    ganho: "Justiça entre setores de volumes distintos e transparência no fechamento.",
  },
  {
    num: 6,
    titulo: "Tabela Dedicada de 22 Faixas para o Líder Geral",
    antes: "Apenas teto fixo de R$ 1.200,00 sem faixas graduais nem rampa de superação.",
    depois: "Escala exclusiva: 80% Ref. = R$ 1.200,00, subindo de R$ 150 (72%) a R$ 3.200 (93%).",
    ganho: "Governança clara para o resultado integrado da fábrica.",
  },
  {
    num: 7,
    titulo: "Expansão Operacional, Proporcionalidade & Views DW",
    antes: "Planilha manual sem histórico semestral ou cálculo proporcional de horas.",
    depois: "Suporte a Classes Semestrais (Operacional R$ 50–1.100), Views DW e backup JSON.",
    ganho: "Plataforma pronta para escalar do nível de liderança para toda a fábrica.",
  },
];

export function ComparativoAGFView() {
  const [perfil, setPerfil] = useState<"lider_setor" | "lider_geral">(
    "lider_setor"
  );
  const [eficiencia, setEficiencia] = useState(84);
  const [retrabalho, setRetrabalho] = useState(2.15);
  const [horasExtras, setHorasExtras] = useState(1.85);
  const [faltas, setFaltas] = useState(0);
  const [atrasos, setAtrasos] = useState(0.45);
  const [gestao5s, setGestao5s] = useState(96);

  const simulacao = useMemo(() => {
    const desafioSim: DesafioPPR = {
      id: "sim",
      setorId: "sim",
      nome: perfil === "lider_geral" ? "Líder Geral AGF" : "Líder de Setor AGF",
      subtitulo: "",
      perfil,
      corAccent: "cyan",
      chaveEficiencia:
        perfil === "lider_geral"
          ? "eficiencia_geral_agf"
          : "eficiencia_setor_agf",
      eficienciaReferencia: 80,
      ganhoMaximoPct: 40,
      perdaMaximaPct: 40,
      faixasEficiencia:
        perfil === "lider_geral"
          ? FAIXAS_EFICIENCIA_LIDER_GERAL_AGF
          : FAIXAS_EFICIENCIA_LIDER_SETOR_AGF,
      moduladores: MODULADORES_PADRAO_AGF,
    };

    const inds: IndicadorCanvas[] = [
      {
        id: "1",
        setorId: "sim",
        chave: desafioSim.chaveEficiencia,
        nome: "Eficiência",
        valorApurado: eficiencia,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
      {
        id: "2",
        setorId: "sim",
        chave: "qualidade_retrabalho",
        nome: "Qualidade",
        valorApurado: retrabalho,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
      {
        id: "3",
        setorId: "sim",
        chave: "controle_horas_extras",
        nome: "Horas Extras",
        valorApurado: horasExtras,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
      {
        id: "4",
        setorId: "sim",
        chave: "frequencia_faltas",
        nome: "Faltas",
        valorApurado: faltas,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
      {
        id: "5",
        setorId: "sim",
        chave: "frequencia_atrasos",
        nome: "Atrasos",
        valorApurado: atrasos,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
      {
        id: "6",
        setorId: "sim",
        chave: "gestao_organizacao_5s",
        nome: "5S",
        valorApurado: gestao5s,
        unidade: "%",
        metaReferenciaLabel: "",
        position: { x: 0, y: 0 },
      },
    ];

    return calcularDesafioPPR(desafioSim, inds);
  }, [perfil, eficiencia, retrabalho, horasExtras, faltas, atrasos, gestao5s]);

  return (
    <div className="space-y-6">
      {/* BANNER EXECUTIVO + BOTÃO PDF */}
      <div className="glow-card p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white border border-cyan-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Proposta Oficial Akiom × AGF – Portas e Rodapés
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">
              Simulador Comparativo &amp; Principais Alterações do PPR AGF
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Veja ao vivo como a reancoragem da meta (<strong>100% atual → Novo 80,00%</strong>) combinada aos moduladores <strong>±40%</strong> destrava crescimento produtivo mantendo sustentabilidade financeira.
            </p>
          </div>

          <a
            href="/Proposta_Alteracao_PPR_AGF_Akiom.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="Proposta_Alteracao_PPR_AGF_Akiom.pdf"
            className="shrink-0 min-h-[44px] px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 rounded-full font-heading font-semibold tracking-tight bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 border border-cyan-300/60 shadow-[0_10px_28px_-6px_rgba(6,182,212,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <FileDown className="w-4 h-4 shrink-0" />
            <span>Baixar Proposta PDF (Akiom)</span>
          </a>
        </div>
      </div>

      {/* SIMULADOR INTERATIVO ANTIGO AGF vs NOVO GESTÃO PPR */}
      <div className="glow-card p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                Simulador Interativo: Regulamento Atual AGF vs. Novo Modelo Gestão PPR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste os parâmetros abaixo para testar qualquer cenário real da fábrica.
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setPerfil("lider_setor")}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold cursor-pointer transition-all ${
                perfil === "lider_setor"
                  ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Líder de Setor
            </button>
            <button
              type="button"
              onClick={() => setPerfil("lider_geral")}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold cursor-pointer transition-all ${
                perfil === "lider_geral"
                  ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Líder Geral
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SLIDERS */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70">
              <div className="flex justify-between font-heading font-bold mb-1.5">
                <span className="text-slate-900 dark:text-white">
                  Eficiência / Produção (80% = Antigo 100% AGF)
                </span>
                <span className="text-amber-700 dark:text-amber-300 font-black">
                  {eficiencia}% (equiv. {simulacao.comparativoModeloAntigoAGF.producaoAntigaPct}% antigo)
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={95}
                step={1}
                value={eficiencia}
                onChange={(e) => setEficiencia(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold mb-1">
                <span>Qualidade &amp; Retrabalho</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {retrabalho}%
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={3.5}
                step={0.05}
                value={retrabalho}
                onChange={(e) => setRetrabalho(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold mb-1">
                <span>Índice Horas Extras</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {horasExtras}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.5}
                step={0.05}
                value={horasExtras}
                onChange={(e) => setHorasExtras(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold mb-1">
                <span>Faltas Injustificadas</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {faltas}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                step={0.1}
                value={faltas}
                onChange={(e) => setFaltas(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between font-bold mb-1">
                <span>Atrasos &amp; Gestão 5S</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400">
                  {atrasos}% / {gestao5s}%
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.1}
                  value={atrasos}
                  onChange={(e) => setAtrasos(Number(e.target.value))}
                  className="w-1/2 accent-cyan-600 cursor-pointer"
                />
                <input
                  type="range"
                  min={70}
                  max={100}
                  step={1}
                  value={gestao5s}
                  onChange={(e) => setGestao5s(Number(e.target.value))}
                  className="w-1/2 accent-violet-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* RESULTADO COMPARATIVO */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
                <div className="text-[10px] font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  Modelo Antigo AGF
                </div>
                <div className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-1">
                  {formatBRL(simulacao.comparativoModeloAntigoAGF.totalAntigoAGF)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5 font-mono">
                  <div>Prod: {formatBRL(simulacao.comparativoModeloAntigoAGF.premioProducaoAntigo)}</div>
                  <div>HE: {formatBRL(simulacao.comparativoModeloAntigoAGF.premioHorasExtrasAntigo)} • Freq: {formatBRL(simulacao.comparativoModeloAntigoAGF.premioFrequenciaAntigo)}</div>
                  <div>Qual: {formatBRL(simulacao.comparativoModeloAntigoAGF.premioQualidadeAntigo)} • 5S: {formatBRL(simulacao.comparativoModeloAntigoAGF.premioGestaoAntigo)}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-950/60 dark:to-emerald-950/60 border border-cyan-300 dark:border-cyan-700">
                <div className="text-[10px] font-heading font-extrabold uppercase text-cyan-800 dark:text-cyan-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Novo Gestão PPR
                </div>
                <div className="font-heading font-black text-2xl text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatBRL(simulacao.premioFinalBase100)}
                </div>
                <div className="text-[10px] text-slate-700 dark:text-slate-200 mt-1 space-y-0.5 font-mono">
                  <div>Base ({simulacao.eficienciaApurada}%): {formatBRL(simulacao.premioBaseEficiencia)}</div>
                  <div>Moduladores: {formatPct(simulacao.somaAjustesLimitadaPct, true)}</div>
                  <div>Ajuste: {formatBRL(simulacao.valorAjustes)}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
              <span>Diferença com a evolução proposta:</span>
              <strong className="font-heading font-black text-base text-emerald-400">
                {simulacao.comparativoModeloAntigoAGF.diferencaValor >= 0
                  ? "+"
                  : ""}
                {formatBRL(simulacao.comparativoModeloAntigoAGF.diferencaValor)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DAS 7 PRINCIPAIS ALTERAÇÕES */}
      <div className="glow-card p-5 sm:p-6 space-y-4">
        <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
          As 7 Principais Alterações Implementadas para a AGF
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PRINCIPAIS_ALTERACOES.map((alt) => (
            <div
              key={alt.num}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-heading font-black text-xs flex items-center justify-center shrink-0">
                  {alt.num}
                </span>
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                  {alt.titulo}
                </h4>
              </div>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-rose-600 dark:text-rose-400">Antes:</strong>{" "}
                  {alt.antes}
                </p>
                <p className="flex items-start gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      Novo Modelo:
                    </strong>{" "}
                    {alt.depois}
                  </span>
                </p>
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  Ganho: {alt.ganho}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABELA RESUMO DAS 22 FAIXAS */}
      <div className="glow-card p-5 sm:p-6 space-y-3">
        <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
          Referência Completa das 22 Faixas de Eficiência (Antigo 100% = Novo 80,00%)
        </h3>
        <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[640px] text-xs text-left">
            <thead className="bg-slate-900 text-white font-heading uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Eficiência</th>
                <th className="p-2.5 text-right">Líder de Setor AGF</th>
                <th className="p-2.5 text-right">Líder Geral AGF</th>
                <th className="p-2.5 text-right">Operacional AGF</th>
                <th className="p-2.5">Enquadramento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {FAIXAS_EFICIENCIA_LIDER_SETOR_AGF.map((f, idx) => {
                const geral = FAIXAS_EFICIENCIA_LIDER_GERAL_AGF[idx];
                const oper = FAIXAS_EFICIENCIA_OPERACIONAL_AGF[idx];
                return (
                  <tr
                    key={f.eficiencia}
                    className={
                      f.destaque
                        ? "bg-amber-100 dark:bg-amber-950/60 font-black"
                        : "bg-white dark:bg-slate-900/60"
                    }
                  >
                    <td className="p-2">{f.eficiencia.toFixed(2)}%</td>
                    <td className="p-2 text-right">{formatBRL(f.premio)}</td>
                    <td className="p-2 text-right">{formatBRL(geral?.premio ?? 0)}</td>
                    <td className="p-2 text-right">{formatBRL(oper?.premio ?? 0)}</td>
                    <td className="p-2 font-sans text-[11px] text-slate-600 dark:text-slate-300">
                      {f.nota ?? (f.eficiencia > 80 ? "Margem de Crescimento" : "Rampa de Entrada")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
