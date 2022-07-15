import { Draw, DrawData } from './Draw'

export class DrawLine extends Draw {
    drawName = 'line'

    draw (currentDrawData:DrawData) {
        Draw.noFill(currentDrawData)
        Draw.sk.line(currentDrawData.startPoint?.x || 0, currentDrawData.startPoint?.y || 0, currentDrawData.endPoint?.x || 0, currentDrawData.endPoint?.y || 0)
    }
}
