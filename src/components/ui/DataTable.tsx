import * as React from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Input } from "./Input"
import { Select } from "./Select"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortable?: boolean
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  className?: string
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortable = true,
  searchable = true,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  emptyMessage = "No data available",
  loading = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize)

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection, sortable])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData
    
    const startIndex = (currentPage - 1) * currentPageSize
    return filteredData.slice(startIndex, startIndex + currentPageSize)
  }, [filteredData, currentPage, currentPageSize, pagination])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / currentPageSize)
  const startItem = (currentPage - 1) * currentPageSize + 1
  const endItem = Math.min(currentPage * currentPageSize, filteredData.length)

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (!sortable) return
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value)
    setCurrentPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(paginatedData)
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, row])
    } else {
      onSelectionChange?.(selectedRows.filter(r => r !== row))
    }
  }

  const isRowSelected = (row: T) => selectedRows.includes(row)

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-2 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      {(searchable || pagination) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {pagination && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Show:</span>
                              <Select
          value={currentPageSize.toString()}
          onChange={handlePageSizeChange}
          options={pageSizeOptions.map(size => ({ value: size.toString(), label: size.toString() }))}
          className="w-20"
        />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-text",
                      column.sortable && sortable && "cursor-pointer hover:bg-surface-3",
                      column.width && `w-${column.width}`,
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                    onClick={() => column.sortable && handleSort(column.key as keyof T)}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.align === 'center' && "justify-center",
                      column.align === 'right' && "justify-end"
                    )}>
                      <span>{column.header}</span>
                      {column.sortable && sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-8 text-center text-muted"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "hover:bg-surface-2 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isRowSelected(row)}
                          onChange={(e) => handleSelectRow(row, e.target.checked)}
                          className="rounded border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "px-4 py-3 text-sm text-text",
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-muted">
            Showing {startItem} to {endItem} of {filteredData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
