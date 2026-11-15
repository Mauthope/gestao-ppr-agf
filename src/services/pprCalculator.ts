import type {
  Colaborador,
  DesafioPPR,
  IndicadorCanvas,
  RegraIndicadorModulador,
  ResultadoCalculoDesafio,
  ResultadoModuladorDetalhe,
} from "@/types/ppr";

export function avaliarFaixaEficiencia(
  desafio: DesafioPPR,
  eficiencia: number
): { premio: number; label: string } {
  const ordenadas = [...desafio.faixasEficiencia].sort(
    (a, b) => a.eficiencia - b.eficiencia
  );
  if (ordenadas.length === 0) {
    return { premio: 0, label: "Sem faixas" };
  }
  const efFloor = Math.floor(eficiencia + 1e-6);
  if (efFloor < ordenadas[0].eficiencia) {
    return {
      premio: 0,
      label: `Abaixo de ${ordenadas[0].eficiencia.toFixed(2)}% (Sem piso)`,
    };
  }
  let matched = ordenadas[0];
  for (const faixa of ordenadas) {
    if (efFloor >= faixa.eficiencia) {
      matched = faixa;
    }
  }
  const isTop = matched.eficiencia === ordenadas[ordenadas.length - 1].eficiencia;
  return {
    premio: matched.premio,
    label: `${matched.eficiencia.toFixed(2)}%${isTop ? "+" : ""}`,
  };
}

export function avaliarFaixaModulador(
  regra: RegraIndicadorModulador,
  valor: number
): { ajustePct: number; label: string } {
  for (const faixa of regra.faixas) {
    const minOk = faixa.min === undefined ? true : valor >= faixa.min - 1e-9;
    const maxOk = faixa.max === undefined ? true : valor <= faixa.max + 1e-9;
    if (minOk && maxOk) {
      return { ajustePct: faixa.ajustePct, label: faixa.label };
    }
  }
  return { ajustePct: 0, label: "Referência (0,00%)" };
}

function calcularModeloAntigoAGF(params: {
  isLiderGeral: boolean;
  eficienciaNovaPct: number;
  hePct: number;
  faltasPct: number;
  atrasosPct: number;
  retrabalhoPct: number;
  gestaoPct: number;
}) {
  // 80% no modelo novo equivale ao 100% da meta do regulamento original AGF
  const producaoAntigaPct = Number(
    ((params.eficienciaNovaPct / 80) * 100).toFixed(1)
  );

  // 1. Produção original (Líder Setor max R$ 400 | Líder Geral max R$ 500)
  let premioProducaoAntigo = 0;
  if (params.isLiderGeral) {
    if (producaoAntigaPct >= 100) premioProducaoAntigo = 500;
    else if (producaoAntigaPct >= 98) premioProducaoAntigo = 375;
    else if (producaoAntigaPct >= 96) premioProducaoAntigo = 250;
    else if (producaoAntigaPct >= 95) premioProducaoAntigo = 125;
  } else {
    if (producaoAntigaPct >= 100) premioProducaoAntigo = 400;
    else if (producaoAntigaPct >= 98) premioProducaoAntigo = 300;
    else if (producaoAntigaPct >= 96) premioProducaoAntigo = 200;
    else if (producaoAntigaPct >= 95) premioProducaoAntigo = 100;
  }

  // 2. Horas extras original (Ranking simulado a partir do índice HE + trava >= 95%)
  let premioHorasExtrasAntigo = 0;
  if (producaoAntigaPct >= 95) {
    if (params.hePct <= 1.5) premioHorasExtrasAntigo = 150;
    else if (params.hePct <= 2.2) premioHorasExtrasAntigo = 100;
    else if (params.hePct <= 2.8) premioHorasExtrasAntigo = 50;
    else premioHorasExtrasAntigo = 0;
  }

  // 3. Frequência original (Faltas R$ 100 + Atrasos R$ 50)
  let premioFaltas = 0;
  if (params.faltasPct === 0) premioFaltas = 100;
  else if (params.faltasPct <= 2) premioFaltas = 80;
  else if (params.faltasPct <= 5) premioFaltas = 50;

  let premioAtrasos = 0;
  if (params.atrasosPct <= 1) premioAtrasos = 50;
  else if (params.atrasosPct <= 3) premioAtrasos = 35;
  else if (params.atrasosPct <= 5) premioAtrasos = 20;

  const premioFrequenciaAntigo = premioFaltas + premioAtrasos;

  // 4. Qualidade e retrabalho original (Setor max R$ 200 | Geral max R$ 300)
  let premioQualidadeAntigo = 0;
  const maxQualidade = params.isLiderGeral ? 300 : 200;
  if (params.retrabalhoPct < 2.0) premioQualidadeAntigo = maxQualidade;
  else if (params.retrabalhoPct <= 2.45)
    premioQualidadeAntigo = maxQualidade * 0.75;
  else if (params.retrabalhoPct <= 2.75)
    premioQualidadeAntigo = maxQualidade * 0.375;

  // 5. Gestão e organização 5S (max R$ 100 em 4 critérios de R$ 25)
  let premioGestaoAntigo = 0;
  if (params.gestaoPct >= 95) premioGestaoAntigo = 100;
  else if (params.gestaoPct >= 85) premioGestaoAntigo = 75;
  else if (params.gestaoPct >= 75) premioGestaoAntigo = 50;
  else if (params.gestaoPct >= 60) premioGestaoAntigo = 25;

  const totalAntigoAGF =
    premioProducaoAntigo +
    premioHorasExtrasAntigo +
    premioFrequenciaAntigo +
    premioQualidadeAntigo +
    premioGestaoAntigo;

  return {
    producaoAntigaPct,
    premioProducaoAntigo,
    premioHorasExtrasAntigo,
    premioFrequenciaAntigo,
    premioQualidadeAntigo,
    premioGestaoAntigo,
    totalAntigoAGF,
  };
}

export function calcularDesafioPPR(
  desafio: DesafioPPR,
  indicadoresSetor: IndicadorCanvas[]
): ResultadoCalculoDesafio {
  const indEficiencia = indicadoresSetor.find(
    (i) => i.chave === desafio.chaveEficiencia
  );
  const eficienciaApurada = indEficiencia ? indEficiencia.valorApurado : 80;
  const { premio: premioBaseEficiencia, label: faixaEficienciaLabel } =
    avaliarFaixaEficiencia(desafio, eficienciaApurada);

  const detalhesModuladores: ResultadoModuladorDetalhe[] = [];
  let somaAjustesBrutaPct = 0;

  for (const regra of desafio.moduladores) {
    const ind = indicadoresSetor.find((i) => i.chave === regra.chave);
    const valorApurado = ind ? ind.valorApurado : 0;
    const { ajustePct, label } = avaliarFaixaModulador(regra, valorApurado);
    somaAjustesBrutaPct += ajustePct;
    detalhesModuladores.push({
      chave: regra.chave,
      nome: regra.nome,
      valorApurado,
      unidade: regra.unidade,
      ajustePct,
      faixaAtingida: label,
    });
  }

  const somaAjustesLimitadaPct = Math.max(
    -Math.abs(desafio.perdaMaximaPct),
    Math.min(Math.abs(desafio.ganhoMaximoPct), somaAjustesBrutaPct)
  );

  const valorAjustes = Number(
    (premioBaseEficiencia * (somaAjustesLimitadaPct / 100)).toFixed(2)
  );
  const premioFinalBase100 = Number(
    Math.max(0, premioBaseEficiencia + valorAjustes).toFixed(2)
  );

  const findVal = (chave: string, fallback: number) =>
    indicadoresSetor.find((i) => i.chave === chave)?.valorApurado ?? fallback;

  const antigo = calcularModeloAntigoAGF({
    isLiderGeral: desafio.perfil === "lider_geral",
    eficienciaNovaPct: eficienciaApurada,
    hePct: findVal("controle_horas_extras", 2.5),
    faltasPct: findVal("frequencia_faltas", 1.5),
    atrasosPct: findVal("frequencia_atrasos", 1.0),
    retrabalhoPct: findVal("qualidade_retrabalho", 2.48),
    gestaoPct: findVal("gestao_organizacao_5s", 90),
  });

  return {
    eficienciaApurada,
    faixaEficienciaLabel,
    premioBaseEficiencia,
    somaAjustesBrutaPct,
    somaAjustesLimitadaPct,
    valorAjustes,
    premioFinalBase100,
    detalhesModuladores,
    comparativoModeloAntigoAGF: {
      ...antigo,
      diferencaValor: Number(
        (premioFinalBase100 - antigo.totalAntigoAGF).toFixed(2)
      ),
    },
  };
}

export function calcularPPRColaborador(
  colaborador: Colaborador,
  premioBase100: number
): {
  fatorProporcionalidade: number;
  ajusteIndividualPct: number;
  valorProporcional: number;
  valorFinal: number;
} {
  const prev = Math.max(1, colaborador.horasPrevistasMes || 220);
  const trab = Math.max(0, Math.min(prev, colaborador.horasTrabalhadasMes ?? prev));
  const fatorProporcionalidade = Number((trab / prev).toFixed(4));
  const valorProporcional = Number((premioBase100 * fatorProporcionalidade).toFixed(2));
  const ajusteIndividualPct = colaborador.ajusteIndividualPct ?? 0;
  const valorFinal = Number(
    Math.max(0, valorProporcional * (1 + ajusteIndividualPct / 100)).toFixed(2)
  );

  return {
    fatorProporcionalidade,
    ajusteIndividualPct,
    valorProporcional,
    valorFinal,
  };
}
