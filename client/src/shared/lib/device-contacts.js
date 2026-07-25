export function normalizeDevicePhone(value) {
  const digits = String(value || "").replace(/\D/g, "")

  if (digits.length === 10) {
    return digits
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2)
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1)
  }

  return null
}

export function isContactPickerSupported() {
  return typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window
}

function getContactDisplayName(contact) {
  if (Array.isArray(contact.name) && contact.name.length > 0) {
    const [first] = contact.name
    const parts = [first?.given, first?.family].filter(Boolean)
    if (parts.length > 0) {
      return parts.join(" ")
    }
  }

  return "User"
}

function getContactPhone(contact) {
  if (!Array.isArray(contact.tel) || contact.tel.length === 0) {
    return null
  }

  for (const entry of contact.tel) {
    const normalized = normalizeDevicePhone(entry)
    if (normalized) {
      return normalized
    }
  }

  return null
}

export async function pickPhoneContacts({ multiple = false } = {}) {
  if (!isContactPickerSupported()) {
    throw new Error("Phone contact picker is not supported on this device")
  }

  const picked = await navigator.contacts.select(["name", "tel"], { multiple })
  const results = []

  for (const contact of picked) {
    const phone = getContactPhone(contact)
    if (!phone) {
      continue
    }

    results.push({
      displayName: getContactDisplayName(contact),
      phone,
    })
  }

  return results
}
