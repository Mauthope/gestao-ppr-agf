"use client";

import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  CalendarCheck2,
  Clock,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import { calcularPPRColaborador } from "@/services/pprCalculator";
import { formatBRL } from "@/lib/utils";
import type { Classe } from "@/types/ppr";

export interface ClasseNodeData extends Record<string, unknown> {
  classe: Classe;
  setorNome: string;
}

export function ClasseNode({ data }: NodeProps) {
  const { classe, setorNome } = data as ClasseNodeData;
  const {
    state,
    getResultadoDesafio,
    adicionarColaborador,
    adicionarTurnoClasse,
  } = usePPR();

  const [novoColabNome, setNovoColabNome] = useState("");
  const [showAddColab, setShowAddColab] = useState(false);

  const desafio = state.desafios.find((d) => d.id === classe.desafioId);
  const resultado = desafio ? getResultadoDesafio(desafio.id) : null;
  const premioBase100 = resultado?.premioFinalBase100 ?? 0;

  const colabs = state.colaboradores.filter((c) => c.classeId === classe.id);
  const somaEquipe = colabs.reduce(
    (acc, c) => acc + calcularPPRColaborador(c, premioBase100).valorFinal,
    0
  );

  const acumuladoSemestralBase100 = classe.historicoSemestral.reduce(
    (acc, h) => acc + h.premioFinalBase100,
    0
  );

  const badgeColors: Record<Classe["corAccent"], string> = {
    amber: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700",
    violet: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/60 dark:text-violet-200 dark:border-violet-700",
    cyan: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-200 dark:border-cyan-700",
  };

  return (
    <div className="w-[340px] glow-card p-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-lg space-y-3">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-indigo-600 !border-2 !border-white dark:!border-slate-900"
      />

      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold border ${badgeColors[classe.corAccent]}`}
            >
              CLASSE • {classe.modeloPPR.toUpperCase()}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Setor: {setorNome}
          </div>
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white truncate">
            {classe.nome}
          </h4>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
          <Users className="w-3.5 h-3.5" />
          {colabs.length}
        </span>
      </div>

      {/* TURNOS */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-heading font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            Turnos ({classe.turnos.length})
          </span>
          <button
            type="button"
            onClick={() =>
              adicionarTurnoClasse(classe.id, `${classe.turnos.length + 1}º Turno`)
            }
            className="nodrag text-cyan-700 dark:text-cyan-400 font-heading font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Turno
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {classe.turnos.map((t) => {
            const qtd = colabs.filter((c) => c.turno === t).length;
            return (
              <span
                key={t}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
              >
                {t} ({qtd})
              </span>
            );
          })}
        </div>
      </div>

      {/* HERANÇA AUTOMÁTICA */}
      <div className="rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 p-2.5 space-y-1">
        <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-cyan-900 dark:text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          Herança Automática do Desafio
        </div>
        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
          {desafio?.nome ?? "Sem desafio"}
        </div>
        <div className="flex items-center justify-between pt-1 text-[11px]">
          <span className="text-slate-600 dark:text-slate-300">
            Mês Atual (100%): <strong>{formatBRL(premioBase100)}</strong>
          </span>
          <span className="font-heading font-black text-emerald-700 dark:text-emerald-400">
            Equipe: {formatBRL(somaEquipe)}
          </span>
        </div>
      </div>

      {/* GRADE SEMESTRAL AUTOMÁTICA (QUANDO MODELO = SEMESTRAL) */}
      {classe.modeloPPR === "semestral" && (
        <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-heading font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Apuração Semestral (6 Meses)
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              Acum: {formatBRL(acumuladoSemestralBase100)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((mes) => {
              const reg = classe.historicoSemestral.find(
                (h) => h.mesIndex === mes
              );
              return (
                <div
                  key={mes}
                  className={`p-1.5 rounded-lg border text-center ${
                    reg
                      ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700"
                      : "bg-slate-100/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75"
                  }`}
                >
                  <div className="text-[9px] font-heading font-bold text-slate-500 dark:text-slate-400">
                    {mes}º Mês
                  </div>
                  <div className="text-[10px] font-mono font-extrabold text-slate-900 dark:text-white">
                    {reg ? formatBRL(reg.premioFinalBase100) : "Pendente"}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[9.5px] text-emerald-800 dark:text-emerald-300">
            Consolidado automaticamente pelo botão global <strong>Fechar PPR</strong> no menu.
          </div>
        </div>
      )}

      {/* CADASTRO RÁPIDO DE COLABORADOR */}
      {showAddColab ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!novoColabNome.trim()) return;
            adicionarColaborador(
              classe.id,
              novoColabNome.trim(),
              "Colaborador AGF",
              classe.turnos[0] || "1º Turno"
            );
            setNovoColabNome("");
            setShowAddColab(false);
          }}
          className="nodrag flex gap-1.5"
        >
          <input
            value={novoColabNome}
            onChange={(e) => setNovoColabNome(e.target.value)}
            placeholder="Nome do colaborador..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-heading font-bold cursor-pointer"
          >
            Salvar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddColab(true)}
          className="nodrag w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-heading font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Cadastrar Colaborador nesta Classe
        </button>
      )}
    </div>
  );
}
