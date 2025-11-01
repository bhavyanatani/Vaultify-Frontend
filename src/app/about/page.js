"use client"

import { Shield, Lock, Key, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  const features = [
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your passwords are encrypted and stored securely using industry-standard encryption."
    },
    {
      icon: Lock,
      title: "Password Encryption",
      description: "All passwords are encrypted at rest and in transit using AES encryption."
    },
    {
      icon: Key,
      title: "Easy Access",
      description: "Access all your passwords from anywhere with a single secure login."
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Quick access to your passwords when you need them most."
    }
  ]

  const benefits = [
    "No more forgotten passwords",
    "Generate and store strong passwords",
    "Password strength checker",
    "Search and organize passwords",
    "Secure and encrypted storage"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-foreground">
            Welcome to <span className="text-primary">Vaultify</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12">
            Keep all your passwords safe, organized, and accessible in one secure place.
            Never forget a password again with Vaultify - your trusted encrypted password manager.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
          Why <span className="text-primary">Vaultify</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-muted/50 rounded-lg">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            Benefits of <span className="text-primary">Vaultify</span>
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-base sm:text-lg text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl mb-4">
              Ready to Get Started with <span className="text-primary">Vaultify</span>?
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Join thousands of users who trust Vaultify to keep their credentials safe and secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="w-full sm:w-auto"
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

