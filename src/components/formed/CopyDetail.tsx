"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyDetail({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#EFE9DB] py-2.5 first:border-t-0">
      <span className="text-sm text-[#59665F]">{label}</span>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="flex min-w-0 items-center gap-2 text-right text-sm font-semibold tabular-nums text-[#123A2E]">
        <span className="select-all break-all">{value}</span>
        {copied ? <Check size={14} className="shrink-0 text-[#1F5E4A]" /> : <Copy size={14} className="shrink-0 text-[#9A7518]" />}
      </button>
    </div>
  )
}
