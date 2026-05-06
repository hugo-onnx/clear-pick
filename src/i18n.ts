import type { CareerMoveExampleLabels } from './utils/matrix';

export const LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = '60second-decisions:language:v1';

export interface TranslationCopy {
  document: {
    title: string;
    description: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
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
  workspaceTabs: {
    label: string;
    matrix: string;
    quickDecider: string;
  };
  seoContent: {
    eyebrow: string;
    heading: string;
    description: string;
    workflowHeading: string;
    workflow: Array<{
      title: string;
      body: string;
    }>;
    useCasesHeading: string;
    useCases: Array<{
      title: string;
      body: string;
    }>;
    privacyHeading: string;
    privacyBody: string;
    learnMore: string;
    backToTool: string;
    faqHeading: string;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  };
  quickDecider: {
    sectionAria: string;
    sectionLabel: string;
    headline: string;
    optionsGroupAria: string;
    optionLabel: (index: number) => string;
    optionPlaceholder: (index: number) => string;
    addOption: string;
    removeOption: (name: string) => string;
    decide: string;
    loadWeightedOptions: string;
    loadWeightedOptionsHint: string;
    reset: string;
    disabledHint: string;
    limitHint: string;
    result: (name: string) => string;
  };
  matrix: {
    editorAria: string;
    title: string;
    intro: string;
    localStorageNoticeTitle: string;
    localStorageNoticeBody: string;
    onboardingGuideAria: string;
    onboardingSteps: string[];
    loadExample: string;
    firstRunHintTitle: string;
    firstRunHintBody: string;
    dismissFirstRunHint: string;
    careerMoveExample: CareerMoveExampleLabels;
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
    howItWorks: string;
    faq: string;
    contactCta: string;
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
      title: '60-Second Decisions | Weighted Decisions Tool',
      description:
        'Compare options with a weighted decision tool. Weight criteria, score choices, and get a clear recommendation in 60 seconds.',
      howItWorksTitle:
        'How 60-Second Decisions Works | Weighted Decision Guide',
      howItWorksDescription:
        'Learn how 60-Second Decisions helps you compare options, weight priorities, score choices, and explain recommendations privately.',
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
    workspaceTabs: {
      label: 'Decision tools',
      matrix: 'Weighted Scoring',
      quickDecider: 'Quick Decider',
    },
    seoContent: {
      eyebrow: 'How it works',
      heading: 'A private weighted decision tool for faster choices',
      description:
        '60-Second Decisions is a private browser-only tool that helps you compare options clearly. Weight what matters, score each choice, and see which option fits your priorities best.',
      workflowHeading: 'Three-step workflow',
      workflow: [
        {
          title: 'Name options',
          body: 'List the choices you need to compare, from two alternatives to a short ranked set.',
        },
        {
          title: 'Weight criteria',
          body: 'Set importance from 0-10 so the comparison reflects your priorities instead of treating every factor equally.',
        },
        {
          title: 'Score and compare',
          body: 'Rate each option, review the weighted score, and use the recommendation as a clear starting point.',
        },
      ],
      useCasesHeading: 'When to use it',
      useCases: [
        {
          title: 'Personal decisions',
          body: 'Compare apartments, schools, trips, purchases, or other choices with multiple tradeoffs.',
        },
        {
          title: 'Career moves',
          body: 'Balance growth, compensation, flexibility, risk, and long-term fit before choosing a path.',
        },
        {
          title: 'Product prioritization',
          body: 'Score ideas by customer impact, effort, revenue potential, confidence, or strategic value.',
        },
        {
          title: 'Vendor and business comparisons',
          body: 'Evaluate vendors, tools, agencies, or business options with a repeatable weighted scoring model.',
        },
      ],
      privacyHeading: 'Private by default',
      privacyBody:
        'Your decision data is saved only in local browser storage on your device. 60-Second Decisions does not require an account, and your comparison is not uploaded to a server.',
      learnMore: 'Read the full guide',
      backToTool: 'Back to the decision tool',
      faqHeading: 'FAQ',
      faq: [
        {
          question: 'What is 60-Second Decisions?',
          answer:
            '60-Second Decisions is a free private browser-only tool for comparing options and getting a clear recommendation quickly.',
        },
        {
          question: 'How does weighted scoring work?',
          answer:
            'Weighted scoring lists your options, assigns importance to each criterion, scores every option against those criteria, and calculates a final score for comparison.',
        },
        {
          question: 'Is my decision data private?',
          answer:
            'Yes. Your comparison is stored locally in your browser, does not require an account, and is not uploaded or available to the site owner.',
        },
        {
          question: 'When should I use a weighted scoring model?',
          answer:
            'Use a weighted scoring model when you need to compare options with several criteria, make tradeoffs explicit, and explain why one choice ranks higher than another.',
        },
      ],
    },
    quickDecider: {
      sectionAria: 'Quick random decider',
      sectionLabel: 'Quick Decider',
      headline: "I can't decide between",
      optionsGroupAria: 'Quick decider options',
      optionLabel: (index) => `Quick option ${index}`,
      optionPlaceholder: (index) => `Option ${index}`,
      addOption: 'Add option',
      removeOption: (name) => `Remove ${name}`,
      decide: 'Decide for me',
      loadWeightedOptions: 'Load options',
      loadWeightedOptionsHint: 'Name at least two weighted options to load.',
      reset: 'Reset',
      disabledHint: 'Name at least two options to decide.',
      limitHint: 'Six options is the limit.',
      result: (name) => `Go with: ${name}.`,
    },
    matrix: {
      editorAria: 'Decision editor',
      title: 'Weighted Scoring',
      intro:
        'Name options, weight criteria, and score each choice in one focused comparison.',
      localStorageNoticeTitle: 'Stored only on this device',
      localStorageNoticeBody:
        'Your decision stays in this browser. We do not upload, store, or access it.',
      onboardingGuideAria: 'Workflow guide',
      onboardingSteps: [
        'Name options',
        'Weight criteria',
        'Score and compare',
      ],
      loadExample: 'Load example',
      firstRunHintTitle: 'Start with the shape of the decision',
      firstRunHintBody:
        'Name at least two options, add what matters, then move one importance slider above 0 to make the ranking meaningful.',
      dismissFirstRunHint: 'Dismiss onboarding hint',
      careerMoveExample: {
        options: {
          stayCurrentRole: 'Stay in current role',
          acceptNewRole: 'Accept new role',
          startFreelancing: 'Start freelancing',
        },
        criteria: {
          growth: 'Growth',
          compensation: 'Compensation',
          workLifeBalance: 'Work-life balance',
          risk: 'Risk',
        },
      },
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
      addOptionToScore: 'Name this option to unlock meaningful scoring.',
      liveTotal: 'Live total',
      liveScoreAria: (name) => `Live score for ${name}`,
      resultsHiddenWhileScoring: 'Results hidden while you score.',
      limitReached: 'Limit reached: remove an option to add another.',
      removeOption: (name) => `Remove ${name}`,
      leading: 'Leading',
      tied: 'Tied',
      criteriaHeading: 'Criteria, weights, and scores',
      criteriaDescription:
        'Name what matters, set importance from 0-10 (0 ignores a criterion, 10 makes it a top priority), then score each option with a 0-10 rating or a yes/no answer.',
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
        `Scoring type for ${optionName} on ${criterionName}`,
      scoreModeScale: 'Rate 0-10',
      scoreModeBoolean: 'Yes / No',
      yes: 'Yes',
      no: 'No',
      booleanScoreScale: 'Yes, gives full credit. No, gives none.',
      optionScores: 'Option scores',
      optionScoresAria: (name) => `${name} option scores`,
      scoreAria: (optionName, criterionName) =>
        `Score for ${optionName} on ${criterionName}`,
    },
    results: {
      title: 'Results',
      noWeightHeadline:
        'Move at least one importance slider above 0 to surface a recommendation.',
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
        'Move an importance slider above 0 and the ranking will update.',
      reset: 'Start over',
      resetDialogTitle: 'Start over?',
      resetDialogDescription:
        'This will clear your options, criteria, weights, and scores stored in this browser.',
      resetDialogCancel: 'Keep editing',
      resetDialogConfirm: 'Start over',
      matrixCount: (options, categories) => `${options} options / ${categories} criteria`,
    },
    footer: {
      productLabel: '60-Second Decisions',
      note:
        'Your data stays stored locally in this browser, so you can return to it without creating an account.',
      howItWorks: 'How it works',
      faq: 'FAQ',
      contactCta: 'Contact support',
      contactEmail: 'hugonzalezhuerta@gmail.com',
      backToTop: 'Back to top',
    },
  },
  es: {
    document: {
      title: '60-Second Decisions | Herramienta gratuita de decisión ponderada',
      description:
        'Compara opciones con una herramienta privada de decisión ponderada. Pondera prioridades, puntúa alternativas y obtén una recomendación clara en 60 segundos. Sin cuenta.',
      howItWorksTitle:
        'Cómo funciona 60-Second Decisions | Guía de decisión ponderada',
      howItWorksDescription:
        'Aprende cómo 60-Second Decisions te ayuda a comparar opciones, ponderar prioridades, puntuar alternativas y explicar recomendaciones de forma privada.',
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
    workspaceTabs: {
      label: 'Herramientas de decisión',
      matrix: 'Puntuación ponderada',
      quickDecider: 'Selector rápido',
    },
    seoContent: {
      eyebrow: '¿Cómo funciona?',
      heading: 'Una herramienta privada de decisión ponderada para elegir más rápido',
      description:
        '60-Second Decisions es una herramienta privada que funciona solo en el navegador para comparar opciones con claridad. Pondera lo que importa, puntúa cada alternativa y ve qué opción encaja mejor con tus prioridades.',
      workflowHeading: 'Flujo en tres pasos',
      workflow: [
        {
          title: 'Nombra opciones',
          body: 'Lista las alternativas que necesitas comparar, desde dos opciones hasta un conjunto corto para clasificar.',
        },
        {
          title: 'Pondera criterios',
          body: 'Define la importancia de 0 a 10 para que la comparación refleje tus prioridades en vez de tratar todos los factores igual.',
        },
        {
          title: 'Puntúa y compara',
          body: 'Valora cada opción, revisa la puntuación ponderada y usa la recomendación como punto de partida claro.',
        },
      ],
      useCasesHeading: 'Cuándo usarla',
      useCases: [
        {
          title: 'Decisiones personales',
          body: 'Compara pisos, escuelas, viajes, compras u otras elecciones con varios tradeoffs.',
        },
        {
          title: 'Movimientos de carrera',
          body: 'Equilibra crecimiento, compensación, flexibilidad, riesgo y encaje a largo plazo antes de elegir.',
        },
        {
          title: 'Priorización de producto',
          body: 'Puntúa ideas por impacto en clientes, esfuerzo, potencial de ingresos, confianza o valor estratégico.',
        },
        {
          title: 'Comparaciones de proveedores y negocio',
          body: 'Evalúa proveedores, herramientas, agencias u opciones de negocio con un modelo de puntuación ponderada repetible.',
        },
      ],
      privacyHeading: 'Privada por defecto',
      privacyBody:
        'Tus datos de decisión se guardan solo en el almacenamiento local del navegador en tu dispositivo. 60-Second Decisions no requiere cuenta y tu comparación no se sube a un servidor.',
      learnMore: 'Leer la guía completa',
      backToTool: 'Volver a la herramienta',
      faqHeading: 'FAQ',
      faq: [
        {
          question: '¿Qué es 60-Second Decisions?',
          answer:
            '60-Second Decisions es una herramienta gratuita y privada, solo en el navegador, para comparar opciones y obtener una recomendación clara rápidamente.',
        },
        {
          question: '¿Cómo funciona la puntuación ponderada?',
          answer:
            'La puntuación ponderada lista opciones, asigna importancia a cada criterio, puntúa cada opción contra esos criterios y calcula una puntuación final para comparar.',
        },
        {
          question: '¿Mis datos de decisión son privados?',
          answer:
            'Sí. Tu comparación se guarda localmente en tu navegador, no requiere cuenta y no se sube ni queda disponible para el propietario del sitio.',
        },
        {
          question: '¿Cuándo debería usar un modelo de puntuación ponderada?',
          answer:
            'Usa un modelo de puntuación ponderada cuando necesites comparar opciones con varios criterios, hacer explícitos los tradeoffs y explicar por qué una alternativa queda por encima de otra.',
        },
      ],
    },
    quickDecider: {
      sectionAria: 'Selector aleatorio rápido',
      sectionLabel: 'Selector rápido',
      headline: 'No puedo decidir entre',
      optionsGroupAria: 'Opciones del selector rápido',
      optionLabel: (index) => `Opción rápida ${index}`,
      optionPlaceholder: (index) => `Opción ${index}`,
      addOption: 'Añadir opción',
      removeOption: (name) => `Eliminar ${name}`,
      decide: 'Decide por mí',
      loadWeightedOptions: 'Cargar opciones ponderadas',
      loadWeightedOptionsHint:
        'Nombra al menos dos opciones ponderadas para cargarlas.',
      reset: 'Reiniciar',
      disabledHint: 'Nombra al menos dos opciones para decidir.',
      limitHint: 'Seis opciones es el límite.',
      result: (name) => `Quédate con: ${name}.`,
    },
    matrix: {
      editorAria: 'Editor de decisión',
      title: 'Modelo de puntuación ponderada',
      intro:
        'Nombra opciones, pondera criterios y puntúa cada alternativa en una comparación clara.',
      localStorageNoticeTitle: 'Guardado en este dispositivo',
      localStorageNoticeBody:
        'Tu decisión queda en este navegador. No subimos, almacenamos ni accedemos a esos datos.',
      onboardingGuideAria: 'Guía de flujo de trabajo',
      onboardingSteps: [
        'Nombra opciones',
        'Pondera criterios',
        'Puntúa y compara',
      ],
      loadExample: 'Cargar ejemplo',
      firstRunHintTitle: 'Empieza por la forma de la decisión',
      firstRunHintBody:
        'Nombra al menos dos opciones, añade lo que importa y sube una importancia por encima de 0 para que la clasificación sea útil.',
      dismissFirstRunHint: 'Descartar pista de inicio',
      careerMoveExample: {
        options: {
          stayCurrentRole: 'Quedarme en mi puesto actual',
          acceptNewRole: 'Aceptar el nuevo puesto',
          startFreelancing: 'Empezar como freelance',
        },
        criteria: {
          growth: 'Crecimiento',
          compensation: 'Compensación',
          workLifeBalance: 'Equilibrio vida-trabajo',
          risk: 'Riesgo',
        },
      },
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
      addOptionToScore: 'Nombra esta opción para desbloquear una puntuación útil.',
      liveTotal: 'Total en tiempo real',
      liveScoreAria: (name) => `Puntuación en tiempo real de ${name}`,
      resultsHiddenWhileScoring: 'Resultados ocultos mientras puntúas.',
      limitReached: 'Límite alcanzado: elimina una opción para añadir otra.',
      removeOption: (name) => `Eliminar ${name}`,
      leading: 'En cabeza',
      tied: 'Empate',
      criteriaHeading: 'Criterios, pesos y puntuaciones',
      criteriaDescription:
        'Nombra lo que importa, define la importancia de 0 a 10 (0 ignora el criterio, 10 lo convierte en prioridad máxima) y puntúa cada opción con una valoración de 0 a 10 o una respuesta sí/no.',
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
        `Tipo de puntuación para ${optionName} en ${criterionName}`,
      scoreModeScale: 'Valorar 0-10',
      scoreModeBoolean: 'Sí / No',
      yes: 'Sí',
      no: 'No',
      booleanScoreScale: 'Sí, da la puntuación completa. No, no suma.',
      optionScores: 'Puntuaciones de opciones',
      optionScoresAria: (name) => `Puntuaciones de opciones para ${name}`,
      scoreAria: (optionName, criterionName) =>
        `Puntuación para ${optionName} en ${criterionName}`,
    },
    results: {
      title: 'Resultados',
      noWeightHeadline:
        'Sube al menos un control de importancia por encima de 0 para mostrar una recomendación.',
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
        'Sube un control de importancia por encima de 0 y la clasificación se actualizará.',
      reset: 'Empezar de nuevo',
      resetDialogTitle: '¿Empezar de nuevo?',
      resetDialogDescription:
        'Se borrarán tus opciones, criterios, pesos y puntuaciones guardados en este navegador.',
      resetDialogCancel: 'Seguir editando',
      resetDialogConfirm: 'Empezar de nuevo',
      matrixCount: (options, categories) =>
        `${options} opciones / ${categories} criterios`,
    },
    footer: {
      productLabel: '60-Second Decisions',
      note:
        'Tu decisión queda guardada localmente en este navegador para que puedas volver sin crear una cuenta.',
      howItWorks: 'Cómo funciona',
      faq: 'Preguntas frecuentes',
      contactCta: 'Contactar soporte',
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
