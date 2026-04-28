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
    eyebrow: string;
    headingAria: string;
    headingFirst: string;
    headingEmphasis: string;
    headingLast: string;
    description: string;
    start: string;
  };
  workspaceLabel: string;
  matrix: {
    editorAria: string;
    title: string;
    intro: string;
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
    label: string;
    title: string;
    noWeightHeadline: string;
    tieHeadline: (names: string[]) => string;
    leadingHeadline: (name: string) => string;
    hideResults: string;
    showResults: string;
    visibilityHelper: string;
    hiddenStatus: string;
    rankingAria: string;
    tied: string;
    leading: string;
    weightedScore: string;
    scoreBarAria: (name: string, score: string) => string;
    influence: string;
    categoryShare: string;
    noPositiveWeights: string;
    localSave: string;
    reset: string;
    matrixCount: (options: number, categories: number) => string;
  };
  footer: {
    productLabel: string;
    title: string;
    description: string;
    linksAria: string;
    links: Array<{ label: string; href: string }>;
    note: string;
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
      eyebrow: 'Interactive weighted decisions',
      headingAria: 'Make your hardest decision in 60 seconds',
      headingFirst: 'Make your hardest',
      headingEmphasis: 'decision',
      headingLast: 'in 60 seconds',
      description:
        'Weight your priorities, score your options, and get an instant recommendation grounded in logic.',
      start: 'Start',
    },
    workspaceLabel: 'Decision workspace',
    matrix: {
      editorAria: 'Decision matrix editor',
      title: 'Weighted Scoring Model',
      intro:
        'Build a weighted comparison by naming your options, setting what matters, and scoring each choice.',
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
      label: 'Results',
      title: 'Your weighted view',
      noWeightHeadline:
        'Give at least one criterion some weight to surface a recommendation.',
      tieHeadline: (names) =>
        `Current tie: ${joinEnglishLabels(names)} are evenly matched right now.`,
      leadingHeadline: (name) => `Leading option: ${name}.`,
      hideResults: 'Hide results',
      showResults: 'Show results',
      visibilityHelper:
        'Hide results while scoring to avoid anchoring on the current leader. You can reveal them anytime.',
      hiddenStatus: 'Results hidden while you score.',
      rankingAria: 'Weighted ranking',
      tied: 'Tied',
      leading: 'Leading',
      weightedScore: 'weighted score',
      scoreBarAria: (name, score) => `${name} has a weighted score of ${score}`,
      influence: 'Influence',
      categoryShare: 'Category share',
      noPositiveWeights:
        'No positive criterion weights are available, so every option is currently neutral.',
      localSave:
        'This matrix is stored locally in this browser for quick return visits.',
      reset: 'Reset matrix',
      matrixCount: (options, categories) => `${options} options / ${categories} categories`,
    },
    footer: {
      productLabel: 'Weighted Matrix',
      title: 'A calmer way to compare the choices in front of you.',
      description:
        'Use the landing space for reflection, then move into the matrix when you want a clearer weighted view.',
      linksAria: 'Footer links',
      links: [
        { label: 'About', href: '#landing-title' },
        { label: 'Templates', href: '#decision-matrix' },
        { label: 'Support', href: '#site-footer-note' },
      ],
      note:
        'Your matrix stays stored locally in this browser, so you can return to it without creating an account.',
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
      navWorkflow: 'Flujo',
      navScoring: 'Puntuación',
      navLocalSave: 'Guardado local',
      eyebrow: 'Decisiones ponderadas interactivas',
      headingAria: 'Toma tu decisión más difícil en 60 segundos',
      headingFirst: 'Toma tu decisión',
      headingEmphasis: 'más difícil',
      headingLast: 'en 60 segundos',
      description:
        'Pondera tus prioridades, evalúa tus opciones y obtén una recomendación instantánea basada en lógica.',
      start: 'Empezar',
    },
    workspaceLabel: 'Espacio de decisión',
    matrix: {
      editorAria: 'Editor de matriz de decisión',
      title: 'Modelo de puntuación ponderada',
      intro:
        'Construye una comparación ponderada nombrando tus opciones, definiendo lo importante y puntuando cada alternativa.',
      optionsRegionAria: 'Opciones para comparar',
      optionsHeading: 'Opciones para comparar',
      optionsDescription:
        'Nombra las alternativas entre las que decides. Puntuarás cada opción con los criterios ponderados de abajo.',
      optionsCount: (count) => `${count} ${count === 1 ? 'opción' : 'opciones'}`,
      optionCards: 'Tarjetas de opciones',
      optionLabel: (index) => `Opción ${index}`,
      optionPlaceholder: (index) => `Opción ${index}`,
      newOption: 'Nueva opción',
      addOption: 'Agregar opción',
      addOptionToScore: 'Agrega una opción para puntuar',
      liveTotal: 'Total en vivo',
      liveScoreAria: (name) => `Puntuación en vivo de ${name}`,
      resultsHiddenWhileScoring: 'Resultados ocultos mientras puntúas.',
      limitReached: 'Límite alcanzado: elimina una opción para agregar otra.',
      removeOption: (name) => `Eliminar ${name}`,
      leading: 'Líder',
      tied: 'Empate',
      criteriaHeading: 'Criterios, pesos y puntuaciones',
      criteriaDescription:
        'Nombra los factores importantes, define cuánto debe influir cada uno en la decisión de 0 a 10 y luego elige si cada puntuación de opción es cuantitativa o una condición de tiene/no tiene. Un peso de 0 excluye ese criterio.',
      criteriaCount: (count) => `${count} ${count === 1 ? 'criterio' : 'criterios'}`,
      criteriaList: 'Lista de criterios',
      criterionLabel: (index) => `Criterio ${index}`,
      newCriterion: 'Nuevo criterio',
      addCriterion: 'Agregar criterio',
      criterionRowAria: (name) => `Fila de criterio ${name}`,
      removeCriterion: (name) => `Eliminar ${name}`,
      importance: 'Importancia',
      importanceAria: (name) => `Importancia de ${name}`,
      scoreMode: 'Tipo de puntuación',
      scoreModeAria: (optionName, criterionName) =>
        `Modo de puntuación de ${optionName} en ${criterionName}`,
      scoreModeScale: 'Cuantitativa',
      scoreModeBoolean: 'Booleana',
      yes: 'Sí',
      no: 'No',
      booleanScoreScale: 'Sí = 10 / No = 0',
      optionScores: 'Puntuaciones de opciones',
      optionScoresAria: (name) => `Puntuaciones de opciones para ${name}`,
      scoreAria: (optionName, criterionName) =>
        `Puntuación de ${optionName} en ${criterionName}`,
    },
    results: {
      label: 'Resultados',
      title: 'Tu vista ponderada',
      noWeightHeadline:
        'Da peso al menos a un criterio para mostrar una recomendación.',
      tieHeadline: (names) =>
        `Empate actual: ${joinSpanishLabels(names)} están igualados ahora.`,
      leadingHeadline: (name) => `Opción líder: ${name}.`,
      hideResults: 'Ocultar resultados',
      showResults: 'Mostrar resultados',
      visibilityHelper:
        'Oculta los resultados mientras puntúas para evitar anclarte en la opción líder actual. Puedes revelarlos cuando quieras.',
      hiddenStatus: 'Resultados ocultos mientras puntúas.',
      rankingAria: 'Clasificación ponderada',
      tied: 'Empate',
      leading: 'Líder',
      weightedScore: 'puntuación ponderada',
      scoreBarAria: (name, score) =>
        `${name} tiene una puntuación ponderada de ${score}`,
      influence: 'Influencia',
      categoryShare: 'Participación por categoría',
      noPositiveWeights:
        'No hay pesos positivos en los criterios, así que todas las opciones están neutrales ahora.',
      localSave:
        'Esta matriz se guarda localmente en este navegador para volver rápido.',
      reset: 'Reiniciar matriz',
      matrixCount: (options, categories) =>
        `${options} opciones / ${categories} categorías`,
    },
    footer: {
      productLabel: 'Matriz ponderada',
      title: 'Una forma más serena de comparar las opciones que tienes delante.',
      description:
        'Usa el espacio inicial para reflexionar y luego pasa a la matriz cuando quieras una vista ponderada más clara.',
      linksAria: 'Enlaces del pie',
      links: [
        { label: 'Acerca de', href: '#landing-title' },
        { label: 'Plantillas', href: '#decision-matrix' },
        { label: 'Ayuda', href: '#site-footer-note' },
      ],
      note:
        'Tu matriz queda guardada localmente en este navegador para que puedas volver sin crear una cuenta.',
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
