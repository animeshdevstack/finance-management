import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { verifyOtp } from "@/shared/api/auth.api"

export function OtpForm({ userId, contact, onSuccess, onBack, onError }) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (otp.length !== 6) {
      onError("Please enter the complete 6-digit code.")
      return
    }

    setLoading(true)

    try {
      const response = await verifyOtp({
        userId,
        otp: String(otp),
      })

      onSuccess({
        token: response.token,
        refreshToken: response.refreshToken,
        userDetails: response.userDetails,
      })
    } catch (error) {
      onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Verify OTP</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code for <span className="text-foreground">{contact}</span>.
          During development, check your database for the OTP value.
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify & sign in"
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBack}
        disabled={loading}
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Button>
    </form>
  )
}
