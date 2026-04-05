// Claudesy Transformer Engine V2 — Extension Optimizer Panel
import React, { useState } from 'react'
import { optimizeViaApi, injectOptimizedPrompt } from '../lib/api-client'

const TASK_TYPES = [
  'GENERAL', 'CODING', 'EMAIL', 'ANALYSIS', 'CREATIVE',
  'RESEARCH', 'BUSINESS', 'EDUCATION', 'MARKETING',
] as const

export function OptimizerPanel() {
  const [rawIdea, setRawIdea] = useState('')
  const [taskType, setTaskType] = useState<string>('GENERAL')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleOptimize() {
    if (!rawIdea.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await optimizeViaApi({
        rawIdea: rawIdea.trim(),
        taskType,
      })
      setResult(response.superPrompt.fullPrompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleInject() {
    if (!result) return
    injectOptimizedPrompt(result)
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px',
          backgroundColor: '#eb5939', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff',
        }}>
          CTE
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#b7ab98' }}>
            Prompt Optimizer
          </div>
          <div style={{ fontSize: '10px', color: '#6b6560' }}>
            Claudesy Transformer Engine V2
          </div>
        </div>
      </div>

      {/* Task Type */}
      <div>
        <label style={{ fontSize: '11px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>
          Task Type
        </label>
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: '6px',
            backgroundColor: '#161616', border: '1px solid #2a2a2a',
            color: '#b7ab98', fontSize: '12px', outline: 'none',
          }}
        >
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Input */}
      <div>
        <label style={{ fontSize: '11px', color: '#6b6560', display: 'block', marginBottom: '4px' }}>
          Your Idea
        </label>
        <textarea
          value={rawIdea}
          onChange={(e) => setRawIdea(e.target.value)}
          placeholder="Describe what you want the AI to do..."
          rows={4}
          style={{
            width: '100%', padding: '8px', borderRadius: '6px',
            backgroundColor: '#161616', border: '1px solid #2a2a2a',
            color: '#b7ab98', fontSize: '12px', resize: 'vertical',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={loading || !rawIdea.trim()}
        style={{
          padding: '8px 16px', borderRadius: '6px', border: 'none',
          backgroundColor: loading ? '#6b6560' : '#eb5939',
          color: '#ffffff', fontSize: '13px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: !rawIdea.trim() ? 0.5 : 1,
        }}
      >
        {loading ? 'Optimizing...' : 'Optimize Prompt'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          padding: '8px', borderRadius: '6px',
          backgroundColor: '#2d1515', border: '1px solid #5c2020',
          color: '#f87171', fontSize: '11px',
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '6px',
          }}>
            <span style={{ fontSize: '11px', color: '#6b6560' }}>
              Optimized Prompt
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '3px 8px', borderRadius: '4px', border: '1px solid #2a2a2a',
                  backgroundColor: '#161616', color: '#b7ab98', fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleInject}
                style={{
                  padding: '3px 8px', borderRadius: '4px', border: 'none',
                  backgroundColor: '#eb5939', color: '#ffffff', fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Inject
              </button>
            </div>
          </div>
          <div style={{
            padding: '10px', borderRadius: '6px',
            backgroundColor: '#161616', border: '1px solid #2a2a2a',
            color: '#b7ab98', fontSize: '11px', lineHeight: '1.6',
            maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}
