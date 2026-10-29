import type { ThumbnailSource } from '../data/scene'
import './Thumbnail.css'

type ThumbnailProps = {
  source: ThumbnailSource
  size: number
  radius?: number
  /** Dark backdrop behind the image stack, used for layer thumbnails. */
  backdrop?: boolean
}

export function Thumbnail({ source, size, radius = 8, backdrop = false }: ThumbnailProps) {
  const { color, images = [], crop } = source

  return (
    <span
      className="thumbnail"
      style={{ width: size, height: size, borderRadius: radius, background: color }}
      aria-hidden
    >
      {backdrop && !color && <span className="thumbnail__backdrop" />}
      {images.map((src, i) => {
        const isCropped = crop && i === images.length - 1
        return (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            className={isCropped ? 'thumbnail__img thumbnail__img--cropped' : 'thumbnail__img'}
            style={isCropped ? crop : undefined}
          />
        )
      })}
    </span>
  )
}
