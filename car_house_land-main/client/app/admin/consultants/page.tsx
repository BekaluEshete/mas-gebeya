"use client"

import React, { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  AlertCircle,
  Search,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Consultant } from "@/types"

interface ConsultantApplication extends Consultant {
  userId: {
    _id: string
    fullName: string
    email: string
    phone: string
    avatar?: string
  }
}

function isImageUrl(url: string) {
  if (!url) return false
  if (url.includes("/image/upload/")) return true
  return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url)
}

function toCloudinaryDownloadUrl(url: string, filename?: string | null) {
  // Cloudinary supports forcing download via fl_attachment (optionally with a filename).
  // If we include a filename with extension (e.g., resume.pdf), the downloaded file keeps the correct format.
  if (!url) return url

  const safeName = (filename || "").trim()
  const attachmentPart = safeName ? `fl_attachment:${encodeURIComponent(safeName)}` : "fl_attachment"

  // Insert transformation right after /upload/
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${attachmentPart}/`) : url
}

export default function ConsultantManagementPage() {
  const { user } = useApp()
  const { toast } = useToast()
  const [applications, setApplications] = useState<ConsultantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ConsultantApplication | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access this page.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/consultants/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.status === 'success') {
        setApplications(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch consultant applications.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReject = async (applicationId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`/api/consultants/${applicationId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved, rejectionReason })
      })

      const result = await response.json()

      if (result.status === 'success') {
        toast({
          title: approved ? "Consultant Approved" : "Application Rejected",
          description: approved
            ? "The consultant has been approved and can now offer services."
            : "The consultant application has been rejected.",
        })
        fetchApplications() // Refresh the list
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process application.",
        variant: "destructive"
      })
    }
  }

  const handleVerifyDocument = async (applicationId: string, docId: string, verified: boolean) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`/api/consultants/${applicationId}/documents/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified })
      })

      const result = await response.json()

      if (result.status === 'success') {
        toast({
          title: verified ? "Document Verified" : "Verification Removed",
          description: verified
            ? "The document has been marked as verified."
            : "The document verification has been removed.",
        })
        fetchApplications() // Refresh the list
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify document.",
        variant: "destructive"
      })
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "pending" && !app.isApproved) ||
      (filterStatus === "approved" && app.isApproved)

    const matchesSearch = !searchQuery ||
      app.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(app => !app.isApproved).length,
    approved: applications.filter(app => app.isApproved).length,
    rejected: applications.filter(app => !app.isApproved && app.rejectionReason).length
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultant Management</h1>
          <p className="text-gray-600">Review and manage consultant applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Consultant Applications</CardTitle>
            <CardDescription>
              Review consultant applications and manage approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No consultant applications found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.userId.fullName}</p>
                          <p className="text-sm text-gray-600">{application.userId.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {application.specialization.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {application.specialization.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.specialization.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{application.experience} years</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{application.documents.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.isApproved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : application.rejectionReason ? (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!application.isApproved && !application.rejectionReason && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveReject(application._id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Application</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="rejectionReason">Reason for rejection</Label>
                                      <Textarea
                                        id="rejectionReason"
                                        placeholder="Please provide a reason for rejecting this application..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline">Cancel</Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          const reason = (document.getElementById('rejectionReason') as HTMLTextAreaElement)?.value
                                          handleApproveReject(application._id, false, reason)
                                        }}
                                      >
                                        Reject Application
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Consultant Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.userId.fullName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.userId.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.userId.phone}</p>
                    </div>
                    <div>
                      <Label>Applied Date</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedApplication.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Experience</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.experience} years</p>
                    </div>
                    <div>
                      <Label>Hourly Rate</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.hourlyRate} ETB/hour</p>
                    </div>
                    <div>
                      <Label>Availability</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.availability}</p>
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <p className="text-sm text-gray-600">{selectedApplication.rating}/5.0</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Specialization</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.specialization.map((spec) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Languages</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedApplication.languages.map((lang) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedApplication.certifications && selectedApplication.certifications.length > 0 && (
                    <div className="mt-4">
                      <Label>Certifications</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.certifications.map((cert) => (
                          <Badge key={cert} variant="outline">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio and Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Background</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Education</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedApplication.education}</p>
                    </div>
                    <div>
                      <Label>Professional Bio</Label>
                      <p className="text-sm text-gray-600 mt-1">{selectedApplication.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
                  <div className="space-y-3">
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-gray-600">
                                Type: {doc.type} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}

                            {isImageUrl(doc.url) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewImageUrl(doc.url)}
                                title="Preview image"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button asChild size="sm" variant="outline" title="Download document">
                                <a
                                  href={toCloudinaryDownloadUrl(doc.url, doc.originalName || doc.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {!doc.verified && (
                              <Button
                                size="sm"
                                onClick={() => handleVerifyDocument(selectedApplication._id, doc._id, true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Preview Dialog */}
                <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    {previewImageUrl && (
                      <div className="w-full">
                        <img
                          src={previewImageUrl}
                          alt="Uploaded document preview"
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Application Status</h3>
                  <div className="flex items-center gap-2">
                    {selectedApplication.isApproved ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approved on {new Date(selectedApplication.approvedAt!).toLocaleDateString()}
                      </Badge>
                    ) : selectedApplication.rejectionReason ? (
                      <div>
                        <Badge variant="destructive" className="mb-2">
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejected
                        </Badge>
                        <p className="text-sm text-gray-600">
                          Reason: {selectedApplication.rejectionReason}
                        </p>
                      </div>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}