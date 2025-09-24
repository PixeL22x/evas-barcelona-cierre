'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import ImageUpload from '../../components/ImageUpload'

function TicketsPageContent() {
  const router = useRouter()
  const { user, canUploadPhotos } = useAuth()
  const [selectedTurno, setSelectedTurno] = useState(null)
  const [cierreId, setCierreId] = useState(null)
  const [trabajador, setTrabajador] = useState('')
  const [images, setImages] = useState({
    mañana: [],
    tarde: []
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Obtener datos del localStorage o de la sesión
    const storedCierreId = localStorage.getItem('cierreId')
    const storedTrabajador = localStorage.getItem('workerName')
    
    if (storedCierreId) {
      setCierreId(storedCierreId)
    }
    if (storedTrabajador) {
      setTrabajador(storedTrabajador)
    }
  }, [])

  const handleTurnoSelect = (turno) => {
    setSelectedTurno(turno)
    loadExistingImages(turno)
  }

  const loadExistingImages = async (turno) => {
    if (!cierreId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/${cierreId}/${turno}`)
      if (response.ok) {
        const data = await response.json()
        setImages(prev => ({
          ...prev,
          [turno]: data.fotos || []
        }))
      }
    } catch (error) {
      console.error('Error al cargar imágenes existentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (imageData) => {
    setImages(prev => ({
      ...prev,
      [selectedTurno]: [...prev[selectedTurno], imageData]
    }))
  }

  const handleImageRemove = (index) => {
    setImages(prev => ({
      ...prev,
      [selectedTurno]: prev[selectedTurno].filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    if (!cierreId || !selectedTurno) return

    try {
      setSaving(true)
      
      // Eliminar imágenes existentes del turno
      await fetch(`/api/tickets/${cierreId}/${selectedTurno}`, {
        method: 'DELETE'
      })

      // Subir nuevas imágenes
      if (images[selectedTurno].length > 0) {
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cierreId,
            turno: selectedTurno,
            trabajador,
            fotos: images[selectedTurno]
          })
        })

        if (!response.ok) {
          throw new Error('Error al guardar las fotos')
        }
      }

      alert('Fotos guardadas correctamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Error al guardar las fotos. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (!selectedTurno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Fotos de Tickets
            </h1>
            <p className="text-white/70">
              Selecciona el turno para subir las fotos de los tickets
            </p>
          </div>

          {/* Selección de turno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleTurnoSelect('mañana')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🌅</div>
                <h3 className="text-xl font-bold text-white mb-2">Turno Mañana</h3>
                <p className="text-white/70">Subir fotos de tickets del turno matutino</p>
              </div>
            </button>

            <button
              onClick={() => handleTurnoSelect('tarde')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🌆</div>
                <h3 className="text-xl font-bold text-white mb-2">Turno Tarde</h3>
                <p className="text-white/70">Subir fotos de tickets del turno vespertino</p>
              </div>
            </button>
          </div>

          {/* Botón de regreso */}
          <div className="text-center mt-8">
            <button
              onClick={handleBack}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 border border-white/20"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <span className="text-3xl">{selectedTurno === 'mañana' ? '🌅' : '🌆'}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Fotos de Tickets - Turno {selectedTurno === 'mañana' ? 'Mañana' : 'Tarde'}
          </h1>
          <p className="text-white/70">
            Sube las fotos de los tickets del turno {selectedTurno}
          </p>
        </div>

        {/* Información del trabajador */}
        {trabajador && (
          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
            <p className="text-white/70 text-sm">
              Trabajador: <span className="text-white font-medium">{trabajador}</span>
            </p>
          </div>
        )}

        {/* Componente de subida */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-white">Cargando imágenes existentes...</span>
            </div>
          ) : (
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              images={images[selectedTurno]}
              maxImages={10}
              turno={selectedTurno}
            />
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setSelectedTurno(null)}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 border border-white/20"
          >
            ← Cambiar Turno
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || images[selectedTurno].length === 0}
            className={`font-medium py-3 px-6 rounded-lg transition-all duration-300 ${
              saving || images[selectedTurno].length === 0
                ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105'
            }`}
          >
            {saving ? 'Guardando...' : `Guardar ${images[selectedTurno].length} Fotos`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TicketsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <TicketsPageContent />
}
