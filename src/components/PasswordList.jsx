"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { passwordAPI } from "@/utils/api"
import { useEffect, useCallback } from "react"

// Password strength checker
function checkPasswordStrength(password) {
  if (!password) return { score: 0, label: "None", color: "bg-gray-500" }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  
  Object.values(checks).forEach((check) => {
    if (check) score++
  })
  
  const strengthMap = [
    { score: 0, label: "Very Weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-orange-500" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very Strong", color: "bg-green-600" },
  ]
  
  const strength = strengthMap[Math.min(score, 5)]
  const percentage = (score / 5) * 100
  
  return {
    score,
    label: strength.label,
    color: strength.color,
    percentage,
    checks,
  }
}

export default function PasswordList({ passwords, allPasswords, setPasswords, onPasswordUpdate }) {
  const [viewingPassword, setViewingPassword] = useState(null)
  const [editingPassword, setEditingPassword] = useState(null)
  const [deletingPassword, setDeletingPassword] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [showAlert, setShowAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrengths, setPasswordStrengths] = useState({}) // Store strength data by password ID
  const [loadingStrengths, setLoadingStrengths] = useState({}) // Track which strengths are being loaded

  const editForm = useForm({
    defaultValues: {
      service: "",
      username: "",
      password: "",
    },
  })

  const handleEdit = (password) => {
    setEditingPassword(password)
    editForm.reset({
      service: password.service,
      username: password.username,
      password: password.password,
    })
  }

  const handleSaveEdit = async (data) => {
    setIsLoading(true)
    setShowAlert(null)
    try {
      // Backend expects 'title' instead of 'service'
      await passwordAPI.updatePassword(
        editingPassword.id,
        data.service,
        data.username,
        data.password
      )
      setEditingPassword(null)
      editForm.reset()
      setShowAlert({ type: "success", message: "Password updated successfully!" })
      setTimeout(() => setShowAlert(null), 3000)
      // Clear strength cache for updated password to force refresh
      setPasswordStrengths(prev => {
        const updated = { ...prev }
        delete updated[editingPassword.id]
        return updated
      })
      // Refresh passwords from backend
      if (onPasswordUpdate) {
        await onPasswordUpdate()
      } else {
        // Fallback to local update if callback not provided
        setPasswords(
          (allPasswords || passwords).map((p) =>
            p.id === editingPassword.id
              ? { ...p, ...data, updatedAt: new Date().toISOString() }
              : p
          )
        )
      }
    } catch (err) {
      setShowAlert({ type: "error", message: err.message || "Failed to update password" })
      setTimeout(() => setShowAlert(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setShowAlert(null)
    try {
      await passwordAPI.deletePassword(deletingPassword.id)
      setDeletingPassword(null)
      setShowAlert({ type: "success", message: "Password deleted successfully!" })
      setTimeout(() => setShowAlert(null), 3000)
      // Remove strength from cache
      setPasswordStrengths(prev => {
        const updated = { ...prev }
        delete updated[deletingPassword.id]
        return updated
      })
      // Refresh passwords from backend
      if (onPasswordUpdate) {
        await onPasswordUpdate()
      } else {
        // Fallback to local update if callback not provided
        setPasswords((allPasswords || passwords).filter((p) => p.id !== deletingPassword.id))
      }
    } catch (err) {
      setShowAlert({ type: "error", message: err.message || "Failed to delete password" })
      setTimeout(() => setShowAlert(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Fetch strength from backend API for a specific password
  const fetchPasswordStrength = useCallback(async (passwordId) => {
    // Start loading
    setLoadingStrengths(prev => {
      if (prev[passwordId]) return prev // Already loading
      return { ...prev, [passwordId]: true }
    })
    
    try {
      const strengthData = await passwordAPI.checkStrength(passwordId)
      
      // Map backend strength data to component format
      const strengthLabel = strengthData.strength
      const score = strengthData.score || 0
      const strengthMap = [
        { score: 0, label: "Very Weak", color: "bg-red-500" },
        { score: 1, label: "Weak", color: "bg-orange-500" },
        { score: 2, label: "Fair", color: "bg-yellow-500" },
        { score: 3, label: "Good", color: "bg-blue-500" },
        { score: 4, label: "Strong", color: "bg-green-500" },
      ]
      const strengthInfo = strengthMap[Math.min(score, 4)] || strengthMap[0]
      const percentage = ((score + 1) / 5) * 100 // Convert 0-4 to percentage

      setPasswordStrengths(prev => ({
        ...prev,
        [passwordId]: {
          score,
          label: strengthLabel || strengthInfo.label,
          color: strengthInfo.color,
          percentage,
          suggestions: strengthData.suggestions || [],
          warning: strengthData.warning || "",
          crack_time: strengthData.crack_time || "",
        }
      }))
    } catch (err) {
      console.error(`Failed to fetch strength for password ${passwordId}:`, err)
      // Fallback to client-side calculation on error
      const passwordList = allPasswords || passwords
      const password = passwordList.find(p => p.id === passwordId)
      if (password) {
        const fallbackStrength = checkPasswordStrength(password.password)
        setPasswordStrengths(prev => ({
          ...prev,
          [passwordId]: fallbackStrength
        }))
      }
    } finally {
      setLoadingStrengths(prev => {
        const updated = { ...prev }
        delete updated[passwordId]
        return updated
      })
    }
  }, [allPasswords, passwords])

  // Fetch strengths for all passwords when component mounts or passwords change
  useEffect(() => {
    const fetchAllStrengths = async () => {
      const passwordList = allPasswords || passwords
      // Clear existing strengths and reload
      setPasswordStrengths({})
      for (const password of passwordList) {
        await fetchPasswordStrength(password.id)
      }
    }
    
    if ((allPasswords || passwords).length > 0) {
      fetchAllStrengths()
    }
  }, [passwords, allPasswords, fetchPasswordStrength])

  // Show empty state if no passwords at all
  if ((allPasswords || passwords).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No passwords saved yet. Add your first password above!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show no search results message
  if (passwords.length === 0 && allPasswords && allPasswords.length > 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No passwords found matching your search. Try a different term.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showAlert && (
        <Alert
          variant={showAlert.type === "success" ? "default" : "destructive"}
        >
          {showAlert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {showAlert.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>{showAlert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved Passwords</CardTitle>
          <CardDescription>
            Manage your stored passwords ({passwords.length} {allPasswords && passwords.length !== allPasswords.length ? `of ${allPasswords.length} ` : ""}total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {passwords.map((password) => {
                // Use backend strength if available, otherwise use fallback
                const strengthData = passwordStrengths[password.id]
                const isStrengthLoading = loadingStrengths[password.id]
                
                // Use backend strength or fallback to client-side calculation
                const strength = strengthData || checkPasswordStrength(password.password)
                const isViewing = viewingPassword === password.id
                const isCopied = copiedId === password.id

                return (
                  <TableRow key={password.id}>
                    <TableCell className="font-medium">
                      {password.service}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{password.username}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(password.username, `username-${password.id}`)}
                            >
                              {isCopied && copiedId === `username-${password.id}` ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCopied && copiedId === `username-${password.id}` ? "Copied!" : "Copy username"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isViewing ? (
                          <span className="font-mono text-sm">
                            {password.password}
                          </span>
                        ) : (
                          <span className="font-mono text-sm">
                            ••••••••••••
                          </span>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                if (isViewing) {
                                  setViewingPassword(null)
                                } else {
                                  setViewingPassword(password.id)
                                }
                              }}
                            >
                              {isViewing ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isViewing ? "Hide password" : "View password"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(password.password, `password-${password.id}`)}
                            >
                              {isCopied && copiedId === `password-${password.id}` ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCopied && copiedId === `password-${password.id}` ? "Copied!" : "Copy password"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[150px]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isStrengthLoading ? (
                              <>
                                <Progress value={0} className="h-2" />
                                <Badge variant="secondary" className="text-xs">
                                  Loading...
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Progress value={strength.percentage} className="h-2" />
                                <Badge
                                  variant={
                                    strength.score <= 1
                                      ? "destructive"
                                      : strength.score <= 2
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {strength.label}
                                </Badge>
                              </>
                            )}
                          </div>
                          {strength.warning && (
                            <p className="text-xs text-muted-foreground mt-1">{strength.warning}</p>
                          )}
                          {strength.suggestions && strength.suggestions.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground cursor-help">
                                  💡 Hover for suggestions
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <ul className="list-disc list-inside space-y-1">
                                  {strength.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-xs">{suggestion}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(password)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit password</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPassword(password)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete password</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {passwords.map((password) => {
              const strengthData = passwordStrengths[password.id]
              const isStrengthLoading = loadingStrengths[password.id]
              const strength = strengthData || checkPasswordStrength(password.password)
              const isViewing = viewingPassword === password.id
              const isCopied = copiedId === password.id

              return (
                <Card key={password.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Service Name */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Service</p>
                        <p className="font-medium">{password.service}</p>
                      </div>

                      {/* Username */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Username</p>
                        <div className="flex items-center gap-2">
                          <span className="flex-1">{password.username}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopy(password.username, `username-${password.id}`)}
                              >
                                {isCopied && copiedId === `username-${password.id}` ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCopied && copiedId === `username-${password.id}` ? "Copied!" : "Copy username"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Password</p>
                        <div className="flex items-center gap-2">
                          {isViewing ? (
                            <span className="font-mono text-sm flex-1 break-all">
                              {password.password}
                            </span>
                          ) : (
                            <span className="font-mono text-sm flex-1">
                              ••••••••••••
                            </span>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  if (isViewing) {
                                    setViewingPassword(null)
                                  } else {
                                    setViewingPassword(password.id)
                                  }
                                }}
                              >
                                {isViewing ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isViewing ? "Hide password" : "View password"}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopy(password.password, `password-${password.id}`)}
                              >
                                {isCopied && copiedId === `password-${password.id}` ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isCopied && copiedId === `password-${password.id}` ? "Copied!" : "Copy password"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Strength */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Strength</p>
                        <div className="space-y-2">
                          {isStrengthLoading ? (
                            <>
                              <Progress value={0} className="h-2" />
                              <Badge variant="secondary" className="text-xs">
                                Loading...
                              </Badge>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Progress value={strength.percentage} className="h-2 flex-1" />
                                <Badge
                                  variant={
                                    strength.score <= 1
                                      ? "destructive"
                                      : strength.score <= 2
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {strength.label}
                                </Badge>
                              </div>
                              {strength.warning && (
                                <p className="text-xs text-muted-foreground">{strength.warning}</p>
                              )}
                              {strength.suggestions && strength.suggestions.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs text-muted-foreground cursor-help">
                                      💡 Hover for suggestions
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <ul className="list-disc list-inside space-y-1">
                                      {strength.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-xs">{suggestion}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(password)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit password</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPassword(password)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete password</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPassword} onOpenChange={(open) => !open && setEditingPassword(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
            <DialogDescription>
              Update the password details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleSaveEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="service"
                rules={{ required: "Service name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service/Website Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="username"
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username/Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => {
                  const strength = checkPasswordStrength(field.value)
                  return (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      {field.value && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={strength.percentage}
                              className="flex-1 h-2"
                            />
                            <Badge
                              variant={
                                strength.score <= 2
                                  ? "destructive"
                                  : strength.score <= 3
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {strength.label}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPassword(null)}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deletingPassword}
        onOpenChange={(open) => !open && setDeletingPassword(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the password for{" "}
              <strong>{deletingPassword?.service}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingPassword(null)}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

