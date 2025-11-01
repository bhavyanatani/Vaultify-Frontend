"use client"

import { useForm } from "react-hook-form"
import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import PasswordList from "@/components/PasswordList"
import { useSearch } from "@/contexts/SearchContext"
import { passwordAPI, authAPI } from "@/utils/api"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function HomePage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const { searchQuery } = useSearch()

  const fetchPasswords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await passwordAPI.getPasswords(searchQuery)
      // Map backend data to frontend format (backend uses 'title', frontend uses 'service')
      const mappedPasswords = data.map(p => ({
        id: p.id,
        service: p.title,
        username: p.username,
        password: p.password,
        createdAt: p.createdAt
      }))
      setPasswords(mappedPasswords)
    } catch (err) {
      if (err.message.includes("authenticate")) {
        authAPI.logout()
        router.push("/login")
      } else {
        setError(err.message || "Failed to fetch passwords")
      }
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, router])

  // Check authentication and fetch passwords on mount and when search changes
  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/login")
      return
    }

    fetchPasswords()
  }, [fetchPasswords, router])

  // Filter passwords based on search query (already handled by backend, but keeping for client-side filtering if needed)
  const filteredPasswords = useMemo(() => {
    return passwords
  }, [passwords])

  const form = useForm({
    defaultValues: {
      service: "",
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setError(null)
    setSuccessMessage(null)
    try {
      // Backend expects 'title' instead of 'service'
      await passwordAPI.addPassword(data.service, data.username, data.password)
      setSuccessMessage("Password added successfully!")
      form.reset()
      // Refresh the password list
      await fetchPasswords()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.message || "Failed to add password")
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Password Manager
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Store and manage your passwords securely
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Add Password Form */}
        <div className="bg-card border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
            Add New Password
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="service"
                  rules={{
                    required: "Service name is required",
                  }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Service/Website Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g., Gmail, Facebook"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  rules={{
                    required: "Username or email is required",
                  }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Username/Email</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter username or email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button type="submit" className="flex-1 w-full sm:w-auto">
                  Add Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="flex-1 w-full sm:w-auto"
                >
                  Clear
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Password List */}
        {isLoading ? (
          <div className="bg-card border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">Loading passwords...</p>
          </div>
        ) : (
          <PasswordList 
            passwords={filteredPasswords} 
            allPasswords={passwords}
            setPasswords={setPasswords}
            onPasswordUpdate={fetchPasswords}
          />
        )}
      </main>
    </div>
  )
}

