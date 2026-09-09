// "Open in Maps" for an item's location (architecture section 7, Today mode:
// "addresses as open-in-Maps links using the platform's URL scheme").
// Prefers the item's own mapsUrl, then coordinates, then a name + address
// search; Apple Maps on iOS / macOS user agents, Google Maps elsewhere.

import type { ServerLocation } from '../../data/api/plansApi'

function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod|Macintosh/.test(ua) && !/Android/.test(ua)
}

/** true when the location carries anything a map could find */
export function hasMapTarget(location?: ServerLocation | null): boolean {
  if (!location) return false
  return !!(location.mapsUrl || (location.lat != null && location.lng != null) || (location.name ?? '').trim() || (location.address ?? '').trim())
}

/** The URL to open for `location`, or null when there is nothing to open. */
export function mapsUrlFor(location?: ServerLocation | null): string | null {
  if (!location) return null
  // mapsUrl is typed by a person; only ever open a web URL from it.
  if (location.mapsUrl && /^https?:\/\//i.test(location.mapsUrl.trim())) return location.mapsUrl.trim()
  const apple = isApplePlatform()
  if (location.lat != null && location.lng != null) {
    const q = `${location.lat},${location.lng}`
    return apple ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`
  }
  const text = [location.name, location.address].map((s) => (s ?? '').trim()).filter(Boolean).join(' ')
  if (!text) return null
  const q = encodeURIComponent(text)
  return apple ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`
}

/** Opens the platform's map app in a new tab; a no-op without a target. */
export function openInMaps(location?: ServerLocation | null): boolean {
  const url = mapsUrlFor(location)
  if (!url) return false
  window.open(url, '_blank', 'noopener')
  return true
}
