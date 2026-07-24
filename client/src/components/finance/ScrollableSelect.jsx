import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"

export function ScrollableSelect({
  value,
  onChange,
  options,
  className = "",
  menuClassName = "",
  maxHeightClassName = "max-h-48",
  disabled = false,
}) {
  const listboxId = useId()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: rect.width,
      zIndex: 9999,
    })
  }

  const closeMenu = () => {
    setOpen(false)
    setMenuStyle(null)
  }

  const openMenu = () => {
    if (disabled) return
    updateMenuPosition()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      const target = event.target
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      closeMenu()
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    const handleScroll = (event) => {
      if (menuRef.current?.contains(event.target)) {
        return
      }
      updateMenuPosition()
    }

    const handleResize = () => {
      updateMenuPosition()
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, true)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [open])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    closeMenu()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          "flex h-8 min-w-[160px] items-center justify-between gap-2 rounded-md border border-input bg-background px-2 py-1 text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (open) {
            closeMenu()
            return
          }
          openMenu()
        }}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>

      {open &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-activedescendant={`${listboxId}-${value}`}
            style={menuStyle}
            className={cn(
              "overflow-hidden rounded-md border border-input bg-background shadow-md",
              menuClassName
            )}
          >
            <div className={cn("overflow-y-auto", maxHeightClassName)}>
              {options.map((option) => (
                <button
                  key={option}
                  id={`${listboxId}-${option}`}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={cn(
                    "flex w-full items-center px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    option === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
