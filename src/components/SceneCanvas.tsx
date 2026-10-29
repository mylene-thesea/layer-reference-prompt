import { canvasImages } from '../data/scene'
import brushStroke from '../assets/images/canvas-brush.svg'
import crossIcon from '../assets/icons/scene-cross-16.svg'
import './SceneCanvas.css'

/** Static composition of Scene 1. Layer positions are in the 720px artboard space. */
export function SceneCanvas({ name }: { name: string }) {
  return (
    <div className="scene-canvas">
      <div className="scene-canvas__top">
        <span className="scene-canvas__name text-normal">{name}</span>
        <button className="scene-canvas__close" aria-label="Close scene">
          <img src={crossIcon} width={16} height={16} alt="" />
        </button>
      </div>
      <div className="scene-canvas__artboard">
        <img className="scene-canvas__layer scene-canvas__layer--fill" src={canvasImages.background} alt="" />
        <img
          className="scene-canvas__layer"
          src={canvasImages.stump}
          style={{ left: 23, top: 446, width: 716, height: 273 }}
          alt=""
        />
        <img
          className="scene-canvas__layer"
          src={canvasImages.lime}
          style={{ left: 515, top: 347, width: 187, height: 172 }}
          alt=""
        />
        <img
          className="scene-canvas__layer"
          src={canvasImages.cream}
          style={{ left: 240, top: 195, width: 324, height: 363 }}
          alt=""
        />
        <div className="scene-canvas__brush">
          <div className="scene-canvas__brush-rotate">
            <div className="scene-canvas__brush-shape">
              <img src={brushStroke} alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
