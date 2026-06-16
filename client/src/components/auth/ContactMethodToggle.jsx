import { Mail, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CONTACT_METHODS } from "@/shared/constants/auth"
import { cn } from "@/shared/lib/utils"

export function ContactMethodToggle({ value, onChange, className }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <Button
        type="button"
        variant={value === CONTACT_METHODS.EMAIL ? "default" : "outline"}
        onClick={() => onChange(CONTACT_METHODS.EMAIL)}
        className="w-full"
      >
        <Mail className="size-4" />
        Email
      </Button>
      <Button
        type="button"
        variant={value === CONTACT_METHODS.PHONE ? "default" : "outline"}
        onClick={() => onChange(CONTACT_METHODS.PHONE)}
        className="w-full"
      >
        <Phone className="size-4" />
        Phone
      </Button>
    </div>
  )
}
