"use client"

import React, { useState } from "react"
import { X, Eye, EyeOff, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/hooks/use-auth"

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp()
  const { login, register, verifyEmail, forgotPassword, resetPassword, loading } = useAuth()

  const [currentView, setCurrentView] = useState<"signin" | "signup" | "verify" | "forgot" | "reset">("signin")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    confirmPassword: "",
    verificationCode: "",
    resetCode: "",
    newPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!isAuthModalOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      confirmPassword: "",
      verificationCode: "",
      resetCode: "",
      newPassword: "",
    })
    setError("")
    setSuccess("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowNewPassword(false)
  }

  const handleClose = () => {
    setIsAuthModalOpen(false)
    resetForm()
    setCurrentView("signin")
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      })
      if (response.status === "success") {
        setIsAuthModalOpen(false)
        resetForm()
        console.log("[v0] Login successful, redirecting via use-auth")
      } else {
        setError(response.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    if (!formData.phone.match(/^\+251\d{9}$/)) {
      setError("Please enter a valid Ethiopian phone number (+251xxxxxxxxx)")
      return
    }
    try {
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: { country: "ETHIOPIA" },
      })
      if (response.status === "success") {
        setSuccess("Registration successful! Please check your email for verification code.")
        setCurrentView("verify")
      } else {
        setError(response.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await verifyEmail(formData.email, formData.verificationCode)
      if (response.status === "success") {
        setSuccess("Email verified successfully! You can now sign in.")
        setCurrentView("signin")
        setFormData((prev) => ({ ...prev, verificationCode: "" }))
      } else {
        setError(response.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await forgotPassword(formData.email)
      if (response.status === "success") {
        setSuccess("Reset code sent to your email!")
        setCurrentView("reset")
      } else {
        setError(response.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    try {
      const response = await resetPassword(formData.email, formData.resetCode, formData.newPassword)
      if (response.status === "success") {
        setSuccess("Password reset successful! You are now logged in.")
        setIsAuthModalOpen(false)
        resetForm()
        console.log("[v0] Password reset successful, redirecting via use-auth")
      } else {
        setError(response.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 z-10" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {currentView === "signin" && "Welcome Back"}
            {currentView === "signup" && "Create Account"}
            {currentView === "verify" && "Verify Email"}
            {currentView === "forgot" && "Forgot Password"}
            {currentView === "reset" && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {currentView === "signin" && "Sign in to your account"}
            {currentView === "signup" && "Create a new account"}
            {currentView === "verify" && "Enter the code sent to your email"}
            {currentView === "forgot" && "Enter your email to receive a reset code"}
            {currentView === "reset" && "Enter the reset code and new password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as typeof currentView)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setCurrentView("forgot")}
                >
                  Forgot password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+251xxxxxxxxx"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setCurrentView("signin")}
                >
                  Already have an account? Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="verify">
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">Check your email for the verification code</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setCurrentView("signin")}
                >
                  Back to Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Code
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setCurrentView("signin")}
                >
                  Back to Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Reset Code</Label>
                  <Input
                    id="resetCode"
                    name="resetCode"
                    type="text"
                    value={formData.resetCode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit reset code"
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setCurrentView("signin")}
                >
                  Back to Sign In
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}