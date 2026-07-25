import { useEffect, useState } from "react"

import { MemberPickerSection } from "@/components/money-split/MemberPickerSection"
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
import { createGroup } from "@/shared/api/group.api"

export function GroupFormDialog({
  open,
  onOpenChange,
  type = "group",
  contacts = [],
  onSuccess,
  onError,
  onContactsChanged,
}) {
  const [name, setName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)

  const isDirect = type === "direct"

  useEffect(() => {
    if (open) {
      setName(isDirect ? "Direct split" : "")
      setSelectedMembers([])
      setLoading(false)
    }
  }, [open, isDirect])

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen)
  }

  const savePhoneContact = (entry) => {
    addContact({
      phone: entry.phone,
      displayName: entry.displayName,
    })
      .then(() => onContactsChanged?.())
      .catch(() => {})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const memberContactIds = selectedMembers
        .filter((member) => member.contactId)
        .map((member) => member.contactId)

      const memberPhones = selectedMembers
        .filter((member) => !member.contactId)
        .map((member) => ({
          phone: member.phone.trim(),
          displayName: member.displayName.trim() || "User",
        }))

      const result = await createGroup({
        name: name.trim() || (isDirect ? "Direct split" : "Group"),
        type,
        memberPhones,
        memberContactIds,
      })

      onSuccess?.(result.group)
      onOpenChange(false)
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
            <DialogTitle>{isDirect ? "New direct split" : "New group"}</DialogTitle>
            <DialogDescription>
              {isDirect
                ? "Pick a saved contact, choose from your phone, or add someone manually."
                : "Pick saved contacts, choose from your phone, or add people manually."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!isDirect && (
              <div className="space-y-2">
                <Label htmlFor="group-name">Group name</Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            )}

            <MemberPickerSection
              contacts={contacts}
              selectedMembers={selectedMembers}
              onChange={setSelectedMembers}
              maxMembers={isDirect ? 1 : null}
              onPhonePicked={savePhoneContact}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedMembers.length === 0}>
              {loading ? "Creating..." : isDirect ? "Create direct split" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
