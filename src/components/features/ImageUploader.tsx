"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export interface ImageUploaderProps {
  label?: string
  helperText?: string
  onFileSelect?: (file: File | null) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  disabled?: boolean
  currentFile?: File | null
}

const ImageUploader = React.forwardRef<HTMLDivElement, ImageUploaderProps>(
  (
    {
      label,
      helperText,
      onFileSelect,
      maxSize = 5,
      acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
      className,
      disabled = false,
      currentFile = null,
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`)
        return
      }
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`)
        return
      }

      onFileSelect?.(file)
      event.target.value = ""
    }

    const removeFile = () => {
      onFileSelect?.(null)
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file) return

      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`)
        return
      }
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`)
        return
      }

      onFileSelect?.(file)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label className="block text-sm font-medium text-text mb-2">
            {label}
          </label>
        )}

        {!currentFile ? (
          <div
            className={cn(
              "relative border-2 border-dashed border-border rounded-xl p-6 transition-colors",
              "hover:border-primary/50 focus-within:border-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={disabled}
            />

            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted mb-2" />
              <p className="text-sm text-muted mb-1">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-muted">
                {acceptedTypes.join(", ")} up to {maxSize}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-surface-2">
              <img
                src={URL.createObjectURL(currentFile)}
                alt="Uploaded image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 px-3"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted text-center">
              {currentFile.name.length > 20
                ? `${currentFile.name.substring(0, 20)}...`
                : currentFile.name}
            </div>
          </div>
        )}

        {helperText && (
          <p className="mt-2 text-sm text-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
ImageUploader.displayName = "ImageUploader"

export { ImageUploader }




