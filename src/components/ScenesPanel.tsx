import type { Mentionable, Scene } from '../data/scene'
import { Thumbnail } from './Thumbnail'
import plusIcon from '../assets/icons/sidebar-plus.svg'
import menuFoldIcon from '../assets/icons/menu-fold.svg'
import downIcon from '../assets/icons/down-outlined.svg'
import moreIcon from '../assets/icons/more.svg'
import './ScenesPanel.css'

type ScenesPanelProps = {
  scenes: Scene[]
  activeSceneId: string
  layers: Mentionable[]
}

export function ScenesPanel({ scenes, activeSceneId, layers }: ScenesPanelProps) {
  return (
    <section className="scenes" aria-label="Scenes">
      <div className="scenes__intro">
        <h2 className="scenes__title text-caption">SCENES</h2>
        <div className="scenes__actions">
          <button className="round-button" aria-label="Add scene">
            <img src={plusIcon} width={14} height={14} alt="" />
          </button>
          <button className="round-button" aria-label="Collapse scenes">
            <img src={menuFoldIcon} width={14} height={14} alt="" />
          </button>
        </div>
      </div>

      <ul className="scenes__list">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId
          return (
            <li key={scene.id} className={isActive ? 'scene is-active' : 'scene'}>
              <div className="scene__line">
                <Thumbnail source={scene.thumbnail} size={40} radius={8} />
                <div className="scene__text">
                  <span className="text-normal">{scene.name}</span>
                  {isActive && <span className="scene__meta text-caption">1 assets</span>}
                </div>
                <div className="scene__actions">
                  {isActive ? (
                    <button className="round-button" aria-label="Collapse scene">
                      <img src={downIcon} width={14} height={14} alt="" />
                    </button>
                  ) : (
                    <span className="round-button" />
                  )}
                  <button className="round-button" aria-label="Scene options">
                    <img src={moreIcon} width={14} height={14} alt="" />
                  </button>
                </div>
              </div>

              {isActive && (
                <ul className="scene__layers" aria-label={`${scene.name} layers`}>
                  {layers.map((layer) => (
                    <li key={layer.id} className="scene__layer">
                      <Thumbnail source={layer.thumbnail} size={24} radius={8} backdrop />
                      <span className="text-caption">{layer.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
