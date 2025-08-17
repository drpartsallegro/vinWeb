import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

export interface ImageUploaderSingleProps {
  value?: File | string | null
  onChange?: (file: File | null) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  placeholder?: string
  error?: string
  showPreview?: boolean
  aspectRatio?: 'square' | 'video' | 'auto'
  quality?: number // 0-1
}

const ImageUploaderSingle = React.forwardRef<HTMLDivElement, ImageUploaderSingleProps>(
  (
    {
      value,
      onChange,
      onError,
      accept = 'image/*',
      maxSize = 5, // 5MB default
      className,
      disabled = false,
      placeholder = 'Drop an image here or click to browse',
      error,
      showPreview = true,
      aspectRatio = 'square',
      quality = 0.8,
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const dropZoneRef = React.useRef<HTMLDivElement>(null)

    // Generate preview URL when value changes
    React.useEffect(() => {
      if (value instanceof File) {
        const url = URL.createObjectURL(value)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      } else if (typeof value === 'string') {
        setPreviewUrl(value)
      } else {
        setPreviewUrl(null)
      }
    }, [value])

    const validateFile = (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return 'File must be an image'
      }
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }
      return null
    }

    const handleFileSelect = async (file: File) => {
      const error = validateFile(file)
      if (error) {
        onError?.(error)
        return
      }

      try {
        setIsLoading(true)
        
        // Compress image if it's too large
        let processedFile = file
        if (file.size > 1024 * 1024) { // If larger than 1MB
          processedFile = await compressImage(file, quality)
        }

        onChange?.(processedFile)
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to process image')
      } finally {
        setIsLoading(false)
      }
    }

    const compressImage = (file: File, quality: number): Promise<File> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200
          let { width, height } = img
          
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height

          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            file.type,
            quality
          )
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
      })
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleClick = () => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click()
      }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const handleRemove = () => {
      onChange?.(null)
      setPreviewUrl(null)
    }

    const getAspectRatioClass = () => {
      switch (aspectRatio) {
        case 'square':
          return 'aspect-square'
        case 'video':
          return 'aspect-video'
        default:
          return 'aspect-auto'
      }
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div
          ref={dropZoneRef}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
            'hover:border-primary/50 hover:bg-muted/50',
            isDragOver && 'border-primary bg-primary/5',
            error && 'border-destructive bg-destructive/5',
            disabled && 'opacity-50 cursor-not-allowed',
            getAspectRatioClass()
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          {previewUrl && showPreview ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {!disabled && (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              )}
              <p className="text-sm text-muted-foreground mb-2">
                {isLoading ? 'Processing image...' : placeholder}
              </p>
              <p className="text-xs text-muted-foreground">
                {accept === 'image/*' ? 'PNG, JPG, GIF up to' : 'File up to'} {maxSize}MB
              </p>
            </div>
          )}

          {isDragOver && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">Drop image here</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    )
  }
)

ImageUploaderSingle.displayName = 'ImageUploaderSingle'

export { ImageUploaderSingle }
