import { useMemo, useState } from "react"
import { Smartphone } from "lucide-react"

import { AccountStateBadge } from "@/components/money-split/AccountStateBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isContactPickerSupported, pickPhoneContacts } from "@/shared/lib/device-contacts"

const EMPTY_MANUAL = { displayName: "", phone: "" }

function memberKey(member) {
  if (member.contactId) return `contact:${member.contactId}`
  if (member.phone) return `phone:${member.phone}`
  return `manual:${member.displayName}:${member.phone}`
}

export function MemberPickerSection({
  contacts = [],
  selectedMembers = [],
  onChange,
  maxMembers = null,
  onPhonePicked,
}) {
  const [search, setSearch] = useState("")
  const [manualMember, setManualMember] = useState({ ...EMPTY_MANUAL })
  const [showManual, setShowManual] = useState(false)
  const phonePickerSupported = isContactPickerSupported()

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return contacts

    return contacts.filter((contact) => {
      const haystack = `${contact.displayName} ${contact.phoneMasked || contact.phone}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [contacts, search])

  const isSelected = (contactId) =>
    selectedMembers.some((member) => member.contactId === contactId)

  const canAddMore = maxMembers == null || selectedMembers.length < maxMembers

  const addMember = (member) => {
    const key = memberKey(member)
    const exists = selectedMembers.some((item) => memberKey(item) === key)
    if (exists) return

    if (!canAddMore && maxMembers === 1) {
      onChange([member])
      return
    }

    if (!canAddMore) return
    onChange([...selectedMembers, member])
  }

  const removeMember = (member) => {
    const key = memberKey(member)
    onChange(selectedMembers.filter((item) => memberKey(item) !== key))
  }

  const toggleContact = (contact) => {
    if (isSelected(contact._id)) {
      removeMember({ contactId: contact._id })
      return
    }

    addMember({
      contactId: contact._id,
      displayName: contact.displayName,
      phone: contact.phone,
      source: "contact",
    })
  }

  const handlePickFromPhone = async () => {
    try {
      const picked = await pickPhoneContacts({ multiple: maxMembers == null || maxMembers > 1 })
      if (picked.length === 0) return

      for (const entry of picked) {
        addMember({
          displayName: entry.displayName,
          phone: entry.phone,
          source: "phone",
        })
        onPhonePicked?.(entry)
      }
    } catch (err) {
      if (err?.name === "InvalidStateError" || err?.name === "NotAllowedError") {
        return
      }
      throw err
    }
  }

  const handleAddManual = () => {
    const displayName = manualMember.displayName.trim()
    const phone = manualMember.phone.trim()
    if (!phone) return

    addMember({
      displayName: displayName || "User",
      phone,
      source: "manual",
    })
    setManualMember({ ...EMPTY_MANUAL })
    setShowManual(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-search">Saved contacts</Label>
        <Input
          id="contact-search"
          placeholder="Search contacts..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
        {filteredContacts.length === 0 ? (
          <p className="px-2 py-1 text-sm text-muted-foreground">No saved contacts found.</p>
        ) : (
          filteredContacts.map((contact) => (
            <label
              key={contact._id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-accent/40"
            >
              <span className="flex items-center gap-2">
                <input
                  type={maxMembers === 1 ? "radio" : "checkbox"}
                  name="saved-contact"
                  checked={isSelected(contact._id)}
                  onChange={() => toggleContact(contact)}
                />
                <span>
                  <span className="block text-sm font-medium">{contact.displayName}</span>
                  <span className="block text-xs text-muted-foreground">
                    {contact.phoneMasked || contact.phone}
                  </span>
                </span>
              </span>
              <AccountStateBadge state={contact.linkedUser?.accountState || "pending"} />
            </label>
          ))
        )}
      </div>

      {phonePickerSupported && (
        <Button type="button" variant="outline" onClick={handlePickFromPhone}>
          <Smartphone className="size-4" />
          Pick from phone
        </Button>
      )}

      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <Label>Selected</Label>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <button
                key={memberKey(member)}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                onClick={() => removeMember(member)}
              >
                <span>{member.displayName}</span>
                <span className="text-muted-foreground">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-0"
          onClick={() => setShowManual((prev) => !prev)}
        >
          {showManual ? "Hide manual entry" : "Add manually"}
        </Button>

        {showManual && (
          <div className="grid gap-3 rounded-md border p-3">
            <div className="space-y-2">
              <Label htmlFor="manual-member-name">Name</Label>
              <Input
                id="manual-member-name"
                value={manualMember.displayName}
                onChange={(event) =>
                  setManualMember((prev) => ({ ...prev, displayName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-member-phone">Phone</Label>
              <Input
                id="manual-member-phone"
                type="tel"
                inputMode="numeric"
                value={manualMember.phone}
                onChange={(event) =>
                  setManualMember((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <Button type="button" variant="outline" onClick={handleAddManual}>
              Add member
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
