"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "#0a0a0f",
          "--normal-text": "#f5f0eb",
          "--normal-border": "rgba(255,255,255,0.08)",
          "--border-radius": "999px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
