import { TileSource } from 'openseadragon'
import './App.css'
import { useRef } from 'react'
import OpenSeaDragonView from './lib/OpenSeaDragonView'
import ControlPanel from './lib/ControlPanel'

function App () {
    const tileSource = useRef<any>(new TileSource({
        width: 7026,
        height: 9221,
        tileSize: 256,
        tileOverlap: 2,
        getTileUrl (level, x, y) {
            return `//openseadragon.github.io//example-images/highsmith/highsmith_files/${ level }/${ x }_${ y }.jpg`
        }
    }))
    return <OpenSeaDragonView
        options={ {
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
            // 禁止鼠标双击放大缩小
            gestureSettingsMouse: {
                dblClickToZoom: false,
                clickToZoom: false
            }
        } }
        controlPanel={ ControlPanel }
        onReady={ ({ viewer }) => {
            viewer.open(tileSource.current)
        } }
    />
}

export default App
