import { Draw, DrawData } from './Draw'

export class DrawCircle extends Draw {
    drawName = 'circle'
    draw (currentDrawData:DrawData) {
        Draw.sk.circle(currentDrawData.startPoint?.x||0, currentDrawData.startPoint?.y || 0, (currentDrawData.startPoint?.distanceTo(currentDrawData.endPoint!) || 0) * 2)
    }
}
