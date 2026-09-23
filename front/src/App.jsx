import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/chat'

const SUGGESTIONS = [
  'Constancia de alumno regular',
  '¿Qué necesito para hacer las prácticas?',
  '¿Cómo rindo una previa?',
  'Normas de seguridad del taller',
]

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const message = text.trim()
    if (!message || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error('Error en la respuesta del servidor')
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'bot', text: data.response }])
    } catch (error) {
      console.error('Error de red:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'No se pudo conectar con el servidor del chatbot. Intentá de nuevo en unos minutos.',
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <p className="text-sm font-semibold">Chatbot</p>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <RotateCcw />
            Nuevo chat
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 sm:px-6">
          {isEmpty ? (
            <EmptyState onSelect={sendMessage} />
          ) : (
            <div className="flex flex-col gap-6 py-8">
              {messages.map((m, i) => (
                <Message key={i} {...m} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 px-4 pb-4 sm:px-6">
        <form
          className="relative mx-auto w-full max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
        >
          <Textarea
            autoFocus
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu consulta…"
            className="max-h-40 min-h-12 resize-none rounded-2xl bg-background py-3 pr-14 pl-4 shadow-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 size-8 rounded-full"
            aria-label="Enviar"
          >
            <ArrowUp />
          </Button>
        </form>
      </footer>
    </div>
  )
}

function EmptyState({ onSelect }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">¿En qué te puedo ayudar?</h1>
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((label) => (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className="rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Message({ role, text, error }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground">
          {text}
        </div>
      </div>
    )
  }
  return (
    <p
      className={cn('text-sm leading-relaxed whitespace-pre-wrap', error && 'text-destructive')}
    >
      {text}
    </p>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 py-2">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export default App
