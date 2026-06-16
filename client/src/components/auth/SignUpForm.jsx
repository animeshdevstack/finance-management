import { useState } from "react"
import { Loader2 } from "lucide-react"

import { ContactMethodToggle } from "@/components/auth/ContactMethodToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/shared/api/auth.api"
import { CONTACT_METHODS } from "@/shared/constants/auth"

export function SignUpForm({ onSuccess, onError }) {
  const [contactMethod, setContactMethod] = useState(CONTACT_METHODS.EMAIL)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!name.trim()) {
      onError("Name is required.")
      return
    }

    const payload = {
      Name: name.trim(),
      ...(contactMethod === CONTACT_METHODS.EMAIL
        ? { Email: email.trim() }
        : { Phone: phone.trim() }),
    }

    if (!payload.Email && !payload.Phone) {
      onError("Email or phone is required.")
      return
    }

    setLoading(true)

    try {
      await signUp(payload)
      onSuccess({
        contact: payload.Email || payload.Phone,
        contactMethod,
      })
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />
      </div>

      <ContactMethodToggle value={contactMethod} onChange={setContactMethod} />

      {contactMethod === CONTACT_METHODS.EMAIL ? (
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email address</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="signup-phone">Phone number</Label>
          <Input
            id="signup-phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  )
}
