"use client"

export function FooterSection() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t border-border/40 py-6 z-10">
      <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
        © {currentYear} AlphaPulse. All rights reserved.
      </div>
    </footer>
  )
}
