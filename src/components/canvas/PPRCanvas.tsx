"use client";

import React, { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { usePPR } from "@/context/PPRContext";
import { IndicadorNode } from "./nodes/IndicadorNode";
import { SetorNode } from "./nodes/SetorNode";
import { ClasseNode } from "./nodes/ClasseNode";
import { ColaboradorNode } from "./nodes/ColaboradorNode";

const nodeTypes = {
  indicador: IndicadorNode,
  setor: SetorNode,
  classe: ClasseNode,
  colaborador: ColaboradorNode,
};

export function PPRCanvas() {
  const { state, getResultadoDesafio, atualizarPosicaoNo } = usePPR();

  const nodes: Node[] = useMemo(() => {
    const list: Node[] = [];

    for (const ind of state.indicadores) {
      const setor = state.setores.find((s) => s.id === ind.setorId);
      list.push({
        id: ind.id,
        type: "indicador",
        position: ind.position,
        data: {
          indicador: ind,
          setorNome: setor?.nome ?? "-",
        },
      });
    }

    for (const setor of state.setores) {
      const desafios = state.desafios.filter((d) => d.setorId === setor.id);
      const qtdClasses = state.classes.filter(
        (c) => c.setorId === setor.id
      ).length;
      const qtdColaboradores = state.colaboradores.filter(
        (c) => c.setorId === setor.id
      ).length;
      list.push({
        id: setor.id,
        type: "setor",
        position: setor.position,
        data: {
          setor,
          desafios,
          qtdClasses,
          qtdColaboradores,
        },
      });
    }

    for (const cls of state.classes) {
      const setor = state.setores.find((s) => s.id === cls.setorId);
      list.push({
        id: cls.id,
        type: "classe",
        position: cls.position,
        data: {
          classe: cls,
          setorNome: setor?.nome ?? "-",
        },
      });
    }

    for (const col of state.colaboradores) {
      const cls = state.classes.find((c) => c.id === col.classeId);
      const res = cls ? getResultadoDesafio(cls.desafioId) : null;
      list.push({
        id: col.id,
        type: "colaborador",
        position: col.position,
        data: {
          colaborador: col,
          classeNome: cls?.nome ?? "-",
          premioBase100: res?.premioFinalBase100 ?? 0,
        },
      });
    }

    return list;
  }, [state, getResultadoDesafio]);

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];

    for (const ind of state.indicadores) {
      list.push({
        id: `e_${ind.id}_${ind.setorId}`,
        source: ind.id,
        target: ind.setorId,
        animated: Boolean(ind.integracaoDW?.ativa),
        style: {
          stroke: ind.integracaoDW?.ativa ? "#0891b2" : "#64748b",
          strokeWidth: 2,
          strokeDasharray: "6 4",
        },
      });
    }

    for (const cls of state.classes) {
      list.push({
        id: `e_${cls.setorId}_${cls.id}`,
        source: cls.setorId,
        target: cls.id,
        style: {
          stroke: "#0284c7",
          strokeWidth: 2.5,
        },
      });
    }

    for (const col of state.colaboradores) {
      list.push({
        id: `e_${col.classeId}_${col.id}`,
        source: col.classeId,
        target: col.id,
        style: {
          stroke: "#4f46e5",
          strokeWidth: 2.2,
        },
      });
    }

    return list;
  }, [state]);

  const onNodesChange = (changes: NodeChange[]) => {
    for (const ch of changes) {
      if (ch.type === "position" && ch.position && ch.dragging === false) {
        const id = ch.id;
        if (state.setores.some((s) => s.id === id)) {
          atualizarPosicaoNo("setor", id, ch.position);
        } else if (state.classes.some((c) => c.id === id)) {
          atualizarPosicaoNo("classe", id, ch.position);
        } else if (state.colaboradores.some((c) => c.id === id)) {
          atualizarPosicaoNo("colaborador", id, ch.position);
        } else if (state.indicadores.some((i) => i.id === id)) {
          atualizarPosicaoNo("indicador", id, ch.position);
        }
      }
    }
  };

  return (
    <div className="w-full h-[760px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 shadow-xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.14 }}
        minZoom={0.25}
        maxZoom={1.5}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color="#94a3b8"
        />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            if (n.type === "setor") return "#0891b2";
            if (n.type === "classe") return "#059669";
            if (n.type === "colaborador") return "#4f46e5";
            return "#f59e0b";
          }}
        />
      </ReactFlow>
    </div>
  );
}
