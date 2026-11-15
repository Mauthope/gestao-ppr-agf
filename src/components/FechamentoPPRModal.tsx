"use client";

import React, { useMemo, useState } from "react";
import { CalendarCheck2, Download, Lock, X } from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import { calcularPPRColaborador } from "@/services/pprCalculator";
import { formatBRL } from "@/lib/utils";
import { GlassCapsuleButton } from "./ui/glass-capsule-button";

interface FechamentoPPRModalProps {
  open: boolean;
  onClose: () => void;
}

export function FechamentoPPRModal({ open, onClose }: FechamentoPPRModalProps) {
  const { state, getResultadoDesafio, fecharPPRMensalConsolidado } = usePPR();

  const proximoMesLivre = useMemo(() => {
    const semestral = state.classes.find((c) => c.modeloPPR === "semestral");
    if (!semestral) return 1;
    const usados = semestral.historicoSemestral.map((h) => h.mesIndex);
    for (let m = 1; m <= 6; m++) {
      if (!usados.includes(m)) return m;
    }
    return 1;
  }, [state.classes]);

  const [competencia, setCompetencia] = useState("Novembro/2026");
  const [mesSemestralIndex, setMesSemestralIndex] =
    useState<number>(proximoMesLivre);

  if (!open) return null;

  const linhas = state.classes.map((cls) => {
    const setor = state.setores.find((s) => s.id === cls.setorId);
    const res = getResultadoDesafio(cls.desafioId);
    const base100 = res?.premioFinalBase100 ?? 0;
    const colabs = state.colaboradores.filter((c) => c.classeId === cls.id);
    const totalEquipe = colabs.reduce(
      (acc, c) => acc + calcularPPRColaborador(c, base100).valorFinal,
      0
    );
    return {
      classe: cls,
      setorNome: setor?.nome ?? "-",
      eficiencia: res?.eficienciaApurada ?? 80,
      base100,
      qtdColab: colabs.length,
      totalEquipe,
    };
  });

  const totalGeral = linhas.reduce((acc, l) => acc + l.totalEquipe, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glow-card p-6 bg-white dark:bg-slate-900 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                Fechamento Global do PPR — AGF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolida todas as classes mensais/semestrais e dispara download automático do Backup JSON.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Competência do Fechamento
            </label>
            <input
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mês no Ciclo Semestral (Classes Semestrais)
            </label>
            <select
              value={mesSemestralIndex}
              onChange={(e) => setMesSemestralIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white font-semibold"
            >
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <option key={m} value={m}>
                  {m}º Mês do Semestre
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-heading uppercase text-[10px]">
              <tr>
                <th className="p-3">Setor &amp; Classe</th>
                <th className="p-3 text-center">Modelo</th>
                <th className="p-3 text-center">Eficiência</th>
                <th className="p-3 text-right">Base 100%</th>
                <th className="p-3 text-right">Total Equipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {linhas.map((l) => (
                <tr
                  key={l.classe.id}
                  className="bg-white dark:bg-slate-900/60"
                >
                  <td className="p-3">
                    <div className="font-heading font-bold text-slate-900 dark:text-white">
                      {l.classe.nome}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {l.setorNome} • {l.qtdColab} colaborador(es)
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase">
                      {l.classe.modeloPPR}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-cyan-700 dark:text-cyan-400">
                    {l.eficiencia}%
                  </td>
                  <td className="p-3 text-right font-mono font-semibold">
                    {formatBRL(l.base100)}
                  </td>
                  <td className="p-3 text-right font-heading font-black text-emerald-700 dark:text-emerald-400">
                    {formatBRL(l.totalEquipe)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-950 font-heading font-black border-t border-slate-200 dark:border-slate-800">
              <tr>
                <td colSpan={4} className="p-3 text-right text-slate-700 dark:text-slate-300">
                  TOTAL CONSOLIDADO DA FOLHA PPR NO MÊS:
                </td>
                <td className="p-3 text-right text-base text-emerald-700 dark:text-emerald-400">
                  {formatBRL(totalGeral)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 shrink-0" />
          <span>
            Ao confirmar, o <strong>{mesSemestralIndex}º Mês</strong> será gravado automaticamente em todas as classes semestrais e o arquivo <code>.json</code> de auditoria será baixado.
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-heading font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <GlassCapsuleButton
            variant="emerald"
            icon={<Download className="w-4 h-4" />}
            onClick={() => {
              fecharPPRMensalConsolidado({ mesSemestralIndex, competencia });
              onClose();
            }}
          >
            Consolidar Mês &amp; Baixar Backup JSON
          </GlassCapsuleButton>
        </div>
      </div>
    </div>
  );
}
