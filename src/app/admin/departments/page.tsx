"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  // useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/redux/slices/authApi";
import { useNotifications } from "@/components/common/NotificationSystem";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Plus,
  Users2,
  // Edit,
  Trash2,
  UserPlus,
} from "lucide-react";

const DepartmentManagementPage = () => {
  const router = useRouter();

  // ALL HOOKS MUST BE CALLED FIRST - before any conditionals
  const { showSuccess, showError, showConfirm } = useNotifications();
  const { hasAccess, AccessDeniedComponent } = useAdminAccess({
    title: "Admin Access Required",
    description: "You need admin privileges to manage departments.",
  });

  // API hooks
  const {
    data: departmentsData,
    isLoading,
    error,
    refetch,
  } = useGetDepartmentsQuery({
    include_user_count: true,
  });
  const [createDepartment, { isLoading: isCreating }] =
    useCreateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();

  // Component state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Show error notification for loading errors
  React.useEffect(() => {
    if (error) {
      showError("Failed to load departments", "Loading Error");
    }
  }, [error, showError]);

  // CONDITIONAL ACCESS CHECK AFTER ALL HOOKS
  if (!hasAccess) {
    return AccessDeniedComponent;
  }

  // Handle create department - Updated to use notifications
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!createFormData.name.trim())
      newErrors.name = "Department name is required";
    if (!createFormData.description.trim())
      newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createDepartment({
        name: createFormData.name.trim(),
        description: createFormData.description.trim(),
        is_active: createFormData.is_active,
      }).unwrap();

      // Use notification system instead of local state
      showSuccess(
        `Department "${createFormData.name}" created successfully!`,
        "Department Created"
      );

      setIsCreateDialogOpen(false);
      setCreateFormData({ name: "", description: "", is_active: true });
      setErrors({});
      refetch();
    } catch (err) {
      console.error("Failed to create department:", err);
      showError(
        "Failed to create department. Please try again.",
        "Creation Failed"
      );
    }
  };

  // Handle delete department - Updated to use confirmation dialog
  const handleDeleteDepartment = async (
    departmentId: string,
    departmentName: string
  ) => {
    showConfirm({
      title: "Delete Department",
      description: `Are you sure you want to delete "${departmentName}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteDepartment(departmentId).unwrap();
          showSuccess(
            `Department "${departmentName}" deleted successfully!`,
            "Department Deleted"
          );
          refetch();
        } catch (err) {
          console.error("Failed to delete department:", err);
          showError(
            "Failed to delete department. Please try again.",
            "Deletion Failed"
          );
        }
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Department Management</h1>
              <p className="text-gray-600">Manage organizational departments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/register-user")}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {departmentsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Departments
                  </p>
                  <p className="text-2xl font-bold">
                    {departmentsData.total_count}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Predefined
                  </p>
                  <p className="text-2xl font-bold">
                    {departmentsData.predefined_count}
                  </p>
                </div>
                <Badge variant="secondary">System</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom</p>
                  <p className="text-2xl font-bold">
                    {departmentsData.custom_count}
                  </p>
                </div>
                <Badge variant="outline">Custom</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Department Button */}
      <div className="mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new custom department to your organization
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) => {
                    setCreateFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g., Study Abroad"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => {
                    setCreateFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  placeholder="Describe the department's role and responsibilities"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={createFormData.is_active}
                  onCheckedChange={(checked) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      is_active: checked,
                    }))
                  }
                />
                <Label htmlFor="is_active">Active Department</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Department"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading departments...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Predefined Departments */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Predefined Departments
              <Badge variant="secondary">
                {departmentsData?.predefined_count || 0}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentsData?.departments?.predefined?.map((dept) => (
                <Card key={dept.name}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{dept.display_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {dept.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Predefined
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users2 className="w-4 h-4" />
                        <span>Users Count coming soon</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Departments */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Custom Departments
              <Badge variant="outline">
                {departmentsData?.custom_count || 0}
              </Badge>
            </h2>
            {departmentsData?.departments?.custom &&
            departmentsData.departments.custom.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentsData.departments.custom.map((dept) => (
                  <Card key={dept.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{dept.display_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {dept.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users2 className="w-4 h-4" />
                          <span>Users Count coming soon</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-xs text-gray-500">
                            Created by {dept.created_by}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() =>
                                dept.id &&
                                handleDeleteDepartment(
                                  dept.id,
                                  dept.display_name
                                )
                              }
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-6">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Custom Departments
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first custom department to get started
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Department
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementPage;
