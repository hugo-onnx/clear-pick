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
    copyright: string;
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
      'Stop overthinking your decisions. ClearPick helps you compare options, weight your options, and find a clear answer — privately, in your browser.',
    howItWorksTitle: 'How ClearPick Works | Weighted Decision Guide',
    howItWorksDescription:
      'Learn how ClearPick helps you compare options, set priorities, rank choices, and reach a clear recommendation — privately, without an account.',
  },
  hero: {
    eyebrow: 'Weighted decisions, in your browser',
    headingAria: 'Stop overthinking. Start deciding.',
    headingFirst: 'Stop overthinking.',
    headingEmphasis: 'Start deciding.',
    headingLast: '',
    description:
      'Name your options, rank your choices, and find your answer.',
    start: 'Start deciding',
    localStorageNoticeTitle: 'Your decision stays on this device',
    localStorageNoticeBody:
      'Nothing is uploaded. Nothing is shared. It lives in your browser until you clear it.',
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
      'ClearPick is a private, browser-only tool that helps you compare options clearly. Name your choices, weight what matters, rank each one, and find the answer that fits your priorities.',
    workflowHeading: 'Three steps',
    workflow: [
      {
        title: 'Name your choices',
        body: 'List what you are deciding between — two options or up to six.',
      },
      {
        title: 'Set what matters',
        body: 'Assign importance from 0 to 10 so the comparison reflects your actual priorities, not equal weight across everything.',
      },
      {
        title: 'Rank and compare',
        body: 'Rank each option against your criteria, review the weighted score, and use the recommendation as a clear starting point.',
      },
    ],
    useCasesHeading: 'When to use it',
    useCases: [
      {
        title: 'Personal decisions',
        body: 'Compare apartments, schools, trips, purchases, or any choice with multiple tradeoffs you keep circling.',
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
      'Your decision data is saved only in local browser storage on your device. ClearPick does not require an account, and your comparison is never uploaded to a server.',
    learnMore: 'Read the full guide',
    backToTool: 'Back to the decision tool',
    faqHeading: 'FAQ',
    faq: [
      {
        question: 'What is ClearPick?',
        answer:
          'ClearPick is a free, private, browser-only tool for comparing options and reaching a clear recommendation without an account or server.',
      },
      {
        question: 'How does weighted scoring work?',
        answer:
          'You list your options, assign importance to each criterion, rank every option against those criteria, and get a final weighted score to compare.',
      },
      {
        question: 'Is my decision data private?',
        answer:
          'Yes. Your comparison is stored locally in your browser, requires no account, and is never uploaded or available to the site owner.',
      },
      {
        question: 'When should I use a weighted scoring model?',
        answer:
          'Use it when you need to compare options across several criteria, make tradeoffs explicit, and explain why one choice ranks higher than another.',
      },
    ],
  },
  quickDecider: {
    sectionAria: 'Quick random decider',
    sectionLabel: 'Quick Decider',
    headline: 'I can\'t decide between',
    optionsGroupAria: 'Quick decider options',
    optionLabel: (index) => `Quick option ${index}`,
    optionPlaceholder: (index) => `Option ${index}`,
    addOption: 'Add option',
    removeOption: (name) => `Remove ${name}`,
    decide: 'Decide for me',
    loadWeightedOptions: 'Load options',
    loadWeightedOptionsHint: 'Name at least two weighted options to load.',
    reset: 'Reset',
    disabledHint: 'Add two options first.',
    limitHint: "That's the max — six options.",
    result: (name) => `Go with ${name}.`,
  },
  matrix: {
    editorAria: 'Decision editor',
    title: 'Weighted Scoring',
    intro: 'Name your choices, weight what matters, rank everything once.',
    localStorageNoticeTitle: 'Stored only on this device',
    localStorageNoticeBody:
      'Your decision stays in this browser. We do not upload, store, or access it.',
    onboardingGuideAria: 'Workflow guide',
    onboardingSteps: ['Name your options', 'Set what matters', 'Rank and compare'],
    optionsRegionAria: 'Options to compare',
    optionsHeading: 'Your options',
    optionsDescription:
      "These are the choices you're deciding between. Each one will be judged against your criteria.",
    optionsCount: (count) => `${count} ${count === 1 ? 'option' : 'options'}`,
    optionCards: 'Option cards',
    optionLabel: (index) => `Option ${index}`,
    optionPlaceholder: (index) =>
      index === 1 ? 'Option 1' : index === 2 ? 'Option 2' : `Option ${index}`,
    newOption: 'New option',
    addOption: 'Add option',
    addOptionToScore: 'Give this option a name to start ranking it.',
    liveTotal: 'Live total',
    liveScoreAria: (name) => `Live score for ${name}`,
    resultsHiddenWhileScoring: 'Scores are hidden — rank without bias.',
    limitReached: 'Six options max. Remove one to add another.',
    removeOption: (name) => `Remove ${name}`,
    leading: 'Leading',
    tied: 'Tied',
    criteriaHeading: 'What matters to you',
    criteriaDescription:
      'Name each criterion, set how much it matters (0 = ignore it, 10 = it\'s everything), then rank your options against it.',
    criteriaCount: (count) => `${count} ${count === 1 ? 'criterion' : 'criteria'}`,
    scoringControls: 'Ranking controls',
    blindScoring: 'Blind ranking',
    blindScoringHelpLabel: 'Why use this?',
    blindScoringHelp:
      "Hides scores and results while you rank, so earlier rankings don't influence later ones.",
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
    booleanScoreScale: 'Yes gives full credit. No gives none.',
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
      'Raise at least one importance above 0 and a winner will appear.',
    tieHeadline: (names) =>
      `Current tie: ${joinEnglishLabels(names)} are evenly matched right now.`,
    showResults: 'Show results',
    hiddenStatus: 'Scores are hidden while you rank.',
    recommendationAria: 'Recommendation preview',
    rankingAria: 'Weighted ranking',
    recommendationEyebrow: 'The pick',
    recommendationTitle: (name) => `${name} comes out ahead`,
    recommendationTieTitle: (names) => `${joinEnglishLabels(names)} are tied`,
    recommendationEmptyTitle: 'No recommendation yet',
    topScore: 'Top score',
    closestAlternative: 'Closest alternative',
    aheadBy: (gap) => `Ahead by ${gap}`,
    optionScore: (name, score) => `${name} (${score})`,
    topContributors: 'Top contributors',
    tiedGap: (names) =>
      `No score gap: ${joinEnglishLabels(names)} are tied for first.`,
    noContributionDrivers: 'No criteria are adding points to this option yet.',
    contributionValue: (value) => `${value} contribution`,
    contributionDetail: (score, weight) => `${score} score × ${weight} weight`,
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
      'Raise an importance slider above zero and the ranking will update.',
    reset: 'Start over',
    resetDialogTitle: 'Start over?',
    resetDialogDescription:
      'This clears everything — options, criteria, weights, and scores — from this browser.',
    resetDialogCancel: 'Keep editing',
    resetDialogConfirm: 'Start over',
    matrixCount: (options, categories) =>
      `${options} options / ${categories} criteria`,
  },
  footer: {
    productLabel: 'ClearPick',
    note: 'Your data never leaves this browser. No account, no server, no tracking.',
    copyright: 'Copyright © 2026 ClearPick - All rights reserved.',
    howItWorks: 'How it works',
    faq: 'FAQ',
    contactCta: 'Contact support',
    contactEmail: 'hugonzalezhuerta@gmail.com',
    backToTop: 'Back to top',
  },
};
