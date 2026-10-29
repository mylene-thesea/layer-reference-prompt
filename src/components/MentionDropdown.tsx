import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Mentionable } from '../data/scene'
import { Thumbnail } from './Thumbnail'
import dividerIcon from '../assets/icons/dropdown-divider.svg'
import './MentionDropdown.css'

export type MentionAnchor = { top: number; bottom: number; left: number }

/** Gap between the "@" line and the dropdown. */
const OFFSET = 4
/** Minimum distance kept from the viewport edges. */
const VIEWPORT_MARGIN = 8

type Placement = { top: number; left: number; maxHeight?: number }

/**
 * Opens below the "@", aligned to its left edge. Shifts left when it would overflow the
 * right edge, and flips above the line when there's no room below. If neither side
 * fits, it takes the roomier side and scrolls.
 */
function placeDropdown(anchor: MentionAnchor, width: number, height: number): Placement {
  const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN
  const left = Math.max(VIEWPORT_MARGIN, Math.min(anchor.left, maxLeft))

  const below = anchor.bottom + OFFSET
  const spaceBelow = window.innerHeight - VIEWPORT_MARGIN - below
  const spaceAbove = anchor.top - OFFSET - VIEWPORT_MARGIN

  if (height <= spaceBelow) return { top: below, left }
  if (height <= spaceAbove) return { top: anchor.top - OFFSET - height, left }
  return spaceBelow >= spaceAbove
    ? { top: below, left, maxHeight: spaceBelow }
    : { top: VIEWPORT_MARGIN, left, maxHeight: spaceAbove }
}

type MentionDropdownProps = {
  layers: Mentionable[]
  references: Mentionable[]
  /** True when the scene has no layers and no reference images at all. */
  isEmpty: boolean
  activeId: string | null
  anchor: MentionAnchor
  onSelect: (item: Mentionable) => void
  onHover: (id: string) => void
}

export function MentionDropdown({
  layers,
  references,
  isEmpty,
  activeId,
  anchor,
  onSelect,
  onHover,
}: MentionDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Placement | null>(null)

  // Measure before paint so the list never flashes in an off-screen spot. Re-runs when
  // filtering changes the height.
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    setPosition(placeDropdown(anchor, el.offsetWidth, el.scrollHeight + el.offsetHeight - el.clientHeight))
  }, [anchor, layers, references, isEmpty])

  useEffect(() => {
    if (!activeId) return
    listRef.current
      ?.querySelector(`[data-item-id="${activeId}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  const renderSection = (title: string, items: Mentionable[]) => (
    <>
      <div className="mention-dropdown__section text-caption-upper">{title}</div>
      <div className="mention-dropdown__items" role="group" aria-label={title}>
        {items.map((item) => (
          <div
            key={item.id}
            id={`mention-option-${item.id}`}
            data-item-id={item.id}
            role="option"
            aria-selected={item.id === activeId}
            className={
              item.id === activeId ? 'mention-dropdown__item is-active' : 'mention-dropdown__item'
            }
            // Keep focus (and the caret) in the editor while picking an item.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item)}
            onMouseMove={() => onHover(item.id)}
          >
            <Thumbnail source={item.thumbnail} size={24} radius={8} backdrop />
            <span className="mention-dropdown__label text-normal">{item.name}</span>
          </div>
        ))}
      </div>
    </>
  )

  return createPortal(
    <div
      ref={listRef}
      className={isEmpty ? 'mention-dropdown mention-dropdown--empty' : 'mention-dropdown'}
      style={position ?? { top: anchor.bottom + OFFSET, left: anchor.left, visibility: 'hidden' }}
      role="listbox"
      aria-label="Mention a layer or reference"
      onMouseDown={(e) => e.preventDefault()}
    >
      {isEmpty ? (
        <p className="mention-dropdown__empty text-caption">
          Nothing to mention, please add layers or reference
        </p>
      ) : (
        <>
          {layers.length > 0 && renderSection('Layers', layers)}
          {layers.length > 0 && references.length > 0 && (
            <img className="mention-dropdown__divider" src={dividerIcon} alt="" />
          )}
          {references.length > 0 && renderSection('Reference image', references)}
        </>
      )}
    </div>,
    document.body,
  )
}
