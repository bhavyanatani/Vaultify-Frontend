"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
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
import { authAPI } from "@/utils/api"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.signUp(data.name, data.email, data.password)
      if (response.success) {
        router.push("/home")
      }
    } catch (err) {
      setError(err.message || "Failed to sign up. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const validatePasswordMatch = (value) => {
    const password = form.getValues("password")
    if (value !== password) {
      return "Passwords do not match"
    }
    return true
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 h-9 w-9"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign up to start managing your passwords securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Please confirm your password",
                  validate: validatePasswordMatch,
                }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

