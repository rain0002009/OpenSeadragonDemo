import { Draw, DrawData } from './Draw'
import { Point } from 'openseadragon'
import { cloneDeep, last } from 'lodash-es'

declare module './Draw' {
    interface DrawData {
        freePath?: [number, number][]
    }
}

export class DrawFree extends Draw {
    drawName = 'free'

    start () {
        Draw.drawData.freePath = []
    }

    end () {
        Draw.store.push({ ...Draw.drawData, path: cloneDeep(Draw.drawData.freePath) })
    }

    draw (currentDrawData: DrawData) {
        if (Draw.mode == 1) {
            if (currentDrawData.freePath?.length === 0) {
                currentDrawData.freePath.push([currentDrawData.startPoint?.x || 0, currentDrawData.startPoint?.y || 0])
            }
            if ((new Point(...last(currentDrawData.freePath as any[])!).distanceTo(currentDrawData.endPoint!)) > 20) {
                currentDrawData.freePath?.push([currentDrawData.endPoint?.x || 0, currentDrawData.endPoint?.y || 0])
            }
        }
        currentDrawData[Draw.mode === 1 ? 'freePath' : 'path']?.forEach((point, pointIndex) => {
            const nextPoint = currentDrawData.freePath?.[pointIndex + 1]
            if (nextPoint) {
                Draw.sk.line(...point, ...nextPoint)
            }
        })
    }
}
