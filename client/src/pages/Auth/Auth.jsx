import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel"
import { OtpForm } from "@/components/auth/OtpForm"
import { SignInForm } from "@/components/auth/SignInForm"
import { SignUpForm } from "@/components/auth/SignUpForm"
import { AuthShell } from "@/components/layout/AuthShell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AUTH_STEPS, AUTH_TABS, CONTACT_METHODS } from "@/shared/constants/auth"
import { useAuth } from "@/shared/hooks/useAuth"

import "./Auth.css"

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(AUTH_STEPS.CREDENTIALS)
  const [activeTab, setActiveTab] = useState(AUTH_TABS.SIGN_IN)
  const [signInContactMethod, setSignInContactMethod] = useState(
    CONTACT_METHODS.EMAIL
  )
  const [otpContext, setOtpContext] = useState({ userId: "", contact: "" })

  const handleSignInSuccess = ({ userId, contact }) => {
    setOtpContext({ userId, contact })
    setStep(AUTH_STEPS.OTP)
    toast.success("OTP sent. Check your database during development.")
  }

  const handleSignUpSuccess = ({ contact, contactMethod }) => {
    toast.success("Account created. Sign in to receive your OTP.")
    setSignInContactMethod(contactMethod ?? CONTACT_METHODS.EMAIL)
    setActiveTab(AUTH_TABS.SIGN_IN)
    setOtpContext((prev) => ({ ...prev, contact }))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === AUTH_TABS.SIGN_UP) {
      setSignInContactMethod(CONTACT_METHODS.EMAIL)
    }
  }

  const handleOtpSuccess = (session) => {
    login(session)
    toast.success("Welcome back!")
    navigate("/dashboard")
  }

  const handleBackToCredentials = () => {
    setStep(AUTH_STEPS.CREDENTIALS)
  }

  const handleError = (message) => {
    toast.error(message)
  }

  return (
    <AuthShell brand={<AuthBrandPanel />}>
      <Card className="auth-page__card">
        {step === AUTH_STEPS.CREDENTIALS ? (
          <>
            <CardHeader className="auth-page__card-header">
              <CardTitle className="auth-page__card-title">Welcome</CardTitle>
              <CardDescription>
                Sign in or create an account to manage shared expenses securely.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                  <TabsTrigger value={AUTH_TABS.SIGN_IN}>Sign In</TabsTrigger>
                  <TabsTrigger value={AUTH_TABS.SIGN_UP}>Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value={AUTH_TABS.SIGN_IN}>
                  <SignInForm
                    initialContactMethod={signInContactMethod}
                    onSuccess={handleSignInSuccess}
                    onError={handleError}
                  />
                </TabsContent>

                <TabsContent value={AUTH_TABS.SIGN_UP}>
                  <SignUpForm
                    onSuccess={handleSignUpSuccess}
                    onError={handleError}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-6">
            <OtpForm
              userId={otpContext.userId}
              contact={otpContext.contact}
              onSuccess={handleOtpSuccess}
              onBack={handleBackToCredentials}
              onError={handleError}
            />
          </CardContent>
        )}
      </Card>
    </AuthShell>
  )
}
