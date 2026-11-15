"use client";

import React from "react";
import {
  CheckCircle2,
  Database,
  Download,
  FileText,
  Layers,
  RotateCcw,
} from "lucide-react";
import { usePPR } from "@/context/PPRContext";
import { GlassCapsuleButton } from "./ui/glass-capsule-button";
import { ThemeToggle } from "./ui/theme-toggle";

interface NavbarProps {
  onOpenFechamento: () => void;
}

export function Navbar({ onOpenFechamento }: NavbarProps) {
  const {
    sincronizarTodosIndicadoresDW,
    exportarBackupJSON,
    restaurarDemoAGF,
  } = usePPR();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white flex items-center justify-center font-heading font-black text-base shadow-[0_10px_24px_-6px_rgba(6,182,212,0.55)] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                Gestão PPR — AGF
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                Portas e Rodapés • Ref. 80%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Setores, Desafios 22 Faixas, Moduladores ±40%, Views DW &amp; Padrão Akiom
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/Proposta_Alteracao_PPR_AGF_Akiom.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-heading font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 flex items-center gap-1.5 transition-all"
            title="Abrir Proposta Executiva em PDF (Padrão Akiom)"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Proposta PDF</span>
          </a>

          <button
            type="button"
            onClick={() => sincronizarTodosIndicadoresDW()}
            className="min-h-[44px] px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-heading font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Sincronizar todas as Views de Data Warehouse ativas"
          >
            <Database className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="hidden md:inline">Sincronizar DW</span>
          </button>

          <button
            type="button"
            onClick={exportarBackupJSON}
            className="min-h-[44px] px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-heading font-bold text-slate-800 dark:text-slate-100 hover:border-cyan-500 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Exportar backup completo JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden lg:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={restaurarDemoAGF}
            className="min-h-[44px] px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-heading font-bold text-slate-600 dark:text-slate-300 hover:border-amber-500 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Restaurar dados iniciais da Demo AGF"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <GlassCapsuleButton
            variant="emerald"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={onOpenFechamento}
          >
            Fechar PPR
          </GlassCapsuleButton>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
