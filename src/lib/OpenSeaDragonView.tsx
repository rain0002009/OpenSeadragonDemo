import React, { FC, useEffect, useRef, useState } from 'react'
import OpenSeaDragon from 'openseadragon'
import P5Overlay from './P5Overlay'
import _ from 'lodash'
import { ControlPanelProps } from './ControlPanel'
import { createPortal } from 'react-dom'
import { useMemoizedFn, useReactive } from 'ahooks'

interface Props {
    options: OpenSeaDragon.Options
    controlPanel?: React.ComponentType<ControlPanelProps>
}

const OpenSeaDragonView: FC<Props> = ({ options, controlPanel }) => {
    const [overlay, setOverlay] = useState<P5Overlay>()
    const ControlPanel = controlPanel || (() => null)
    const innerData = useReactive({
        controlPanelOk: false,
    })
    const domEl = useRef<HTMLDivElement | null>(null)
    const controlPanelEl = useRef<HTMLDivElement>(document.createElement('div'))
    const initControlPanel = useMemoizedFn((viewer: OpenSeadragon.Viewer) => {
        viewer.container.append(controlPanelEl.current)
        innerData.controlPanelOk = true
    })
    useEffect(() => {
        let viewer: OpenSeadragon.Viewer
        if (domEl.current) {
            viewer = OpenSeaDragon({
                element: domEl.current,
                ...options
            })
            const overlay = new P5Overlay(viewer)
            setOverlay(overlay)
            initControlPanel(viewer)
            _.set(window, 'overlay', overlay)
        }
        return () => {
            viewer.destroy()
        }
    }, [domEl.current, options])
    return <div>
        <div className="h-100vh w-full z-1" ref={ domEl } />
        {
            innerData.controlPanelOk
            && overlay
            && createPortal(<ControlPanel
                overlay={ overlay }
            />, controlPanelEl.current)
        }
    </div>
}

export default OpenSeaDragonView
