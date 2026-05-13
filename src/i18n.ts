export interface TranslationCopy {
  document: {
    title: string;
    description: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
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
    optionRanking: string;
    optionRankingAria: (name: string) => string;
    rankPosition: (rank: number, optionName: string) => string;
    rankScoreAria: (optionName: string, criterionName: string) => string;
    dragOption: (optionName: string) => string;
    moveOptionUp: (optionName: string, criterionName: string) => string;
    moveOptionDown: (optionName: string, criterionName: string) => string;
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

export const copy: TranslationCopy = {
  document: {
    title: 'ClearPick | Weighted Decisions Tool',
    description:
      'Compare options with a weighted decision tool. Set priorities, rank options, and get a clear recommendation in 60 seconds.',
    howItWorksTitle:
      'How ClearPick Works | Weighted Decision Guide',
    howItWorksDescription:
      'Learn how ClearPick helps you compare options, set priorities, rank options, and explain recommendations privately.',
  },
  hero: {
    eyebrow: 'Interactive weighted decisions',
    headingAria: 'Make your hardest decision in 60 seconds',
    headingFirst: 'Make your hardest',
    headingEmphasis: 'decision',
    headingLast: 'in 60 seconds',
    description:
      'Set priorities, rank options, and see the strongest choice without sending data anywhere.',
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
      'ClearPick is a private browser-only tool that helps you compare options clearly. Set what matters, rank each choice, and see which option fits your priorities best.',
    workflowHeading: 'Three-step workflow',
    workflow: [
      {
        title: 'Name options',
        body: 'List the choices you need to compare, from two alternatives to a short ranked set.',
      },
      {
        title: 'Set priorities',
        body: 'Set importance from 0-10 so the comparison reflects your priorities instead of treating every factor equally.',
      },
      {
        title: 'Rank and compare',
        body: 'Rank options for each criterion, review the weighted score, and use the recommendation as a clear starting point.',
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
      'Your decision data is saved only in local browser storage on your device. ClearPick does not require an account, and your comparison is not uploaded to a server.',
    learnMore: 'Read the full guide',
    backToTool: 'Back to the decision tool',
    faqHeading: 'FAQ',
    faq: [
      {
        question: 'What is ClearPick?',
        answer:
          'ClearPick is a free private browser-only tool for comparing options and getting a clear recommendation quickly.',
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
      'Name options, set priorities, and rank each choice in one focused comparison.',
    localStorageNoticeTitle: 'Stored only on this device',
    localStorageNoticeBody:
      'Your decision stays in this browser. We do not upload, store, or access it.',
    onboardingGuideAria: 'Workflow guide',
    onboardingSteps: [
      'Name options',
      'Set priorities',
      'Rank and compare',
    ],
    optionsRegionAria: 'Options to compare',
    optionsHeading: 'Options to compare',
    optionsDescription:
      'Name the choices in play. Each option is ranked against the weighted criteria below.',
    optionsCount: (count) => `${count} ${count === 1 ? 'option' : 'options'}`,
    optionCards: 'Option cards',
    optionLabel: (index) => `Option ${index}`,
    optionPlaceholder: (index) => `Option ${index}`,
    newOption: 'New option',
    addOption: 'Add option',
    addOptionToScore: 'Name this option to unlock meaningful scoring.',
    liveTotal: 'Live total',
    liveScoreAria: (name) => `Live score for ${name}`,
    resultsHiddenWhileScoring: 'Results hidden while you rank.',
    limitReached: 'Limit reached: remove an option to add another.',
    removeOption: (name) => `Remove ${name}`,
    leading: 'Leading',
    tied: 'Tied',
    criteriaHeading: 'Criteria, weights, and rankings',
    criteriaDescription:
      'Name what matters, set importance from 0-10 (0 ignores a criterion, 10 makes it a top priority), then rank each option for every criterion.',
    criteriaCount: (count) => `${count} ${count === 1 ? 'criterion' : 'criteria'}`,
    scoringControls: 'Ranking controls',
    blindScoring: 'Blind ranking',
    blindScoringHelpLabel: 'Why this helps',
    blindScoringHelp:
      'Hides live totals and recommendations while you rank options, reducing bias as you compare choices.',
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
    optionRanking: 'Option ranking',
    optionRankingAria: (name) => `${name} option ranking`,
    rankPosition: (rank, optionName) => `${optionName} is ranked ${rank}`,
    rankScoreAria: (optionName, criterionName) =>
      `Interpolated score for ${optionName} on ${criterionName}`,
    dragOption: (optionName) => `Drag ${optionName}`,
    moveOptionUp: (optionName, criterionName) =>
      `Move ${optionName} up in ${criterionName} ranking`,
    moveOptionDown: (optionName, criterionName) =>
      `Move ${optionName} down in ${criterionName} ranking`,
  },
  results: {
    title: 'Results',
    noWeightHeadline:
      'Move at least one importance slider above 0 to surface a recommendation.',
    tieHeadline: (names) =>
      `Current tie: ${joinEnglishLabels(names)} are evenly matched right now.`,
    showResults: 'Show results',
    hiddenStatus: 'Results hidden while you rank.',
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
    productLabel: 'ClearPick',
    note:
      'Your data stays stored locally in this browser, so you can return to it without creating an account.',
    howItWorks: 'How it works',
    faq: 'FAQ',
    contactCta: 'Contact support',
    contactEmail: 'hugonzalezhuerta@gmail.com',
    backToTop: 'Back to top',
  },
};
