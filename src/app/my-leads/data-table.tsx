// src/app/sample-table/data-table.tsx

"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NewLeadDropdown from "@/components/leads/NewLeadDropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  VisibilityState,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  CalendarDaysIcon,
  DownloadIcon,
  Grid2X2PlusIcon,
  ListFilterIcon,
  SlidersHorizontalIcon,
  ArrowUpDown,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Import the LEAD_STAGES configuration
import { LEAD_STAGES } from "@/constants/stageConfig";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  onAddNew?: () => void;
  onExportCsv?: () => void;
  onCustomize?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "Leads",
  description,
  onExportCsv,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Local filter states
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState("last-7-days");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  // Apply filters to table
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (stageFilter !== "all") {
      filters.push({ id: "stage", value: stageFilter });
    }

    if (departmentFilter !== "all") {
      filters.push({ id: "department", value: departmentFilter });
    }

    if (statusFilter.length > 0) {
      filters.push({ id: "status", value: statusFilter });
    }

    setColumnFilters(filters);
  }, [stageFilter, departmentFilter, statusFilter]);

  const hasActiveFilters =
    stageFilter !== "all" ||
    departmentFilter !== "all" ||
    statusFilter.length > 0;
  const activeFiltersCount = [
    stageFilter !== "all" ? 1 : 0,
    departmentFilter !== "all" ? 1 : 0,
    statusFilter.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Handler functions
  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
    } else {
      if (data.length === 0) {
        console.warn("No data to export");
        return;
      }

      const firstItem = data[0] as Record<string, unknown>;
      const headers = Object.keys(firstItem);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers,
          ...data.map((row) => {
            const typedRow = row as Record<string, unknown>;
            return headers.map((header) => {
              const value = typedRow[header];
              if (value === null || value === undefined) {
                return "";
              }
              if (typeof value === "string" && value.includes(",")) {
                return `"${value}"`;
              }
              return String(value);
            });
          }),
        ]
          .map((row) => (Array.isArray(row) ? row.join(",") : row))
          .join("\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `${title.toLowerCase()}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClearAllFilters = () => {
    setStageFilter("all");
    setDepartmentFilter("all");
    setStatusFilter([]);
    setGlobalFilter("");
  };

  const handleStatusToggle = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleSort = (columnId: string) => {
    const existingSort = sorting.find((s) => s.id === columnId);
    if (!existingSort) {
      setSorting([{ id: columnId, desc: false }]);
    } else if (!existingSort.desc) {
      setSorting([{ id: columnId, desc: true }]);
    } else {
      setSorting([]);
    }
  };

  const getSortIcon = (columnId: string) => {
    const existingSort = sorting.find((s) => s.id === columnId);
    if (!existingSort) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return existingSort.desc ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  // Helper function to get stage label by value
  const getStageLabel = (value: string) => {
    const stage = LEAD_STAGES.find((stage) => stage.value === value);
    return stage?.label || value;
  };

  // Improved pagination component
  const ImprovedPagination = () => {
    const {
      getState,
      getCanPreviousPage,
      getCanNextPage,
      getPageCount,
      setPageIndex,
      previousPage,
      nextPage,
      setPageSize,
      getFilteredRowModel,
      getFilteredSelectedRowModel,
    } = table;

    const { pageIndex, pageSize } = getState().pagination;
    const totalRows = getFilteredRowModel().rows.length;
    const selectedRows = getFilteredSelectedRowModel().rows.length;

    // Calculate page numbers to show
    const getPageNumbers = () => {
      const totalPages = getPageCount();
      const currentPage = pageIndex + 1;
      const delta = 2; // Number of pages to show on each side of current page

      let start = Math.max(1, currentPage - delta);
      let end = Math.min(totalPages, currentPage + delta);

      // Adjust if we're near the beginning or end
      if (currentPage <= delta + 1) {
        end = Math.min(totalPages, delta * 2 + 1);
      }
      if (currentPage >= totalPages - delta) {
        start = Math.max(1, totalPages - delta * 2);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
      <div className="flex items-center justify-between px-2 py-4">
        {/* Left side - Selection info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {selectedRows} of {totalRows} row(s) selected
          </div>

          {/* Page size selector */}
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page:</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right side - Navigation */}
        <div className="flex items-center space-x-2">
          {/* Page info */}
          <div className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {getPageCount()}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(0)}
              disabled={!getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => previousPage()}
              disabled={!getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={pageIndex + 1 === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPageIndex(page - 1)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => nextPage()}
              disabled={!getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(getPageCount() - 1)}
              disabled={!getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Row - Integrated Header */}
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <div className="font-semibold text-2xl">{title}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Grid2X2PlusIcon className="h-4 w-4" />
                Customize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8 w-64"
            />
          </div>

          {/* Sort by Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontalIcon className="h-4 w-4" />
                Sort by
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleSort("name")}
                className="cursor-pointer"
              >
                <span className="flex items-center justify-between w-full">
                  Lead name
                  {getSortIcon("name")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("createdDate")}
                className="cursor-pointer"
              >
                <span className="flex items-center justify-between w-full">
                  Created date
                  {getSortIcon("createdDate")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("lastActivity")}
                className="cursor-pointer"
              >
                <span className="flex items-center justify-between w-full">
                  Last activity
                  {getSortIcon("lastActivity")}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSorting([])}
                className="cursor-pointer"
              >
                Clear sorting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Optimized Filters for CRM */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ListFilterIcon className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Filter Leads</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Lead Stage Filter - Updated to use LEAD_STAGES */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lead Stage</label>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {LEAD_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lead Source Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lead Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Website",
                      "Email",
                      "Phone",
                      "Social Media",
                      "Referral",
                      "Advertisement",
                    ].map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={source}
                          checked={statusFilter.includes(source.toLowerCase())}
                          onCheckedChange={() =>
                            handleStatusToggle(source.toLowerCase())
                          }
                        />
                        <label htmlFor={source} className="text-sm">
                          {source}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Active Filters
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {stageFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          Stage: {getStageLabel(stageFilter)}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => setStageFilter("all")}
                          />
                        </Badge>
                      )}
                      {departmentFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                          Dept: {departmentFilter}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => setDepartmentFilter("all")}
                          />
                        </Badge>
                      )}
                      {statusFilter.map((status) => (
                        <Badge
                          key={status}
                          variant="secondary"
                          className="text-xs"
                        >
                          {status}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleStatusToggle(status)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={handleClearAllFilters}>
                  Clear All
                </Button>
                <DialogTrigger asChild>
                  <Button>Apply Filters</Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Date Range Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" />
                Last 7 days
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={setDateRange}
              >
                <DropdownMenuRadioItem value="last-7-days">
                  Last 7 days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last-30-days">
                  Last 30 days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-month">
                  This month
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="last-month">
                  Last month
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-quarter">
                  This quarter
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="this-year">
                  This year
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-blue-200 border-blue-500 border-2 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
          >
            <DownloadIcon className="h-4 w-4" />
            .csv
          </Button>
          <NewLeadDropdown />
        </div>
      </div>

      {/* Description */}
      {description && <p className="text-gray-600 text-sm">{description}</p>}

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-600">Active filters:</span>
          {stageFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Stage: {getStageLabel(stageFilter)}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => setStageFilter("all")}
              />
            </Badge>
          )}
          {departmentFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Department: {departmentFilter}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => setDepartmentFilter("all")}
              />
            </Badge>
          )}
          {statusFilter.map((status) => (
            <Badge key={status} variant="secondary" className="text-xs">
              Source: {status}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {hasActiveFilters
                    ? "No leads match your filters."
                    : "No leads found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Improved Pagination */}
      <ImprovedPagination />
    </div>
  );
}
