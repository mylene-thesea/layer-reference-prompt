import type { Mentionable, ThumbnailSource } from '../data/scene'
import './Thumbnail.css'
import './MentionTag.css'

/** DOM twin of <Thumbnail backdrop />, for nodes living inside the contentEditable. */
function createThumbnailElement({ color, images = [], crop }: ThumbnailSource, size: number, radius: number) {
  const thumb = document.createElement('span')
  thumb.className = 'thumbnail'
  thumb.setAttribute('aria-hidden', 'true')
  Object.assign(thumb.style, { width: `${size}px`, height: `${size}px`, borderRadius: `${radius}px` })

  if (color) {
    thumb.style.background = color
  } else {
    const backdrop = document.createElement('span')
    backdrop.className = 'thumbnail__backdrop'
    thumb.append(backdrop)
  }

  images.forEach((src, i) => {
    const img = document.createElement('img')
    img.src = src
    img.alt = ''
    img.draggable = false
    img.className = 'thumbnail__img'
    if (crop && i === images.length - 1) {
      img.classList.add('thumbnail__img--cropped')
      Object.assign(img.style, crop)
    }
    thumb.append(img)
  })
  return thumb
}

/**
 * Inline reference inside the prompt text (Figma: "Inline ref"). The prompt is an
 * uncontrolled contentEditable, so tags are plain DOM nodes rather than React elements.
 */
export function createMentionElement(item: Mentionable): HTMLElement {
  const tag = document.createElement('span')
  tag.className = 'mention'
  tag.contentEditable = 'false'
  tag.dataset.mentionId = item.id
  tag.dataset.mentionKind = item.kind
  tag.dataset.mentionName = item.name

  const label = document.createElement('span')
  label.className = 'mention__label'
  label.textContent = item.name

  tag.append(createThumbnailElement(item.thumbnail, 16, 4), label)
  return tag
}
