import React, {
    FC,
    useEffect,
    useRef,
    useState
} from 'react'
import OpenSeaDragon from 'openseadragon'
import P5Overlay from './P5Overlay'
import { ControlPanelProps } from './ControlPanel'
import { createPortal } from 'react-dom'
import { useMemoizedFn, useReactive } from 'ahooks'

interface Props {
    options: OpenSeaDragon.Options
    ControlPanel?: FC<ControlPanelProps>
    onReady?: (payload: { viewer: OpenSeadragon.Viewer, overlay: P5Overlay }) => void
    beforeDeleteCrop?: ControlPanelProps['beforeDeleteCrop']
}

const OpenSeaDragonView: FC<Props> = ({
    options,
    ControlPanel,
    onReady,
    beforeDeleteCrop
}) => {
    const [overlay, setOverlay] = useState<P5Overlay>()
    const innerData = useReactive({
        controlPanelVisible: false,
    })
    const domEl = useRef<HTMLDivElement | null>(null)
    const controlPanelEl = useRef<HTMLDivElement>(document.createElement('div'))
    const initControlPanel = useMemoizedFn((viewer: OpenSeadragon.Viewer) => {
        viewer.container.append(controlPanelEl.current)
        innerData.controlPanelVisible = true
    })
    useEffect(() => {
        let viewer: OpenSeadragon.Viewer
        if (domEl.current) {
            viewer = OpenSeaDragon({
                element: domEl.current,
                ...options
            })
            viewer.addHandler('full-screen', (event) => {
                innerData.controlPanelVisible = !event.fullScreen
            })
            const overlay = new P5Overlay(viewer)
            initControlPanel(viewer)
            overlay.onReady(() => {
                setOverlay(overlay)
                onReady?.({ viewer, overlay })
            })
        }
        return () => {
            viewer.destroy()
        }
    }, [])
    return <>
        <div className="h-100vh w-full z-1" ref={ domEl } />
        {
            innerData.controlPanelVisible
            && overlay
            && ControlPanel
            && createPortal(<ControlPanel
                overlay={ overlay }
                beforeDeleteCrop={ beforeDeleteCrop }
            />, controlPanelEl.current)
        }
    </>
}

export default OpenSeaDragonView
