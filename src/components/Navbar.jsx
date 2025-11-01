"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import { useSearch } from "@/contexts/SearchContext"
import { authAPI } from "@/utils/api"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { searchQuery, setSearchQuery } = useSearch()

  // Check if user is on login or signup page
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  // Check if user is on home page (logged in area)
  const isHomePage = pathname === "/home"

  useEffect(() => {
    // Check actual auth state
    setIsLoggedIn(authAPI.isAuthenticated())
  }, [pathname])

  const handleLogout = () => {
    authAPI.logout()
    setIsLoggedIn(false)
    router.push("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled in real-time via onChange
  }

  // Don't show navbar on login/signup pages
  if (isAuthPage) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-0">
          {/* App Name */}
          <Link href="/home" className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">PasswordManager</h1>
          </Link>

          {/* Search Bar */}
          <div className="flex flex-1 items-center justify-center w-full sm:w-auto sm:max-w-md order-3 sm:order-2">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4"
              />
            </form>
          </div>

          {/* Navigation Menu with Logout Button */}
          {isLoggedIn && (
            <div className="order-2 sm:order-3 w-full sm:w-auto">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full sm:w-auto px-4"
                    >
                      Logout
                    </Button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

