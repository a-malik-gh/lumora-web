"use client";

import { useMemo, useState } from "react";

import {
  DONATION_ASSETS,
  DONATION_PRESETS,
  estimateFee,
  isDonationAsset,
  NETWORK_FEE_XLM,
  parseAmount,
  resolveActivePreset,
  type DonationAssetId,
} from "@/lib/donation";
import {
  useWalletSigning,
  injectedWalletSigner,
  type WalletSigner,
} from "@/hooks/useWalletSigning";
import { useWalletSession } from "@/stores/walletStore";

type DonationWidgetProps = {
  campaignId: string;
  /** Optional custom signer; defaults to the injected-wallet stub. */
  signer?: WalletSigner;
};

const PRESET_BUTTON_BASE_CLASS =
  "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors";
const PRESET_BUTTON_INACTIVE_CLASS =
  "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600";
const PRESET_BUTTON_ACTIVE_CLASS = "border-blue-600 bg-blue-50 text-blue-700";

/**
 * Donation flow for a campaign: asset selector (XLM/USDC/AQUA), preset or
 * custom amount, anonymous toggle, a fee estimate before confirming and a
 * Donate button that triggers wallet signing.
 */
export function DonationWidget({ campaignId, signer }: DonationWidgetProps) {
  const [asset, setAsset] = useState<DonationAssetId>("XLM");
  const [amountInput, setAmountInput] = useState<string>("25");
  const [anonymous, setAnonymous] = useState(false);

  const { isConnected } = useWalletSession();
  const {
    signDonation,
    isSigning,
    signingError,
    signedDonation,
    reset,
  } = useWalletSigning(signer ?? injectedWalletSigner);

  const amount = parseAmount(amountInput);
  const activePreset = resolveActivePreset(amount);
  const estimate = useMemo(
    () => (amount !== null ? estimateFee(amount, asset) : null),
    [amount, asset],
  );

  const selectAsset = (next: string) => {
    if (!isDonationAsset(next)) return;
    setAsset(next);
    reset();
  };

  const selectPreset = (value: number) => {
    setAmountInput(value.toString());
    reset();
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    reset();
  };

  const handleDonate = async () => {
    if (amount === null || isSigning) return;
    await signDonation({ campaignId, amount, asset, anonymous });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Donate</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="donation-asset"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Asset
          </label>
          <select
            id="donation-asset"
            value={asset}
            onChange={(event) => selectAsset(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          >
            {DONATION_ASSETS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id} — {option.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-gray-700">
            Amount
          </legend>
          <div className="flex gap-2">
            {DONATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                data-testid={`preset-${preset}`}
                aria-pressed={activePreset === DONATION_PRESETS.indexOf(preset)}
                onClick={() => selectPreset(preset)}
                className={`${PRESET_BUTTON_BASE_CLASS} ${
                  activePreset === DONATION_PRESETS.indexOf(preset)
                    ? PRESET_BUTTON_ACTIVE_CLASS
                    : PRESET_BUTTON_INACTIVE_CLASS
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="Custom amount"
            aria-label="Custom donation amount"
            value={amountInput}
            onChange={(event) => handleAmountChange(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </fieldset>

        {amount === null && amountInput.trim() !== "" ? (
          <p role="alert" className="text-sm text-red-600">
            Please enter an amount greater than zero.
          </p>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            data-testid="anonymous-toggle"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Donate anonymously
        </label>

        {estimate ? (
          <div
            data-testid="fee-estimate"
            className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-600"
          >
            <p className="font-medium text-gray-700">Before you confirm</p>
            <p>
              Donation: {estimate.amount} {estimate.asset}
            </p>
            <p>Estimated network fee: ≈{NETWORK_FEE_XLM} XLM</p>
            <p>
              Total: {estimate.total} {estimate.totalAsset}
            </p>
          </div>
        ) : null}

        {!isConnected ? (
          <p className="text-sm text-gray-500">
            Connect your wallet to donate.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleDonate}
          disabled={amount === null || !isConnected || isSigning}
          data-testid="donate-button"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSigning ? "Confirm in your wallet…" : "Donate"}
        </button>

        {signingError ? (
          <p role="alert" className="text-sm text-red-600">
            {signingError}
          </p>
        ) : null}

        {signedDonation ? (
          <p
            role="status"
            data-testid="donation-success"
            className="text-sm text-green-700"
          >
            Thank you! Your donation was signed successfully.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default DonationWidget;
