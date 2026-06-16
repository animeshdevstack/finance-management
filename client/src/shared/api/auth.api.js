import { post } from "@/shared/api/http"

export function signUp(payload) {
  return post("/signup", payload)
}

export function signIn(payload) {
  return post("/signin", payload)
}

export function verifyOtp(payload) {
  return post("/otp", payload)
}
