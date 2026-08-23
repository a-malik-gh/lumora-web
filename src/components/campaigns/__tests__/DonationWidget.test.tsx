// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WalletSigner } from '@/hooks/useWalletSigning';

const walletState = vi.hoisted(() => ({ isConnected: false }));

vi.mock('@/stores/walletStore', () => ({
  useWalletSession: () => ({
    isConnected: walletState.isConnected,
    address: walletState.isConnected ? 'GTESTWALLET' : null,
    isDemoSession: false,
  }),
}));

import { DonationWidget } from '../DonationWidget';

const CAMPAIGN_ID = 'campaign-1';

function createMockSigner(
  implementation: WalletSigner['signDonation'] = () =>
    Promise.resolve({ txHash: '0xabc' }),
): WalletSigner & { signDonation: ReturnType<typeof vi.fn> } {
  return { signDonation: vi.fn(implementation) };
}

async function renderWidget(signer: WalletSigner) {
  const view = render(<DonationWidget campaignId={CAMPAIGN_ID} signer={signer} />);
  return view;
}

beforeEach(() => {
  walletState.isConnected = true;
});

describe('DonationWidget', () => {
  it('renders asset selector with XLM/USDC/AQUA options', () => {
    renderWidget(createMockSigner());

    const select = screen.getByLabelText('Asset') as HTMLSelectElement;
    const options = Array.from(select.options).map((option) => option.value);

    expect(options).toEqual(['XLM', 'USDC', 'AQUA']);
    expect(select.value).toBe('XLM');
  });

  it('selects a preset amount when a preset button is clicked', () => {
    renderWidget(createMockSigner());

    fireEvent.click(screen.getByTestId('preset-50'));

    const input = screen.getByLabelText('Custom donation amount') as HTMLInputElement;
    expect(input.value).toBe('50');
    expect(screen.getByTestId('preset-50')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('preset-25')).toHaveAttribute('aria-pressed', 'false');
  });

  it('treats typed amounts as custom', () => {
    renderWidget(createMockSigner());

    const input = screen.getByLabelText('Custom donation amount');
    fireEvent.change(input, { target: { value: '12.5' } });

    expect(screen.getByTestId('preset-25')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('fee-estimate')).toHaveTextContent('12.5');
  });

  it('shows a fee estimate before confirming', () => {
    renderWidget(createMockSigner());

    const estimate = screen.getByTestId('fee-estimate');

    expect(estimate).toHaveTextContent('Donation: 25 XLM');
    expect(estimate).toHaveTextContent(/network fee/i);
    expect(estimate).toHaveTextContent('Total:');
  });

  it('updates the estimate for non-XLM assets', () => {
    renderWidget(createMockSigner());

    fireEvent.change(screen.getByLabelText('Asset'), {
      target: { value: 'USDC' },
    });

    expect(screen.getByTestId('fee-estimate')).toHaveTextContent(
      'Donation: 25 USDC',
    );
    expect(screen.getByTestId('fee-estimate')).toHaveTextContent(/XLM/i);
  });

  it('rejects invalid amounts and disables Donate', () => {
    renderWidget(createMockSigner());

    fireEvent.change(screen.getByLabelText('Custom donation amount'), {
      target: { value: '-1' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      /greater than zero/i,
    );
    expect(screen.getByTestId('donate-button')).toBeDisabled();
    expect(screen.queryByTestId('fee-estimate')).not.toBeInTheDocument();
  });

  it('toggles the anonymous flag', () => {
    renderWidget(createMockSigner());

    const toggle = screen.getByTestId('anonymous-toggle') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  it('disables Donate until the wallet is connected', () => {
    walletState.isConnected = false;
    renderWidget(createMockSigner());

    expect(screen.getByText(/connect your wallet to donate/i)).toBeInTheDocument();
    expect(screen.getByTestId('donate-button')).toBeDisabled();
  });

  it('triggers wallet signing with the chosen parameters', async () => {
    const signer = createMockSigner();
    renderWidget(signer);

    fireEvent.click(screen.getByTestId('preset-10'));
    fireEvent.click(screen.getByTestId('anonymous-toggle'));
    fireEvent.click(screen.getByTestId('donate-button'));

    await waitFor(() => {
      expect(signer.signDonation).toHaveBeenCalledTimes(1);
    });
    expect(signer.signDonation).toHaveBeenCalledWith({
      campaignId: CAMPAIGN_ID,
      amount: 10,
      asset: 'XLM',
      anonymous: true,
    });
    expect(await screen.findByTestId('donation-success')).toBeInTheDocument();
  });

  it('shows a pending state while signing', async () => {
    let resolveSigning: (value: { txHash: string }) => void = () => {};
    const signer = createMockSigner(
      () =>
        new Promise((resolve) => {
          resolveSigning = resolve;
        }),
    );
    renderWidget(signer);

    fireEvent.click(screen.getByTestId('donate-button'));

    expect(screen.getByTestId('donate-button')).toHaveTextContent(
      /confirm in your wallet/i,
    );
    expect(screen.getByTestId('donate-button')).toBeDisabled();

    resolveSigning({ txHash: '0xdef' });
    await waitFor(() => {
      expect(screen.getByTestId('donation-success')).toBeInTheDocument();
    });
  });

  it('surfaces signer errors without showing success', async () => {
    const signer = createMockSigner(() =>
      Promise.reject(new Error('Donation was rejected.')),
    );
    renderWidget(signer);

    fireEvent.click(screen.getByTestId('donate-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Donation was rejected.',
    );
    expect(screen.queryByTestId('donation-success')).not.toBeInTheDocument();
  });
});
