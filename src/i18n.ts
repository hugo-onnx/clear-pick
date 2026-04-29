export const LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'weighted-matrix:language:v1';

export interface TranslationCopy {
  document: {
    title: string;
    description: string;
  };
  languageToggle: {
    label: string;
    english: string;
    spanish: string;
    switchToEnglish: string;
    switchToSpanish: string;
  };
  hero: {
    navWorkflow: string;
    navScoring: string;
    navLocalSave: string;
    navAria: string;
    eyebrow: string;
    headingAria: string;
    headingFirst: string;
    headingEmphasis: string;
    headingLast: string;
    description: string;
    start: string;
    localStorageNoticeTitle: string;
    localStorageNoticeBody: string;
  };
  workspaceLabel: string;
  workspaceTabs: {
    label: string;
    scoreMatrix: string;
    scoringPanel: string;
    scoringPanelAria: string;
    audit: string;
    auditPanel: string;
    auditPanelAria: string;
  };
  matrix: {
    editorAria: string;
    title: string;
    intro: string;
    localStorageNoticeTitle: string;
    localStorageNoticeBody: string;
    optionsRegionAria: string;
    optionsHeading: string;
    optionsDescription: string;
    optionsCount: (count: number) => string;
    optionCards: string;
    optionLabel: (index: number) => string;
    optionPlaceholder: (index: number) => string;
    newOption: string;
    addOption: string;
    addOptionToScore: string;
    liveTotal: string;
    liveScoreAria: (name: string) => string;
    resultsHiddenWhileScoring: string;
    limitReached: string;
    removeOption: (name: string) => string;
    leading: string;
    tied: string;
    criteriaHeading: string;
    criteriaDescription: string;
    criteriaCount: (count: number) => string;
    scoringControls: string;
    blindScoring: string;
    blindScoringHelpLabel: string;
    blindScoringHelp: string;
    criteriaList: string;
    criterionLabel: (index: number) => string;
    newCriterion: string;
    addCriterion: string;
    criterionRowAria: (name: string) => string;
    removeCriterion: (name: string) => string;
    importance: string;
    importanceAria: (name: string) => string;
    scoreMode: string;
    scoreModeAria: (optionName: string, criterionName: string) => string;
    scoreModeScale: string;
    scoreModeBoolean: string;
    yes: string;
    no: string;
    booleanScoreScale: string;
    optionScores: string;
    optionScoresAria: (name: string) => string;
    scoreAria: (optionName: string, criterionName: string) => string;
  };
  audit: {
    title: string;
    intro: string;
    formulaTitle: string;
    formulaWeight: string;
    formulaContribution: string;
    formulaTotal: string;
    scaleRule: string;
    booleanRule: string;
    zeroWeightRule: string;
    checklistTitle: string;
    checklistItems: string[];
    hiddenTitle: string;
    hiddenDescription: string;
    weightsTitle: string;
    weightsDescription: string;
    contributionTitle: string;
    contributionDescription: string;
    contributionBreakdownAria: string;
    optionContributionAria: (name: string) => string;
    rankingTitle: string;
    rankingDescription: string;
    rankingAria: string;
    neutralTitle: string;
    noPositiveWeights: string;
    criterionColumn: string;
    rawWeightColumn: string;
    influenceColumn: string;
    scoringColumn: string;
    behaviorColumn: string;
    optionColumn: string;
    scoreColumn: string;
    contributionColumn: string;
    totalColumn: string;
    rankColumn: string;
    noteColumn: string;
    included: string;
    excluded: string;
    scaleScore: string;
    booleanScore: string;
    optionTotal: (name: string, score: string) => string;
    contributionFormula: (score: string, weight: string) => string;
    contributionValue: (value: string) => string;
    rankingLeader: string;
    rankingTiedForLead: string;
    rankingBehindLeader: (gap: string) => string;
    tieHandlingNote: string;
    showResults: string;
  };
  results: {
    title: string;
    noWeightHeadline: string;
    tieHeadline: (names: string[]) => string;
    showResults: string;
    hiddenStatus: string;
    recommendationAria: string;
    rankingAria: string;
    recommendationEyebrow: string;
    recommendationTitle: (name: string) => string;
    recommendationTieTitle: (names: string[]) => string;
    recommendationEmptyTitle: string;
    topScore: string;
    closestAlternative: string;
    aheadBy: (gap: string) => string;
    optionScore: (name: string, score: string) => string;
    topContributors: string;
    tiedGap: (names: string[]) => string;
    noContributionDrivers: string;
    contributionValue: (value: string) => string;
    contributionDetail: (score: string, weight: string) => string;
    contributionBarAria: (
      criterionName: string,
      optionName: string,
      contribution: string,
    ) => string;
    fullRankingTitle: string;
    showFullRanking: string;
    hideFullRanking: string;
    rankingGapLeader: string;
    rankingGapFromLeader: (gap: string) => string;
    rankingTiedForLead: string;
    tied: string;
    leading: string;
    weightedScore: string;
    scoreBarAria: (name: string, score: string) => string;
    noPositiveWeights: string;
    reset: string;
    resetDialogTitle: string;
    resetDialogDescription: string;
    resetDialogCancel: string;
    resetDialogConfirm: string;
    matrixCount: (options: number, categories: number) => string;
  };
  footer: {
    productLabel: string;
    note: string;
    contactLabel: string;
    contactEmail: string;
    backToScoring: string;
  };
}

function joinEnglishLabels(labels: string[]): string {
  if (labels.length <= 1) {
    return labels[0] ?? '';
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function joinSpanishLabels(labels: string[]): string {
  if (labels.length <= 1) {
    return labels[0] ?? '';
  }

  if (labels.length === 2) {
    return `${labels[0]} y ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
}

export const translations: Record<Language, TranslationCopy> = {
  en: {
    document: {
      title: '60-Second Decisions',
      description: 'Reflect on complex life decisions with an interactive weighted matrix.',
    },
    languageToggle: {
      label: 'Language',
      english: 'EN',
      spanish: 'ES',
      switchToEnglish: 'Switch to English',
      switchToSpanish: 'Switch to Spanish',
    },
    hero: {
      navWorkflow: 'Workflow',
      navScoring: 'Scoring',
      navLocalSave: 'Local save',
      navAria: 'Hero navigation',
      eyebrow: 'Interactive weighted decisions',
      headingAria: 'Make your hardest decision in 60 seconds',
      headingFirst: 'Make your hardest',
      headingEmphasis: 'decision',
      headingLast: 'in 60 seconds',
      description:
        'Weight your priorities, score your options, and get an instant recommendation grounded in logic.',
      start: 'Start',
      localStorageNoticeTitle: 'Data stored only on your device',
      localStorageNoticeBody:
        'Your information is saved locally in this browser. We do not upload, store, or access your decision data.',
    },
    workspaceLabel: 'Decision workspace',
    workspaceTabs: {
      label: 'Decision workspace views',
      scoreMatrix: 'Score matrix',
      scoringPanel: 'Score matrix workspace',
      scoringPanelAria: 'Score matrix workspace',
      audit: 'How scoring works',
      auditPanel: 'Scoring audit',
      auditPanelAria: 'How scoring works',
    },
    matrix: {
      editorAria: 'Decision matrix editor',
      title: 'Weighted Scoring Model',
      intro:
        'Build a weighted comparison by naming your options, setting what matters, and scoring each choice.',
      localStorageNoticeTitle: 'Data stored only on your device',
      localStorageNoticeBody:
        'Your matrix is saved locally in this browser. We do not upload, store, or access your decision data.',
      optionsRegionAria: 'Options to compare',
      optionsHeading: 'Options to compare',
      optionsDescription:
        "Name the choices you're deciding between. You'll score each option against the weighted criteria below.",
      optionsCount: (count) => `${count} ${count === 1 ? 'option' : 'options'}`,
      optionCards: 'Option cards',
      optionLabel: (index) => `Option ${index}`,
      optionPlaceholder: (index) => `Option ${index}`,
      newOption: 'New option',
      addOption: 'Add option',
      addOptionToScore: 'Add an option to score',
      liveTotal: 'Live total',
      liveScoreAria: (name) => `Live score for ${name}`,
      resultsHiddenWhileScoring: 'Results hidden while you score.',
      limitReached: 'Limit reached: remove an option to add another.',
      removeOption: (name) => `Remove ${name}`,
      leading: 'Leading',
      tied: 'Tied',
      criteriaHeading: 'Criteria, weights, and scores',
      criteriaDescription:
        'Name the factors that matter, set how strongly each one should influence the decision from 0-10, then choose whether each option score is quantitative or a has/does-not-have condition. A weight of 0 excludes that criterion.',
      criteriaCount: (count) => `${count} ${count === 1 ? 'criterion' : 'criteria'}`,
      scoringControls: 'Scoring controls',
      blindScoring: 'Blind scoring',
      blindScoringHelpLabel: 'Why this helps',
      blindScoringHelp:
        'Hides live totals and recommendations while you score, helping reduce bias as you compare options.',
      criteriaList: 'Criteria list',
      criterionLabel: (index) => `Criterion ${index}`,
      newCriterion: 'New criterion',
      addCriterion: 'Add criterion',
      criterionRowAria: (name) => `${name} criterion row`,
      removeCriterion: (name) => `Remove ${name}`,
      importance: 'Importance',
      importanceAria: (name) => `Importance for ${name}`,
      scoreMode: 'Scoring type',
      scoreModeAria: (optionName, criterionName) =>
        `Scoring mode for ${optionName} on ${criterionName}`,
      scoreModeScale: 'Quantitative',
      scoreModeBoolean: 'Boolean',
      yes: 'Yes',
      no: 'No',
      booleanScoreScale: 'Yes = 10 / No = 0',
      optionScores: 'Option scores',
      optionScoresAria: (name) => `${name} option scores`,
      scoreAria: (optionName, criterionName) =>
        `Score for ${optionName} on ${criterionName}`,
    },
    audit: {
      title: 'How scoring works',
      intro:
        'Audit the current recommendation by checking how each criterion weight is normalized and how every option contributes to its final score.',
      formulaTitle: 'Formula',
      formulaWeight:
        'Normalized weight = positive criterion weight / total positive weight.',
      formulaContribution: 'Contribution = normalized weight x option score.',
      formulaTotal: 'Total score = sum of contributions.',
      scaleRule: 'Scale scoring uses 0-10.',
      booleanRule: 'Boolean scoring uses Yes = 10 / No = 0.',
      zeroWeightRule: 'A weight of 0 is excluded from totals.',
      checklistTitle: 'Audit checklist',
      checklistItems: [
        'Confirm the raw weights match your actual priorities.',
        'Check whether the normalized influence percentages feel defensible.',
        'Review the largest contributions before accepting the ranking.',
      ],
      hiddenTitle: 'Blind scoring is on',
      hiddenDescription:
        'The methodology and normalized weights stay visible, but live totals, contribution rows, and ranking are hidden until results are shown.',
      weightsTitle: 'Normalized weights',
      weightsDescription:
        'Only positive weights are included in the denominator used for influence percentages.',
      contributionTitle: 'Contribution breakdown',
      contributionDescription:
        'Each row multiplies an option score by the criterion influence shown above.',
      contributionBreakdownAria: 'Contribution breakdown',
      optionContributionAria: (name) => `${name} contribution breakdown`,
      rankingTitle: 'Ranking notes',
      rankingDescription:
        'Options are sorted by total score. Equal top totals are marked as tied.',
      rankingAria: 'Scoring audit ranking',
      neutralTitle: 'No ranking yet',
      noPositiveWeights:
        'No positive criterion weights are available, so every option is currently neutral.',
      criterionColumn: 'Criterion',
      rawWeightColumn: 'Raw weight',
      influenceColumn: 'Influence',
      scoringColumn: 'Scoring',
      behaviorColumn: 'Behavior',
      optionColumn: 'Option',
      scoreColumn: 'Score',
      contributionColumn: 'Contribution',
      totalColumn: 'Total',
      rankColumn: 'Rank',
      noteColumn: 'Note',
      included: 'Included',
      excluded: 'Excluded',
      scaleScore: 'Scale 0-10',
      booleanScore: 'Yes = 10 / No = 0',
      optionTotal: (name, score) => `${name} total: ${score}`,
      contributionFormula: (score, weight) => `${score} score x ${weight} weight`,
      contributionValue: (value) => `${value} contribution`,
      rankingLeader: 'Leading',
      rankingTiedForLead: 'Tied for first',
      rankingBehindLeader: (gap) => `${gap} behind leader`,
      tieHandlingNote:
        'If top totals are equal after calculation, the decision is treated as a tie instead of forcing a winner.',
      showResults: 'Show results to audit live totals.',
    },
    results: {
      title: 'Results',
      noWeightHeadline:
        'Give at least one criterion some weight to surface a recommendation.',
      tieHeadline: (names) =>
        `Current tie: ${joinEnglishLabels(names)} are evenly matched right now.`,
      showResults: 'Show results',
      hiddenStatus: 'Results hidden while you score.',
      recommendationAria: 'Recommendation preview',
      rankingAria: 'Weighted ranking',
      recommendationEyebrow: 'Recommendation',
      recommendationTitle: (name) => `${name} is the strongest option`,
      recommendationTieTitle: (names) => `${joinEnglishLabels(names)} are tied`,
      recommendationEmptyTitle: 'No recommendation yet',
      topScore: 'Top score',
      closestAlternative: 'Closest alternative',
      aheadBy: (gap) => `Ahead by ${gap}`,
      optionScore: (name, score) => `${name} (${score})`,
      topContributors: 'Top contributors',
      tiedGap: (names) =>
        `No score gap: ${joinEnglishLabels(names)} are tied for first.`,
      noContributionDrivers:
        'No criteria are adding points to this option yet.',
      contributionValue: (value) => `${value} contribution`,
      contributionDetail: (score, weight) => `${score} score x ${weight} weight`,
      contributionBarAria: (criterionName, optionName, contribution) =>
        `${criterionName} contributes ${contribution} to ${optionName}`,
      fullRankingTitle: 'Full ranking',
      showFullRanking: 'See full ranking',
      hideFullRanking: 'Hide full ranking',
      rankingGapLeader: 'Leader',
      rankingGapFromLeader: (gap) => `${gap} behind leader`,
      rankingTiedForLead: 'Tied for first',
      tied: 'Tied',
      leading: 'Leading',
      weightedScore: 'weighted score',
      scoreBarAria: (name, score) => `${name} has a weighted score of ${score}`,
      noPositiveWeights:
        'No positive criterion weights are available, so every option is currently neutral.',
      reset: 'Reset matrix',
      resetDialogTitle: 'Reset this matrix?',
      resetDialogDescription:
        'This will clear your options, criteria, weights, and scores stored in this browser.',
      resetDialogCancel: 'Keep editing',
      resetDialogConfirm: 'Reset matrix',
      matrixCount: (options, categories) => `${options} options / ${categories} categories`,
    },
    footer: {
      productLabel: 'Weighted Scoring Model',
      note:
        'Your matrix stays stored locally in this browser, so you can return to it without creating an account.',
      contactLabel: 'Contact',
      contactEmail: 'hugonzalezhuerta@gmail.com',
      backToScoring: 'Back to scoring',
    },
  },
  es: {
    document: {
      title: 'Decisiones en 60 segundos',
      description:
        'Reflexiona sobre decisiones complejas con una matriz ponderada interactiva.',
    },
    languageToggle: {
      label: 'Idioma',
      english: 'EN',
      spanish: 'ES',
      switchToEnglish: 'Cambiar a inglés',
      switchToSpanish: 'Cambiar a español',
    },
    hero: {
      navWorkflow: 'Flujo de trabajo',
      navScoring: 'Puntuación',
      navLocalSave: 'Guardado local',
      navAria: 'Navegación de inicio',
      eyebrow: 'Decisiones ponderadas interactivas',
      headingAria: 'Toma tu decisión más difícil en 60 segundos',
      headingFirst: 'Toma tu decisión',
      headingEmphasis: 'más difícil',
      headingLast: 'en 60 segundos',
      description:
        'Pondera tus prioridades, evalúa tus opciones y obtén una recomendación instantánea basada en la lógica.',
      start: 'Empezar',
      localStorageNoticeTitle: 'Guardado solo en este dispositivo',
      localStorageNoticeBody:
        'Tu matriz se guarda localmente en este navegador. No subimos, almacenamos ni accedemos a los datos de tu decisión.',
    },
    workspaceLabel: 'Espacio de decisión',
    workspaceTabs: {
      label: 'Vistas del espacio de decisión',
      scoreMatrix: 'Puntuar matriz',
      scoringPanel: 'Espacio para puntuar la matriz',
      scoringPanelAria: 'Espacio para puntuar la matriz',
      audit: 'Cómo funciona la puntuación',
      auditPanel: 'Auditoría de puntuación',
      auditPanelAria: 'Cómo funciona la puntuación',
    },
    matrix: {
      editorAria: 'Editor de matriz de decisión',
      title: 'Modelo de puntuación ponderada',
      intro:
        'Construye una comparación ponderada nombrando tus opciones, definiendo qué importa y puntuando cada alternativa.',
      localStorageNoticeTitle: 'Guardado solo en este dispositivo',
      localStorageNoticeBody:
        'Tu matriz se guarda localmente en este navegador. No subimos, almacenamos ni accedemos a los datos de tu decisión.',
      optionsRegionAria: 'Opciones para comparar',
      optionsHeading: 'Opciones para comparar',
      optionsDescription:
        'Nombra las alternativas entre las que estás decidiendo. Puntuarás cada opción según los criterios ponderados de abajo.',
      optionsCount: (count) => `${count} ${count === 1 ? 'opción' : 'opciones'}`,
      optionCards: 'Tarjetas de opciones',
      optionLabel: (index) => `Opción ${index}`,
      optionPlaceholder: (index) => `Opción ${index}`,
      newOption: 'Nueva opción',
      addOption: 'Añadir opción',
      addOptionToScore: 'Añade una opción para puntuarla',
      liveTotal: 'Total en tiempo real',
      liveScoreAria: (name) => `Puntuación en tiempo real de ${name}`,
      resultsHiddenWhileScoring: 'Resultados ocultos mientras puntúas.',
      limitReached: 'Límite alcanzado: elimina una opción para añadir otra.',
      removeOption: (name) => `Eliminar ${name}`,
      leading: 'En cabeza',
      tied: 'Empate',
      criteriaHeading: 'Criterios, pesos y puntuaciones',
      criteriaDescription:
        'Nombra los factores que importan, define de 0 a 10 cuánto debe influir cada uno en la decisión y elige si cada opción se puntuará con una escala cuantitativa o con una condición de cumple/no cumple. Un peso de 0 excluye ese criterio.',
      criteriaCount: (count) => `${count} ${count === 1 ? 'criterio' : 'criterios'}`,
      scoringControls: 'Controles de puntuación',
      blindScoring: 'Puntuación a ciegas',
      blindScoringHelpLabel: 'Por qué ayuda',
      blindScoringHelp:
        'Oculta los totales en tiempo real y las recomendaciones mientras puntúas, para ayudar a reducir sesgos al comparar opciones.',
      criteriaList: 'Lista de criterios',
      criterionLabel: (index) => `Criterio ${index}`,
      newCriterion: 'Nuevo criterio',
      addCriterion: 'Añadir criterio',
      criterionRowAria: (name) => `Fila del criterio ${name}`,
      removeCriterion: (name) => `Eliminar ${name}`,
      importance: 'Importancia',
      importanceAria: (name) => `Importancia de ${name}`,
      scoreMode: 'Tipo de puntuación',
      scoreModeAria: (optionName, criterionName) =>
        `Modo de puntuación para ${optionName} en ${criterionName}`,
      scoreModeScale: 'Cuantitativa',
      scoreModeBoolean: 'Booleana',
      yes: 'Sí',
      no: 'No',
      booleanScoreScale: 'Sí = 10 / No = 0',
      optionScores: 'Puntuaciones de opciones',
      optionScoresAria: (name) => `Puntuaciones de opciones para ${name}`,
      scoreAria: (optionName, criterionName) =>
        `Puntuación para ${optionName} en ${criterionName}`,
    },
    audit: {
      title: 'Cómo funciona la puntuación',
      intro:
        'Audita la recomendación actual revisando cómo se normaliza cada peso y cómo contribuye cada opción a su puntuación final.',
      formulaTitle: 'Fórmula',
      formulaWeight:
        'Peso normalizado = peso positivo del criterio / suma de pesos positivos.',
      formulaContribution:
        'Contribución = peso normalizado x puntuación de la opción.',
      formulaTotal: 'Puntuación total = suma de contribuciones.',
      scaleRule: 'La puntuación de escala usa 0-10.',
      booleanRule: 'La puntuación booleana usa Sí = 10 / No = 0.',
      zeroWeightRule: 'Un peso de 0 se excluye de los totales.',
      checklistTitle: 'Lista de auditoría',
      checklistItems: [
        'Confirma que los pesos brutos reflejan tus prioridades reales.',
        'Comprueba si los porcentajes de influencia normalizada son defendibles.',
        'Revisa las mayores contribuciones antes de aceptar la clasificación.',
      ],
      hiddenTitle: 'La puntuación a ciegas está activa',
      hiddenDescription:
        'La metodología y los pesos normalizados siguen visibles, pero los totales en tiempo real, las contribuciones y la clasificación se ocultan hasta que muestres los resultados.',
      weightsTitle: 'Pesos normalizados',
      weightsDescription:
        'Solo los pesos positivos se incluyen en el denominador usado para calcular los porcentajes de influencia.',
      contributionTitle: 'Desglose de contribuciones',
      contributionDescription:
        'Cada fila multiplica la puntuación de una opción por la influencia del criterio mostrada arriba.',
      contributionBreakdownAria: 'Desglose de contribuciones',
      optionContributionAria: (name) => `Desglose de contribuciones de ${name}`,
      rankingTitle: 'Notas de clasificación',
      rankingDescription:
        'Las opciones se ordenan por puntuación total. Los totales más altos iguales se marcan como empate.',
      rankingAria: 'Clasificación de auditoría de puntuación',
      neutralTitle: 'Aún no hay clasificación',
      noPositiveWeights:
        'No hay criterios con pesos positivos, así que todas las opciones quedan neutras por ahora.',
      criterionColumn: 'Criterio',
      rawWeightColumn: 'Peso bruto',
      influenceColumn: 'Influencia',
      scoringColumn: 'Puntuación',
      behaviorColumn: 'Comportamiento',
      optionColumn: 'Opción',
      scoreColumn: 'Puntuación',
      contributionColumn: 'Contribución',
      totalColumn: 'Total',
      rankColumn: 'Puesto',
      noteColumn: 'Nota',
      included: 'Incluido',
      excluded: 'Excluido',
      scaleScore: 'Escala 0-10',
      booleanScore: 'Sí = 10 / No = 0',
      optionTotal: (name, score) => `Total de ${name}: ${score}`,
      contributionFormula: (score, weight) =>
        `${score} de puntuación x ${weight} de peso`,
      contributionValue: (value) => `${value} de contribución`,
      rankingLeader: 'En cabeza',
      rankingTiedForLead: 'Empate en primer lugar',
      rankingBehindLeader: (gap) => `${gap} por detrás del líder`,
      tieHandlingNote:
        'Si los totales más altos son iguales después del cálculo, la decisión se trata como empate en vez de forzar una opción ganadora.',
      showResults: 'Muestra los resultados para auditar los totales en tiempo real.',
    },
    results: {
      title: 'Resultados',
      noWeightHeadline:
        'Asigna peso al menos a un criterio para mostrar una recomendación.',
      tieHeadline: (names) =>
        `Empate actual: ${joinSpanishLabels(names)} tienen la misma puntuación ahora mismo.`,
      showResults: 'Mostrar resultados',
      hiddenStatus: 'Resultados ocultos mientras puntúas.',
      recommendationAria: 'Vista previa de recomendación',
      rankingAria: 'Clasificación ponderada',
      recommendationEyebrow: 'Recomendación',
      recommendationTitle: (name) => `${name} es la opción más sólida`,
      recommendationTieTitle: (names) => `${joinSpanishLabels(names)} empatan`,
      recommendationEmptyTitle: 'Aún no hay recomendación',
      topScore: 'Puntuación más alta',
      closestAlternative: 'Alternativa más cercana',
      aheadBy: (gap) => `Ventaja de ${gap}`,
      optionScore: (name, score) => `${name} (${score})`,
      topContributors: 'Principales contribuciones',
      tiedGap: (names) =>
        `Sin diferencia de puntuación: ${joinSpanishLabels(names)} comparten el primer lugar.`,
      noContributionDrivers:
        'Ningún criterio suma puntos a esta opción todavía.',
      contributionValue: (value) => `${value} de contribución`,
      contributionDetail: (score, weight) => `${score} de puntuación x ${weight} de peso`,
      contributionBarAria: (criterionName, optionName, contribution) =>
        `${criterionName} aporta ${contribution} a ${optionName}`,
      fullRankingTitle: 'Clasificación completa',
      showFullRanking: 'Ver clasificación completa',
      hideFullRanking: 'Ocultar clasificación completa',
      rankingGapLeader: 'En cabeza',
      rankingGapFromLeader: (gap) => `${gap} por detrás del líder`,
      rankingTiedForLead: 'Empate en primer lugar',
      tied: 'Empate',
      leading: 'En cabeza',
      weightedScore: 'puntuación ponderada',
      scoreBarAria: (name, score) =>
        `${name} tiene una puntuación ponderada de ${score}`,
      noPositiveWeights:
        'No hay criterios con pesos positivos, así que todas las opciones quedan neutras por ahora.',
      reset: 'Reiniciar matriz',
      resetDialogTitle: '¿Reiniciar esta matriz?',
      resetDialogDescription:
        'Se borrarán tus opciones, criterios, pesos y puntuaciones guardados en este navegador.',
      resetDialogCancel: 'Seguir editando',
      resetDialogConfirm: 'Reiniciar matriz',
      matrixCount: (options, categories) =>
        `${options} opciones / ${categories} categorías`,
    },
    footer: {
      productLabel: 'Modelo de puntuación ponderada',
      note:
        'Tu matriz queda guardada localmente en este navegador para que puedas volver sin crear una cuenta.',
      contactLabel: 'Contacto',
      contactEmail: 'hugonzalezhuerta@gmail.com',
      backToScoring: 'Volver a la puntuación',
    },
  },
};

export function loadLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGES.includes(storedLanguage as Language)
      ? (storedLanguage as Language)
      : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors and keep the selected in-memory language active.
  }
}
