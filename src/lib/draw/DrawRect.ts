import { Draw, DrawData } from './Draw'

export class DrawRect extends Draw {
    drawName = 'rect'

    draw (currentDrawData:DrawData) {
        Draw.sk.quad(
            currentDrawData.startPoint?.x || 0, currentDrawData.startPoint?.y || 0,
            currentDrawData.endPoint?.x || 0, currentDrawData.startPoint?.y || 0,
            currentDrawData.endPoint?.x || 0, currentDrawData.endPoint?.y || 0,
            currentDrawData.startPoint?.x || 0, currentDrawData.endPoint?.y || 0
        )
    }
}
