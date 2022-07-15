import P5, { Color } from 'p5'
import { Point } from 'openseadragon'
import type { CanvasInfo } from '../DrawMark'

export enum DRAW_MODE {
    /**
     * 用户操作
     */
    USER = 1,
    /**
     * 系统操作
     */
    SYSTEM
}

export interface DrawData {
    startPoint?: Point | null
    endPoint?: Point | null
    startPointTransformed?: Point | null
    strokeWeight?: number
    color?: string | P5.Color
    opacity?: number
    path?: [number, number][]
    type?: string
    enable?: boolean
    zoom?: number
}

export class Draw {
    static sk: P5
    static store: DrawData[] = []
    /**
     * 绘画过程中所需要的数据
     */
    static drawData: DrawData = {}
    /**
     * 1：用户操作。2：历史记录
     */
    static mode: 1 | 2
    public drawName: string = ''

    constructor (sk: P5) {
        Draw.sk = sk
    }

    static noFill (currentDrawData: DrawData) {
        Draw.sk.noFill()
        Draw.sk.strokeWeight(currentDrawData.strokeWeight! * 2)
        Draw.sk.stroke(currentDrawData.color as Color)
    }

    draw (currentDrawData: DrawData) {}

    /**
     * 选中绘画模式后的回调
     */
    active () {}

    /**
     * 绘画开始时的回调
     * @private
     */
    start () {}

    /**
     * 绘图结束时的回调
     * @private
     */
    end (canvasInfo: CanvasInfo) {
        Draw.store.push({
            ...Draw.drawData,
            path: [[Draw.drawData.startPointTransformed!.x, Draw.drawData!.startPointTransformed!.y], [Draw.drawData!.endPoint!.x, Draw.drawData!.endPoint!.y]],
            zoom: canvasInfo.zoom
        })
    }
}

