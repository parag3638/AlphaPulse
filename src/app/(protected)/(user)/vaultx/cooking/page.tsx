"use client"

import { ChefHat } from "lucide-react"

export default function Account() {
  return (
    <div className="min-h-[90vh] bg-background text-foreground flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-8 animate-float">
          <ChefHat className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          Still
          <br />
          <span className="text-primary">Cooking</span>
        </h1>

        <p className="text-sm text-muted-foreground mb-8 text-pretty">
          We're preparing something special for you.
          <br />
          Please check back soon!
        </p>

        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
