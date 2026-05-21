'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  BrainCog,
  FolderCode,
  Globe,
  Mic,
  Paperclip,
  Square,
  StopCircle,
  X,
} from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

type Mode = 'search' | 'think' | 'canvas' | null

type PromptInputBoxProps = {
  onSend?: (message: string, files?: File[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

const ABBY_TYPING_LINE =
  'Halo! Saya Abby, selamat datang di website dr. Ferdi Iskandar. Ada yang bisa Abby bantu?'

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function buildMessage(message: string, mode: Mode) {
  if (mode === 'search') return `[Search: ${message}]`
  if (mode === 'think') return `[Think: ${message}]`
  if (mode === 'canvas') return `[Canvas: ${message}]`
  return message
}

function VoiceRecorder({ seconds, bars = 24 }: { seconds: number; bars?: number }) {
  return (
    <div className="fi-prompt-recorder" role="status" aria-live="polite">
      <div className="fi-prompt-recorder-meta">
        <span className="fi-prompt-recorder-dot" aria-hidden="true" />
        <span>{formatDuration(seconds)}</span>
      </div>
      <div className="fi-prompt-visualizer" aria-hidden="true">
        {Array.from({ length: bars }).map((_, index) => (
          <span
            className="fi-prompt-bar"
            key={index}
            style={
              {
                '--fi-bar-height': `${30 + ((index * 13) % 60)}%`,
                '--fi-bar-delay': `${index * 0.04}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}

function ImagePreviewDialog({
  imageUrl,
  onClose,
}: {
  imageUrl: string | null
  onClose: () => void
}) {
  return (
    <DialogPrimitive.Root open={Boolean(imageUrl)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fi-prompt-dialog-overlay" />
        <DialogPrimitive.Content className="fi-prompt-dialog-content">
          <DialogPrimitive.Title className="fi-prompt-sr-only">Image Preview</DialogPrimitive.Title>
          <DialogPrimitive.Close className="fi-prompt-dialog-close">
            <X aria-hidden="true" />
            <span className="fi-prompt-sr-only">Close</span>
          </DialogPrimitive.Close>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="fi-prompt-dialog-card"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {imageUrl ? (
              <Image
                alt="Pratinjau gambar"
                className="fi-prompt-dialog-image"
                src={imageUrl}
                unoptimized
                width={1600}
                height={1200}
              />
            ) : null}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>(
  (
    {
      onSend = () => {},
      isLoading = false,
      placeholder = 'Tulis pesan Anda di sini...',
      className,
    },
    ref,
  ) => {
    const [input, setInput] = React.useState('')
    const [files, setFiles] = React.useState<File[]>([])
    const [filePreview, setFilePreview] = React.useState<string | null>(null)
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const [mode, setMode] = React.useState<Mode>(null)
    const [isRecording, setIsRecording] = React.useState(false)
    const [recordingSeconds, setRecordingSeconds] = React.useState(0)
    const [typingLine, setTypingLine] = React.useState('')
    const uploadInputRef = React.useRef<HTMLInputElement>(null)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const timerRef = React.useRef<number | null>(null)

    const clearTimer = React.useCallback(() => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, [])

    React.useEffect(() => {
      return () => clearTimer()
    }, [clearTimer])

    React.useEffect(() => {
      if (!textareaRef.current) return
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`
    }, [input])

    React.useEffect(() => {
      let index = 0
      const intervalId = window.setInterval(() => {
        index += 1
        setTypingLine(ABBY_TYPING_LINE.slice(0, index))
        if (index >= ABBY_TYPING_LINE.length) {
          window.clearInterval(intervalId)
        }
      }, 24)

      return () => {
        window.clearInterval(intervalId)
      }
    }, [])

    const processFile = React.useCallback((file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 10 * 1024 * 1024) return

      setFiles([file])

      const reader = new FileReader()
      reader.onload = (event) => setFilePreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }, [])

    const handleSubmit = React.useCallback(() => {
      if (!input.trim() && files.length === 0) return
      onSend(buildMessage(input.trim(), mode), files)
      setInput('')
      setFiles([])
      setFilePreview(null)
    }, [files, input, mode, onSend])

    const stopRecording = React.useCallback(() => {
      clearTimer()
      setIsRecording(false)
      if (recordingSeconds > 0) onSend(`[Voice message - ${recordingSeconds} seconds]`, [])
      setRecordingSeconds(0)
    }, [clearTimer, onSend, recordingSeconds])

    const startRecording = React.useCallback(() => {
      clearTimer()
      setRecordingSeconds(0)
      setIsRecording(true)
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((current) => current + 1)
      }, 1000)
    }, [clearTimer])

    const handleMode = (nextMode: Exclude<Mode, null>) => {
      setMode((current) => (current === nextMode ? null : nextMode))
    }

    const handlePaste = React.useCallback(
      (event: ClipboardEvent) => {
        const items = event.clipboardData?.items
        if (!items) return

        for (const item of Array.from(items)) {
          if (!item.type.startsWith('image/')) continue
          const file = item.getAsFile()
          if (!file) continue
          event.preventDefault()
          processFile(file)
          break
        }
      },
      [processFile],
    )

    React.useEffect(() => {
      document.addEventListener('paste', handlePaste)
      return () => document.removeEventListener('paste', handlePaste)
    }, [handlePaste])

    const hasContent = input.trim().length > 0 || files.length > 0
    const currentPlaceholder =
      mode === 'search'
        ? 'Cari referensi atau arah web...'
        : mode === 'think'
          ? 'Tulis pertanyaan untuk mode think...'
          : mode === 'canvas'
            ? 'Jelaskan apa yang ingin dibangun di canvas...'
            : placeholder

    return (
      <>
        <TooltipPrimitive.Provider delayDuration={120}>
          <div
            className={cn('fi-prompt-shell', isRecording && 'is-recording', className)}
            onDragOver={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            onDrop={(event) => {
              event.preventDefault()
              event.stopPropagation()
              const file = Array.from(event.dataTransfer.files).find((item) =>
                item.type.startsWith('image/'),
              )
              if (file) processFile(file)
            }}
            ref={ref}
          >
            <div className="fi-prompt-head">
              <div>
                <div className="fi-prompt-kicker">Meet Abby</div>
                <p
                  aria-label={ABBY_TYPING_LINE}
                  className="fi-prompt-caption fi-prompt-caption-typing"
                >
                  <span>{typingLine}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'fi-prompt-typing-cursor',
                      typingLine === ABBY_TYPING_LINE && 'is-resting',
                    )}
                  />
                </p>
              </div>
            </div>

            {files.length > 0 && filePreview ? (
              <div className="fi-prompt-preview-list">
                <button
                  className="fi-prompt-preview-card"
                  onClick={() => setSelectedImage(filePreview)}
                  type="button"
                >
                  <Image
                    alt={files[0]?.name || 'Uploaded image'}
                    className="fi-prompt-preview-image"
                    src={filePreview}
                    unoptimized
                    width={72}
                    height={72}
                  />
                  <span className="fi-prompt-preview-name">{files[0]?.name}</span>
                </button>
                <button
                  aria-label="Hapus gambar"
                  className="fi-prompt-remove"
                  onClick={() => {
                    setFiles([])
                    setFilePreview(null)
                  }}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            ) : null}

            {!isRecording ? (
              <textarea
                aria-label="Prompt message"
                className="fi-prompt-textarea"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder={currentPlaceholder}
                ref={textareaRef}
                rows={1}
                value={input}
              />
            ) : (
              <VoiceRecorder seconds={recordingSeconds} />
            )}

            <div className="fi-prompt-actions">
              <div className="fi-prompt-actions-left">
                <TooltipPrimitive.Root>
                  <TooltipPrimitive.Trigger asChild>
                    <button
                      aria-label="Unggah gambar"
                      className="fi-prompt-action fi-prompt-upload"
                      disabled={isLoading || isRecording}
                      onClick={() => uploadInputRef.current?.click()}
                      type="button"
                    >
                      <Paperclip aria-hidden="true" />
                    </button>
                  </TooltipPrimitive.Trigger>
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content className="fi-prompt-tooltip" sideOffset={8}>
                      Unggah gambar
                    </TooltipPrimitive.Content>
                  </TooltipPrimitive.Portal>
                </TooltipPrimitive.Root>

                <input
                  accept="image/*"
                  className="fi-prompt-sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) processFile(file)
                    event.currentTarget.value = ''
                  }}
                  ref={uploadInputRef}
                  type="file"
                />

                <div className="fi-prompt-toggle-group">
                  <button
                    aria-label="Toggle search mode"
                    className={cn('fi-prompt-toggle', mode === 'search' && 'is-search')}
                    onClick={() => handleMode('search')}
                    type="button"
                  >
                    <Globe aria-hidden="true" />
                    <AnimatePresence initial={false}>
                      {mode === 'search' ? (
                        <motion.span
                          animate={{ opacity: 1, width: 'auto' }}
                          className="fi-prompt-toggle-label"
                          exit={{ opacity: 0, width: 0 }}
                          initial={{ opacity: 0, width: 0 }}
                        >
                          Search
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </button>

                  <button
                    aria-label="Toggle think mode"
                    className={cn('fi-prompt-toggle', mode === 'think' && 'is-think')}
                    onClick={() => handleMode('think')}
                    type="button"
                  >
                    <BrainCog aria-hidden="true" />
                    <AnimatePresence initial={false}>
                      {mode === 'think' ? (
                        <motion.span
                          animate={{ opacity: 1, width: 'auto' }}
                          className="fi-prompt-toggle-label"
                          exit={{ opacity: 0, width: 0 }}
                          initial={{ opacity: 0, width: 0 }}
                        >
                          Think
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </button>

                  <button
                    aria-label="Toggle canvas mode"
                    className={cn('fi-prompt-toggle', mode === 'canvas' && 'is-canvas')}
                    onClick={() => handleMode('canvas')}
                    type="button"
                  >
                    <FolderCode aria-hidden="true" />
                    <AnimatePresence initial={false}>
                      {mode === 'canvas' ? (
                        <motion.span
                          animate={{ opacity: 1, width: 'auto' }}
                          className="fi-prompt-toggle-label"
                          exit={{ opacity: 0, width: 0 }}
                          initial={{ opacity: 0, width: 0 }}
                        >
                          Canvas
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                  <button
                    aria-label={
                      isLoading
                        ? 'Hentikan proses'
                        : isRecording
                          ? 'Hentikan rekaman'
                          : hasContent
                            ? 'Kirim pesan'
                            : 'Mulai voice message'
                    }
                    className={cn(
                      'fi-prompt-send',
                      hasContent && 'is-ready',
                      isRecording && 'is-recording',
                    )}
                    disabled={isLoading && !hasContent}
                    onClick={() => {
                      if (isLoading) return
                      if (isRecording) {
                        stopRecording()
                        return
                      }
                      if (hasContent) {
                        handleSubmit()
                        return
                      }
                      startRecording()
                    }}
                    type="button"
                  >
                    {isLoading ? (
                      <Square aria-hidden="true" />
                    ) : isRecording ? (
                      <StopCircle aria-hidden="true" />
                    ) : hasContent ? (
                      <ArrowUp aria-hidden="true" />
                    ) : (
                      <Mic aria-hidden="true" />
                    )}
                  </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content className="fi-prompt-tooltip" sideOffset={8}>
                    {isLoading
                      ? 'Hentikan proses'
                      : isRecording
                        ? 'Hentikan rekaman'
                        : hasContent
                          ? 'Kirim pesan'
                          : 'Mulai voice message'}
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            </div>
          </div>
        </TooltipPrimitive.Provider>

        <ImagePreviewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      </>
    )
  },
)

PromptInputBox.displayName = 'PromptInputBox'
