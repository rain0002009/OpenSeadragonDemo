import OpenSeaDragon from 'openseadragon'
import './App.css'
import { useEffect, useRef } from 'react'
import P5Overlay from './lib/P5Overlay'
import { virtualModulePrefix } from 'vite/dist/node/utils'

function App () {
    const domEl = useRef<HTMLDivElement>(null)
    const tileSource = useRef<any>({
        Image: {
            xmlns: 'http://schemas.microsoft.com/deepzoom/2009',
            Url: 'http://openseadragon.github.io/example-images/highsmith/highsmith_files/',
            Format: 'jpg',
            Overlap: '2',
            TileSize: '256',
            Size: {
                Width: '9221',
                Height: '7026'
            }
        }
    })
    useEffect(() => {
        if (domEl.current) {
            const viewer = OpenSeaDragon({
                element: domEl.current,
                collectionMode: true,
                autoResize: false,
                collectionRows: 2,
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
    }, [domEl])
    return <div>
        <div className="h-100vh z-1" ref={ domEl } />
    </div>
}

export default App
