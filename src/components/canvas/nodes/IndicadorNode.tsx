"use client";

import React, { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Activity,
  Database,
  Minus,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import {
  CATALOGO_VIEWS_DW_AGF,
  gerarSqlPreviewDW,
} from "@/services/indicadoresDWService";
import type { IndicadorCanvas, IntegracaoIndicadorDW } from "@/types/ppr";

export interface IndicadorNodeData extends Record<string, unknown> {
  indicador: IndicadorCanvas;
  setorNome: string;
}

export function IndicadorNode({ data }: NodeProps) {
  const { indicador, setorNome } = data as IndicadorNodeData;
  const {
    atualizarValorIndicador,
    atualizarIntegracaoDW,
    sincronizarIndicadorDW,
  } = usePPR();

  const [modalDWOpen, setModalDWOpen] = useState(false);

  const template = CATALOGO_VIEWS_DW_AGF[indicador.chave];
  const [dwDraft, setDwDraft] = useState<IntegracaoIndicadorDW>(
    indicador.integracaoDW ?? {
      ativa: true,
      tipoFonte: "view_dw",
      conexaoNome: "DW Corporativo AGF",
      schema: template.schema,
      objetoNome: template.objetoNome,
      colunaValor: template.colunaValor,
      agregacao: template.agregacao,
      filtroSetor: `ds_setor = '${setorNome}'`,
      sincronizacaoAutomatica: true,
    }
  );

  const isEficiencia = indicador.chave.startsWith("eficiencia_");
  const step = isEficiencia ? 1 : indicador.chave === "gestao_organizacao_5s" ? 1 : 0.1;

  const ajustar = (delta: number) => {
    const raw = Math.max(0, Number((indicador.valorApurado + delta).toFixed(2)));
    const next = isEficiencia ? Math.min(100, Math.round(raw)) : raw;
    atualizarValorIndicador(indicador.id, next);
  };

  return (
    <>
      <div className="w-[300px] glow-card p-3.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 shadow-lg">
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white dark:!border-slate-900"
        />

        <div className="flex items-start justify-between gap-2 pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 truncate">
                Indicador AGF
              </span>
            </div>
            <h4 className="font-heading font-extrabold text-xs text-slate-900 dark:text-white truncate mt-0.5">
              {indicador.nome}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setModalDWOpen(true)}
            className="nodrag px-2 py-1 rounded-lg text-[10px] font-heading font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer shrink-0"
            title="Configurar conexão com Banco / View DW"
          >
            <Database className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            BD / DW
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Valor Apurado
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
            {indicador.metaReferenciaLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => ajustar(-step)}
            className="nodrag w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 h-9">
            <input
              type="number"
              step={step}
              value={indicador.valorApurado}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v)) atualizarValorIndicador(indicador.id, Math.max(0, v));
              }}
              className="nodrag w-full bg-transparent text-center font-heading font-black text-base text-slate-900 dark:text-white focus:outline-none"
            />
            <span className="text-xs font-heading font-bold text-slate-500 dark:text-slate-400 ml-1">
              {indicador.unidade}
            </span>
          </div>

          <button
            type="button"
            onClick={() => ajustar(step)}
            className="nodrag w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {indicador.integracaoDW?.ativa ? (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-[10px]">
            <div className="min-w-0 truncate font-mono font-semibold text-cyan-800 dark:text-cyan-300">
              DW: {indicador.integracaoDW.objetoNome}
              {indicador.integracaoDW.ultimaSincronizacao && (
                <span className="ml-1 opacity-75">
                  ({indicador.integracaoDW.ultimaSincronizacao})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => sincronizarIndicadorDW(indicador.id)}
              className="nodrag p-1 rounded-md text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 cursor-pointer shrink-0"
              title="Sincronizar com View DW agora"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Alimentando Cálculos
            </span>
            <span className="font-mono">{setorNome}</span>
          </div>
        )}
      </div>

      {modalDWOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glow-card p-5 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  Conexão BD / View DW — {indicador.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {template.descricao}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDWOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tipo de Fonte
                </label>
                <select
                  value={dwDraft.tipoFonte}
                  onChange={(e) =>
                    setDwDraft({
                      ...dwDraft,
                      tipoFonte: e.target.value as IntegracaoIndicadorDW["tipoFonte"],
                      ativa: e.target.value !== "manual",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="view_dw">View de DW (Data Warehouse)</option>
                  <option value="banco_sql">Banco de Dados SQL / ERP</option>
                  <option value="supabase">Supabase Realtime</option>
                  <option value="manual">Manual (Sem automação)</option>
                </select>
              </div>

              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Agregação
                </label>
                <select
                  value={dwDraft.agregacao}
                  onChange={(e) =>
                    setDwDraft({
                      ...dwDraft,
                      agregacao: e.target.value as IntegracaoIndicadorDW["agregacao"],
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="AVG">AVG (Média)</option>
                  <option value="SUM">SUM (Soma)</option>
                  <option value="LAST">LAST (Último Fechamento)</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                </select>
              </div>

              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Schema
                </label>
                <input
                  value={dwDraft.schema}
                  onChange={(e) =>
                    setDwDraft({ ...dwDraft, schema: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  View / Tabela
                </label>
                <input
                  value={dwDraft.objetoNome}
                  onChange={(e) =>
                    setDwDraft({ ...dwDraft, objetoNome: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Coluna de Valor
                </label>
                <input
                  value={dwDraft.colunaValor}
                  onChange={(e) =>
                    setDwDraft({ ...dwDraft, colunaValor: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-heading font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Filtro Setor (WHERE)
                </label>
                <input
                  value={dwDraft.filtroSetor ?? ""}
                  onChange={(e) =>
                    setDwDraft({ ...dwDraft, filtroSetor: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="text-[11px] font-heading font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preview da Query SQL Gerada
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto">
                {gerarSqlPreviewDW(dwDraft, setorNome)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalDWOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  atualizarIntegracaoDW(indicador.id, dwDraft);
                  if (dwDraft.ativa) {
                    sincronizarIndicadorDW(indicador.id);
                  }
                  setModalDWOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md cursor-pointer"
              >
                Salvar &amp; Sincronizar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
