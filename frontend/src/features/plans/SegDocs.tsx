// mobile-b-plans.md 2.10 / desktop.md 7.2 - Documents: real thumbnails when the
// store has one, 3:4 placeholder pages otherwise, a page-count badge and the
// upload affordance.

import { useRef, useState } from 'react'
import type { PlanDoc } from '../../data/types'

export function SegDocs({
  docs,
  onUpload,
  variant = 'mobile',
}: {
  docs: PlanDoc[]
  onUpload?: (files: FileList) => Promise<unknown>
  variant?: 'mobile' | 'desktop'
}) {
  const desktop = variant === 'desktop'
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onUpload || busy) return
    setBusy(true)
    setUploadError('')
    try {
      await onUpload(files)
    } catch {
      setUploadError("That upload didn't make it. Try again.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ padding: desktop ? '24px 40px' : '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {onUpload && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            style={{
              height: 32,
              padding: '0 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--fg1)',
              fontSize: 12,
              cursor: busy ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          {uploadError && <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{uploadError}</span>}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,image/*"
            hidden
            onChange={(e) => void pick(e.target.files)}
          />
        </div>
      )}

      {docs.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--fg3)' }}>No documents yet.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: desktop ? 'repeat(6,1fr)' : '1fr 1fr',
            gap: desktop ? 16 : 12,
            alignContent: 'start',
          }}
        >
          {docs.map((dc) => (
            <div key={dc.id ?? dc.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  borderRadius: 6,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: dc.thumb ? 0 : 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  overflow: 'hidden',
                }}
              >
                {dc.thumb ? (
                  <img src={dc.thumb} alt={dc.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ height: 6, width: '70%', background: 'var(--surface-2)', borderRadius: 2 }} />
                    <span style={{ height: 4, width: '90%', background: 'var(--surface-2)', borderRadius: 2 }} />
                    <span style={{ height: 4, width: '80%', background: 'var(--surface-2)', borderRadius: 2 }} />
                    <span style={{ height: 4, width: '60%', background: 'var(--surface-2)', borderRadius: 2 }} />
                  </>
                )}
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--fg2)',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    padding: '2px 6px',
                    borderRadius: 3,
                  }}
                >
                  {dc.pages}
                </span>
              </div>
              <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dc.name}</div>
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: -6 }}>{dc.of}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
