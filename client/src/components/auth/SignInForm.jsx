import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { ContactMethodToggle } from "@/components/auth/ContactMethodToggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/shared/api/auth.api"
import { CONTACT_METHODS } from "@/shared/constants/auth"

export function SignInForm({ onSuccess, onError, initialContactMethod }) {
  const [contactMethod, setContactMethod] = useState(
    initialContactMethod ?? CONTACT_METHODS.EMAIL
  )
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialContactMethod) {
      setContactMethod(initialContactMethod)
    }
  }, [initialContactMethod])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload =
      contactMethod === CONTACT_METHODS.EMAIL
        ? { Email: email.trim() }
        : { Phone: phone.trim() }

    if (!payload.Email && !payload.Phone) {
      onError("Email or phone is required to sign in.")
      return
    }

    setLoading(true)

    try {
      const response = await signIn(payload)
      onSuccess({
        userId: response.userDetails._id,
        contact: payload.Email || payload.Phone,
      })
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ContactMethodToggle value={contactMethod} onChange={setContactMethod} />

      {contactMethod === CONTACT_METHODS.EMAIL ? (
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email address</Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="signin-phone">Phone number</Label>
          <Input
            id="signin-phone"
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
            Sending OTP...
          </>
        ) : (
          "Continue with OTP"
        )}
      </Button>
    </form>
  )
}
