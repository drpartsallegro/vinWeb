'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { MessageCircle, EyeOff } from 'lucide-react'

interface CommentThreadProps {
  orderId: string
  comments: any[]
  canComment: boolean
}

export function CommentThread({ orderId, comments, canComment }: CommentThreadProps) {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: newComment.trim(),
          isInternal: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      setNewComment('')
      addToast({
        type: 'success',
        title: 'Comment Posted',
        description: 'Your message has been sent.',
      })

      // Refresh the page to show the new comment
      window.location.reload()
    } catch (error) {
      console.error('Error posting comment:', error)
      addToast({
        type: 'error',
        title: 'Failed to Post Comment',
        description: 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleComments = comments.filter(comment => 
    !comment.isInternal || (session?.user?.role && ['ADMIN', 'STAFF'].includes(session.user.role))
  )

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {visibleComments.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          visibleComments.map((comment) => {
            const isFromStaff = ['ADMIN', 'STAFF'].includes(comment.authorRole)
            const isInternal = comment.isInternal
            
            return (
              <Card 
                key={comment.id} 
                className={`p-4 ${
                  isFromStaff 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-surface2/50'
                } ${
                  isInternal ? 'border-warning/30 bg-warning/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isFromStaff 
                      ? 'bg-primary text-white' 
                      : 'bg-surface2 text-muted'
                  }`}>
                    {isFromStaff ? 'S' : 'U'}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text">
                          {comment.author?.name || 
                           (isFromStaff ? 'PartsFlow Support' : 'Customer')}
                        </span>
                        <span className="text-xs text-muted">
                          {comment.authorRole.toLowerCase()}
                        </span>
                        {isInternal && (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <EyeOff className="h-3 w-3" />
                            Internal
                          </div>
                        )}
                      </div>
                      <time 
                        className="text-xs text-muted"
                        title={formatDate(comment.createdAt)}
                      >
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>
                    
                    <div className="text-sm text-text whitespace-pre-wrap">
                      {comment.body}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* New Comment Form */}
      {canComment && (
        <Card className="p-4">
          <div className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your message here..."
              rows={3}
              maxLength={2000}
              disabled={isSubmitting}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {newComment.length}/2000 characters
              </span>
              
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                loading={isSubmitting}
              >
                Send Message
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!canComment && (
        <div className="text-center py-4 text-muted">
          {!session?.user ? (
            <div className="space-y-2">
              <p className="text-sm">Comments are disabled for guest users.</p>
              <p className="text-xs text-muted">Please log in or register to participate in the conversation.</p>
            </div>
          ) : (
            <p className="text-sm">Comments are disabled for this order.</p>
          )}
        </div>
      )}
    </div>
  )
}





