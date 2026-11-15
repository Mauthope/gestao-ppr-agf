"use client";

import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Award, Clock, SlidersHorizontal, User } from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import { calcularPPRColaborador } from "@/services/pprCalculator";
import { formatBRL, formatPct } from "@/lib/utils";
import type { Colaborador } from "@/types/ppr";

export interface ColaboradorNodeData extends Record<string, unknown> {
  colaborador: Colaborador;
  classeNome: string;
  premioBase100: number;
}

export function ColaboradorNode({ data }: NodeProps) {
  const { colaborador, classeNome, premioBase100 } = data as ColaboradorNodeData;
  const { atualizarColaborador } = usePPR();
  const [editando, setEditando] = useState(false);

  const calc = calcularPPRColaborador(colaborador, premioBase100);

  return (
    <div className="w-[310px] glow-card p-3.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg space-y-2.5">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-cyan-300 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {classeNome} • {colaborador.turno}
            </div>
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white truncate">
              {colaborador.nome}
            </h4>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {colaborador.cargo}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditando(!editando)}
          className="nodrag p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500 cursor-pointer shrink-0"
          title="Ajustar horas proporcionais e mérito individual"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Proporção
          </div>
          <div className="font-heading font-extrabold text-slate-900 dark:text-white">
            {(calc.fatorProporcionalidade * 100).toFixed(1)}%
            <span className="text-[10px] font-mono font-normal text-slate-500 ml-1">
              ({colaborador.horasTrabalhadasMes}/{colaborador.horasPrevistasMes}h)
            </span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800">
          <div className="text-[10px] font-heading font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Valor PPR
          </div>
          <div className="font-heading font-black text-sm text-emerald-950 dark:text-white">
            {formatBRL(calc.valorFinal)}
          </div>
        </div>
      </div>

      {Boolean(colaborador.ajusteIndividualPct) && (
        <div className="px-2.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-[10px] text-violet-900 dark:text-violet-200">
          <strong>Ajuste Individual ({formatPct(colaborador.ajusteIndividualPct ?? 0, true)}):</strong>{" "}
          {colaborador.ajusteIndividualJustificativa || "Justificativa registrada"}
        </div>
      )}

      {editando && (
        <div className="nodrag pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                Horas Trab.
              </label>
              <input
                type="number"
                value={colaborador.horasTrabalhadasMes}
                onChange={(e) =>
                  atualizarColaborador(colaborador.id, {
                    horasTrabalhadasMes: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                Ajuste Indiv. (%)
              </label>
              <input
                type="number"
                value={colaborador.ajusteIndividualPct ?? 0}
                onChange={(e) =>
                  atualizarColaborador(colaborador.id, {
                    ajusteIndividualPct: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
              Justificativa do Ajuste
            </label>
            <input
              type="text"
              value={colaborador.ajusteIndividualJustificativa ?? ""}
              placeholder="Ex: Mérito operacional ou falta grave..."
              onChange={(e) =>
                atualizarColaborador(colaborador.id, {
                  ajusteIndividualJustificativa: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
