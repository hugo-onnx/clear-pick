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
    backToTop: string;
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
      eyebrow: 'Interactive weighted decisions',
      headingAria: 'Make your hardest decision in 60 seconds',
      headingFirst: 'Make your hardest',
      headingEmphasis: 'decision',
      headingLast: 'in 60 seconds',
      description:
        'Weight priorities, score options, and see the strongest choice without sending data anywhere.',
      start: 'Start',
      localStorageNoticeTitle: 'Stored only on this device',
      localStorageNoticeBody:
        'Your decision stays in this browser. We do not upload, store, or access it.',
    },
    workspaceLabel: 'Decision workspace',
    matrix: {
      editorAria: 'Decision matrix editor',
      title: 'Weighted Scoring Model',
      intro:
        'Name options, weight criteria, and score each choice in one focused comparison.',
      localStorageNoticeTitle: 'Stored only on this device',
      localStorageNoticeBody:
        'Your matrix stays in this browser. We do not upload, store, or access it.',
      optionsRegionAria: 'Options to compare',
      optionsHeading: 'Options to compare',
      optionsDescription:
        'Name the choices in play. Each option is scored against the weighted criteria below.',
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
        'Name what matters, set each weight from 0-10, then score every option by scale or yes/no. A weight of 0 excludes that criterion.',
      criteriaCount: (count) => `${count} ${count === 1 ? 'criterion' : 'criteria'}`,
      scoringControls: 'Scoring controls',
      blindScoring: 'Blind scoring',
      blindScoringHelpLabel: 'Why this helps',
      blindScoringHelp:
        'Hides live totals and recommendations while you score, reducing bias as you compare options.',
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
      matrixCount: (options, categories) => `${options} options / ${categories} criteria`,
    },
    footer: {
      productLabel: 'Weighted Scoring Model',
      note:
        'Your matrix stays stored locally in this browser, so you can return to it without creating an account.',
      contactLabel: 'Contact',
      contactEmail: 'hugonzalezhuerta@gmail.com',
      backToTop: 'Back to top',
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
      eyebrow: 'Decisiones ponderadas interactivas',
      headingAria: 'Toma tu decisión más difícil en 60 segundos',
      headingFirst: 'Toma tu decisión',
      headingEmphasis: 'más difícil',
      headingLast: 'en 60 segundos',
      description:
        'Pondera prioridades, puntúa opciones y ve la alternativa más sólida sin enviar datos.',
      start: 'Empezar',
      localStorageNoticeTitle: 'Guardado en este dispositivo',
      localStorageNoticeBody:
        'Tu decisión queda en este navegador. No subimos, almacenamos ni accedemos a esos datos.',
    },
    workspaceLabel: 'Espacio de decisión',
    matrix: {
      editorAria: 'Editor de matriz de decisión',
      title: 'Modelo de puntuación ponderada',
      intro:
        'Nombra opciones, pondera criterios y puntúa cada alternativa en una comparación clara.',
      localStorageNoticeTitle: 'Guardado en este dispositivo',
      localStorageNoticeBody:
        'Tu matriz queda en este navegador. No subimos, almacenamos ni accedemos a esos datos.',
      optionsRegionAria: 'Opciones para comparar',
      optionsHeading: 'Opciones para comparar',
      optionsDescription:
        'Nombra las alternativas en juego. Cada opción se puntúa con los criterios ponderados de abajo.',
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
        'Nombra lo que importa, define cada peso de 0 a 10 y puntúa cada opción con escala o sí/no. Un peso de 0 excluye ese criterio.',
      criteriaCount: (count) => `${count} ${count === 1 ? 'criterio' : 'criterios'}`,
      scoringControls: 'Controles de puntuación',
      blindScoring: 'Puntuación a ciegas',
      blindScoringHelpLabel: 'Por qué ayuda',
      blindScoringHelp:
        'Oculta totales y recomendaciones mientras puntúas, reduciendo sesgos al comparar opciones.',
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
        `${options} opciones / ${categories} criterios`,
    },
    footer: {
      productLabel: 'Modelo de puntuación ponderada',
      note:
        'Tu matriz queda guardada localmente en este navegador para que puedas volver sin crear una cuenta.',
      contactLabel: 'Contacto',
      contactEmail: 'hugonzalezhuerta@gmail.com',
      backToTop: 'Volver arriba',
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
