export const SUPPORTED_BANKS = [
  { id: "icici", label: "ICICI Bank", requiresPassword: false },
  { id: "hdfc", label: "HDFC Bank", requiresPassword: true },
]

export const DEFAULT_BANK_ID = "icici"

export function getBankConfig(bankId) {
  return SUPPORTED_BANKS.find((bank) => bank.id === bankId) || null
}
