import { useEffect, useState } from "react"

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
import { createGroup } from "@/shared/api/group.api"

const EMPTY_MEMBER = { phone: "", displayName: "" }

export function GroupFormDialog({
  open,
  onOpenChange,
  type = "group",
  onSuccess,
  onError,
}) {
  const [name, setName] = useState("")
  const [members, setMembers] = useState([{ ...EMPTY_MEMBER }])
  const [loading, setLoading] = useState(false)

  const isDirect = type === "direct"

  useEffect(() => {
    if (open) {
      setName(isDirect ? "Direct split" : "")
      setMembers([{ ...EMPTY_MEMBER }])
      setLoading(false)
    }
  }, [open, isDirect])

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen)
  }

  const updateMember = (index, field, value) => {
    setMembers((prev) =>
      prev.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const memberPhones = members
        .filter((member) => member.phone.trim())
        .map((member) => ({
          phone: member.phone.trim(),
          displayName: member.displayName.trim() || "User",
        }))

      const result = await createGroup({
        name: name.trim() || (isDirect ? "Direct split" : "Group"),
        type,
        memberPhones,
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
                ? "Add one person to split expenses one-to-one."
                : "Add one or more people to split expenses together."}
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

            {members.map((member, index) => (
              <div key={index} className="grid gap-3 rounded-md border p-3">
                <div className="space-y-2">
                  <Label htmlFor={`member-name-${index}`}>Name</Label>
                  <Input
                    id={`member-name-${index}`}
                    value={member.displayName}
                    onChange={(event) =>
                      updateMember(index, "displayName", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`member-phone-${index}`}>Phone</Label>
                  <Input
                    id={`member-phone-${index}`}
                    type="tel"
                    inputMode="numeric"
                    value={member.phone}
                    onChange={(event) => updateMember(index, "phone", event.target.value)}
                    required
                  />
                </div>
              </div>
            ))}

            {!isDirect && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setMembers((prev) => [...prev, { ...EMPTY_MEMBER }])}
              >
                Add another member
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : isDirect ? "Create direct split" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
