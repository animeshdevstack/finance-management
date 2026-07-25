import { useEffect, useMemo, useState } from "react"
import { FileUp, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilterSelect } from "@/components/finance/FilterSelect"
import { ScrollableSelect } from "@/components/finance/ScrollableSelect"
import {
  DEFAULT_BANK_ID,
  getBankConfig,
  SUPPORTED_BANKS,
} from "@/shared/constants/supported-banks"
import {
  confirmStatementImport,
  parseStatementPdf,
} from "@/shared/api/statement-import.api"

const AMOUNT_INPUT_PATTERN = /^-?\d*\.?\d*$/
const UNCATEGORY = "Uncategory"

function parseAmount(value) {
  const trimmed = value.trim()
  const parsed = Number(trimmed)
  if (!trimmed || trimmed === "-" || trimmed === "." || Number.isNaN(parsed)) {
    return null
  }
  return parsed
}

export function StatementImportDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
  onError,
}) {
  const [step, setStep] = useState("upload")
  const [bank, setBank] = useState(DEFAULT_BANK_ID)
  const [password, setPassword] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [warnings, setWarnings] = useState([])
  const [statementPeriod, setStatementPeriod] = useState(null)
  const [rows, setRows] = useState([])

  const categoryOptions = useMemo(() => {
    const userCategoryNames = categories
      .map((category) => category?.Name)
      .filter((name) => name && name !== UNCATEGORY)
      .sort((a, b) => a.localeCompare(b))

    const knownNames = new Set([UNCATEGORY, ...userCategoryNames])
    const orphanNames = new Set()

    for (const row of rows) {
      for (const name of [row.categoryName, row.suggestedCategory]) {
        if (name && !knownNames.has(name) && !orphanNames.has(name)) {
          orphanNames.add(name)
        }
      }
    }

    return [
      UNCATEGORY,
      ...userCategoryNames,
      ...[...orphanNames].sort((a, b) => a.localeCompare(b)),
    ]
  }, [categories, rows])

  const bankOptions = useMemo(
    () =>
      SUPPORTED_BANKS.map((item) => ({
        value: item.id,
        label: item.label,
      })),
    []
  )

  const selectedBank = useMemo(() => getBankConfig(bank), [bank])

  useEffect(() => {
    if (!open) {
      setStep("upload")
      setBank(DEFAULT_BANK_ID)
      setPassword("")
      setFile(null)
      setLoading(false)
      setWarnings([])
      setStatementPeriod(null)
      setRows([])
    }
  }, [open])

  const handleParse = async () => {
    if (!file) {
      onError?.(new Error("Select a bank statement PDF."))
      return
    }

    if (selectedBank?.requiresPassword && !password.trim()) {
      onError?.(new Error("PDF password is required for HDFC statements."))
      return
    }

    setLoading(true)
    try {
      const res = await parseStatementPdf(file, {
        bank,
        password: password.trim() || undefined,
      })
      setWarnings(res.warnings || [])
      setStatementPeriod(res.statementPeriod || null)
      setRows(
        (res.transactions || []).map((transaction) => ({
          ...transaction,
          categoryName: transaction.suggestedCategory || UNCATEGORY,
          amountInput: String(transaction.amount),
        }))
      )
      setStep("review")
    } catch (err) {
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const updateRow = (id, updates) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    )
  }

  const handleUncategorizeUnknown = () => {
    setRows((prev) =>
      prev.map((row) =>
        row.suggestedCategory === UNCATEGORY
          ? { ...row, categoryName: UNCATEGORY }
          : row
      )
    )
  }

  const handleConfirm = async () => {
    const includedRows = rows.filter((row) => row.included)
    if (includedRows.length === 0) {
      onError?.(new Error("Select at least one transaction to import."))
      return
    }

    const transactions = []
    for (const row of includedRows) {
      const parsedAmount = parseAmount(row.amountInput)
      if (parsedAmount == null) {
        onError?.(new Error(`Enter a valid amount for "${row.description}".`))
        return
      }

      transactions.push({
        date: row.date,
        description: row.description,
        amount: parsedAmount,
        categoryName: row.categoryName?.trim() || UNCATEGORY,
      })
    }

    setLoading(true)
    try {
      const result = await confirmStatementImport(transactions)
      onSuccess?.(result)
      onOpenChange(false)
    } catch (err) {
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const includedCount = rows.filter((row) => row.included).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-5xl">
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import bank statement</DialogTitle>
          <DialogDescription>
            Choose your bank, upload a text-based PDF, review parsed transactions,
            then import them into your expense categories.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4">
            <FilterSelect
              id="statement-bank"
              label="Bank"
              value={bank}
              onChange={setBank}
              options={bankOptions}
            />

            <div className="space-y-2">
              <Label htmlFor="statement-file">Bank statement PDF</Label>
              <Input
                id="statement-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>

            {selectedBank?.requiresPassword && (
              <div className="space-y-2">
                <Label htmlFor="statement-password">PDF password</Label>
                <Input
                  id="statement-password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter PDF password"
                />
                <p className="text-xs text-muted-foreground">
                  HDFC statements are password-protected. Use the password from your
                  bank email or Customer ID.
                </p>
              </div>
            )}

            {file && (
              <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleParse} disabled={loading || !file}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <FileUp className="size-4" />
                    Parse statement
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {statementPeriod && (
              <p className="text-sm text-muted-foreground">
                Statement period: {statementPeriod.start} to {statementPeriod.end}
              </p>
            )}

            {warnings.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleUncategorizeUnknown}>
                Set unknown to Uncategory
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setStep("upload")}>
                Upload another file
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-secondary/50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">Include</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={Boolean(row.included)}
                          onChange={(event) =>
                            updateRow(row.id, { included: event.target.checked })
                          }
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-2">{row.description}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="h-8 min-w-[100px]"
                          value={row.amountInput}
                          onChange={(event) => {
                            const { value } = event.target
                            if (value === "" || AMOUNT_INPUT_PATTERN.test(value)) {
                              updateRow(row.id, { amountInput: value })
                            }
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <ScrollableSelect
                          value={row.categoryName}
                          options={categoryOptions}
                          onChange={(categoryName) =>
                            updateRow(row.id, { categoryName })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={loading || includedCount === 0}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${includedCount} transaction${includedCount === 1 ? "" : "s"}`
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
