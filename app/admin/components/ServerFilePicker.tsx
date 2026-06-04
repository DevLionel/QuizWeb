'use client'
import { useState } from 'react'
import { listServerImages } from '../actions'

type Props = {
  onSelect: (url: string) => void
  onClose: () => void
}

export default function ServerFilePicker({ onSelect, onClose }: Props) {
  const [path, setPath] = useState('Quiz/WK_Quiz/Round_01/Pictures')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    setFiles([])
    setSelected(null)
    try {
      const result = await listServerImages(path.trim())
      setFiles(result)
      if (result.length === 0) setError('Geen afbeeldingen gevonden in deze map.')
    } catch (err) {
      setError('Kan map niet laden: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function confirm() {
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Foto kiezen van server</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        {/* Path row */}
        <div className="px-5 py-3 border-b dark:border-gray-700 flex gap-2">
          <input
            value={path}
            onChange={e => setPath(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="flex-1 border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 font-mono"
            placeholder="Quiz/WK_Quiz/Round_01/Pictures"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading || !path.trim()}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Laden…' : 'Laden'}
          </button>
        </div>

        {/* Thumbnail grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          )}
          {!error && files.length === 0 && !loading && (
            <p className="text-gray-400 text-sm text-center py-12">
              Vul het pad in en klik op &apos;Laden&apos; om foto&apos;s te tonen.
            </p>
          )}
          {files.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {files.map(f => (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => setSelected(f.url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                    selected === f.url
                      ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full aspect-square object-cover bg-gray-100 dark:bg-gray-800"
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1.5 py-1 truncate text-left">
                    {f.name}
                  </span>
                  {selected === f.url && (
                    <span className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!selected}
            className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            Gebruik deze foto
          </button>
        </div>
      </div>
    </div>
  )
}
