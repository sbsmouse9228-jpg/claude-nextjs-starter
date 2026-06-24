"use client"

import { useState, useEffect } from "react"
import { UserPlus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AddUserButton() {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(id)
  }, [added])

  return (
    <Button size="sm" onClick={() => setAdded(true)}>
      {added ? <Check className="mr-1 size-4" /> : <UserPlus className="mr-1 size-4" />}
      {added ? "추가됨" : "사용자 추가"}
    </Button>
  )
}
