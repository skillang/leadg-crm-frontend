// src/app/my-leads/columns.tsx - FIXED: Function Factory Pattern

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useState } from "react";
import { Lead } from "@/models/types/lead";
import {
  useUpdateLeadStageMutation,
  useDeleteLeadMutation,
} from "@/redux/slices/leadsApi";
import { useGetActiveStagesQuery } from "@/redux/slices/stagesApi";
import { useNotifications } from "@/components/common/NotificationSystem";
import EditLeadModal from "@/components/leads/EditLeadModal";
import Image from "next/image";
import { StageSelect } from "@/components/common/StageSelect";
import { StatusSelect } from "@/components/common/StatusSelect";
import { useUpdateLeadMutation } from "@/redux/slices/leadsApi";
import { useGetActiveStatusesQuery } from "@/redux/slices/statusesApi";
import { openEmailDialog } from "@/redux/slices/emailSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { openModal } from "@/redux/slices/whatsappSlice";

// StageSelectCell with StageDisplay in dropdown (UNCHANGED)
const StageSelectCell = ({ row }: { row: Row<Lead> }) => {
  const [updateStage, { isLoading }] = useUpdateLeadStageMutation();
  const { showSuccess, showError } = useNotifications();

  const { data: stagesData, isLoading: stagesLoading } =
    useGetActiveStagesQuery({});

  const stage = row.getValue("stage") as string;
  const currentLead = row.original;

  const handleStageChange = async (newStage: string) => {
    if (newStage === stage) return;

    try {
      await updateStage({
        leadId: currentLead.id,
        stage: newStage,
        currentLead,
      }).unwrap();

      // Get stage display name for notification
      const selectedStage = stagesData?.stages.find((s) => s.name === newStage);
      const stageDisplayName = selectedStage?.display_name || newStage;

      showSuccess(
        `${currentLead.name}'s stage updated to "${stageDisplayName}"`,
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
        } else if (typeof error.data.detail === "string") {
          errorMessage = error.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(
        `Failed to update ${currentLead.name}'s stage: ${errorMessage}`
      );
    }
  };

  // Show loading if stages are being fetched
  if (stagesLoading) {
    return (
      <div className="flex items-center justify-center w-[120px] h-8">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      <StageSelect
        value={stage}
        onValueChange={handleStageChange}
        stages={stagesData?.stages || []}
        disabled={isLoading}
        isLoading={stagesLoading}
        placeholder="Select stage"
        className="w-[140px]"
        showLabel={false}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

const ContactCell = ({ row }: { row: Row<Lead> }) => {
  const dispatch = useDispatch();
  const lead = row.original;
  const { showError } = useNotifications();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // const handleCall = () => {
  //   if (lead.phoneNumber || lead.contact) {
  //     showWarning(
  //       `Phone call feature is not available yet, Tata Tele coming soon`,
  //       "Feature Coming soon"
  //     );
  //   } else {
  //     showError("No phone number available for this lead", "No Phone Number");
  //   }
  // };

  const handleEmail = () => {
    if (lead.id) {
      dispatch(openEmailDialog(lead.id));
    } else {
      showError("No lead ID available", "Error");
    }
  };

  const handleWhatsApp = () => {
    if (!lead.phoneNumber && !lead.contact) {
      showError("No phone number available for this lead", "No Phone Number");
      return;
    }

    // Prepare lead data for WhatsApp modal
    const whatsappLeadData = {
      id: lead.id,
      leadId: lead.id,
      name: lead.name,
      phoneNumber: lead.phoneNumber || lead.contact || "",
      email: lead.email,
    };

    // Prepare user data for WhatsApp modal
    const whatsappUserData = currentUser
      ? {
          id: currentUser.id,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          email: currentUser.email,
        }
      : null;

    if (whatsappUserData) {
      dispatch(
        openModal({
          lead: whatsappLeadData,
          user: whatsappUserData,
        })
      );
    } else {
      showError("User data not available", "Error");
    }
  };

  return (
    <div className="flex gap-2">
      {/* <Badge
        className="bg-slate-500/10 text-slate-700 border-slate-500/25 border-2 cursor-pointer hover:bg-slate-500/20"
        onClick={handleCall}
      >
        <Image
          src="/assets/icons/call-icon.svg"
          alt="Call Icon"
          width={16}
          height={16}
        />
      </Badge> */}
      <Button
        className="bg-slate-500/10 text-slate-700 border-slate-500/25 border-2 cursor-pointer hover:bg-slate-500/20 h-6 px-2"
        onClick={handleEmail}
      >
        <Image
          src="/assets/icons/email-icon.svg"
          alt="Email Icon"
          width={16}
          height={16}
        />
      </Button>
      <Badge
        className="bg-slate-500/10 text-slate-700 border-slate-500/25 border-2 cursor-pointer hover:bg-slate-500/20"
        onClick={handleWhatsApp}
      >
        <Image
          src="/assets/icons/whatsapp-icon.svg"
          alt="WhatsApp Icon"
          width={16}
          height={16}
        />
      </Badge>
    </div>
  );
};

// FIXED: Actions cell that accepts router as prop
const ActionsCell = ({
  row,
  router,
}: {
  row: Row<Lead>;
  router: AppRouterInstance;
}) => {
  const lead = row.original;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLead] = useDeleteLeadMutation();
  const { showSuccess, showError } = useNotifications();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Copied to clipboard!");
    } catch (error) {
      showError(error ? String(error) : "Error", "Failed to copy to clipboard");
    }
  };

  const handleEditLead = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(lead.id).unwrap();
      showSuccess(`Lead "${lead.name}" has been deleted successfully.`);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { detail?: string }; message?: string })?.data
          ?.detail ||
        (error as { data?: { detail?: string }; message?: string })?.message ||
        "Failed to delete lead";
      showError(`Failed to delete lead: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
            <span className="sr-only">Open menu</span>
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleCopy(lead.id)}>
            Copy Lead ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleCopy(lead.email!)}
            disabled={!lead.email}
          >
            Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/my-leads/${lead.id}`)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditLead}>
            Edit Lead
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete Lead"
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        lead={lead}
      />
    </>
  );
};

// FIXED: View Details Cell that accepts router as prop
const ViewDetailsCell = ({
  row,
  router,
}: {
  row: Row<Lead>;
  router: AppRouterInstance;
}) => {
  const leadId = row.original.id;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push(`/my-leads/${leadId}`)}
      className="p-2 hover:bg-gray-50 border-2 cursor-pointer"
    >
      <ArrowRight className="h-4 w-4 text-gray-600 " />
    </Button>
  );
};

// Add this component before createColumns function
const StatusSelectCell = ({ row }: { row: Row<Lead> }) => {
  const [updateLeadStatus, { isLoading }] = useUpdateLeadMutation(); // You'll need to create this
  const { showSuccess, showError } = useNotifications();

  const { data: statusesData, isLoading: statusesLoading } =
    useGetActiveStatusesQuery({}); // You'll need to create this

  const status = row.getValue("status") as string;
  const currentLead = row.original;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    try {
      await updateLeadStatus({
        lead_id: currentLead.id,
        status: newStatus,
        currentLead,
      }).unwrap();

      const selectedStatus = statusesData?.statuses.find(
        (s) => s.name === newStatus
      );
      const statusDisplayName = selectedStatus?.display_name || newStatus;

      showSuccess(
        `${currentLead.name}'s status updated to "${statusDisplayName}"`,
        "Lead Status updated successfully!"
      );
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        data?: { detail?: { msg: string }[] | string };
      };

      let errorMessage = "Failed to update status";
      if (error?.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          errorMessage = error.data.detail
            .map((e: { msg: string }) => e.msg)
            .join(", ");
        } else if (typeof error.data.detail === "string") {
          errorMessage = error.data.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(
        `Failed to update ${currentLead.name}'s status: ${errorMessage}`
      );
    }
  };

  if (statusesLoading) {
    return (
      <div className="flex items-center justify-center w-[120px] h-8">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      <StatusSelect
        value={status}
        onValueChange={handleStatusChange}
        statuses={statusesData?.statuses || []}
        disabled={isLoading}
        isLoading={statusesLoading}
        placeholder="Select status"
        className="w-[140px]"
        showLabel={false}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};

// FIXED: Create columns as a factory function that accepts router
export const createColumns = (router: AppRouterInstance): ColumnDef<Lead>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lead Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "createdOn",
    header: "Created On",
    cell: ({ row }) => {
      const date = row.getValue("createdOn") as string;
      return (
        <div className="text-gray-600">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
          {/* <div className="font-medium">
            {row.getValue("createdAt") as string}
          </div> */}
          {/* {formatDate(leadDetails.createdAt)} */}
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => <ContactCell row={row} />,
    meta: {
      className: "w-auto",
    },
  },
  // {
  //   accessorKey: "email",
  //   header: "Email",
  //   cell: ({ row }) => <EmailCell email={row.getValue("email")} />,
  // },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      return (
        <Badge variant="outline" className="text-xs">
          {source}
        </Badge>
      );
    },
    meta: {
      className: "w-auto", // This helps with auto-sizing
    },
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stage
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <StageSelectCell row={row} />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <StatusSelectCell row={row} />,
  },

  {
    id: "view_details",
    header: "View More",
    cell: ({ row }) => <ViewDetailsCell row={row} router={router} />,
    enableSorting: false,
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => {
      const date = row.getValue("lastActivity") as string;
      return (
        <div className="text-gray-600 text-sm">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Assigned To
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const lead = row.original;
      const assignedToEmail = lead.assignedTo;

      // Create a mapping from emails to proper names
      const emailToNameMap: { [key: string]: string } = {
        "rejibabu@skillang.com": "Reji Babu",
        "hariharan@skillang.com": "Hariharan",
        "lokesh@skillang.com": "Lokesh Sekar",
        "neha@skillang.com": "Neha Admin",
      };

      let displayName = null;
      if (assignedToEmail) {
        displayName =
          emailToNameMap[assignedToEmail] || assignedToEmail.split("@")[0];
      }

      return (
        <div className="flex items-center">
          {displayName ? (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
            >
              {displayName}
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-500"
            >
              Unassigned
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      // Try both possible field names from the API response
      const category =
        (row.getValue("category") as string) ||
        (row.original.leadCategory as string);
      return (
        <Badge variant="outline" className="text-xs">
          {category || "N/A"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} router={router} />,
  },
];

// DEPRECATED: Keep this for backward compatibility but mark as deprecated
// export const columns: ColumnDef<Lead>[] = [];
// console.warn(
//   "Using deprecated 'columns' export. Use 'createColumns(router)' instead."
// );
