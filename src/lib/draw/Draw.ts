import P5 from 'p5'
import { Point } from 'openseadragon'

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
    public needStroke = true

    constructor (sk: P5) {
        Draw.sk = sk
    }

    draw (currentDrawData: DrawData) {}

    /**
     * 绘画开始时的回调
     * @private
     */
    start () {}

    /**
     * 绘图结束时的回调
     * @private
     */
    end () {
        Draw.store.push({
            ...Draw.drawData,
            path: [[Draw.drawData.startPointTransformed!.x, Draw.drawData!.startPointTransformed!.y], [Draw.drawData!.endPoint!.x, Draw.drawData!.endPoint!.y]]
        })
    }
}

