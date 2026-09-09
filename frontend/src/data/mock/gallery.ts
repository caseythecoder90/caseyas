// mock-data.md section 4: gallery months, tiles, albums, filters.

import { mockImage as img } from '../mockImage'
import type { Album, GalleryFilter, GalleryMonth, PhotoTile } from '../types'
import { MEM } from './memories'

export const GAL: GalleryMonth[] = [
  { label: 'September 2026', count: 9, key: 'sep' },
  { label: 'August 2026', count: 15, key: 'aug' },
  { label: 'July 2026', count: 12, key: 'jul' },
]

/** tile i of month key k. */
export function galleryTile(key: string, i: number): PhotoTile {
  return {
    id: key + i,
    src: img('g' + key + i, 300, 300),
    video: i % 7 === 3,
    dur: '0:' + (12 + i * 3),
    fav: i % 5 === 1,
    byHer: i % 2 === 0,
  }
}

export interface GalleryMonthTiles extends GalleryMonth {
  tiles: PhotoTile[]
}

export function galleryMonths(): GalleryMonthTiles[] {
  return GAL.map((m) => ({ ...m, tiles: Array.from({ length: m.count }, (_, i) => galleryTile(m.key, i)) }))
}

export const CUSTOM_ALBUMS: Album[] = [
  { name: 'Favorites', count: '48 items', src: img('fav', 400, 400) },
  { name: 'Fridge door', count: '23 photos', src: img('fridge', 400, 400) },
  { name: 'The dog, mostly', count: '311 photos · 9 videos', src: img('dog', 400, 400) },
]

export const AUTO_ALBUMS: Album[] = MEM.map((m) => ({ name: m.title, count: m.count, src: m.img, memId: m.id }))

export const GAL_FILTERS: GalleryFilter[] = ['All', 'Photos', 'Videos', 'Favorites', 'Casey', 'Yasmim']

export function filterTiles(tiles: PhotoTile[], filter: GalleryFilter, deleted: readonly string[] = []): PhotoTile[] {
  return tiles.filter((t) => {
    if (deleted.includes(t.id)) return false
    switch (filter) {
      case 'Photos':
        return !t.video
      case 'Videos':
        return t.video
      case 'Favorites':
        return t.fav
      case 'Casey':
        return !t.byHer
      case 'Yasmim':
        return t.byHer
      default:
        return true
    }
  })
}
