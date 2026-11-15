"use client";

import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Building2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  Scale,
  TrendingUp,
} from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import { formatBRL, formatPct } from "@/lib/utils";
import type { DesafioPPR, Setor } from "@/types/ppr";

export interface SetorNodeData extends Record<string, unknown> {
  setor: Setor;
  desafios: DesafioPPR[];
  qtdClasses: number;
  qtdColaboradores: number;
}

export function SetorNode({ data }: NodeProps) {
  const { setor, desafios, qtdClasses, qtdColaboradores } = data as SetorNodeData;
  const { getResultadoDesafio } = usePPR();
  const [expandedDesafioId, setExpandedDesafioId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"faixas" | "moduladores">("faixas");

  const accentBadge: Record<DesafioPPR["corAccent"], string> = {
    amber: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700",
    cyan: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-200 dark:border-cyan-700",
    violet: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/60 dark:text-violet-200 dark:border-violet-700",
  };

  return (
    <div className="w-[540px] glow-card p-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-cyan-500 !border-2 !border-white dark:!border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-slate-900 text-cyan-300 dark:bg-cyan-950 dark:text-cyan-300">
                {setor.codigo}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {qtdClasses} classes • {qtdColaboradores} colab.
              </span>
            </div>
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white truncate mt-0.5">
              {setor.nome}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {setor.descricao}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {desafios.map((des) => {
          const res = getResultadoDesafio(des.id);
          const isExpanded = expandedDesafioId === des.id;
          if (!res) return null;

          return (
            <div
              key={des.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-950/60 p-3 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold border mb-1 ${accentBadge[des.corAccent]}`}
                  >
                    {des.perfil === "lider_geral"
                      ? "DESAFIO LÍDER GERAL"
                      : des.perfil === "operacional"
                        ? "DESAFIO OPERACIONAL"
                        : "DESAFIO LÍDER SETOR"}
                  </span>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {des.nome}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {des.subtitulo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedDesafioId(isExpanded ? null : des.id)
                  }
                  className="nodrag px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-heading font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:border-cyan-500 cursor-pointer shrink-0"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Réguas
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* RESUMO DE CÁLCULO AO VIVO */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Base ({res.eficienciaApurada}%)
                  </div>
                  <div className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    {formatBRL(res.premioBaseEficiencia)}
                  </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Moduladores
                  </div>
                  <div
                    className={`font-heading font-black text-sm ${
                      res.somaAjustesLimitadaPct >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatPct(res.somaAjustesLimitadaPct, true)}
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/60 dark:to-blue-950/60 border border-cyan-200 dark:border-cyan-800 p-2">
                  <div className="text-[10px] font-heading font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    PPR Novo
                  </div>
                  <div className="font-heading font-black text-sm text-cyan-950 dark:text-white">
                    {formatBRL(res.premioFinalBase100)}
                  </div>
                </div>
              </div>

              {/* PILLS DOS 5 MODULADORES */}
              <div className="flex flex-wrap gap-1.5">
                {res.detalhesModuladores.map((m) => (
                  <span
                    key={m.chave}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                      m.ajustePct > 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        : m.ajustePct < 0
                          ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                          : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {m.nome.split(" ")[0]}: {formatPct(m.ajustePct, true)}
                  </span>
                ))}
              </div>

              {/* COMPARATIVO DIRETO COM O MODELO ANTIGO AGF */}
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Regulamento Antigo AGF (equiv.{" "}
                    <strong className="text-white">
                      {res.comparativoModeloAntigoAGF.producaoAntigaPct}%
                    </strong>
                    ):{" "}
                    <strong className="text-amber-300">
                      {formatBRL(res.comparativoModeloAntigoAGF.totalAntigoAGF)}
                    </strong>
                  </span>
                </span>
                <span className="flex items-center gap-1 font-heading font-extrabold text-emerald-400 shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  {res.comparativoModeloAntigoAGF.diferencaValor >= 0 ? "+" : ""}
                  {formatBRL(res.comparativoModeloAntigoAGF.diferencaValor)}
                </span>
              </div>

              {/* DETALHAMENTO EXPANSÍVEL DAS 22 FAIXAS E MODULADORES */}
              {isExpanded && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSubTab("faixas")}
                      className={`nodrag px-3 py-1 rounded-lg text-[10px] font-heading font-bold cursor-pointer ${
                        subTab === "faixas"
                          ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      22 Faixas Eficiência (Ref. 80%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubTab("moduladores")}
                      className={`nodrag px-3 py-1 rounded-lg text-[10px] font-heading font-bold cursor-pointer ${
                        subTab === "moduladores"
                          ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Moduladores AGF (±40%)
                    </button>
                  </div>

                  {subTab === "faixas" ? (
                    <div className="max-h-44 overflow-y-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <table className="w-full text-[10px]">
                        <thead className="bg-slate-900 text-white sticky top-0">
                          <tr>
                            <th className="p-1.5 text-left">Eficiência</th>
                            <th className="p-1.5 text-right">Prêmio Mês</th>
                            <th className="p-1.5 text-right">Ref.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          {des.faixasEficiencia.map((f) => {
                            const isAtiva =
                              Math.floor(res.eficienciaApurada) === f.eficiencia ||
                              (res.eficienciaApurada >= 93 && f.eficiencia === 93);
                            return (
                              <tr
                                key={f.eficiencia}
                                className={
                                  f.destaque
                                    ? "bg-amber-100/90 dark:bg-amber-950/60 font-bold"
                                    : isAtiva
                                      ? "bg-cyan-50 dark:bg-cyan-950/50 font-bold"
                                      : ""
                                }
                              >
                                <td className="p-1.5">{f.eficiencia.toFixed(2)}%</td>
                                <td className="p-1.5 text-right">
                                  {formatBRL(f.premio)}
                                </td>
                                <td className="p-1.5 text-right text-[9px] text-slate-500 dark:text-slate-400">
                                  {f.nota ?? (isAtiva ? "Atual" : "")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-1.5">
                      {res.detalhesModuladores.map((m) => (
                        <div
                          key={m.chave}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]"
                        >
                          <div>
                            <div className="font-heading font-bold text-slate-900 dark:text-white">
                              {m.nome}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              Apurado: <strong>{m.valorApurado}{m.unidade}</strong> • {m.faixaAtingida}
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black ${
                              m.ajustePct >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {formatPct(m.ajustePct, true)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
