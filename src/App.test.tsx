import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { createStarterMatrix } from './utils/matrix';
import { STORAGE_KEY } from './utils/storage';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

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
      screen.getByRole('heading', { name: /a calmer way to compare/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /options to compare/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/current decision/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/decision title/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute(
      'href',
      '#landing-title',
    );
    expect(screen.getByRole('link', { name: /templates/i })).toHaveAttribute(
      'href',
      '#decision-matrix',
    );
    expect(screen.getByRole('link', { name: /support/i })).toHaveAttribute(
      'href',
      '#site-footer-note',
    );
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

    expect(within(optionsRegion).getByText(/^leading$/i)).toBeInTheDocument();
    expect(
      within(optionsRegion).getByLabelText(/live score for remote role/i),
    ).toHaveTextContent('50.0 pts');

    firstOption.setSelectionRange(0, 0);
    await user.click(firstOption);

    expect(firstOption.selectionStart).toBe(optionName.length);
    expect(firstOption.selectionEnd).toBe(optionName.length);
  });

  it('restores the saved matrix and updates results live', async () => {
    const savedMatrix = createStarterMatrix();
    savedMatrix.options[0].name = 'Stay here';
    savedMatrix.options[1].name = 'Move abroad';
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Stay here')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Move abroad')).toBeInTheDocument();
    expect(screen.getByText(/current tie: stay here and move abroad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/live score for move abroad/i)).toHaveTextContent(
      '50.0 pts',
    );

    const scoreSlider = screen.getByLabelText(/score for stay here on category 1/i);

    fireEvent.change(scoreSlider, { target: { value: '100' } });

    await waitFor(() => {
      expect(screen.getByText(/leading option: stay here/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live score for stay here/i)).toHaveTextContent(
        '100.0 pts',
      );
    });
  });

  it('lets users add, rename, and remove options and categories', async () => {
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

    await user.click(screen.getByRole('button', { name: /add category/i }));
    const categoryTwo = screen.getByDisplayValue('Category 2');
    await user.clear(categoryTwo);
    await user.type(categoryTwo, 'Meaning');
    expect(screen.getByDisplayValue('Meaning')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove start the business/i }));
    await user.click(screen.getByRole('button', { name: /remove meaning/i }));

    expect(screen.queryByDisplayValue('Start the business')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Meaning')).not.toBeInTheDocument();
  });

  it('commits predefined option names when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstOption = screen.getByLabelText(/^option 1$/i);
    await user.type(firstOption, 'Remote role');
    await user.keyboard('{Enter}');

    expect(firstOption).toHaveValue('Remote role');
    expect(firstOption).not.toHaveFocus();
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

    expect(screen.getByLabelText(/^option 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^option 2$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^category 1$/i)).toHaveValue('');
    expect(screen.getByLabelText(/importance for category 1/i)).toHaveValue('50');
  });
});
