"use client";

import React from "react";
import { usePPR } from "@/context/PPRContext";
import { calcularPPRColaborador } from "@/services/pprCalculator";
import { formatBRL, formatPct } from "@/lib/utils";

export function MatrizConsolidadaView() {
  const { state, getResultadoDesafio } = usePPR();

  const linhas = state.colaboradores.map((col) => {
    const cls = state.classes.find((c) => c.id === col.classeId);
    const setor = state.setores.find((s) => s.id === col.setorId);
    const res = cls ? getResultadoDesafio(cls.desafioId) : null;
    const base100 = res?.premioFinalBase100 ?? 0;
    const calc = calcularPPRColaborador(col, base100);
    return {
      col,
      cls,
      setor,
      res,
      calc,
    };
  });

  const totalGeral = linhas.reduce((acc, l) => acc + l.calc.valorFinal, 0);

  return (
    <div className="glow-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white">
            Matriz Consolidada de Apuração PPR — AGF
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visão completa de setores, classes, eficiência, moduladores ±40%, proporcionalidade e valor final por colaborador.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-heading font-black text-emerald-800 dark:text-emerald-300">
          Folha PPR Estimada: {formatBRL(totalGeral)}
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[760px] text-xs text-left">
          <thead className="bg-slate-900 text-white font-heading uppercase text-[10px]">
            <tr>
              <th className="p-3">Colaborador</th>
              <th className="p-3">Setor &amp; Classe</th>
              <th className="p-3 text-center">Eficiência</th>
              <th className="p-3 text-right">Base Eficiência</th>
              <th className="p-3 text-center">Moduladores</th>
              <th className="p-3 text-center">Proporção</th>
              <th className="p-3 text-right">Antigo AGF (Ref.)</th>
              <th className="p-3 text-right">PPR Novo a Pagar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {linhas.map(({ col, cls, setor, res, calc }) => (
              <tr
                key={col.id}
                className="bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="p-3">
                  <div className="font-heading font-bold text-slate-900 dark:text-white">
                    {col.nome}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {col.cargo} • {col.turno}
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {setor?.nome ?? "-"}
                  </div>
                  <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono">
                    {cls?.nome ?? "-"} ({cls?.modeloPPR.toUpperCase()})
                  </div>
                </td>
                <td className="p-3 text-center font-mono font-bold">
                  {res?.eficienciaApurada ?? 80}%
                </td>
                <td className="p-3 text-right font-mono">
                  {formatBRL(res?.premioBaseEficiencia ?? 0)}
                </td>
                <td className="p-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatPct(res?.somaAjustesLimitadaPct ?? 0, true)}
                </td>
                <td className="p-3 text-center font-mono">
                  {(calc.fatorProporcionalidade * 100).toFixed(0)}%
                  {col.ajusteIndividualPct ? (
                    <span className="ml-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                      ({formatPct(col.ajusteIndividualPct, true)})
                    </span>
                  ) : null}
                </td>
                <td className="p-3 text-right font-mono text-slate-500">
                  {cls?.desafioId === "des_usi_oper"
                    ? "N/A (Novo)"
                    : formatBRL(
                        res?.comparativoModeloAntigoAGF.totalAntigoAGF ?? 0
                      )}
                </td>
                <td className="p-3 text-right font-heading font-black text-sm text-emerald-700 dark:text-emerald-300">
                  {formatBRL(calc.valorFinal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
