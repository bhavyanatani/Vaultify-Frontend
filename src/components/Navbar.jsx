"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import { useSearch } from "@/contexts/SearchContext"
import { authAPI } from "@/utils/api"
import { useTheme } from "@/components/ThemeProvider"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { searchQuery, setSearchQuery } = useSearch()
  const { theme, toggleTheme } = useTheme()

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
    router.push("/about")
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
          <Link href={isLoggedIn ? "/home" : "/about"} className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Vaultify</h1>
          </Link>

          {/* Search Bar - Only show when logged in */}
          {isLoggedIn && (
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
          )}

          {/* Navigation Menu - Show Login/Signup when not logged in, Logout when logged in */}
          <div className="order-2 sm:order-3 w-full sm:w-auto flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <NavigationMenu>
              <NavigationMenuList>
                {isLoggedIn ? (
                  <NavigationMenuItem>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full sm:w-auto px-4"
                    >
                      Logout
                    </Button>
                  </NavigationMenuItem>
                ) : (
                  <>
                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/login")}
                        className="w-full sm:w-auto px-4"
                      >
                        Login
                      </Button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Button
                        onClick={() => router.push("/signup")}
                        className="w-full sm:w-auto px-4"
                      >
                        Sign Up
                      </Button>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

