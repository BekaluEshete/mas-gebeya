"use client"

import React, { useState } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, FileText, GraduationCap, Award, Briefcase, Users, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DocumentUpload {
  file: File
  type: string
  title: string
  preview?: string
}

const SPECIALIZATIONS = [
  "Research", "Cases in law", "Health", "Business",
  "Technology", "Finance", "Education", "Marketing",
  "Human Resources", "Consulting", "Legal", "Medical"
]

const LANGUAGES = [
  "Amharic", "English", "Oromo", "Tigrinya", "Somali",
  "Arabic", "French", "Italian", "German", "Spanish"
]

const DOCUMENT_TYPES = [
  { value: "degree", label: "Degree Certificate", icon: GraduationCap },
  { value: "certificate", label: "Professional Certificate", icon: Award },
  { value: "license", label: "Professional License", icon: Briefcase },
  { value: "cv", label: "CV/Resume", icon: FileText },
  { value: "other", label: "Other Document", icon: FileText }
]

export default function ConsultantRegisterPage() {
  const router = useRouter()
  const { user } = useApp()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    specialization: [] as string[],
    experience: "",
    education: "",
    bio: "",
    languages: [] as string[],
    hourlyRate: "",
    availability: "",
    linkedin: "",
    website: "",
    certifications: [] as string[]
  })

  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [certificationInput, setCertificationInput] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newDoc: DocumentUpload = {
          file,
          type: "other",
          title: file.name,
          preview: e.target?.result as string
        }
        setDocuments(prev => [...prev, newDoc])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const updateDocumentType = (index: number, type: string) => {
    setDocuments(prev => prev.map((doc, i) =>
      i === index ? { ...doc, type } : doc
    ))
  }

  const updateDocumentTitle = (index: number, title: string) => {
    setDocuments(prev => prev.map((doc, i) =>
      i === index ? { ...doc, title } : doc
    ))
  }

  const addCertification = () => {
    if (certificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }))
      setCertificationInput("")
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register as a consultant.",
        variant: "destructive"
      })
      return
    }

    // Validation
    if (formData.specialization.length === 0 ||
        !formData.experience ||
        !formData.education ||
        !formData.bio ||
        formData.languages.length === 0 ||
        !formData.hourlyRate ||
        !formData.availability) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    if (documents.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload at least one document for verification.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value)
        }
      })

      // Add documents
      documents.forEach((doc, index) => {
        submitData.append('documents', doc.file)
      })

      // Add document metadata
      submitData.append('documentTypes', JSON.stringify(documents.map(doc => doc.type)))
      submitData.append('documentTitles', JSON.stringify(documents.map(doc => doc.title)))

      const token = localStorage.getItem("accessToken")

      const response = await fetch('/api/consultants/register', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: submitData,
      })

      const result = await response.json().catch(() => null)

      if (response.ok && result?.status === 'success') {
        toast({
          title: "Successfully submitted",
          description: "Your application was submitted successfully. Redirecting to Home...",
        })
        // Redirect to home after a short delay (lets the toast show)
        setTimeout(() => {
          window.location.href = "/"
        }, 1200)
      } else {
        throw new Error(result?.message || `Request failed (${response.status})`)
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to register as a consultant.</p>
              <Button onClick={() => window.location.href = '/auth/login'}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/consult')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Consult Options
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Consultant</h1>
            <p className="text-gray-600">Join our network of verified consultants and help others with your expertise</p>
          </div>
          <div></div> {/* Spacer for centering */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Tell us about your professional background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (ETB) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="education">Education Background *</Label>
                    <Textarea
                      id="education"
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      placeholder="Describe your educational qualifications..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about your professional experience and expertise..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability *</Label>
                    <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                        <SelectItem value="evenings">Evenings Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Specialization */}
              <Card>
                <CardHeader>
                  <CardTitle>Specialization</CardTitle>
                  <CardDescription>Select your areas of expertise (1-5)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <label key={spec} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={(e) => handleArrayChange('specialization', spec, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                  <CardDescription>Select languages you can communicate in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {LANGUAGES.map((lang) => (
                      <label key={lang} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => handleArrayChange('languages', lang, e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                  <CardDescription>Add your professional certifications (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      placeholder="Enter certification name"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" onClick={addCertification} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {cert}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeCertification(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Contact Information</CardTitle>
                  <CardDescription>Optional professional links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Upload */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>Upload documents to verify your qualifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload verification documents</p>
                    <p className="text-xs text-gray-500 mb-4">PDF, DOC, DOCX, JPG, PNG (Max 5 files, 10MB each)</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('document-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Uploaded Documents ({documents.length}/5)</h4>
                      {documents.map((doc, index) => (
                        <div key={index} className="border rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{doc.file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Select
                            value={doc.type}
                            onValueChange={(value) => updateDocumentType(index, value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={doc.title}
                            onChange={(e) => updateDocumentTitle(index, e.target.value)}
                            placeholder="Document title"
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Your application will be reviewed by our admin team. You'll receive a notification once approved.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}