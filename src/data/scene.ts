import type { CSSProperties } from 'react'

import layerBase from '../assets/images/layer-base.png'
import scene1A from '../assets/images/scene1-a.png'
import scene1B from '../assets/images/scene1-b.png'
import scene1C from '../assets/images/scene1-c.png'
import scene2A from '../assets/images/scene2-a.png'
import scene2B from '../assets/images/scene2-b.png'
import scene3A from '../assets/images/scene3-a.png'
import scene3B from '../assets/images/scene3-b.png'
import canvasBackground from '../assets/images/canvas-background.png'
import canvasCream from '../assets/images/canvas-cream.png'
import canvasLime from '../assets/images/canvas-lime.png'
import canvasStump from '../assets/images/canvas-stump.png'
import refLight from '../assets/images/ref-light.png'
import refWildFlowers from '../assets/images/ref-wild-flowers.png'

/**
 * A thumbnail is either a flat colour (e.g. a brush stroke layer) or a stack of
 * images drawn on top of each other, matching how Figma composes them.
 * `crop` positions the top-most image when it is not a plain object-cover.
 */
export type ThumbnailSource = {
  color?: string
  images?: string[]
  crop?: CSSProperties
}

export type MentionKind = 'layer' | 'reference'

export type Mentionable = {
  id: string
  kind: MentionKind
  name: string
  thumbnail: ThumbnailSource
}

export type Scene = {
  id: string
  name: string
  thumbnail: ThumbnailSource
}

const COMPOSITE_BASE = [layerBase, scene1C]

export const sceneLayers: Mentionable[] = [
  { id: 'brush-blue', kind: 'layer', name: 'Brush blue', thumbnail: { color: '#3affe8' } },
  { id: 'day-cream', kind: 'layer', name: 'Day cream', thumbnail: { images: [...COMPOSITE_BASE, canvasCream] } },
  { id: 'fresh-lime-slice', kind: 'layer', name: 'Fresh lime slice', thumbnail: { images: [canvasLime] } },
  { id: 'wooden-stump', kind: 'layer', name: 'Wooden stump', thumbnail: { images: [canvasStump] } },
  { id: 'background', kind: 'layer', name: 'Background', thumbnail: { images: [...COMPOSITE_BASE, canvasBackground] } },
]

export const referenceImages: Mentionable[] = [
  { id: 'light', kind: 'reference', name: 'Light', thumbnail: { images: [refLight] } },
  {
    id: 'wild-flowers',
    kind: 'reference',
    name: 'Wild flowers',
    thumbnail: {
      images: [refWildFlowers],
      crop: { width: '181.25%', height: '271.93%', left: '-81.12%', top: '-80.68%' },
    },
  },
]

export const scenes: Scene[] = [
  { id: 'scene-1', name: 'Scene 1', thumbnail: { images: [scene1A, scene1B, scene1C] } },
  { id: 'scene-2', name: 'Scene 2', thumbnail: { images: [scene2A, scene2B] } },
  { id: 'scene-3', name: 'Scene 3', thumbnail: { images: [scene3A, scene3B] } },
]

export const canvasImages = {
  background: canvasBackground,
  stump: canvasStump,
  lime: canvasLime,
  cream: canvasCream,
}
