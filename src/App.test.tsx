import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  it('renders the hero, tab bar, and footer anchors', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /make smarter decisions/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Matrix')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /a calmer way to compare/i }),
    ).toBeInTheDocument();
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

  it('restores the saved matrix and updates results live', async () => {
    const savedMatrix = createStarterMatrix();
    savedMatrix.title = 'Big move';
    savedMatrix.options[0].name = 'Stay here';
    savedMatrix.options[1].name = 'Move abroad';
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatrix));

    render(<App />);

    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Big move')).toBeInTheDocument();
    expect(screen.getByText(/leading option: move abroad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/live score for move abroad/i)).toHaveTextContent(
      '71.0 pts',
    );

    const scoreSlider = screen.getByLabelText(/score for move abroad on growth/i);

    fireEvent.change(scoreSlider, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText(/leading option: stay here/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/live score for move abroad/i)).toHaveTextContent(
        '35.0 pts',
      );
    });
  });

  it('lets users add, rename, and remove options and categories', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /make smarter decisions/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add option/i }));
    const optionThree = screen.getByDisplayValue('Option 3');
    await user.clear(optionThree);
    await user.type(optionThree, 'Start the business');
    expect(screen.getByDisplayValue('Start the business')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add category/i }));
    const categoryFour = screen.getByDisplayValue('Category 4');
    await user.clear(categoryFour);
    await user.type(categoryFour, 'Meaning');
    expect(screen.getByDisplayValue('Meaning')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove start the business/i }));
    await user.click(screen.getByRole('button', { name: /remove meaning/i }));

    expect(screen.queryByDisplayValue('Start the business')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Meaning')).not.toBeInTheDocument();
  });

  it('persists edits and can reset back to the starter matrix', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);

    expect(document.getElementById('decision-matrix')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/decision title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Choosing a city');

    await waitFor(() => {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      expect(storedValue).not.toBeNull();
      expect(JSON.parse(storedValue ?? '{}').title).toBe('Choosing a city');
    });

    await user.click(screen.getByRole('button', { name: /reset decision/i }));

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(screen.getByDisplayValue('Career crossroads')).toBeInTheDocument();
  });
});
