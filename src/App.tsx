import { useState } from 'react'
import { GenerationSettings } from './components/GenerationSettings'
import { SceneCanvas } from './components/SceneCanvas'
import { ScenesPanel } from './components/ScenesPanel'
import { referenceImages, sceneLayers, scenes } from './data/scene'
import './App.css'

export default function App() {
  const activeScene = scenes[0]
  // Layers referenced from the prompt that the canvas outlines.
  const [highlightedLayerIds, setHighlightedLayerIds] = useState<string[]>([])

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__breadcrumb text-normal">Makeup</span>
        <span className="app__breadcrumb-sep" />
        <span className="text-normal">Beauty product</span>
      </header>

      <div className="app__content">
        <aside className="app__sidebar">
          <ScenesPanel scenes={scenes} activeSceneId={activeScene.id} layers={sceneLayers} />
        </aside>

        <main className="app__canvas">
          <SceneCanvas name={activeScene.name} highlightedLayerIds={highlightedLayerIds} />
          <div className="app__panel">
            <GenerationSettings
              layers={sceneLayers}
              references={referenceImages}
              onHighlightLayers={setHighlightedLayerIds}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
