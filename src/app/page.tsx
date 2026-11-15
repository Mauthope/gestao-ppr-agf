"use client";

import React, { useState } from "react";
import {
  Building2,
  GitBranch,
  Scale,
  TableProperties,
  TrendingUp,
  Users,
} from "lucide-react";
import { PPRProvider, usePPR } from "@/context/PPRContext";
import { calcularPPRColaborador } from "@/services/pprCalculator";
import { formatBRL } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { SquircleKpiCard } from "@/components/ui/squircle-kpi-card";
import { PPRCanvas } from "@/components/canvas/PPRCanvas";
import { ComparativoAGFView } from "@/components/ComparativoAGFView";
import { MatrizConsolidadaView } from "@/components/MatrizConsolidadaView";
import { FechamentoPPRModal } from "@/components/FechamentoPPRModal";

type ActiveTab = "canvas" | "comparativo" | "matriz";

function DashboardContent() {
  const { state, getResultadoDesafio, toastMessage } = usePPR();
  const [activeTab, setActiveTab] = useState<ActiveTab>("canvas");
  const [fechamentoOpen, setFechamentoOpen] = useState(false);

  const totalPagarMes = state.colaboradores.reduce((acc, col) => {
    const cls = state.classes.find((c) => c.id === col.classeId);
    const res = cls ? getResultadoDesafio(cls.desafioId) : null;
    return acc + calcularPPRColaborador(col, res?.premioFinalBase100 ?? 0).valorFinal;
  }, 0);

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    accent: string;
  }> = [
    {
      id: "canvas",
      label: "1. Canvas em Árvore (AGF)",
      icon: <GitBranch className="w-4 h-4" />,
      accent:
        "bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_10px_22px_-4px_rgba(14,165,233,0.6)] border-cyan-300/60",
    },
    {
      id: "comparativo",
      label: "2. Proposta & Simulador Antigo vs. Novo",
      icon: <Scale className="w-4 h-4" />,
      accent:
        "bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-slate-950 shadow-[0_10px_22px_-4px_rgba(245,158,11,0.55)] border-amber-200/80",
    },
    {
      id: "matriz",
      label: "3. Matriz Consolidada",
      icon: <TableProperties className="w-4 h-4" />,
      accent:
        "bg-gradient-to-b from-violet-500 via-purple-600 to-indigo-700 text-white shadow-[0_10px_22px_-4px_rgba(139,92,246,0.6)] border-violet-300/60",
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <Navbar onOpenFechamento={() => setFechamentoOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 4 SQUIRCLE KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SquircleKpiCard
            badgeNumber={1}
            title="Setores & Desafios AGF"
            value={`${state.setores.length} / ${state.desafios.length}`}
            subtitle="22 faixas (Ref. 80% = antigo 100%)"
            icon={Building2}
            color="blue"
          />
          <SquircleKpiCard
            badgeNumber={2}
            title="Classes & Pessoas"
            value={`${state.classes.length} / ${state.colaboradores.length}`}
            subtitle="Mensal (Líderes) e Semestral (Oper.)"
            icon={Users}
            color="violet"
          />
          <SquircleKpiCard
            badgeNumber={3}
            title="Indicadores Ativos"
            value={state.indicadores.length}
            subtitle="Moduladores ±40% integráveis ao DW"
            icon={TrendingUp}
            color="amber"
          />
          <SquircleKpiCard
            badgeNumber={4}
            title="Folha PPR Estimada"
            value={formatBRL(totalPagarMes)}
            subtitle="Atualizada em tempo real pelo Canvas"
            icon={Scale}
            color="emerald"
          />
        </section>

        {/* TACTILE PILL TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            className="flex flex-wrap items-center gap-2.5 p-2 rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] px-5 py-2 rounded-full font-heading font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? tab.accent
                      : "border-transparent bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs px-3.5 py-2 rounded-full bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 font-medium">
            Dica Demo: altere qualquer indicador no Canvas e veja o PPR recalcular ao vivo.
          </div>
        </div>

        {/* CONTEÚDO DA ABA ATIVA */}
        {activeTab === "canvas" && <PPRCanvas />}
        {activeTab === "comparativo" && <ComparativoAGFView />}
        {activeTab === "matriz" && <MatrizConsolidadaView />}
      </main>

      <FechamentoPPRModal
        open={fechamentoOpen}
        onClose={() => setFechamentoOpen(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-cyan-500/40 shadow-2xl text-xs font-heading font-bold">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <PPRProvider>
      <DashboardContent />
    </PPRProvider>
  );
}
