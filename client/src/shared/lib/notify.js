import { toast } from "sonner"

const toastClass = (colors) => ({
  classNames: {
    toast: `group toast border shadow-lg ${colors}`,
    title: "!text-white",
    description: "!text-white/90",
    icon: "!text-white",
  },
})

export function notifyCreated(message) {
  toast.success(message, toastClass("!bg-emerald-600 !text-white !border-emerald-500"))
}

export function notifyUpdated(message) {
  toast.info(message, toastClass("!bg-blue-600 !text-white !border-blue-500"))
}

export function notifyDeleted(message) {
  toast(message, toastClass("!bg-red-600 !text-white !border-red-500"))
}

export function notifyError(messageOrError) {
  const status =
    typeof messageOrError === "object" && messageOrError !== null
      ? messageOrError.status
      : undefined
  if (status === 401) return

  const message =
    typeof messageOrError === "object" && messageOrError !== null
      ? messageOrError.message
      : messageOrError
  toast.error(message)
}
