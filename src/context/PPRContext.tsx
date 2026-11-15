"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AGF_SEED_STATE } from "@/data/agfSeedData";
import {
  calcularDesafioPPR,
  calcularPPRColaborador,
} from "@/services/pprCalculator";
import { simularSincronizacaoDW } from "@/services/indicadoresDWService";
import type {
  Classe,
  Colaborador,
  FechamentoPPRRegistro,
  IndicadorCanvas,
  IntegracaoIndicadorDW,
  PPRDatabaseState,
  ResultadoCalculoDesafio,
  Setor,
} from "@/types/ppr";

const STORAGE_KEY = "gestao_ppr_agf_state_v1";
const emptySubscribe = () => () => {};

interface PPRContextValue {
  state: PPRDatabaseState;
  hydrated: boolean;
  getResultadoDesafio: (desafioId: string) => ResultadoCalculoDesafio | null;
  atualizarValorIndicador: (indicadorId: string, novoValor: number) => void;
  atualizarIntegracaoDW: (
    indicadorId: string,
    integracao: IntegracaoIndicadorDW
  ) => void;
  sincronizarIndicadorDW: (indicadorId: string) => void;
  sincronizarTodosIndicadoresDW: (setorId?: string) => number;
  atualizarPosicaoNo: (
    tipo: "setor" | "classe" | "colaborador" | "indicador",
    id: string,
    position: { x: number; y: number }
  ) => void;
  atualizarColaborador: (
    colaboradorId: string,
    patch: Partial<Colaborador>
  ) => void;
  adicionarColaborador: (
    classeId: string,
    nome: string,
    cargo: string,
    turno: string
  ) => void;
  adicionarTurnoClasse: (classeId: string, nomeTurno: string) => void;
  adicionarSetor: (nome: string, codigo: string, descricao: string) => void;
  fecharPPRMensalConsolidado: (opcoes: {
    mesSemestralIndex: number;
    competencia: string;
  }) => FechamentoPPRRegistro;
  exportarBackupJSON: () => void;
  restaurarDemoAGF: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const PPRContext = createContext<PPRContextValue | null>(null);

export function PPRProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PPRDatabaseState>(AGF_SEED_STATE);
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const hasRestoredRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PPRDatabaseState;
          if (parsed?.setores?.length) {
            hasRestoredRef.current = true;
            setState(parsed);
            return;
          }
        }
      } catch {
        // fallback para seed AGF
      }
      hasRestoredRef.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !hasRestoredRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state, hydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const getResultadoDesafio = (
    desafioId: string
  ): ResultadoCalculoDesafio | null => {
    const desafio = state.desafios.find((d) => d.id === desafioId);
    if (!desafio) return null;
    const indicadoresSetor = state.indicadores.filter(
      (i) => i.setorId === desafio.setorId
    );
    return calcularDesafioPPR(desafio, indicadoresSetor);
  };

  const atualizarValorIndicador = (indicadorId: string, novoValor: number) => {
    setState((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind) =>
        ind.id === indicadorId ? { ...ind, valorApurado: novoValor } : ind
      ),
    }));
  };

  const atualizarIntegracaoDW = (
    indicadorId: string,
    integracao: IntegracaoIndicadorDW
  ) => {
    setState((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind) =>
        ind.id === indicadorId ? { ...ind, integracaoDW: integracao } : ind
      ),
    }));
    showToast("Configuração BD / View DW salva no indicador.");
  };

  const sincronizarIndicadorDW = (indicadorId: string) => {
    let atualizado: IndicadorCanvas | undefined;
    setState((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind) => {
        if (ind.id !== indicadorId) return ind;
        const { novoValor, timestamp } = simularSincronizacaoDW(ind);
        atualizado = {
          ...ind,
          valorApurado: novoValor,
          integracaoDW: ind.integracaoDW
            ? { ...ind.integracaoDW, ultimaSincronizacao: timestamp }
            : undefined,
        };
        return atualizado;
      }),
    }));
    if (atualizado) {
      showToast(
        `Indicador "${atualizado.nome}" sincronizado com DW (${atualizado.valorApurado}${atualizado.unidade}).`
      );
    }
  };

  const sincronizarTodosIndicadoresDW = (setorId?: string): number => {
    let count = 0;
    setState((prev) => ({
      ...prev,
      indicadores: prev.indicadores.map((ind) => {
        if (setorId && ind.setorId !== setorId) return ind;
        if (!ind.integracaoDW?.ativa) return ind;
        count += 1;
        const { novoValor, timestamp } = simularSincronizacaoDW(ind);
        return {
          ...ind,
          valorApurado: novoValor,
          integracaoDW: {
            ...ind.integracaoDW,
            ultimaSincronizacao: timestamp,
          },
        };
      }),
    }));
    showToast(
      count > 0
        ? `${count} indicadores sincronizados com Views de DW.`
        : "Nenhuma View DW ativa para sincronizar."
    );
    return count;
  };

  const atualizarPosicaoNo = (
    tipo: "setor" | "classe" | "colaborador" | "indicador",
    id: string,
    position: { x: number; y: number }
  ) => {
    setState((prev) => {
      if (tipo === "setor") {
        return {
          ...prev,
          setores: prev.setores.map((s) =>
            s.id === id ? { ...s, position } : s
          ),
        };
      }
      if (tipo === "classe") {
        return {
          ...prev,
          classes: prev.classes.map((c) =>
            c.id === id ? { ...c, position } : c
          ),
        };
      }
      if (tipo === "colaborador") {
        return {
          ...prev,
          colaboradores: prev.colaboradores.map((c) =>
            c.id === id ? { ...c, position } : c
          ),
        };
      }
      return {
        ...prev,
        indicadores: prev.indicadores.map((i) =>
          i.id === id ? { ...i, position } : i
        ),
      };
    });
  };

  const atualizarColaborador = (
    colaboradorId: string,
    patch: Partial<Colaborador>
  ) => {
    setState((prev) => ({
      ...prev,
      colaboradores: prev.colaboradores.map((c) =>
        c.id === colaboradorId ? { ...c, ...patch } : c
      ),
    }));
  };

  const adicionarColaborador = (
    classeId: string,
    nome: string,
    cargo: string,
    turno: string
  ) => {
    const classe = state.classes.find((c) => c.id === classeId);
    if (!classe) return;
    const colabsDaClasse = state.colaboradores.filter(
      (c) => c.classeId === classeId
    );
    const novo: Colaborador = {
      id: `col_${Date.now()}`,
      classeId,
      setorId: classe.setorId,
      nome,
      cargo: cargo || "Colaborador AGF",
      turno: turno || classe.turnos[0] || "1º Turno",
      horasPrevistasMes: 220,
      horasTrabalhadasMes: 220,
      position: {
        x: classe.position.x + 440,
        y: classe.position.y + colabsDaClasse.length * 195,
      },
    };
    setState((prev) => ({
      ...prev,
      colaboradores: [...prev.colaboradores, novo],
    }));
    showToast(`Colaborador "${nome}" cadastrado na classe.`);
  };

  const adicionarTurnoClasse = (classeId: string, nomeTurno: string) => {
    const t = nomeTurno.trim();
    if (!t) return;
    setState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classeId && !c.turnos.includes(t)
          ? { ...c, turnos: [...c.turnos, t] }
          : c
      ),
    }));
  };

  const adicionarSetor = (nome: string, codigo: string, descricao: string) => {
    const novoSetor: Setor = {
      id: `setor_${Date.now()}`,
      nome,
      codigo: codigo || "AGF-NOVO",
      descricao: descricao || "Setor produtivo AGF",
      position: { x: 460, y: 120 + state.setores.length * 520 },
    };
    setState((prev) => ({
      ...prev,
      setores: [...prev.setores, novoSetor],
    }));
    showToast(`Setor "${nome}" adicionado ao Canvas.`);
  };

  const downloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fecharPPRMensalConsolidado = (opcoes: {
    mesSemestralIndex: number;
    competencia: string;
  }): FechamentoPPRRegistro => {
    const hoje = new Date().toISOString().slice(0, 10);
    let totalPagarGeral = 0;
    let totalColaboradores = 0;
    const resumoClasses: FechamentoPPRRegistro["resumoClasses"] = [];

    const novasClasses: Classe[] = state.classes.map((cls) => {
      const desafio = state.desafios.find((d) => d.id === cls.desafioId);
      const setor = state.setores.find((s) => s.id === cls.setorId);
      const inds = state.indicadores.filter((i) => i.setorId === cls.setorId);
      const res = desafio ? calcularDesafioPPR(desafio, inds) : null;
      const premioBase100 = res?.premioFinalBase100 ?? 0;

      const colabs = state.colaboradores.filter((c) => c.classeId === cls.id);
      const totalEquipe = colabs.reduce(
        (acc, c) => acc + calcularPPRColaborador(c, premioBase100).valorFinal,
        0
      );

      totalPagarGeral += totalEquipe;
      totalColaboradores += colabs.length;

      resumoClasses.push({
        classeId: cls.id,
        classeNome: cls.nome,
        setorNome: setor?.nome ?? "-",
        modeloPPR: cls.modeloPPR,
        eficiencia: res?.eficienciaApurada ?? 80,
        premioBase100,
        totalEquipe: Number(totalEquipe.toFixed(2)),
      });

      if (cls.modeloPPR === "semestral" && res) {
        const filtrado = cls.historicoSemestral.filter(
          (h) => h.mesIndex !== opcoes.mesSemestralIndex
        );
        return {
          ...cls,
          historicoSemestral: [
            ...filtrado,
            {
              mesIndex: opcoes.mesSemestralIndex,
              competencia: opcoes.competencia,
              eficienciaApurada: res.eficienciaApurada,
              premioBase: res.premioBaseEficiencia,
              ajusteTotalPct: res.somaAjustesLimitadaPct,
              premioFinalBase100: res.premioFinalBase100,
              fechadoEm: hoje,
            },
          ].sort((a, b) => a.mesIndex - b.mesIndex),
        };
      }
      return cls;
    });

    const registro: FechamentoPPRRegistro = {
      id: `fech_${Date.now()}`,
      competencia: opcoes.competencia,
      mesSemestralIndex: opcoes.mesSemestralIndex,
      fechadoEm: hoje,
      totalPagarGeral: Number(totalPagarGeral.toFixed(2)),
      totalColaboradores,
      resumoClasses,
    };

    const nextState: PPRDatabaseState = {
      ...state,
      classes: novasClasses,
      fechamentos: [registro, ...state.fechamentos],
    };

    setState(nextState);
    downloadJson(`fechamento-ppr-agf-${hoje}.json`, {
      fechamento: registro,
      snapshotCompleto: nextState,
    });
    showToast(
      `Fechamento "${opcoes.competencia}" consolidado e Backup JSON baixado.`
    );
    return registro;
  };

  const exportarBackupJSON = () => {
    const hoje = new Date().toISOString().slice(0, 10);
    downloadJson(`backup-gestao-ppr-agf-${hoje}.json`, state);
    showToast("Backup JSON completo da AGF exportado.");
  };

  const restaurarDemoAGF = () => {
    setState(AGF_SEED_STATE);
    localStorage.removeItem(STORAGE_KEY);
    showToast("Base Demo AGF restaurada ao estado inicial.");
  };

  return (
    <PPRContext.Provider
      value={{
        state,
        hydrated,
        getResultadoDesafio,
        atualizarValorIndicador,
        atualizarIntegracaoDW,
        sincronizarIndicadorDW,
        sincronizarTodosIndicadoresDW,
        atualizarPosicaoNo,
        atualizarColaborador,
        adicionarColaborador,
        adicionarTurnoClasse,
        adicionarSetor,
        fecharPPRMensalConsolidado,
        exportarBackupJSON,
        restaurarDemoAGF,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </PPRContext.Provider>
  );
}

export function usePPR() {
  const ctx = useContext(PPRContext);
  if (!ctx) {
    throw new Error("usePPR deve ser usado dentro de PPRProvider");
  }
  return ctx;
}
