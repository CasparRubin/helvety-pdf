"use client"

// Next.js
import { Github, Building2, Scale, FileText, Menu, Info, LogOut, Crown, User, ShoppingBag, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// External libraries

// Internal components
import { AppSwitcher } from "@/components/app-switcher"
import { useSubscriptionContext } from "@/components/auth-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { VERSION } from "@/lib/config/version"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { isAuthenticated, userEmail, isPro, isLoading } = useSubscriptionContext()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: "https://helvety.com/impressum", label: "Impressum", icon: Building2 },
    { href: "https://helvety.com/privacy", label: "Privacy", icon: Scale },
    { href: "https://helvety.com/terms", label: "Terms", icon: FileText },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AppSwitcher currentApp="PDF" />
          <a
            href="https://helvety.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Visit Helvety.com"
          >
            <Image
              src="/helvety_logo_white.svg"
              alt="Helvety"
              width={120}
              height={30}
              className="h-8 w-auto hidden sm:block"
              priority
            />
            <Image
              src="/helvety_Identifier_whiteBg.svg"
              alt="Helvety"
              width={30}
              height={30}
              className="h-8 w-auto sm:hidden"
              priority
            />
          </a>
          <Link href="/" className="text-xl font-black tracking-tight hover:opacity-80 transition-opacity">
              PDF
            </Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </Button>
            ))}
          </div>

          {/* About button */}
          <Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>About</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent>
              <DialogHeader className="pr-8">
                <DialogTitle>About</DialogTitle>
                <DialogDescription className="pt-2">
                  A comprehensive PDF tool for merging, reordering, rotating, and extracting pages. All processing happens locally in your browser - private and secure.
                </DialogDescription>
              </DialogHeader>
              <>
                <div className="border-t" />
                <p className="text-xs text-muted-foreground">
                  {VERSION || "Unknown build time"}
                </p>
              </>
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>

          {/* GitHub icon - always visible */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/CasparRubin/helvety-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Github className="h-4 w-4" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>View source code on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ThemeSwitcher />

          {/* User profile popover - only show when authenticated */}
          {isAuthenticated && !isLoading && (
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <PopoverHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <PopoverTitle>Account</PopoverTitle>
                      {userEmail && (
                        <PopoverDescription className="truncate">
                          {userEmail}
                        </PopoverDescription>
                      )}
                    </div>
                  </div>
                </PopoverHeader>
                <Separator />
                {/* Tier badge and upgrade section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={isPro ? "default" : "secondary"}>
                      {isPro ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </>
                      ) : (
                        'Basic'
                      )}
                    </Badge>
                  </div>
                  {!isPro && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Upgrade to Pro
                      </h4>
                      <ul className="space-y-1 mb-3">
                        {[
                          'Unlimited file uploads',
                          'Unlimited pages',
                          'Rotate pages',
                          'All merge & split features',
                          'Client-side processing',
                          'Priority support',
                        ].map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-xs">
                            <Check className="h-3 w-3 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground mb-3">
                        Only <span className="font-medium text-foreground">CHF 4.95/month</span>
                      </p>
                      <Button variant="default" className="w-full justify-start" size="sm" asChild>
                        <a
                          href="https://store.helvety.com/products/helvety-pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Upgrade Now
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a
                      href="https://store.helvety.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Helvety Store
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      setProfileOpen(false)
                      void handleLogout()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Mobile burger menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {/* User info section in mobile menu */}
                {isAuthenticated && !isLoading && (
                  <>
                    <div className="px-3 py-2 border-b mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">{userEmail}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant={isPro ? "default" : "secondary"}>
                          {isPro ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Pro
                            </>
                          ) : (
                            'Basic'
                          )}
                        </Badge>
                      </div>
                    </div>
                    {!isPro && (
                      <div className="px-3 py-2 rounded-lg border bg-muted/50">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Upgrade to Pro
                        </h4>
                        <ul className="space-y-1 mb-3">
                          {[
                            'Unlimited file uploads',
                            'Unlimited pages',
                            'Rotate pages',
                            'All merge & split features',
                            'Client-side processing',
                            'Priority support',
                          ].map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-xs">
                              <Check className="h-3 w-3 text-primary shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground mb-3">
                          Only <span className="font-medium text-foreground">CHF 4.95/month</span>
                        </p>
                        <a
                          href="https://store.helvety.com/products/helvety-pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Upgrade Now
                        </a>
                      </div>
                    )}
                  </>
                )}
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </a>
                  )
                })}
                <a
                  href="https://github.com/CasparRubin/helvety-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                {/* Logout button in mobile menu */}
                {isAuthenticated && !isLoading && (
                  <button
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors text-destructive w-full text-left"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      void handleLogout()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
