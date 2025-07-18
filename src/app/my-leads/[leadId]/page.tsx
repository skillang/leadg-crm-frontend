// src/app/sample-table/[leadId]/page.tsx

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetLeadDetailsQuery } from "@/redux/slices/leadsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { StageSelect } from "@/components/StageSelectComponent";
import { useUpdateLeadStageMutation } from "@/redux/slices/leadsApi";
import NotesContainer from "@/components/notes/NotesContainer";
import TasksContainer from "@/components/tasks/TasksContainer";
import DocumentsContainer from "@/components/documents/DocumentsContainer";
import TimelineContainer from "@/components/timeline/TimelineContainer";
import ContactsContainer from "@/components/contacts/ContactsContainer";
import { LEAD_STAGES } from "@/constants/stageConfig";
import { useNotifications } from "@/components/common/NotificationSystem";

// Simple Card components
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// Priority badge colors
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Tab definitions
const tabs = [
  { id: "notes", label: "Notes" },
  { id: "tasks", label: "Tasks & reminders" },
  { id: "timeline", label: "Timeline" },
  { id: "documents", label: "Documents" },
  { id: "activity", label: "Activity log" },
  { id: "contacts", label: "Contacts" },
];

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function LeadDetailsPage() {
  const [activeTab, setActiveTab] = useState("notes");
  const [updateStage, { isLoading: isUpdatingStage }] =
    useUpdateLeadStageMutation();
  const { showSuccess, showError, showWarning } = useNotifications();
  const params = useParams();
  const router = useRouter();
  const leadId = params?.leadId as string;

  const {
    data: leadDetails,
    isLoading,
    error,
  } = useGetLeadDetailsQuery(leadId);

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    if (leadDetails?.phoneNumber) {
      showWarning(
        `Phone call feature is not available yet, Tata Tele coming soon`,
        "Feature Coming soon"
      );
    } else {
      showError("No phone number available for this lead", "No Phone Number");
    }
  };

  const handleEmail = () => {
    if (leadDetails?.email) {
      // window.open(`mailto:${leadDetails.email}`, "_self");
      showWarning(`Email feature is not available yet`, "Feature Coming soon");
    } else {
      showError("No email address available for this lead", "No Email Address");
    }
  };

  // WhatsApp handler with notification instead of alert
  const handleWhatsApp = () => {
    if (!leadDetails?.phoneNumber) {
      showError("No phone number available for this lead");
      return;
    }
    // TODO: Implement WhatsApp modal
    showWarning("WhatsApp chat is not available yet", "Feature Coming soon");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading lead details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !leadDetails) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lead Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The lead you are looking for does not exist or has been removed.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced stage change handler with notifications
  const handleStageChange = async (newStage: string) => {
    if (!leadDetails || newStage === leadDetails.stage) return;

    try {
      // Create a mock Lead object for the API call
      const currentLead = {
        id: leadDetails.leadId,
        name: leadDetails.name,
        stage: leadDetails.stage,
        leadScore: leadDetails.leadScore,
        contact: leadDetails.phoneNumber,
        email: leadDetails.email,
        source: leadDetails.source,
        notes: leadDetails.notes,
        // Add other required Lead properties with defaults
        createdOn: leadDetails.createdAt.split("T")[0],
        media: "Email",
        lastActivity: leadDetails.updatedAt.split("T")[0],
        department: "Sales",
      };

      await updateStage({
        leadId: leadDetails.leadId,
        stage: newStage,
        currentLead: currentLead,
      }).unwrap();

      // Show success notification
      showSuccess(
        `${leadDetails.name}'s stage updated to "${newStage}"`,
        "Lead Stage updated successfully!"
      );
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        data?: {
          detail?: { msg: string }[] | string;
        };
      };

      let errorMessage = "Failed to update stage";

      if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          errorMessage = error.data.detail
            .map((e: { msg: string }) => e.msg)
            .join(", ");
        } else {
          errorMessage = error.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show error notification instead of alert
      showError(
        `Failed to update ${leadDetails.name}'s stage: ${errorMessage}`
      );
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "timeline":
        return (
          <div className="p-6">
            <TimelineContainer leadId={leadDetails.leadId} />
          </div>
        );
      case "tasks":
        return (
          <div className="p-6">
            <TasksContainer leadId={leadDetails.leadId} />
          </div>
        );
      case "notes":
        return (
          <div className="p-6">
            <NotesContainer leadId={leadDetails.leadId} />
          </div>
        );
      case "documents":
        return (
          <div className="p-6">
            <DocumentsContainer leadId={leadDetails.leadId} />
          </div>
        );
      case "activity":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Log Content</h3>
            <p className="text-gray-600">
              Activity log entries will be displayed here...
            </p>
            <h2 className="text-lg font-semibold my-10 text-center text-red-600 bg-red-200 rounded-md">
              ⚠️ Coming soon ⚠️
            </h2>
          </div>
        );
      case "contacts":
        return (
          <div className="p-6">
            <ContactsContainer leadId={leadDetails.leadId} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Button variant="ghost" onClick={handleBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>My leads</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">
              {leadDetails.name}
            </span>
          </div>
        </div>

        {/* Lead Header - Top Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{leadDetails.name}</h1>

                {/* Priority Badge */}
                <Badge
                  className={`text-sm ${getPriorityColor(
                    leadDetails.priority
                  )}`}
                >
                  {leadDetails.priority.charAt(0).toUpperCase() +
                    leadDetails.priority.slice(1)}{" "}
                  Priority
                </Badge>

                {/* Tags */}
                {leadDetails.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Stage Dropdown */}
              <div className="relative">
                <StageSelect
                  value={leadDetails.stage}
                  onValueChange={handleStageChange}
                  options={LEAD_STAGES}
                  placeholder="Select stage..."
                  disabled={isUpdatingStage}
                />
                {isUpdatingStage && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-blue-100 border border-blue-200 rounded text-xs text-blue-600 z-10">
                    Updating stage...
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <Button
                onClick={handleCall}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button
                onClick={handleEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Mail
              </Button>
              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!leadDetails.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Overview (Fixed) */}
          <div className="col-span-12 md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6 w-1/3">
                        Name:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.name}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Lead ID:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.leadId}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Phone number:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.phoneNumber || "Not provided"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Email:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.email || "Not provided"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Lead Category:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.leadCategory || "Not provided"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Country of interest:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.countryOfInterest || "Not specified"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Course level:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.courseLevel || "Not specified"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Source:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 capitalize">
                            {leadDetails.source}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Assigned to:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.assignedToName || "Unassigned"}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Created on:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {formatDate(leadDetails.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-b">
                      <TableCell className="font-medium text-gray-500 py-3 px-6">
                        Last contacted:
                      </TableCell>
                      <TableCell className="py-3 px-6">
                        <span className="text-gray-900">
                          {leadDetails.lastContacted
                            ? formatDate(leadDetails.lastContacted)
                            : "Never"}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Extra Info</CardTitle>
              </CardHeader>
              <CardContent>
                {leadDetails.notes ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {leadDetails.notes.split("•").map((line, index) => {
                      const trimmedLine = line.trim();
                      return trimmedLine ? (
                        <li key={index} className="text-gray-900">
                          {trimmedLine}
                        </li>
                      ) : null;
                    })}
                  </ul>
                ) : (
                  <span className="text-gray-900">
                    No extra info was given while lead creation
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabbed Interface */}
          <div className="col-span-12 md:col-span-7">
            <Card>
              {/* Tab Navigation */}
              <div className="border-b">
                <div className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">{renderTabContent()}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
