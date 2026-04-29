import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { LANGUAGE_STORAGE_KEY } from './i18n';
import {
  SCORE_MODE_BOOLEAN,
  SCORE_MODE_SCALE,
  createStarterMatrix,
} from './utils/matrix';
import { STORAGE_KEY } from './utils/storage';

afterEach(() => {
  window.localStorage.clear();
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
      screen.getByRole('heading', { name: /weighted scoring model/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /build a weighted comparison by naming your options, setting what matters, and scoring each choice/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/data stored only on your device/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /your information is saved locally in this browser\. we do not upload, store, or access your decision data\./i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/current decision/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/decision title/i)).not.toBeInTheDocument();

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);

    const footer = screen.getByRole('contentinfo');
    const footerLogo = footer.querySelector('img');

    expect(footerLogo).toHaveAttribute('src', '/favicon.svg');
    expect(footerLogo).toHaveAttribute('alt', '');
    expect(footerLogo).toHaveAttribute('aria-hidden', 'true');
    expect(within(footer).getByText('Weighted Scoring Model')).toBeInTheDocument();
    expect(
      within(footer).getByText(
        /your matrix stays stored locally in this browser/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /local save/i })).toHaveAttribute(
      'href',
      '#local-save-notice',
    );
    expect(
      within(footer).getByRole('link', {
        name: /hugonzalezhuerta@gmail\.com/i,
      }),
    ).toHaveAttribute('href', 'mailto:hugonzalezhuerta@gmail.com');
    expect(screen.queryByRole('link', { name: /about/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /templates/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /support/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/trust strip/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/minimal premium/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/action footer/i)).not.toBeInTheDocument();
    expect(
      document.getElementById('site-footer-note'),
    ).toHaveTextContent(
      /your matrix stays stored locally in this browser/i,
    );
    expect(document.getElementById('local-save-notice')).toHaveTextContent(
      /your information is saved locally in this browser/i,
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

    expect(document.getElementById('decision-matrix')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^start$/i }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
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

  it('toggles the interface between English and Spanish', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole('button', { name: /switch to spanish/i }),
    );

    expect(document.documentElement).toHaveAttribute('lang', 'es');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es');
    expect(
      screen.getByRole('heading', {
        name: /toma tu decisión más difícil en 60 segundos/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /modelo de puntuación ponderada/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /opciones para comparar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^empezar$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /puntuación a ciegas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/guardado solo en este dispositivo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /tu matriz se guarda localmente en este navegador\. no subimos, almacenamos ni accedemos a los datos de tu decisión\./i,
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /cambiar a inglés/i }),
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(
      screen.getByRole('button', { name: /^start$/i }),
    ).toBeInTheDocument();
  });

  it('keeps blank starter option cards visually unscored until the name is committed', async () => {
    const user = userEvent.setup();

    render(<App />);

    const optionsRegion = screen.getByRole('region', {
      name: /options to compare/i,
    });

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).queryByLabelText(/live score for option 1/i),
    ).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getAllByText(/add an option to score/i),
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
        "Name the choices you're deciding between. You'll score each option against the weighted criteria below.",
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
      within(optionsRegion).getAllByText(/add an option to score/i),
    ).toHaveLength(3);
  });

  it('renders criteria as a vertical list instead of a table', () => {
    render(<App />);

    const criteriaRegion = screen.getByRole('region', {
      name: /criteria, weights, and scores/i,
    });
    const criteriaList = within(criteriaRegion).getByRole('list', {
      name: /criteria list/i,
    });
    const scoreRows = within(criteriaRegion).getByRole('group', {
      name: /criterion 1 option scores/i,
    });
    const criteriaHeading = within(criteriaRegion).getByRole('heading', {
      name: /criteria, weights, and scores/i,
    });
    const criteriaCount = within(criteriaRegion).getByText(/1 criterion/i);

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
    expect(
      within(criteriaRegion).getAllByLabelText(/score for option \d on criterion 1/i),
    ).toHaveLength(2);
    for (const scoreSlider of within(criteriaRegion).getAllByLabelText(
      /score for option \d on criterion 1/i,
    )) {
      expect(scoreSlider).toHaveValue('0');
    }
    expect(scoreRows).toHaveClass('criteria-score-rows');
    expect(Array.from(scoreRows.children)).toHaveLength(2);
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
    expect(screen.getByLabelText(/score for option 1 on criterion 1/i)).toHaveValue('0');
    expect(screen.getByLabelText(/score for option 2 on criterion 1/i)).toHaveValue('0');
    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
  });

  it('smooth snap moves in tenths and commits rounded integer scores on release', async () => {
    render(<App />);

    const scoreSlider = screen.getByLabelText(
      /score for option 1 on criterion 1/i,
    );

    fireEvent.pointerDown(scoreSlider);
    fireEvent.change(scoreSlider, { target: { value: '4.6' } });

    expect(scoreSlider).toHaveValue('4.6');

    fireEvent.pointerUp(scoreSlider);

    await waitFor(() => {
      expect(scoreSlider).toHaveValue('5');
    });
  });

  it('converts an option score to yes/no scoring with weighted binary values', async () => {
    const user = userEvent.setup();
    render(<App />);

    const weightSlider = screen.getByLabelText(/importance for criterion 1/i);
    fireEvent.pointerDown(weightSlider);
    fireEvent.change(weightSlider, { target: { value: '10' } });
    fireEvent.pointerUp(weightSlider);

    const firstScoreSlider = screen.getByLabelText(
      /score for option 1 on criterion 1/i,
    );
    const secondScoreSlider = screen.getByLabelText(
      /score for option 2 on criterion 1/i,
    );

    fireEvent.pointerDown(firstScoreSlider);
    fireEvent.change(firstScoreSlider, { target: { value: '4' } });
    fireEvent.pointerUp(firstScoreSlider);
    fireEvent.pointerDown(secondScoreSlider);
    fireEvent.change(secondScoreSlider, { target: { value: '5' } });
    fireEvent.pointerUp(secondScoreSlider);

    await waitFor(() => {
      expect(firstScoreSlider).toHaveValue('4');
      expect(secondScoreSlider).toHaveValue('5');
    });

    const firstScoreModeSelect = screen.getByRole('combobox', {
      name: /scoring mode for option 1 on criterion 1/i,
    });
    const secondScoreModeSelect = screen.getByRole('combobox', {
      name: /scoring mode for option 2 on criterion 1/i,
    });

    await user.selectOptions(firstScoreModeSelect, SCORE_MODE_BOOLEAN);

    expect(
      screen.queryByRole('slider', {
        name: /score for option 1 on criterion 1/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('slider', {
        name: /score for option 2 on criterion 1/i,
      }),
    ).toHaveValue('5');
    expect(secondScoreModeSelect).toHaveValue(SCORE_MODE_SCALE);

    const firstBooleanScore = screen.getByRole('group', {
      name: /score for option 1 on criterion 1/i,
    });

    expect(
      within(firstBooleanScore).getByRole('button', { name: /^no$/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/yes = 10 \/ no = 0/i)).toBeInTheDocument();
    expect(firstScoreModeSelect).toHaveValue(SCORE_MODE_BOOLEAN);

    await user.click(screen.getByRole('button', { name: /see full ranking/i }));

    const ranking = screen.getByRole('region', { name: /weighted ranking/i });
    expect(within(ranking).getByText('Option 2')).toBeInTheDocument();
    expect(within(ranking).getByText(/^leading$/i)).toBeInTheDocument();
  });

  it('shows the recommendation-first results by default', () => {
    saveScoredMatrix();

    render(<App />);

    expect(
      screen.getByRole('switch', { name: /blind scoring/i }),
    ).not.toBeChecked();
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
      screen.getByRole('button', { name: /reset matrix/i }),
    ).toBeInTheDocument();
  });

  it('expands and collapses the secondary full ranking', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

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
    expect(within(ranking).getByText(/10\/10 weighted score/i)).toBeInTheDocument();
    expect(
      within(ranking).queryByText(/10\.0\/10 weighted score/i),
    ).not.toBeInTheDocument();
    expect(within(ranking).getByText(/6\.0 pts behind leader/i)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide full ranking/i }));
    expect(
      screen.queryByRole('region', { name: /weighted ranking/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a neutral recommendation state when there are no positive weights', () => {
    render(<App />);

    expect(
      screen.getByRole('region', { name: /recommendation preview/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no recommendation yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no positive criterion weights are available/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /see full ranking/i }),
    ).not.toBeInTheDocument();
  });

  it('hides result designs and explains the bias guard', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

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
      screen.queryByRole('button', { name: /reset matrix/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /hide results/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/results hidden while you score/i).length).toBeGreaterThan(
      0,
    );
  });

  it('restores the recommendation when results are shown again', async () => {
    const user = userEvent.setup();
    saveScoredMatrix();

    render(<App />);

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));
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

    expect(within(optionsRegion).getByText(/^leading$/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).getByLabelText(/live score for stay here/i),
    ).toHaveTextContent('10.0 pts');

    await user.click(screen.getByRole('switch', { name: /blind scoring/i }));

    expect(within(optionsRegion).queryByText(/^leading$/i)).not.toBeInTheDocument();
    expect(
      within(optionsRegion).queryByLabelText(/live score for stay here/i),
    ).not.toBeInTheDocument();
    expect(
      within(optionsRegion).getAllByText(/results hidden while you score/i),
    ).toHaveLength(2);
  });

  it('allows each option score in each criterion to keep an independent scoring type', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/new criterion/i), 'Eligibility');
    await user.click(screen.getByRole('button', { name: /add criterion/i }));

    const firstCriterionFirstOptionMode = screen.getByRole('combobox', {
      name: /scoring mode for option 1 on criterion 1/i,
    });
    const secondCriterionFirstOptionMode = screen.getByRole('combobox', {
      name: /scoring mode for option 1 on eligibility/i,
    });
    const secondCriterionSecondOptionMode = screen.getByRole('combobox', {
      name: /scoring mode for option 2 on eligibility/i,
    });

    await user.selectOptions(
      secondCriterionFirstOptionMode,
      SCORE_MODE_BOOLEAN,
    );

    expect(firstCriterionFirstOptionMode).toHaveValue(SCORE_MODE_SCALE);
    expect(secondCriterionFirstOptionMode).toHaveValue(SCORE_MODE_BOOLEAN);
    expect(secondCriterionSecondOptionMode).toHaveValue(SCORE_MODE_SCALE);
    expect(
      screen.getByRole('slider', {
        name: /score for option 1 on criterion 1/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {
        name: /score for option 1 on eligibility/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('slider', {
        name: /score for option 2 on eligibility/i,
      }),
    ).toBeInTheDocument();
  });

  it('restores and resets saved yes/no option scores', async () => {
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

    const scoreModeSelect = screen.getByRole('combobox', {
      name: /scoring mode for option 1 on criterion 1/i,
    });
    expect(scoreModeSelect).toHaveValue(SCORE_MODE_BOOLEAN);
    expect(
      screen.queryByRole('slider', {
        name: /score for option 1 on criterion 1/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('slider', {
        name: /score for option 2 on criterion 1/i,
      }),
    ).toHaveValue('0');

    await user.click(screen.getByRole('button', { name: /reset matrix/i }));
    const resetDialog = screen.getByRole('alertdialog', {
      name: /reset this matrix/i,
    });
    expect(
      within(resetDialog).getByText(/clear your options, criteria, weights, and scores/i),
    ).toBeInTheDocument();
    await user.click(
      within(resetDialog).getByRole('button', { name: /reset matrix/i }),
    );

    const resetScoreModeSelect = screen.getByRole('combobox', {
      name: /scoring mode for option 1 on criterion 1/i,
    });
    expect(resetScoreModeSelect).toHaveValue(SCORE_MODE_SCALE);
    expect(
      screen.getByRole('slider', {
        name: /score for option 1 on criterion 1/i,
      }),
    ).toHaveValue('0');
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
    ).not.toBeChecked();
    expect(screen.getByDisplayValue('Stay here')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Move abroad')).toBeInTheDocument();
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

    const scoreSlider = screen.getByLabelText(/score for stay here on criterion 1/i);

    fireEvent.pointerDown(scoreSlider);
    fireEvent.change(scoreSlider, { target: { value: '10' } });
    fireEvent.pointerUp(scoreSlider);

    await waitFor(() => {
      const ranking = screen.getByRole('region', { name: /weighted ranking/i });
      expect(within(ranking).getByText('Stay here')).toBeInTheDocument();
      expect(within(ranking).getByText(/^leading$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live score for stay here/i)).toHaveTextContent(
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

  it('keeps and reveals the add criterion box after submitting named criteria', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nextCriterionInput = screen.getByLabelText(
      /new criterion/i,
    ) as HTMLInputElement;
    const scrollIntoView = vi.fn();
    Object.defineProperty(nextCriterionInput, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: window.innerHeight + 64,
        height: 44,
        left: 0,
        right: 320,
        top: window.innerHeight + 20,
        width: 320,
        x: 0,
        y: window.innerHeight + 20,
        toJSON: () => ({}),
      }),
    });
    Object.defineProperty(nextCriterionInput, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    await user.type(nextCriterionInput, 'Meaning{Enter}');

    expect(screen.getByDisplayValue('Meaning')).toBeInTheDocument();
    expect(nextCriterionInput).toHaveValue('');
    expect(nextCriterionInput).toHaveAttribute('placeholder', 'Criterion 3');
    expect(nextCriterionInput).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });

    scrollIntoView.mockClear();
    await user.type(nextCriterionInput, 'Purpose{Enter}');

    expect(screen.getByDisplayValue('Purpose')).toBeInTheDocument();
    expect(nextCriterionInput).toHaveValue('');
    expect(nextCriterionInput).toHaveAttribute('placeholder', 'Criterion 4');
    expect(nextCriterionInput).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });
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
        screen.getByRole('group', { name: /criterion 1 option scores/i })
          .children,
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
        screen.getByRole('group', { name: /criterion 1 option scores/i })
          .children,
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

  it('commits option names and focuses the next text box when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    const secondOption = screen.getByLabelText(/^option 2$/i);
    await user.type(firstOption, 'Remote role');
    await user.keyboard('{Enter}');

    expect(firstOption).toHaveValue('Remote role');
    expect(secondOption).toHaveFocus();

    await user.type(secondOption, 'Office role');
    await user.keyboard('{Enter}');

    expect(secondOption).toHaveValue('Office role');
    expect(screen.getByLabelText(/new option/i)).toHaveFocus();
  });

  it('sets criterion names and focuses the new criterion box when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add criterion/i }));

    const secondCriterion = screen.getByLabelText(/^criterion 2$/i);
    const newCriterionInput = screen.getByLabelText(
      /new criterion/i,
    ) as HTMLInputElement;
    const scrollIntoView = vi.fn();
    Object.defineProperty(newCriterionInput, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: window.innerHeight + 64,
        height: 44,
        left: 0,
        right: 320,
        top: window.innerHeight + 20,
        width: 320,
        x: 0,
        y: window.innerHeight + 20,
        toJSON: () => ({}),
      }),
    });
    Object.defineProperty(newCriterionInput, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    expect(secondCriterion).toHaveValue('');
    expect(secondCriterion).toHaveAttribute('placeholder', 'Criterion 2');
    await user.type(secondCriterion, 'Long-term fit');
    await user.keyboard('{Enter}');

    expect(secondCriterion).toHaveValue('Long-term fit');
    expect(newCriterionInput).toHaveAttribute('placeholder', 'Criterion 3');
    expect(newCriterionInput).toHaveFocus();
    expect(newCriterionInput.selectionStart).toBe(0);
    expect(newCriterionInput.selectionEnd).toBe(0);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });
    expect(screen.queryByLabelText(/^criterion 3$/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /remove long-term fit/i }),
    ).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: /reset matrix/i }));
    await user.click(
      within(
        screen.getByRole('alertdialog', { name: /reset this matrix/i }),
      ).getByRole('button', { name: /reset matrix/i }),
    );

    expect(screen.getByLabelText(/^option 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^option 2$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^criterion 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/importance for criterion 1/i)).toHaveValue('0');
    expect(screen.getByLabelText(/score for option 1 on criterion 1/i)).toHaveValue('0');
    expect(screen.getByLabelText(/score for option 2 on criterion 1/i)).toHaveValue('0');
  });

  it('keeps matrix edits when the reset warning is cancelled', async () => {
    const user = userEvent.setup();

    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    await user.type(firstOption, 'Choosing a city');
    await user.tab();

    await user.click(screen.getByRole('button', { name: /reset matrix/i }));
    const resetDialog = screen.getByRole('alertdialog', {
      name: /reset this matrix/i,
    });

    await user.click(
      within(resetDialog).getByRole('button', { name: /keep editing/i }),
    );

    expect(
      screen.queryByRole('alertdialog', { name: /reset this matrix/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^option 1$/i)).toHaveValue('Choosing a city');
  });
});
