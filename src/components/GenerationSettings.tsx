import { useState } from 'react'
import type { Mentionable } from '../data/scene'
import { PromptEditor, type PromptSegment } from './PromptEditor'
import { Thumbnail } from './Thumbnail'
import crossIcon from '../assets/icons/cross-16.svg'
import dropdownIcon from '../assets/icons/dropdown-16.svg'
import dropBottomIcon from '../assets/icons/drop-bottom.svg'
import fastIcon from '../assets/icons/fast-24.svg'
import minusIcon from '../assets/icons/minus-14.svg'
import plus14Icon from '../assets/icons/plus-14.svg'
import plus16Icon from '../assets/icons/plus-16.svg'
import questionIcon from '../assets/icons/question-16.svg'
import ratioIcon from '../assets/icons/ratio-1-1.svg'
import './GenerationSettings.css'

type GenerationSettingsProps = {
  layers: Mentionable[]
  references: Mentionable[]
  onHighlightLayers?: (layerIds: string[]) => void
}

const RESOLUTIONS = { '1K': 1024, '2K': 2048 } as const
type Resolution = keyof typeof RESOLUTIONS

const MIN_COUNT = 1
const MAX_COUNT = 8

/** Serialised form sent to generation, e.g. "@[Light](reference:light) for the scene". */
function toPromptString(segments: PromptSegment[]) {
  return segments
    .map((s) => (s.type === 'text' ? s.text : `@[${s.name}](${s.kind}:${s.id})`))
    .join('')
}

export function GenerationSettings({ layers, references, onHighlightLayers }: GenerationSettingsProps) {
  const [segments, setSegments] = useState<PromptSegment[]>([])
  const [resolution, setResolution] = useState<Resolution>('2K')
  const [count, setCount] = useState(4)
  const size = RESOLUTIONS[resolution]

  const handleGenerate = () => {
    console.info('Generate', {
      prompt: toPromptString(segments),
      segments,
      resolution: `${size}x${size}`,
      count,
    })
  }

  return (
    <aside className="gen-settings" aria-label="Generation settings">
      <div className="gen-settings__scroll">
        <header className="gen-settings__header">
          <h2 className="gen-settings__title text-caption-upper">Generation settings</h2>
          <button className="icon-button" aria-label="Close generation settings">
            <img src={crossIcon} width={16} height={16} alt="" />
          </button>
        </header>

        <div className="gen-settings__body">
          <section className="gen-settings__group gen-settings__group--prompt">
            <label className="text-normal">Text prompt</label>
            <div className="prompt-box">
              <div className="prompt-box__editor">
                <PromptEditor
                  layers={layers}
                  references={references}
                  placeholder="Describe what you imagine, use @ to refer to layers or references."
                  onChange={setSegments}
                  onHighlightLayers={onHighlightLayers}
                />
              </div>
              <button className="secondary-button prompt-box__library">
                <span className="text-normal">Library</span>
                <img src={dropdownIcon} width={16} height={16} alt="" />
              </button>
            </div>
          </section>

          <section className="gen-settings__group">
            <div className="gen-settings__row">
              <div className="gen-settings__label">
                <span className="text-normal">Reference image</span>
                <button className="icon-button" aria-label="About reference images">
                  <img src={questionIcon} width={16} height={16} alt="" />
                </button>
              </div>
              <button className="icon-button icon-button--muted" aria-label="Add reference image">
                <img src={plus16Icon} width={16} height={16} alt="" />
              </button>
            </div>
            <div className="reference-list">
              {references.map((ref, i) => (
                <div key={ref.id} className="reference-chip">
                  <Thumbnail source={ref.thumbnail} size={32} radius={4} />
                  <span className="reference-chip__name text-normal">{ref.name}</span>
                  <span className="badge-count text-caption">{i + 1}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="gen-settings__group">
            <div className="gen-settings__row">
              <span className="text-normal">Aspect ratio</span>
              <div className="size-selector" role="radiogroup" aria-label="Resolution">
                {(Object.keys(RESOLUTIONS) as Resolution[]).map((key) => (
                  <button
                    key={key}
                    role="radio"
                    aria-checked={resolution === key}
                    className={
                      resolution === key
                        ? 'size-selector__item is-selected text-caption'
                        : 'size-selector__item text-caption'
                    }
                    onClick={() => setResolution(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <button className="select">
              <img src={ratioIcon} width={24} height={24} alt="" />
              <span className="select__value text-normal">Square (1:1)</span>
              <span className="select__meta text-caption">
                {size}x{size}
              </span>
              <img src={dropBottomIcon} width={16} height={16} alt="" />
            </button>
          </section>

          <div className="stepper">
            <button
              className="stepper__button"
              aria-label="Fewer images"
              disabled={count <= MIN_COUNT}
              onClick={() => setCount((c) => Math.max(MIN_COUNT, c - 1))}
            >
              <img src={minusIcon} width={14} height={14} alt="" />
            </button>
            <span className="stepper__value" aria-live="polite">
              {count}
            </span>
            <button
              className="stepper__button"
              aria-label="More images"
              disabled={count >= MAX_COUNT}
              onClick={() => setCount((c) => Math.min(MAX_COUNT, c + 1))}
            >
              <img src={plus14Icon} width={14} height={14} alt="" />
            </button>
          </div>
        </div>
      </div>

      <footer className="gen-settings__footer">
        <div className="generate-button">
          <button className="generate-button__main" onClick={handleGenerate}>
            <img src={fastIcon} width={24} height={24} alt="" />
            <span>Generate</span>
          </button>
          <button className="generate-button__more" aria-label="More generate options">
            <span className="generate-button__divider" />
            <img src={dropdownIcon} width={16} height={16} alt="" />
          </button>
        </div>
      </footer>
    </aside>
  )
}
