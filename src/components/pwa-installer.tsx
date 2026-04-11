'use client'

import { useEffect } from 'react'

export function PwaInstaller() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Register service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Handle install promotion on compatible browsers
    let deferredPrompt: any

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      
      // You can show an install button here if desired
      // For now, this just allows the browser's built-in prompt
    })

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      deferredPrompt = null
    })
  }, [])

  return null
}
