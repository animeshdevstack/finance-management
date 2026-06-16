import { useRegisterSW } from "virtual:pwa-register/react"
import { RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-lg sm:left-auto">
      <p className="text-sm text-foreground">A new version is available.</p>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={() => setNeedRefresh(false)}>
          <X className="size-4" />
        </Button>
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          <RefreshCw className="size-4" />
          Update
        </Button>
      </div>
    </div>
  )
}
