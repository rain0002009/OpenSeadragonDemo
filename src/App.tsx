import OpenSeaDragon, { TileSource } from 'openseadragon'
import './App.css'
import { useEffect, useRef } from 'react'
import P5Overlay from './lib/P5Overlay'

function App () {
    const domEl = useRef<HTMLDivElement>(null)
    const tileSource = useRef<any>(new TileSource({
        width: 18034,
        height: 12435,
        minLevel: 8,
        maxLevel: 15,
        tileSize: 256,
        tileOverlap: 0,
        getTileUrl (level, x, y) {
            return `http://api.fxskcloud.com/Section/GetTileImage?sectionId=288&level=${ level }&x=${ x }&y=${ y }`
        }
    }))
    useEffect(() => {
        let viewer: OpenSeadragon.Viewer
        if (domEl.current) {
            viewer = OpenSeaDragon({
                element: domEl.current,
                // 不显示基础导航按钮
                showNavigationControl: false,
                // 显示小地图
                showNavigator: true,
                navigatorAutoFade: false,
                // 小地图自动缩放,关闭以提高性能
                navigatorAutoResize: false,
                navigatorHeight: 100,
                navigatorWidth: 200,
                navigatorPosition: 'TOP_LEFT',
                tileSources: [tileSource.current],
                gestureSettingsMouse: {
                    dblClickToZoom: false,
                    clickToZoom: false
                }
            })
            new P5Overlay(viewer, {})
        }
        return () => {
            viewer.destroy()
        }
    }, [domEl.current])
    return <div>
        <div className="h-100vh w-full z-1" ref={ domEl } />
    </div>
}

export default App
