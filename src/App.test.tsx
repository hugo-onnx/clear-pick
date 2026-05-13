import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { MatrixEditor } from './components/MatrixEditor';
import { copy } from './i18n';
import {
  SCORE_MODE_BOOLEAN,
  createStarterMatrix,
} from './utils/matrix';
import { getDecisionSummary } from './utils/scoring';
import {
  QUICK_DECIDER_STORAGE_KEY,
  STORAGE_KEY,
} from './utils/storage';

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
  vi.restoreAllMocks();
});

function saveScoredMatrix() {
  const savedMatrix = createStarterMatrix();
  const categoryId = savedMatrix.categories[0].id;

  savedMatrix.options[0].name = 'Stay here';
  savedMatrix.options[1].name = 'Move abroad';
  savedMatrix.categories[0].weight = 10;
  savedMatrix.scores[savedMatrix.options[0].id][categoryId] = 10;
  savedMatrix.scores[savedMatrix.options[1].id][categoryId] = 4;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

  return savedMatrix;
}

function installOptionRevealMocks({
  cardTop = 96,
  reducedMotion = false,
  viewport = {
    height: 520,
    offsetLeft: 0,
    offsetTop: 24,
    width: 390,
  },
}: {
  cardTop?: number;
  reducedMotion?: boolean;
  viewport?: Pick<
    VisualViewport,
    'height' | 'offsetLeft' | 'offsetTop' | 'width'
  >;
} = {}) {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const originalScrollBy = window.scrollBy;
  const originalScrollTo = window.scrollTo;
  const originalVisualViewport = window.visualViewport;
  const originalMatchMedia = window.matchMedia;
  const scrollIntoView = vi.fn();
  const scrollBy = vi.fn();
  const scrollTo = vi.fn();
  const getBoundingClientRectSpy = vi.spyOn(
    window.HTMLElement.prototype,
    'getBoundingClientRect',
  );

  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
  Object.defineProperty(window, 'scrollBy', {
    configurable: true,
    value: scrollBy,
  });
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  });
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport as VisualViewport,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) =>
      ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches:
          reducedMotion &&
          query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      }) as MediaQueryList,
  });

  getBoundingClientRectSpy.mockImplementation(function getBoundingClientRect(
    this: HTMLElement,
  ) {
    if (
      this.hasAttribute('data-focus-card') ||
      this.hasAttribute('data-option-focus-card')
    ) {
      return {
        bottom: cardTop + 220,
        height: 220,
        left: 0,
        right: 320,
        toJSON: () => ({}),
        top: cardTop,
        width: 320,
        x: 0,
        y: cardTop,
      } as DOMRect;
    }

    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      toJSON: () => ({}),
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    } as DOMRect;
  });

  return {
    expectedTopCorrection: cardTop - (viewport.offsetTop + 16),
    restore() {
      getBoundingClientRectSpy.mockRestore();
      Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });
      Object.defineProperty(window, 'scrollBy', {
        configurable: true,
        value: originalScrollBy,
      });
      Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        value: originalScrollTo,
      });
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: originalMatchMedia,
      });
    },
    scrollBy,
    scrollIntoView,
    scrollTo,
  };
}

function installMobileOptionRevealMocks() {
  return installOptionRevealMocks();
}

function getInterpolatedScore(
  optionName: string,
  criterionName = 'Criterion 1',
) {
  return screen.getByLabelText(
    `Interpolated score for ${optionName} on ${criterionName}`,
  );
}

function getMoveOptionUpButton(
  optionName: string,
  criterionName = 'Criterion 1',
) {
  return screen.getByRole('button', {
    name: `Move ${optionName} up in ${criterionName} ranking`,
  });
}

function getMoveOptionDownButton(
  optionName: string,
  criterionName = 'Criterion 1',
) {
  return screen.getByRole('button', {
    name: `Move ${optionName} down in ${criterionName} ranking`,
  });
}

async function openQuickDeciderTab(user: { click: (element: Element) => Promise<void> }) {
  await user.click(screen.getByRole('tab', { name: /quick decider/i }));

  return screen.getByRole('region', {
    name: /quick random decider/i,
  });
}

describe('App', () => {
  it('renders the hero and footer anchors', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /make your hardest decision in 60 seconds/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^start$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', { name: /options to compare/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /weighted scoring/i }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tab', { name: /quick decider/i }),
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.queryByRole('region', { name: /quick random decider/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^weighted scoring$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /name options, weight criteria, and score each choice in one focused comparison/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/stored only on this device/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /your decision stays in this browser\. we do not upload, store, or access it\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /a private weighted decision tool for faster choices/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/clearpick is a private browser-only tool/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /name options/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /weight criteria/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /score and compare/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /read the full guide/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /what is clearpick\?/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/current decision/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/decision title/i)).not.toBeInTheDocument();

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);

    const footer = screen.getByRole('contentinfo');
    const footerLogo = footer.querySelector('img');

    expect(footerLogo).toHaveAttribute('src', '/favicon.svg');
    expect(footerLogo).toHaveAttribute('alt', '');
    expect(footerLogo).toHaveAttribute('aria-hidden', 'true');
    expect(
      within(footer).getByText('ClearPick'),
    ).toBeInTheDocument();
    expect(
      within(footer).getByText(
        /your data stays stored locally in this browser/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /workflow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /scoring/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /local save/i }),
    ).not.toBeInTheDocument();
    const supportLink = within(footer).getByRole('link', {
      name: /contact support/i,
    });
    expect(supportLink).toHaveAttribute(
      'href',
      'mailto:hugonzalezhuerta@gmail.com',
    );
    expect(supportLink).not.toHaveTextContent(/hugonzalezhuerta@gmail\.com/i);
    expect(
      within(footer).getByRole('link', { name: /how it works/i }),
    ).toHaveAttribute('href', '/how-it-works');
    expect(
      within(footer).getByRole('link', { name: /faq/i }),
    ).toHaveAttribute('href', '/how-it-works#faq-heading');
    expect(screen.queryByRole('link', { name: /about/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /templates/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/trust strip/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/minimal premium/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/action footer/i)).not.toBeInTheDocument();
    expect(
      document.getElementById('site-footer-note'),
    ).toHaveTextContent(
      /your data stays stored locally in this browser/i,
    );
    expect(document.getElementById('local-save-notice')).toHaveTextContent(
      /your decision stays in this browser/i,
    );
    expect(
      within(footer).getByRole('button', { name: /back to top/i }),
    ).toBeInTheDocument();
  });

  it('scrolls to the decision matrix when Start is clicked', async () => {
    const user = userEvent.setup();
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoViewMock = vi.fn();

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(<App />);

    await user.click(screen.getByRole('tab', { name: /quick decider/i }));
    expect(
      screen.getByRole('tab', { name: /quick decider/i }),
    ).toHaveAttribute('aria-selected', 'true');

    expect(document.getElementById('decision-matrix')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^start$/i }));

    expect(
      screen.getByRole('tab', { name: /weighted scoring/i }),
    ).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it('scrolls to the decision matrix when the footer top action is clicked', async () => {
    const user = userEvent.setup();
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoViewMock = vi.fn();

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: /back to top/i }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it('scrolls to the decision matrix after confirming reset', async () => {
    const user = userEvent.setup();
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoViewMock = vi.fn();

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(<App />);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
    await user.click(screen.getByRole('button', { name: /start over/i }));
    await user.click(
      within(
        screen.getByRole('alertdialog', { name: /start over/i }),
      ).getByRole('button', { name: /start over/i }),
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it('renders the full how-it-works page with FAQ content and route metadata', () => {
    window.history.pushState({}, '', '/how-it-works');
    const descriptionMeta = document.createElement('meta');
    descriptionMeta.setAttribute('name', 'description');
    document.head.append(descriptionMeta);

    render(<App />);

    expect(document.title).toBe(
      'How ClearPick Works | Weighted Decision Guide',
    );
    expect(
      document.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      copy.document.howItWorksDescription,
    );
    expect(
      screen.queryByRole('heading', {
        name: /make your hardest decision in 60 seconds/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /a private weighted decision tool for faster choices/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: /how it works/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: /three-step workflow/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /when to use it/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: /private by default/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /^faq$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /when to use it/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /product prioritization/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^faq$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /what is clearpick\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /how does weighted scoring work\?/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /is my decision data private\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /when should i use a weighted scoring model\?/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /back to the decision tool/i })[0],
    ).toHaveAttribute('href', '/');
    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByRole('link', {
        name: /back to the decision tool/i,
      }),
    ).toHaveAttribute('href', '/');
    expect(
      within(footer).queryByRole('link', { name: /^how it works$/i }),
    ).not.toBeInTheDocument();
    expect(
      within(footer).queryByRole('link', { name: /^faq$/i }),
    ).not.toBeInTheDocument();
    expect(document.querySelector('script[type="application/ld+json"]')).toHaveTextContent(
      '"@type":"FAQPage"',
    );
  });

  it('scrolls to the FAQ section when the how-it-works hash route loads', async () => {
    window.history.pushState({}, '', '/how-it-works#faq-heading');
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoViewMock = vi.fn();

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(<App />);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      });
    });

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
    });
  });

  it('keeps launch metadata on the production domain', () => {
    const root = process.cwd();
    const files = [
      'index.html',
      'public/robots.txt',
      'public/sitemap.xml',
      'public/llms.txt',
      'src/App.tsx',
    ].map((file) => readFileSync(path.resolve(root, file), 'utf8'));
    const combined = files.join('\n');

    expect(combined).toContain('https://clear-pick.pages.dev/');
    expect(combined).not.toContain('weighted-decision-making.pages.dev');

  });

  it('picks a quick decider option immediately with every named option eligible', async () => {
    const user = userEvent.setup();
    const randomSpy = vi.spyOn(Math, 'random');

    render(<App />);

    let quickDecider = await openQuickDeciderTab(user);
    const decideButton = within(quickDecider).getByRole('button', {
      name: /decide for me/i,
    });

    expect(decideButton).toBeDisabled();
    expect(
      within(quickDecider).getByText(/name at least two options to decide/i),
    ).toBeInTheDocument();

    await user.type(
      within(quickDecider).getByLabelText(/^quick option 1$/i),
      'Sushi',
    );
    await user.type(
      within(quickDecider).getByLabelText(/^quick option 2$/i),
      'Pizza',
    );

    randomSpy.mockReturnValueOnce(0.75);
    await user.click(decideButton);

    expect(
      within(quickDecider).getByText('Go with: Pizza.'),
    ).toBeInTheDocument();

    randomSpy.mockReturnValueOnce(0.75);
    await user.click(decideButton);

    expect(
      within(quickDecider).getByText('Go with: Pizza.'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        JSON.parse(window.localStorage.getItem(QUICK_DECIDER_STORAGE_KEY) ?? '[]'),
      ).toEqual(['Sushi', 'Pizza']);
    });

    await user.click(screen.getByRole('tab', { name: /weighted scoring/i }));
    expect(
      screen.queryByRole('region', { name: /quick random decider/i }),
    ).not.toBeInTheDocument();
    quickDecider = await openQuickDeciderTab(user);
    expect(within(quickDecider).getByLabelText(/^quick option 1$/i)).toHaveValue(
      'Sushi',
    );
    expect(
      within(quickDecider).getByText('Go with: Pizza.'),
    ).toBeInTheDocument();
  });

  it('triggers a decision when Enter is pressed in an option input', async () => {
    const user = userEvent.setup();
    const randomSpy = vi.spyOn(Math, 'random');

    render(<App />);

    const quickDecider = await openQuickDeciderTab(user);

    await user.type(
      within(quickDecider).getByLabelText(/^quick option 1$/i),
      'Tea',
    );
    await user.type(
      within(quickDecider).getByLabelText(/^quick option 2$/i),
      'Coffee',
    );

    // Blur option 2 to commit it, then re-focus — now it has a name at focus time
    await user.tab();
    const option2Input = within(quickDecider).getByLabelText(/^quick option 2$/i);
    await user.click(option2Input);

    randomSpy.mockReturnValueOnce(0.1);
    await user.keyboard('{Enter}');

    expect(
      within(quickDecider).getByText('Go with: Tea.'),
    ).toBeInTheDocument();
    expect(option2Input).not.toHaveFocus();
  });

  it('restores persisted quick decider options', async () => {
    window.localStorage.setItem(
      QUICK_DECIDER_STORAGE_KEY,
      JSON.stringify(['Tea', 'Coffee', 'Juice']),
    );

    render(<App />);

    const quickDecider = await openQuickDeciderTab(userEvent.setup());

    expect(within(quickDecider).getByLabelText(/^quick option 1$/i)).toHaveValue(
      'Tea',
    );
    expect(within(quickDecider).getByLabelText(/^quick option 2$/i)).toHaveValue(
      'Coffee',
    );
    expect(within(quickDecider).getByLabelText(/^quick option 3$/i)).toHaveValue(
      'Juice',
    );
  });

  it('adds and removes quick decider options within the six-option limit', async () => {
    const user = userEvent.setup();

    render(<App />);

    const quickDecider = await openQuickDeciderTab(user);

    await user.click(
      within(quickDecider).getByRole('button', { name: /add option/i }),
    );
    await waitFor(() => {
      expect(within(quickDecider).getByLabelText(/^quick option 3$/i)).toHaveFocus();
    });

    for (let index = 0; index < 3; index += 1) {
      await user.click(
        within(quickDecider).getByRole('button', { name: /add option/i }),
      );
    }

    expect(
      within(quickDecider).getAllByRole('textbox', { name: /quick option/i }),
    ).toHaveLength(6);
    expect(
      within(quickDecider).queryByRole('button', { name: /add option/i }),
    ).not.toBeInTheDocument();
    expect(
      within(quickDecider).getByText(/six options is the limit/i),
    ).toBeInTheDocument();

    await user.click(
      within(quickDecider).getByRole('button', {
        name: /remove quick option 6/i,
      }),
    );

    expect(
      within(quickDecider).getAllByRole('textbox', { name: /quick option/i }),
    ).toHaveLength(5);
    expect(
      within(quickDecider).getByRole('button', { name: /add option/i }),
    ).toBeInTheDocument();
  });

  it('resets quick decider options and clears the result', async () => {
    const user = userEvent.setup();
    const randomSpy = vi.spyOn(Math, 'random');

    render(<App />);

    const quickDecider = await openQuickDeciderTab(user);
    await user.type(
      within(quickDecider).getByLabelText(/^quick option 1$/i),
      'Tea',
    );
    await user.type(
      within(quickDecider).getByLabelText(/^quick option 2$/i),
      'Coffee',
    );

    randomSpy.mockReturnValueOnce(0);
    await user.click(
      within(quickDecider).getByRole('button', { name: /decide for me/i }),
    );
    expect(
      within(quickDecider).getByText('Go with: Tea.'),
    ).toBeInTheDocument();

    await user.click(within(quickDecider).getByRole('button', { name: /reset/i }));

    expect(
      within(quickDecider).getAllByRole('textbox', { name: /quick option/i }),
    ).toHaveLength(2);
    expect(within(quickDecider).getByLabelText(/^quick option 1$/i)).toHaveValue(
      '',
    );
    expect(within(quickDecider).getByLabelText(/^quick option 2$/i)).toHaveValue('');
    expect(
      within(quickDecider).queryByText(/go with:/i),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        JSON.parse(window.localStorage.getItem(QUICK_DECIDER_STORAGE_KEY) ?? '[]'),
      ).toEqual(['', '']);
    });
  });

  it('loads weighted option names into the quick decider and clears stale results', async () => {
    const user = userEvent.setup();
    const randomSpy = vi.spyOn(Math, 'random');

    render(<App />);

    let quickDecider = await openQuickDeciderTab(user);
    const loadButton = within(quickDecider).getByRole('button', {
      name: /load options/i,
    });

    expect(loadButton).toBeDisabled();

    await user.type(
      within(quickDecider).getByLabelText(/^quick option 1$/i),
      'Sushi',
    );
    await user.type(
      within(quickDecider).getByLabelText(/^quick option 2$/i),
      'Pizza',
    );

    randomSpy.mockReturnValueOnce(0);
    await user.click(
      within(quickDecider).getByRole('button', { name: /decide for me/i }),
    );
    expect(
      within(quickDecider).getByText('Go with: Sushi.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /weighted scoring/i }));
    await user.type(screen.getByLabelText(/^option 1$/i), 'Remote role');

    quickDecider = await openQuickDeciderTab(user);
    expect(
      within(quickDecider).getByRole('button', {
        name: /load options/i,
      }),
    ).toBeDisabled();

    await user.click(screen.getByRole('tab', { name: /weighted scoring/i }));
    await user.type(screen.getByLabelText(/^option 2$/i), 'Office role');

    quickDecider = await openQuickDeciderTab(user);
    await user.click(
      within(quickDecider).getByRole('button', {
        name: /load options/i,
      }),
    );

    expect(within(quickDecider).getByLabelText(/^quick option 1$/i)).toHaveValue(
      'Remote role',
    );
    expect(within(quickDecider).getByLabelText(/^quick option 2$/i)).toHaveValue(
      'Office role',
    );
    expect(
      within(quickDecider).queryByText(/go with:/i),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        JSON.parse(window.localStorage.getItem(QUICK_DECIDER_STORAGE_KEY) ?? '[]'),
      ).toEqual(['Remote role', 'Office role']);
    });
  });

  it('loads only named weighted options into the quick decider', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText(/^option 1$/i), 'First path');
    await user.type(screen.getByLabelText(/new option/i), 'Third path');
    await user.click(screen.getByRole('button', { name: /add option/i }));

    const quickDecider = await openQuickDeciderTab(user);
    await user.click(
      within(quickDecider).getByRole('button', {
        name: /load options/i,
      }),
    );

    expect(within(quickDecider).getAllByRole('textbox')).toHaveLength(2);
    expect(within(quickDecider).getByLabelText(/^quick option 1$/i)).toHaveValue(
      'First path',
    );
    expect(within(quickDecider).getByLabelText(/^quick option 2$/i)).toHaveValue(
      'Third path',
    );
  });

  it('renders the onboarding strip', () => {
    render(<App />);

    const guide = screen.getByRole('region', { name: /workflow guide/i });
    expect(within(guide).getByText('1. Name options')).toBeInTheDocument();
    expect(within(guide).getByText('2. Weight criteria')).toBeInTheDocument();
    expect(within(guide).getByText('3. Score and compare')).toBeInTheDocument();
  });

  it('keeps blank starter option cards visually unscored until the name is committed', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).queryByLabelText(/live score for option 1/i),
    ).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getAllByText(/name this option to unlock meaningful scoring/i),
    ).toHaveLength(2);

    const firstOption = screen.getByLabelText(/^option 1$/i) as HTMLInputElement;
    const optionName = 'Remote role';
    await user.type(firstOption, optionName);

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).queryByLabelText(/live score for remote role/i),
    ).not.toBeInTheDocument();

    await user.tab();

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getByLabelText(/live score for remote role/i),
    ).toHaveTextContent('0.0 pts');

    const tappedOffset = 'Remote'.length;
    firstOption.setSelectionRange(0, 0);
    await user.pointer({
      keys: '[MouseLeft]',
      target: firstOption,
      offset: tappedOffset,
    });

    expect(firstOption.selectionStart).toBe(tappedOffset);
    expect(firstOption.selectionEnd).toBe(tappedOffset);
  });

  it('renders option cards as a wrapped grid with the add card at the end', () => {
    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });
    const optionCardsGrid = within(optionsRegion).getByRole('group', {
      name: /option cards/i,
    });
    const addCard = within(optionCardsGrid).getByRole('form', {
      name: /add option/i,
    });

    expect(within(optionsRegion).getByText(/2 options/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).getByText(
        'Name the choices in play. Each option is scored against the weighted criteria below.',
      ),
    ).toBeInTheDocument();
    expect(Array.from(optionCardsGrid.children)).toHaveLength(3);
    expect(optionCardsGrid.children[2]).toBe(addCard);
    expect(within(addCard).getByLabelText(/new option/i)).toBeEnabled();
    expect(
      within(addCard).getByRole('button', { name: /add option/i }),
    ).toBeEnabled();
    expect(
      within(optionsRegion).queryByText(/adds to this comparison/i),
    ).not.toBeInTheDocument();
    expect(optionsRegion.querySelector('.overflow-x-auto')).not.toBeInTheDocument();
    expect(optionsRegion.querySelector('.grid-flow-col')).not.toBeInTheDocument();
  });

  it('adds a blank option without showing a live score until its name is committed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    await user.click(
      within(optionsRegion).getByRole('button', { name: /add option/i }),
    );

    expect(within(optionsRegion).getByText(/3 options/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^option 3$/i)).toHaveValue('');
    expect(
      within(optionsRegion).queryByLabelText(/live score for option 3/i),
    ).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getAllByText(/name this option to unlock meaningful scoring/i),
    ).toHaveLength(3);
  });

  it('adds an option and blurs the pending input when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    await user.type(screen.getByLabelText(/new option/i), 'Start the business{Enter}');

    const newOptionCardInput = screen.getByLabelText(/^option 3$/i);
    const nextOptionInput = screen.getByLabelText(/new option/i);
    const addOptionButton = within(optionsRegion).getByRole('button', {
      name: /add option/i,
    });

    expect(newOptionCardInput).toHaveValue('Start the business');
    expect(nextOptionInput).toHaveValue('');
    expect(nextOptionInput).not.toHaveFocus();
    expect(newOptionCardInput).not.toHaveFocus();
    expect(addOptionButton).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });

  it('scrolls each newly added option card into view', async () => {
    const user = userEvent.setup();
    const mobileReveal = installOptionRevealMocks({
      cardTop: 120,
      viewport: {
        height: 300,
        offsetLeft: 0,
        offsetTop: 0,
        width: 390,
      },
    });

    try {
      render(<App />);

      const optionsRegion = screen.getByRole('region', {
        name: /options to compare/i,
      });

      for (let optionIndex = 3; optionIndex <= 5; optionIndex += 1) {
        await user.click(
          within(optionsRegion).getByRole('button', { name: /add option/i }),
        );

        expect(
          screen.getByLabelText(new RegExp(`^option ${optionIndex}$`, 'i')),
        ).toBeInTheDocument();
      }

      await waitFor(() => {
        expect(mobileReveal.scrollTo).toHaveBeenCalledTimes(3);
      });
      expect(mobileReveal.scrollTo).toHaveBeenLastCalledWith({
        behavior: 'smooth',
        top: mobileReveal.expectedTopCorrection,
      });
      expect(mobileReveal.scrollIntoView).not.toHaveBeenCalled();
      expect(mobileReveal.scrollBy).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/^option 5$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^option 5$/i)).toHaveFocus();
    } finally {
      mobileReveal.restore();
    }
  });

  it('renders criteria as a vertical list instead of a table', () => {
    render(<App />);

    const criteriaRegion = screen.getByRole('region', {
      name: /criteria, weights, and rankings/i,
    });
    const criteriaList = within(criteriaRegion).getByRole('list', {
      name: /criteria list/i,
    });
    const rankingGroup = within(criteriaRegion).getByRole('group', {
      name: /criterion 1 option ranking/i,
    });
    const criteriaHeading = within(criteriaRegion).getByRole('heading', {
      name: /criteria, weights, and rankings/i,
    });
    const criteriaCount = within(criteriaRegion).getByText(/1 criterion/i);
    const rankingRows = rankingGroup.querySelector('.criteria-score-rows');
    const firstDragHandle = within(rankingGroup).getByText(/drag option 1/i).parentElement;
    const firstRankingCard = firstDragHandle?.closest('[data-scoring-focus-card]');
    const firstOptionLabel = within(rankingGroup).getByText('Option 1');
    const firstScore = getInterpolatedScore('Option 1');
    const firstArrowControls = getMoveOptionUpButton('Option 1').parentElement;

    if (
      !(firstDragHandle instanceof HTMLElement) ||
      !(firstRankingCard instanceof HTMLElement) ||
      !(firstArrowControls instanceof HTMLElement)
    ) {
      throw new Error('Expected option ranking row elements');
    }

    expect(criteriaHeading.parentElement).toContainElement(criteriaCount);
    expect(within(criteriaList).getAllByRole('listitem')).toHaveLength(1);
    expect(criteriaList.nextElementSibling).toBe(
      within(criteriaRegion).getByRole('form', { name: /add criterion/i }),
    );
    expect(within(criteriaRegion).getByLabelText(/new criterion/i)).toHaveAttribute(
      'placeholder',
      'Criterion 2',
    );
    expect(
      within(criteriaRegion).getByRole('button', { name: /add criterion/i }),
    ).toBeEnabled();
    expect(
      within(criteriaRegion).getByLabelText(/importance for criterion 1/i),
    ).toHaveValue('0');
    expect(firstScore).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');
    expect(rankingRows).toHaveClass('criteria-score-rows');
    expect(Array.from(rankingRows?.children ?? [])).toHaveLength(2);
    expect(firstRankingCard).toHaveClass('grid', 'grid-cols-[auto_minmax(0,1fr)_auto_auto]', 'items-center');
    expect(firstOptionLabel).toHaveClass('truncate');
    expect(firstScore).toHaveClass('whitespace-nowrap', 'text-right');
    expect(firstArrowControls).toHaveClass('justify-self-end');
    expect(firstDragHandle).toHaveClass('touch-none', 'select-none', 'h-10', 'w-10', 'sm:h-8', 'sm:w-8');
    expect(within(criteriaRegion).queryByRole('tablist')).not.toBeInTheDocument();
    expect(within(criteriaRegion).queryByRole('table')).not.toBeInTheDocument();
    expect(criteriaRegion.querySelector('.overflow-x-auto')).not.toBeInTheDocument();
  });

  it('migrates a saved blank default card from old 50 sliders to current defaults', () => {
    const savedMatrix = createStarterMatrix();
    const categoryId = savedMatrix.categories[0].id;

    savedMatrix.categories[0].weight = 50;
    for (const option of savedMatrix.options) {
      savedMatrix.scores[option.id][categoryId] = 50;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    expect(screen.getByLabelText(/importance for criterion 1/i)).toHaveValue('0');
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');
    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
  });

  it('ranks options with interpolated scores', async () => {
    render(<App />);

    const weightSlider = screen.getByLabelText(/importance for criterion 1/i);
    fireEvent.pointerDown(weightSlider);
    fireEvent.change(weightSlider, { target: { value: '10' } });
    fireEvent.pointerUp(weightSlider);

    await userEvent.click(screen.getByRole('switch', { name: /blind scoring/i }));
    await userEvent.click(screen.getByRole('button', { name: /see full ranking/i }));

    const ranking = screen.getByRole('region', { name: /weighted ranking/i });

    expect(within(ranking).getAllByText(/^tied$/i)).toHaveLength(2);

    await userEvent.click(getMoveOptionUpButton('Option 2'));

    await waitFor(() => {
      expect(getInterpolatedScore('Option 2')).toHaveTextContent('10/10');
    });
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
    expect(within(ranking).getByText(/^leading$/i)).toBeInTheDocument();
    expect(within(ranking).getByText('Option 2')).toBeInTheDocument();
  });

  it('does not commit weight slider changes until release and reports rank moves', () => {
    const matrix = createStarterMatrix();
    const onCategoryWeightChange = vi.fn();
    const onCategoryRankingChange = vi.fn();

    render(
      <MatrixEditor
        areResultsHidden={false}
        copy={copy.matrix}
        matrix={matrix}
        summary={getDecisionSummary(matrix)}
        onAddOption={vi.fn()}
        onRemoveOption={vi.fn()}
        onOptionNameChange={vi.fn()}
        onAddCategory={vi.fn()}
        onRemoveCategory={vi.fn()}
        onCategoryNameChange={vi.fn()}
        onCategoryWeightChange={onCategoryWeightChange}
        onCategoryRankingChange={onCategoryRankingChange}
        onResultsHiddenChange={vi.fn()}
      />,
    );

    const weightSlider = screen.getByLabelText(/importance for criterion 1/i);
    fireEvent.pointerDown(weightSlider);
    fireEvent.change(weightSlider, { target: { value: '2.2' } });
    fireEvent.change(weightSlider, { target: { value: '7.6' } });

    expect(onCategoryWeightChange).not.toHaveBeenCalled();
    expect(weightSlider).toHaveValue('7.6');

    fireEvent.pointerUp(weightSlider);

    expect(onCategoryWeightChange).toHaveBeenCalledTimes(1);
    expect(onCategoryWeightChange).toHaveBeenCalledWith(
      matrix.categories[0].id,
      8,
    );

    fireEvent.click(getMoveOptionUpButton('Option 2'));

    expect(onCategoryRankingChange).toHaveBeenCalledTimes(1);
    expect(onCategoryRankingChange).toHaveBeenCalledWith(
      matrix.categories[0].id,
      [matrix.options[1].id, matrix.options[0].id],
    );
  });

  it('uses option ranking to update weighted results', async () => {
    const user = userEvent.setup();
    render(<App />);

    const weightSlider = screen.getByLabelText(/importance for criterion 1/i);
    fireEvent.pointerDown(weightSlider);
    fireEvent.change(weightSlider, { target: { value: '10' } });
    fireEvent.pointerUp(weightSlider);

    await user.click(getMoveOptionUpButton('Option 2'));
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('10/10');
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
    await user.click(screen.getByRole('button', { name: /see full ranking/i }));

    const ranking = screen.getByRole('region', { name: /weighted ranking/i });
    expect(within(ranking).getByText('Option 2')).toBeInTheDocument();
    expect(within(ranking).getByText(/^leading$/i)).toBeInTheDocument();
  });

  it('shows the recommendation-first results by default', async () => {
    saveScoredMatrix();

    render(<App />);

    expect(
      screen.getByRole('switch', { name: /blind scoring/i }),
    ).toBeChecked();

    await userEvent.click(screen.getByRole('switch', { name: /blind scoring/i }));
    expect(
      screen.queryByRole('button', { name: /hide results/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/stay here is the strongest option/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/ahead by 6\.0 pts/i)).toBeInTheDocument();
    expect(screen.getByText('10.0/10')).toBeInTheDocument();
    expect(screen.getByText(/closest alternative/i)).toBeInTheDocument();
    expect(screen.getByText(/move abroad \(4\/10\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/runner-up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^leader$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/top contributors/i)).toBeInTheDocument();
    expect(screen.getByText(/10\/10 score x 100% weight/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/10\.0\/10 score x 100\.0% weight/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /see full ranking/i }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('region', { name: /weighted ranking/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start over/i }),
    ).toBeInTheDocument();
  });

  it('expands and collapses the secondary full ranking', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /see full ranking/i }));

    const ranking = screen.getByRole('region', { name: /weighted ranking/i });
    expect(screen.getByRole('button', { name: /hide full ranking/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(ranking).getByText('Stay here')).toBeInTheDocument();
    expect(within(ranking).getByText(/10\.0\/10 weighted score/i)).toBeInTheDocument();
    expect(within(ranking).getByText(/6\.0 pts behind leader/i)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide full ranking/i }));
    expect(
      screen.queryByRole('region', { name: /weighted ranking/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a neutral recommendation state when there are no positive weights', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('switch', { name: /blind scoring/i }));

    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no recommendation yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/move an importance slider above 0/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /see full ranking/i }),
    ).not.toBeInTheDocument();
  });

  it('hides result designs and explains the bias guard', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    expect(
      screen.getByRole('switch', { name: /blind scoring/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('button', { name: /show results/i }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('button', { name: /why this helps/i }),
    ).toHaveAccessibleDescription(
      /hides live totals and recommendations while you score/i,
    );
    expect(
      screen.queryByRole('region', { name: /recommendation preview/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /weighted ranking/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: /leader contribution breakdown/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/10\.0\/10 weighted score/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /see full ranking/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /start over/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /hide results/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/results hidden while you score/i).length).toBeGreaterThan(
      0,
    );
  });

  it('opens and closes the blind scoring help text from the question mark button', async () => {
    const user = userEvent.setup();

    render(<App />);

    const helpButton = screen.getByRole('button', { name: /why this helps/i });
    const helpText = screen.getByRole('tooltip');
    const innerWidthSpy = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(helpButton, 'getBoundingClientRect').mockReturnValue({
      bottom: 88,
      height: 40,
      left: 200,
      right: 240,
      top: 48,
      width: 40,
      x: 200,
      y: 48,
      toJSON: () => ({}),
    });

    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    expect(helpText).not.toHaveClass('opacity-100');

    await user.click(helpButton);

    expect(helpButton).toHaveAttribute('aria-expanded', 'true');
    expect(helpText).toHaveClass('opacity-100');
    expect(helpText).toHaveTextContent(
      /hides live totals and recommendations while you score/i,
    );
    expect(
      helpText.style.getPropertyValue('--blind-scoring-help-left'),
    ).toBe('76px');
    expect(helpText.style.getPropertyValue('--blind-scoring-help-top')).toBe(
      '96px',
    );

    await user.click(helpButton);

    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    expect(helpText).not.toHaveClass('opacity-100');

    innerWidthSpy.mockReturnValue(1024);
    await user.click(helpButton);

    expect(helpButton).toHaveAttribute('aria-expanded', 'true');
    expect(helpText).toHaveClass('opacity-100');
    expect(
      helpText.style.getPropertyValue('--blind-scoring-help-left'),
    ).toBe('248px');
    expect(helpText.style.getPropertyValue('--blind-scoring-help-top')).toBe(
      '48px',
    );

    await user.click(document.body);

    expect(helpButton).toHaveAttribute('aria-expanded', 'false');
    expect(helpText).not.toHaveClass('opacity-100');
  });

  it('restores the recommendation when results are shown again', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /show results/i }));

    expect(
      screen.getByRole('switch', { name: /blind scoring/i }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/stay here is the strongest option/i)).toBeInTheDocument();
  });

  it('suppresses matrix-side live score and leader cues while results are hidden', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).queryByLabelText(/live score for stay here/i),
    ).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getAllByText(/results hidden while you score/i),
    ).toHaveLength(2);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

    expect(within(optionsRegion).getByText(/^leading$/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).getByLabelText(/live score for stay here/i),
    ).toHaveTextContent('10.0 pts');
  });

  it('keeps option rankings independent for each criterion', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/new criterion/i), 'Eligibility');
    await user.click(screen.getByRole('button', { name: /add criterion/i }));

    await user.click(getMoveOptionUpButton('Option 2', 'Eligibility'));

    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2', 'Eligibility')).toHaveTextContent(
      '10/10',
    );
    expect(getInterpolatedScore('Option 1', 'Eligibility')).toHaveTextContent(
      '0/10',
    );
  });

  it('restores saved legacy yes/no scores as ranking scores and resets them', async () => {
    const user = userEvent.setup();
    const savedMatrix = createStarterMatrix();
    const categoryId = savedMatrix.categories[0].id;
    const firstOptionId = savedMatrix.options[0].id;
    const secondOptionId = savedMatrix.options[1].id;

    savedMatrix.categories[0].weight = 10;
    savedMatrix.scoreModes[firstOptionId][categoryId] = SCORE_MODE_BOOLEAN;
    savedMatrix.scores[firstOptionId][categoryId] = 10;
    savedMatrix.scores[secondOptionId][categoryId] = 0;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    expect(
      screen.queryByRole('combobox', {
        name: /scoring type for option 1 on criterion 1/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('slider', {
        name: /score for option 1 on criterion 1/i,
      }),
    ).not.toBeInTheDocument();
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('10/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
    await user.click(screen.getByRole('button', { name: /start over/i }));
    const resetDialog = screen.getByRole('alertdialog', {
      name: /start over/i,
    });
    expect(
      within(resetDialog).getByText(/clear your options, criteria, weights, and scores/i),
    ).toBeInTheDocument();
    await user.click(
      within(resetDialog).getByRole('button', { name: /start over/i }),
    );

    expect(
      screen.queryByRole('combobox', {
        name: /scoring type for option 1 on criterion 1/i,
      }),
    ).not.toBeInTheDocument();
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
  });

  it('restores the saved matrix and updates results live', async () => {
    const user = userEvent.setup();
    const savedMatrix = createStarterMatrix();
    savedMatrix.options[0].name = 'Stay here';
    savedMatrix.options[1].name = 'Move abroad';
    savedMatrix.categories[0].weight = 10;
    savedMatrix.scores[savedMatrix.options[0].id][savedMatrix.categories[0].id] = 5;
    savedMatrix.scores[savedMatrix.options[1].id][savedMatrix.categories[0].id] = 5;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /blind scoring/i }),
    ).toBeChecked();
    expect(screen.getByDisplayValue('Stay here')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Move abroad')).toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

    expect(screen.getByText(/current tie: stay here and move abroad/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no score gap: stay here and move abroad are tied for first/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^tied for first$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/move abroad \(5\/10\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/runner-up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ahead by/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /see full ranking/i }));

    expect(within(screen.getByRole('region', { name: /weighted ranking/i })).getAllByText(/^tied$/i)).toHaveLength(2);
    expect(screen.getAllByText(/^tied$/i)).toHaveLength(4);
    expect(screen.queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/live score for move abroad/i)).toHaveTextContent(
      '5.0 pts',
    );

    await user.click(getMoveOptionUpButton('Move abroad'));

    await waitFor(() => {
      const ranking = screen.getByRole('region', { name: /weighted ranking/i });
      expect(within(ranking).getByText('Move abroad')).toBeInTheDocument();
      expect(within(ranking).getByText(/^leading$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live score for move abroad/i)).toHaveTextContent(
        '10.0 pts',
      );
    });
  });

  it('lets users add, rename, and remove options and criteria', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /make your hardest decision in 60 seconds/i,
      }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/new option/i), 'Start the business');
    await user.click(screen.getByRole('button', { name: /add option/i }));
    expect(screen.getByDisplayValue('Start the business')).toBeInTheDocument();
    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });
    const optionCardsGrid = within(optionsRegion).getByRole('group', {
      name: /option cards/i,
    });
    const addCard = within(optionCardsGrid).getByRole('form', {
      name: /add option/i,
    });

    expect(within(optionsRegion).getByText(/3 options/i)).toBeInTheDocument();
    expect(Array.from(optionCardsGrid.children)).toHaveLength(4);
    expect(optionCardsGrid.children[3]).toBe(addCard);

    await user.type(screen.getByLabelText(/new criterion/i), 'Meaning');
    await user.click(screen.getByRole('button', { name: /add criterion/i }));

    expect(screen.getByDisplayValue('Meaning')).toBeInTheDocument();
    expect(screen.getByLabelText(/new criterion/i)).toHaveValue('');
    expect(screen.getByLabelText(/importance for meaning/i)).toHaveValue('0');

    await user.click(screen.getByRole('button', { name: /remove start the business/i }));
    await user.click(screen.getByRole('button', { name: /remove meaning/i }));

    expect(screen.queryByDisplayValue('Start the business')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Meaning')).not.toBeInTheDocument();
  });

  it('blurs the add-criterion input after submitting named criteria', async () => {
    const user = userEvent.setup();

    render(<App />);

    const nextCriterionInput = screen.getByLabelText(
      /new criterion/i,
    ) as HTMLInputElement;

    await user.type(nextCriterionInput, 'Meaning{Enter}');

    expect(screen.getByDisplayValue('Meaning')).toBeInTheDocument();
    expect(nextCriterionInput).toHaveValue('');
    expect(nextCriterionInput).toHaveAttribute('placeholder', 'Criterion 3');
    expect(nextCriterionInput).not.toHaveFocus();

    await user.click(nextCriterionInput);
    await user.type(nextCriterionInput, 'Purpose{Enter}');

    expect(screen.getByDisplayValue('Purpose')).toBeInTheDocument();
    expect(nextCriterionInput).toHaveValue('');
    expect(nextCriterionInput).toHaveAttribute('placeholder', 'Criterion 4');
    expect(nextCriterionInput).not.toHaveFocus();
  });

  it('limits new options to six and re-enables adding after removal', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addOption = async (name: string) => {
      const newOptionInput = screen.getByLabelText(/new option/i);
      await user.clear(newOptionInput);
      await user.type(newOptionInput, name);
      await user.click(screen.getByRole('button', { name: /add option/i }));
    };

    await addOption('Third path');
    await addOption('Fourth path');
    await addOption('Fifth path');
    await addOption('Sixth path');

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });
    const optionCardsGrid = within(optionsRegion).getByRole('group', {
      name: /option cards/i,
    });

    expect(within(optionsRegion).getByText(/6 options/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Third path')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fourth path')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fifth path')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sixth path')).toBeInTheDocument();
    expect(
      Array.from(
        screen.getByRole('group', { name: /criterion 1 option ranking/i })
          .querySelector('.criteria-score-rows')?.children ?? [],
      ),
    ).toHaveLength(6);
    expect(
      within(optionCardsGrid).queryByRole('form', { name: /add option/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/new option/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add option/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/limit reached: remove an option to add another/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove third path/i }));

    expect(within(optionsRegion).getByText(/5 options/i)).toBeInTheDocument();
    expect(
      within(optionCardsGrid).getByRole('form', { name: /add option/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/new option/i)).toBeEnabled();
    expect(screen.getByRole('button', { name: /add option/i })).toBeEnabled();
    expect(
      screen.queryByText(/limit reached: remove an option to add another/i),
    ).not.toBeInTheDocument();

    await addOption('Replacement path');

    expect(within(optionsRegion).getByText(/6 options/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Replacement path')).toBeInTheDocument();
  });

  it('preserves saved matrices above the option limit without allowing more additions', async () => {
    const user = userEvent.setup();
    const savedMatrix = createStarterMatrix();
    const categoryId = savedMatrix.categories[0].id;

    savedMatrix.options = Array.from({ length: 7 }, (_, index) => ({
      id: `saved-option-${index + 1}`,
      name: `Saved option ${index + 1}`,
    }));
    savedMatrix.scores = Object.fromEntries(
      savedMatrix.options.map((option) => [option.id, { [categoryId]: 5 }]),
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    expect(within(optionsRegion).getByText(/7 options/i)).toBeInTheDocument();
    for (let index = 1; index <= 7; index += 1) {
      expect(screen.getByDisplayValue(`Saved option ${index}`)).toBeInTheDocument();
    }
    expect(
      within(optionsRegion).queryByRole('form', { name: /add option/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/new option/i)).not.toBeInTheDocument();
    expect(
      Array.from(
        screen.getByRole('group', { name: /criterion 1 option ranking/i })
          .querySelector('.criteria-score-rows')?.children ?? [],
      ),
    ).toHaveLength(7);

    await user.click(
      screen.getByRole('button', { name: /remove saved option 7/i }),
    );

    expect(within(optionsRegion).getByText(/6 options/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).queryByRole('form', { name: /add option/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/new option/i)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /remove saved option 6/i }),
    );

    expect(within(optionsRegion).getByText(/5 options/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).getByRole('form', { name: /add option/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/new option/i)).toBeEnabled();
  });

  it('commits an option name and blurs the input when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    await user.type(firstOption, 'Remote role');
    await user.keyboard('{Enter}');

    expect(firstOption).toHaveValue('Remote role');
    expect(firstOption).not.toHaveFocus();
    expect(screen.getByLabelText(/^option 2$/i)).not.toHaveFocus();
    expect(screen.getByLabelText(/new option/i)).not.toHaveFocus();
  });

  it('commits and blurs the last option input when the option limit is already reached', async () => {
    const user = userEvent.setup();
    const savedMatrix = createStarterMatrix();
    const categoryId = savedMatrix.categories[0].id;

    savedMatrix.options = Array.from({ length: 6 }, (_, index) => ({
      id: `saved-option-${index + 1}`,
      name: `Saved option ${index + 1}`,
    }));
    savedMatrix.scores = Object.fromEntries(
      savedMatrix.options.map((option) => [option.id, { [categoryId]: 5 }]),
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    const lastOption = screen.getByLabelText(/^option 6$/i);
    await user.clear(lastOption);
    await user.type(lastOption, 'Final saved path');
    await user.keyboard('{Enter}');

    expect(lastOption).toHaveValue('Final saved path');
    expect(lastOption).not.toHaveFocus();
    expect(screen.queryByLabelText(/new option/i)).not.toBeInTheDocument();
    expect(document.activeElement).not.toBeInstanceOf(HTMLInputElement);
  });

  it('sets criterion names and blurs the input when Enter is pressed', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /add criterion/i }));

    const firstCriterion = screen.getByLabelText(
      /^criterion 1$/i,
    ) as HTMLInputElement;
    const secondCriterion = screen.getByLabelText(
      /^criterion 2$/i,
    ) as HTMLInputElement;
    const newCriterionInput = screen.getByLabelText(
      /new criterion/i,
    ) as HTMLInputElement;

    expect(secondCriterion).toHaveValue('');
    expect(secondCriterion).toHaveAttribute('placeholder', 'Criterion 2');

    await user.type(firstCriterion, 'Cost');
    await user.keyboard('{Enter}');

    expect(firstCriterion).toHaveValue('Cost');
    expect(firstCriterion).not.toHaveFocus();

    await user.click(secondCriterion);
    await user.type(secondCriterion, 'Long-term fit');
    await user.keyboard('{Enter}');

    expect(secondCriterion).toHaveValue('Long-term fit');
    expect(secondCriterion).not.toHaveFocus();
    expect(newCriterionInput).toHaveAttribute('placeholder', 'Criterion 3');
    expect(newCriterionInput).not.toHaveFocus();
    expect(screen.queryByLabelText(/^criterion 3$/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /remove long-term fit/i }),
    ).toBeInTheDocument();
  });

  it('creates a blank criterion from a blank submit and focuses the new criterion input', async () => {
    const user = userEvent.setup();
    const reveal = installMobileOptionRevealMocks();

    try {
      render(<App />);

      reveal.scrollIntoView.mockClear();
      reveal.scrollBy.mockClear();
      reveal.scrollTo.mockClear();
      await user.click(screen.getByRole('button', { name: /add criterion/i }));

      const secondCriterion = screen.getByLabelText(
        /^criterion 2$/i,
      ) as HTMLInputElement;
      expect(secondCriterion).toHaveValue('');
      expect(secondCriterion).toHaveFocus();
      expect(secondCriterion.selectionStart).toBe(0);
      expect(secondCriterion.selectionEnd).toBe(0);
      expect(reveal.scrollIntoView).not.toHaveBeenCalled();
      expect(reveal.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        top: reveal.expectedTopCorrection,
      });
      expect(reveal.scrollTo).toHaveBeenCalledTimes(1);
      expect(reveal.scrollBy).not.toHaveBeenCalled();
    } finally {
      reveal.restore();
    }
  });


  it('reveals ranking widgets on focus without changing their values', () => {
    render(<App />);

    const weightSlider = screen.getByLabelText(/importance for criterion 1/i);
    const moveButton = getMoveOptionDownButton('Option 1');

    fireEvent.focus(weightSlider);
    expect(weightSlider).toHaveValue('0');
    fireEvent.focus(moveButton);
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');
  });

  it('uses one nearest reveal for an offscreen tablet ranking row focus', () => {
    const reveal = installOptionRevealMocks({
      cardTop: 780,
      viewport: {
        height: 720,
        offsetLeft: 0,
        offsetTop: 0,
        width: 820,
      },
    });

    try {
      render(<App />);

      const moveButton = getMoveOptionDownButton('Option 1');
      reveal.scrollIntoView.mockClear();
      reveal.scrollBy.mockClear();
      reveal.scrollTo.mockClear();
      fireEvent.focus(moveButton);

      expect(reveal.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
      expect(reveal.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(reveal.scrollTo).not.toHaveBeenCalled();
      expect(reveal.scrollBy).not.toHaveBeenCalled();
    } finally {
      reveal.restore();
    }
  });

  it('uses one direct mobile reveal for ranking row focus', () => {
    const reveal = installMobileOptionRevealMocks();

    try {
      render(<App />);

      const moveButton = getMoveOptionDownButton('Option 1');
      reveal.scrollIntoView.mockClear();
      reveal.scrollBy.mockClear();
      reveal.scrollTo.mockClear();
      fireEvent.focus(moveButton);

      expect(reveal.scrollIntoView).not.toHaveBeenCalled();
      expect(reveal.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        top: reveal.expectedTopCorrection,
      });
      expect(reveal.scrollTo).toHaveBeenCalledTimes(1);
      expect(reveal.scrollBy).not.toHaveBeenCalled();
    } finally {
      reveal.restore();
    }
  });

  it('persists edits and can reset back to the blank default matrix', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(document.getElementById('decision-matrix')).toBeInTheDocument();

    const firstOption = screen.getByLabelText(/^option 1$/i);
    await user.type(firstOption, 'Choosing a city');
    await user.tab();

    await waitFor(() => {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      expect(storedValue).not.toBeNull();
      expect(JSON.parse(storedValue ?? '{}').options[0].name).toBe(
        'Choosing a city',
      );
    });

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
    await user.click(screen.getByRole('button', { name: /start over/i }));
    await user.click(
      within(
        screen.getByRole('alertdialog', { name: /start over/i }),
      ).getByRole('button', { name: /start over/i }),
    );

    expect(screen.getByLabelText(/^option 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^option 2$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^criterion 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/importance for criterion 1/i)).toHaveValue('0');
    expect(getInterpolatedScore('Option 1')).toHaveTextContent('0/10');
    expect(getInterpolatedScore('Option 2')).toHaveTextContent('0/10');
  });

  it('flushes pending matrix persistence on pagehide', () => {
    vi.useFakeTimers();

    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    fireEvent.change(firstOption, { target: { value: 'Choosing a city' } });
    fireEvent.blur(firstOption);

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    window.dispatchEvent(new Event('pagehide'));

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}').options[0].name).toBe(
      'Choosing a city',
    );
  });

  it('keeps matrix edits when the reset warning is cancelled', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    await user.type(firstOption, 'Choosing a city');
    await user.tab();

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
    const resetButton = screen.getByRole('button', { name: /start over/i });
    await user.click(resetButton);
    const resetDialog = screen.getByRole('alertdialog', {
      name: /start over/i,
    });
    const cancelResetButton = within(resetDialog).getByRole('button', {
      name: /keep editing/i,
    });
    const confirmResetButton = within(resetDialog).getByRole('button', {
      name: /start over/i,
    });

    await waitFor(() => expect(cancelResetButton).toHaveFocus());
    await user.tab();
    expect(confirmResetButton).toHaveFocus();
    await user.tab();
    expect(cancelResetButton).toHaveFocus();

    await user.click(cancelResetButton);

    expect(
      screen.queryByRole('alertdialog', { name: /start over/i }),
    ).not.toBeInTheDocument();
    expect(resetButton).toHaveFocus();
    expect(screen.getByLabelText(/^option 1$/i)).toHaveValue('Choosing a city');
  });
});
