import { useState } from "react"
import { Smartphone } from "lucide-react"

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
import { addContact } from "@/shared/api/contact.api"
import { isContactPickerSupported, pickPhoneContacts } from "@/shared/lib/device-contacts"

export function ContactFormDialog({ open, onOpenChange, onSuccess, onError }) {
  const [phone, setPhone] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const phonePickerSupported = isContactPickerSupported()

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setPhone("")
      setDisplayName("")
      setLoading(false)
    }
    onOpenChange(nextOpen)
  }

  const handlePickFromPhone = async () => {
    try {
      const [picked] = await pickPhoneContacts({ multiple: false })
      if (!picked) return

      setDisplayName(picked.displayName)
      setPhone(picked.phone)
    } catch (err) {
      if (err?.name === "InvalidStateError" || err?.name === "NotAllowedError") {
        return
      }
      onError?.(err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await addContact({ phone, displayName })
      onSuccess?.(result.contact)
      handleOpenChange(false)
    } catch (err) {
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Save a phone number for quick splits. If they are not on the app yet,
              a pending account is created silently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {phonePickerSupported && (
              <Button type="button" variant="outline" onClick={handlePickFromPhone}>
                <Smartphone className="size-4" />
                Pick from phone
              </Button>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
