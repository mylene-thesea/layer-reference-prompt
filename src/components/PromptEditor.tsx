import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { MentionKind, Mentionable } from '../data/scene'
import { createMentionElement } from './mentionElement'
import { MentionDropdown, type MentionAnchor } from './MentionDropdown'
import './PromptEditor.css'

export type PromptSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; id: string; kind: MentionKind; name: string }

type PromptEditorProps = {
  layers: Mentionable[]
  references: Mentionable[]
  placeholder?: string
  onChange?: (segments: PromptSegment[]) => void
  /** Layers being pointed at: hovered or selected tags, or the highlighted dropdown row. */
  onHighlightLayers?: (layerIds: string[]) => void
}

type MentionQuery = {
  query: string
  /** Text node + offset of the "@" that opened the dropdown. */
  node: Text
  start: number
  end: number
  /** Viewport rect of the "@"; the dropdown positions itself against it. */
  anchor: MentionAnchor
}

const NBSP = ' '
const MAX_QUERY_LENGTH = 40

function isMention(node: Node | null | undefined): node is HTMLElement {
  return node instanceof HTMLElement && node.classList.contains('mention')
}

/** Matches the start of the name or the start of any word ("@f" → "Wild flowers"). */
function matches(name: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const n = name.toLowerCase()
  return n.startsWith(q) || n.split(/\s+/).some((word) => word.startsWith(q))
}

function filterOptions(layers: Mentionable[], references: Mentionable[], query: string | null) {
  if (query === null) return { layers: [], references: [], all: [] }
  // "@1", "@2"… is a shortcut to the reference image with that badge number.
  const number = query.trim()
  if (/^\d+$/.test(number)) {
    const r = references.filter((_, i) => String(i + 1).startsWith(number))
    return { layers: [], references: r, all: r }
  }
  const l = layers.filter((item) => matches(item.name, query))
  const r = references.filter((item) => matches(item.name, query))
  return { layers: l, references: r, all: [...l, ...r] }
}

/** Looks backwards from the caret for an "@" that starts a word. */
function readMentionQuery(editor: HTMLElement): MentionQuery | null {
  const selection = window.getSelection()
  if (!selection || !selection.isCollapsed || selection.rangeCount === 0) return null

  const { focusNode, focusOffset } = selection
  if (!(focusNode instanceof Text) || !editor.contains(focusNode)) return null

  const before = focusNode.data.slice(0, focusOffset)
  const at = before.lastIndexOf('@')
  if (at === -1) return null
  if (at > 0 && !/\s/.test(before[at - 1])) return null // e.g. an email address

  const query = before.slice(at + 1)
  if (query.length > MAX_QUERY_LENGTH || /^\s/.test(query) || query.includes('\n')) return null

  const atRange = document.createRange()
  atRange.setStart(focusNode, at)
  atRange.setEnd(focusNode, at + 1)
  const rect = atRange.getBoundingClientRect()

  return {
    query,
    node: focusNode,
    start: at,
    end: focusOffset,
    anchor: { top: rect.top, bottom: rect.bottom, left: rect.left },
  }
}

function serialize(editor: HTMLElement): PromptSegment[] {
  const segments: PromptSegment[] = []
  const pushText = (text: string) => {
    if (!text) return
    const last = segments[segments.length - 1]
    if (last?.type === 'text') last.text += text
    else segments.push({ type: 'text', text })
  }

  const walk = (node: Node) => {
    if (node instanceof Text) {
      pushText(node.data.replaceAll(NBSP, ' '))
    } else if (isMention(node)) {
      const { mentionId, mentionKind, mentionName } = node.dataset
      segments.push({
        type: 'mention',
        id: mentionId!,
        kind: mentionKind as MentionKind,
        name: mentionName!,
      })
    } else if (node.nodeName === 'BR') {
      pushText('\n')
    } else {
      node.childNodes.forEach(walk)
    }
  }
  editor.childNodes.forEach(walk)

  // contentEditable keeps a trailing <br> as a caret placeholder.
  const last = segments[segments.length - 1]
  if (last?.type === 'text') last.text = last.text.replace(/\n$/, '')
  return segments.filter((s) => s.type !== 'text' || s.text.length > 0)
}

/** Node immediately before (or after) a collapsed caret, crossing text boundaries. */
function adjacentNode(editor: HTMLElement, direction: 'before' | 'after'): Node | null {
  const selection = window.getSelection()
  if (!selection || !selection.isCollapsed || !selection.focusNode) return null
  const { focusNode, focusOffset } = selection

  if (focusNode instanceof Text) {
    const atEdge = direction === 'before' ? focusOffset === 0 : focusOffset === focusNode.length
    if (!atEdge) return null
    return direction === 'before' ? focusNode.previousSibling : focusNode.nextSibling
  }
  if (focusNode === editor || editor.contains(focusNode)) {
    return direction === 'before'
      ? focusNode.childNodes[focusOffset - 1] ?? null
      : focusNode.childNodes[focusOffset] ?? null
  }
  return null
}

/** The tag when the selection wraps exactly one tag, i.e. the pill is "selected". */
function selectedMention(editor: HTMLElement): HTMLElement | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  if (range.startContainer !== range.endContainer || range.endOffset - range.startOffset !== 1) {
    return null
  }
  const node = range.startContainer.childNodes[range.startOffset]
  return isMention(node) && editor.contains(node) ? node : null
}

function setSelection(update: (range: Range) => void) {
  const range = document.createRange()
  update(range)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const selectTag = (tag: HTMLElement) => setSelection((r) => r.selectNode(tag))

const placeCaretBeside = (tag: HTMLElement, side: 'before' | 'after') =>
  setSelection((r) => {
    if (side === 'before') r.setStartBefore(tag)
    else r.setStartAfter(tag)
    r.collapse(true)
  })

/**
 * Mirrors the DOM selection onto the tags so selected pills can be styled: a single
 * pill picked with the arrows/click, or every pill inside a wider text selection.
 */
function syncSelectedTag(editor: HTMLElement): HTMLElement[] {
  const selection = window.getSelection()
  const range =
    document.activeElement === editor && selection && selection.rangeCount > 0 && !selection.isCollapsed
      ? selection.getRangeAt(0)
      : null
  const selected: HTMLElement[] = []
  editor.querySelectorAll<HTMLElement>('.mention').forEach((tag) => {
    const isSelected = range?.intersectsNode(tag) ?? false
    tag.classList.toggle('is-selected', isSelected)
    if (isSelected) selected.push(tag)
  })
  return selected
}

/** Layer ids of the given tags, skipping reference images. */
const layerIdsOf = (tags: (HTMLElement | null)[]) =>
  tags.flatMap((tag) =>
    tag?.isConnected && tag.dataset.mentionKind === 'layer' ? [tag.dataset.mentionId!] : [],
  )

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((id, i) => id === b[i])

export function PromptEditor({
  layers,
  references,
  placeholder,
  onChange,
  onHighlightLayers,
}: PromptEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [mention, setMention] = useState<MentionQuery | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [hoveredTag, setHoveredTag] = useState<HTMLElement | null>(null)
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([])
  /** The "@" the user dismissed with Escape, so it doesn't immediately reopen. */
  const dismissedRef = useRef<{ node: Text; start: number } | null>(null)

  const hasNothingToMention = layers.length === 0 && references.length === 0
  const filtered = useMemo(
    () => filterOptions(layers, references, mention?.query ?? null),
    [layers, references, mention?.query],
  )
  // Fall back to the first option whenever filtering removes the highlighted one.
  const resolveActive = (options: Mentionable[]) =>
    options.find((o) => o.id === highlightedId) ?? options[0] ?? null
  const activeId = resolveActive(filtered.all)?.id ?? null
  // With a query and no matches, close the list so "@" can be typed as plain text.
  const isOpen = mention !== null && (filtered.all.length > 0 || hasNothingToMention)

  const updateSelectedTags = useCallback((editor: HTMLElement) => {
    const ids = layerIdsOf(syncSelectedTag(editor))
    setSelectedLayerIds((prev) => (sameIds(prev, ids) ? prev : ids))
  }, [])

  // Tell the canvas which layers to outline.
  const activeOption = isOpen ? filtered.all.find((o) => o.id === activeId) : undefined
  const pointedLayerIds = [
    ...new Set([
      ...(activeOption?.kind === 'layer' ? [activeOption.id] : []),
      ...layerIdsOf([hoveredTag]),
      ...selectedLayerIds,
    ]),
  ]
  const pointedKey = pointedLayerIds.join('|')
  useEffect(() => {
    onHighlightLayers?.(pointedKey ? pointedKey.split('|') : [])
  }, [pointedKey, onHighlightLayers])

  /** Current "@query" at the caret, ignoring one the user dismissed with Escape. */
  const readActiveMention = useCallback((): MentionQuery | null => {
    const editor = editorRef.current
    if (!editor || document.activeElement !== editor) return null
    const next = readMentionQuery(editor)
    const dismissed = dismissedRef.current
    if (next && dismissed && dismissed.node === next.node && dismissed.start === next.start) {
      return null
    }
    dismissedRef.current = null
    return next
  }, [])

  const syncMention = useCallback(() => {
    const next = readActiveMention()
    setMention((prev) =>
      next &&
      prev &&
      prev.node === next.node &&
      prev.start === next.start &&
      prev.query === next.query &&
      prev.anchor.top === next.anchor.top &&
      prev.anchor.left === next.anchor.left
        ? prev
        : next,
    )
  }, [readActiveMention])

  // Typing, clicking and arrow keys all move the caret; follow it.
  useEffect(() => {
    const onSelectionChange = () => {
      syncMention()
      if (editorRef.current) updateSelectedTags(editorRef.current)
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [syncMention, updateSelectedTags])

  // Re-anchor the dropdown when the page or the editor scrolls.
  useEffect(() => {
    if (!mention) return
    const editor = editorRef.current
    window.addEventListener('resize', syncMention)
    window.addEventListener('scroll', syncMention, true)
    editor?.addEventListener('scroll', syncMention)
    return () => {
      window.removeEventListener('resize', syncMention)
      window.removeEventListener('scroll', syncMention, true)
      editor?.removeEventListener('scroll', syncMention)
    }
  }, [mention, syncMention])

  const emitChange = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const segments = serialize(editor)
    setIsEmpty(segments.length === 0)
    // A hovered tag can be deleted from the keyboard without a mouse event.
    setHoveredTag((tag) => (tag?.isConnected ? tag : null))
    onChange?.(segments)
  }, [onChange])

  const insertMention = useCallback(
    (item: Mentionable, target: MentionQuery) => {

      const range = document.createRange()
      range.setStart(target.node, target.start)
      range.setEnd(target.node, target.end)
      range.deleteContents()

      const tag = createMentionElement(item)
      range.insertNode(tag)

      // Always leave a space after the tag so the caret has somewhere to land.
      let caretNode: Text
      const next = tag.nextSibling
      if (next instanceof Text && /^\s/.test(next.data)) {
        caretNode = next
      } else {
        caretNode = document.createTextNode(NBSP)
        tag.after(caretNode)
      }

      const selection = window.getSelection()
      const caret = document.createRange()
      caret.setStart(caretNode, 1)
      caret.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(caret)

      // Drop empty text nodes left behind by deleteContents.
      if (target.node.length === 0) target.node.remove()

      setMention(null)
      emitChange()
    },
    [emitChange],
  )

  const removeMention = (tag: HTMLElement) => {
    placeCaretBeside(tag, 'before')
    tag.remove()
    emitChange()
  }

  // Clicking a tag selects it as a whole instead of dropping the caret inside it.
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).closest('.mention')
    if (!isMention(tag)) return
    e.preventDefault()
    editorRef.current?.focus()
    selectTag(tag)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current!

    // Read the query from the DOM: selectionchange is async, so state can lag
    // behind fast typing (e.g. "@fr" + Enter in quick succession).
    const live = readActiveMention()
    const options = filterOptions(layers, references, live?.query ?? null).all
    if (live && options.length > 0) {
      const active = resolveActive(options)!
      const index = options.indexOf(active)
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedId(options[(index + 1) % options.length].id)
          return
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedId(options[(index - 1 + options.length) % options.length].id)
          return
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          insertMention(active, live)
          return
      }
    }
    if (live && e.key === 'Escape') {
      e.preventDefault()
      dismissedRef.current = { node: live.node, start: live.start }
      setMention(null)
      return
    }

    const selected = selectedMention(editor)
    const hasModifier = e.shiftKey || e.altKey || e.metaKey || e.ctrlKey

    // Arrowing onto a tag first selects it; the next press moves past it.
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !hasModifier) {
      const isLeft = e.key === 'ArrowLeft'
      if (selected) {
        e.preventDefault()
        placeCaretBeside(selected, isLeft ? 'before' : 'after')
        return
      }
      const target = adjacentNode(editor, isLeft ? 'before' : 'after')
      if (isMention(target)) {
        e.preventDefault()
        selectTag(target)
        return
      }
    }

    // A tag behaves as a single character: one keystroke removes it entirely.
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const target = selected ?? adjacentNode(editor, e.key === 'Backspace' ? 'before' : 'after')
      if (isMention(target)) {
        e.preventDefault()
        removeMention(target)
        return
      }
    }

    if (e.key === 'Enter') {
      // Plain line breaks instead of the browser's nested <div>s.
      e.preventDefault()
      document.execCommand('insertLineBreak')
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
  }

  return (
    <>
      <div className="prompt-editor">
        {isEmpty && (
          <div className="prompt-editor__placeholder text-normal" aria-hidden>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className="prompt-editor__input text-normal"
          contentEditable
          suppressContentEditableWarning
          role="combobox"
          aria-label="Text prompt"
          aria-multiline
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && activeId ? `mention-option-${activeId}` : undefined}
          spellCheck={false}
          onInput={emitChange}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseOver={(e) => setHoveredTag((e.target as HTMLElement).closest<HTMLElement>('.mention'))}
          onMouseLeave={() => setHoveredTag(null)}
          onPaste={handlePaste}
          onBlur={(e) => {
            setMention(null)
            updateSelectedTags(e.currentTarget)
          }}
          onDrop={(e) => e.preventDefault()}
        />
      </div>

      {isOpen && mention && (
        <MentionDropdown
          layers={filtered.layers}
          references={filtered.references}
          isEmpty={hasNothingToMention}
          activeId={activeId}
          anchor={mention.anchor}
          onSelect={(item) => insertMention(item, mention)}
          onHover={setHighlightedId}
        />
      )}
    </>
  )
}
