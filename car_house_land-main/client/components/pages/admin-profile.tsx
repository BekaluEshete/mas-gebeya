"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Phone, MapPin, Shield, Settings, Save, Camera, Key, Loader2, Lock } from "lucide-react"
import { useApp } from "@/context/app-context"
import { authService } from "@/lib/auth"

export function AdminProfile() {
  const { user, isAuthenticated, dispatch } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  
  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  // Forgot password form
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "reset">("email")
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "Admin",
    department: "Platform Management",
    bio: "",
    lastLogin: "",
    accountCreated: "",
  })

  useEffect(() => {
    if (user && isAuthenticated) {
      console.log("[v0] Loading admin profile data:", user)
      setProfile({
        name: user.fullName || "Admin User",
        email: user.email || "",
        phone: user.phone || "",
        location: user.address || user.location || "",
        role: user.role === "admin" ? "Super Admin" : "Admin",
        department: "Platform Management",
        bio: user.bio || "Platform administrator managing e-commerce operations.",
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Recently",
        accountCreated: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2023-06-15",
      })
      // Initialize forgot password email with user's email
      setForgotPasswordForm(prev => ({
        ...prev,
        email: user.email || "",
      }))
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [user, isAuthenticated])

  const handleSave = async () => {
    setSaving(true)
    setPasswordError("")
    
    try {
      const updateData: { fullName?: string; phone?: string; address?: string } = {}
      
      if (profile.name && profile.name !== user?.fullName) {
        updateData.fullName = profile.name
      }
      
      if (profile.phone && profile.phone !== user?.phone) {
        updateData.phone = profile.phone
      }
      
      if (profile.location && profile.location !== (user?.address || user?.location)) {
        updateData.address = profile.location
      }
      
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false)
        setSaving(false)
        return
      }
      
      const result = await authService.updateProfile(updateData)
      
      if (result.status === "success") {
        alert("Profile updated successfully!")
        setIsEditing(false)
        // Refresh user data
        if (dispatch) {
          dispatch({ type: "SET_USER", payload: result.data?.user || user })
        }
        // Reload user from API
        const updatedUser = await authService.getMe()
        if (updatedUser && dispatch) {
          dispatch({ type: "SET_USER", payload: updatedUser })
        }
      } else {
        alert(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword || !passwordForm.currentPassword) {
      setPasswordError("Please fill in all fields")
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long")
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    
    setPasswordLoading(true)
    
    try {
      const result = await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      )
      
      if (result.status === "success") {
        alert("Password changed successfully!")
        setIsChangePasswordOpen(false)
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setPasswordError(result.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("Failed to change password. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleForgotPasswordEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError("")
    
    if (!forgotPasswordForm.email) {
      setForgotPasswordError("Please enter your email address")
      return
    }
    
    setForgotPasswordLoading(true)
    
    try {
      const result = await authService.forgotPassword(forgotPasswordForm.email)
      
      if (result.status === "success") {
        setForgotPasswordStep("reset")
        alert("Reset code sent to your email!")
      } else {
        setForgotPasswordError(result.message || "Failed to send reset code")
      }
    } catch (error) {
      console.error("Error sending reset code:", error)
      setForgotPasswordError("Failed to send reset code. Please try again.")
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError("")
    
    if (!forgotPasswordForm.code || !forgotPasswordForm.newPassword || !forgotPasswordForm.confirmPassword) {
      setForgotPasswordError("Please fill in all fields")
      return
    }
    
    if (forgotPasswordForm.newPassword.length < 6) {
      setForgotPasswordError("New password must be at least 6 characters long")
      return
    }
    
    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
      setForgotPasswordError("Passwords do not match")
      return
    }
    
    setForgotPasswordLoading(true)
    
    try {
      const result = await authService.resetPassword(
        forgotPasswordForm.email,
        forgotPasswordForm.code,
        forgotPasswordForm.newPassword
      )
      
      if (result.status === "success") {
        alert("Password reset successfully! You are now logged in with your new password.")
        setIsForgotPasswordOpen(false)
        setForgotPasswordForm({
          email: "",
          code: "",
          newPassword: "",
          confirmPassword: "",
        })
        setForgotPasswordStep("email")
        // Refresh user data if available
        if (result.data?.user && dispatch) {
          dispatch({ type: "SET_USER", payload: result.data.user })
        }
        // Reload user from API to get latest data
        const updatedUser = await authService.getMe()
        if (updatedUser && dispatch) {
          dispatch({ type: "SET_USER", payload: updatedUser })
        }
      } else {
        setForgotPasswordError(result.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      setForgotPasswordError("Failed to reset password. Please try again.")
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading admin profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your administrator account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  {profile.role}
                </Badge>
                <p className="text-gray-600 mt-2">{profile.department}</p>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium">{profile.lastLogin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Created</span>
                    <span className="font-medium">{profile.accountCreated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    "Edit Profile"
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled={true}
                        className="pl-10 bg-gray-50"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                      {passwordError && (
                        <p className="text-sm text-red-600">{passwordError}</p>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsChangePasswordOpen(false)
                            setPasswordForm({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            })
                            setPasswordError("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Lock className="w-4 h-4 mr-2" />
                      Forgot Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
                    {forgotPasswordStep === "email" ? (
                      <form onSubmit={handleForgotPasswordEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="forgotEmail">Email Address</Label>
                          <Input
                            id="forgotEmail"
                            type="email"
                            value={forgotPasswordForm.email}
                            onChange={(e) =>
                              setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })
                            }
                            required
                            placeholder={user?.email || "Enter your email"}
                          />
                        </div>
                        {forgotPasswordError && (
                          <p className="text-sm text-red-600">{forgotPasswordError}</p>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsForgotPasswordOpen(false)
                              setForgotPasswordForm({
                                email: "",
                                code: "",
                                newPassword: "",
                                confirmPassword: "",
                              })
                              setForgotPasswordError("")
                              setForgotPasswordStep("email")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={forgotPasswordLoading}>
                            {forgotPasswordLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send Reset Code"
                            )}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resetCode">Verification Code</Label>
                          <Input
                            id="resetCode"
                            type="text"
                            value={forgotPasswordForm.code}
                            onChange={(e) =>
                              setForgotPasswordForm({ ...forgotPasswordForm, code: e.target.value })
                            }
                            required
                            placeholder="Enter code from email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resetNewPassword">New Password</Label>
                          <Input
                            id="resetNewPassword"
                            type="password"
                            value={forgotPasswordForm.newPassword}
                            onChange={(e) =>
                              setForgotPasswordForm({ ...forgotPasswordForm, newPassword: e.target.value })
                            }
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resetConfirmPassword">Confirm New Password</Label>
                          <Input
                            id="resetConfirmPassword"
                            type="password"
                            value={forgotPasswordForm.confirmPassword}
                            onChange={(e) =>
                              setForgotPasswordForm({ ...forgotPasswordForm, confirmPassword: e.target.value })
                            }
                            required
                            minLength={6}
                          />
                        </div>
                        {forgotPasswordError && (
                          <p className="text-sm text-red-600">{forgotPasswordError}</p>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setForgotPasswordStep("email")
                              setForgotPasswordForm({
                                ...forgotPasswordForm,
                                code: "",
                                newPassword: "",
                                confirmPassword: "",
                              })
                              setForgotPasswordError("")
                            }}
                          >
                            Back
                          </Button>
                          <Button type="submit" disabled={forgotPasswordLoading}>
                            {forgotPasswordLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              "Reset Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
