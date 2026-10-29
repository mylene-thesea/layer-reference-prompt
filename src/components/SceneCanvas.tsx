import { canvasImages } from '../data/scene'
import brushStroke from '../assets/images/canvas-brush.svg'
import crossIcon from '../assets/icons/scene-cross-16.svg'
import './SceneCanvas.css'

const ARTBOARD_SIZE = 720

type Box = { x: number; y: number; w: number; h: number }

type CanvasLayer = {
  /** Matches the layer id in `sceneLayers`. */
  id: string
  src: string
  /** Placement in the 720px artboard. Omitted for the brush, which has its own rotated wrapper. */
  box?: Box
  /** Rectangle around the visible pixels, when it differs from `box`. */
  bounds?: Box
}

/** Bottom to top, as stacked in Figma. */
const CANVAS_LAYERS: CanvasLayer[] = [
  { id: 'background', src: canvasImages.background, box: { x: 0, y: 0, w: 720, h: 720 } },
  { id: 'wooden-stump', src: canvasImages.stump, box: { x: 23, y: 446, w: 716, h: 273 } },
  { id: 'fresh-lime-slice', src: canvasImages.lime, box: { x: 515, y: 347, w: 187, h: 172 } },
  { id: 'day-cream', src: canvasImages.cream, box: { x: 240, y: 195, w: 324, h: 363 } },
  // Measured from the rotated stroke's pixels; its SVG has transparent padding.
  { id: 'brush-blue', src: brushStroke, bounds: { x: 54.5, y: 327.5, w: 238.8, h: 203.3 } },
]

/** Layer bounds clipped to the artboard, so the whole rectangle stays visible. */
function outlineBox(layer: CanvasLayer): Box {
  const { x, y, w, h } = layer.bounds ?? layer.box!
  const left = Math.max(0, x)
  const top = Math.max(0, y)
  return {
    x: left,
    y: top,
    w: Math.min(ARTBOARD_SIZE, x + w) - left,
    h: Math.min(ARTBOARD_SIZE, y + h) - top,
  }
}

function renderLayer(layer: CanvasLayer) {
  if (!layer.box) {
    return (
      <div key={layer.id} className="scene-canvas__brush">
        <div className="scene-canvas__brush-rotate">
          <div className="scene-canvas__brush-shape">
            <img className="scene-canvas__layer" src={layer.src} alt="" />
          </div>
        </div>
      </div>
    )
  }
  const { x, y, w, h } = layer.box
  return (
    <img
      key={layer.id}
      className="scene-canvas__layer"
      src={layer.src}
      style={{ left: x, top: y, width: w, height: h }}
      alt=""
    />
  )
}

type SceneCanvasProps = {
  name: string
  /** Layers to outline, e.g. because they're referenced in the prompt. */
  highlightedLayerIds?: string[]
}

/** Static composition of Scene 1. */
export function SceneCanvas({ name, highlightedLayerIds = [] }: SceneCanvasProps) {
  const highlighted = CANVAS_LAYERS.filter((layer) => highlightedLayerIds.includes(layer.id))

  return (
    <div className="scene-canvas">
      <div className="scene-canvas__top">
        <span className="scene-canvas__name text-normal">{name}</span>
        <button className="scene-canvas__close" aria-label="Close scene">
          <img src={crossIcon} width={16} height={16} alt="" />
        </button>
      </div>
      <div className="scene-canvas__artboard">
        {CANVAS_LAYERS.map(renderLayer)}

        {/* Drawn above all layers so a partly covered layer still shows its full rectangle. */}
        {highlighted.map((layer) => {
          const { x, y, w, h } = outlineBox(layer)
          return (
            <div
              key={layer.id}
              className="scene-canvas__outline"
              style={{ left: x, top: y, width: w, height: h }}
            />
          )
        })}
      </div>
    </div>
  )
}
