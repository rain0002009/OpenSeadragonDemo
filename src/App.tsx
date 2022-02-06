import OpenSeaDragon, { TileSource } from 'openseadragon'
import './App.css'
import { useEffect, useRef } from 'react'
import P5Overlay from './lib/P5Overlay'
import _ from 'lodash'

function App () {
    const domEl = useRef<HTMLDivElement>(null)
    const tileSource = useRef<any>(new TileSource({
        width: 7026,
        height: 9221,
        tileSize: 256,
        tileOverlap: 2,
        getTileUrl (level, x, y) {
            return `//openseadragon.github.io//example-images/highsmith/highsmith_files/${ level }/${ x }_${ y }.jpg`
        }
    }))
    useEffect(() => {
        let viewer: OpenSeadragon.Viewer
        if (domEl.current) {
            viewer = OpenSeaDragon({
                element: domEl.current,
                crossOriginPolicy: 'Anonymous',
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
            _.set(window, 'viewer', viewer)
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
