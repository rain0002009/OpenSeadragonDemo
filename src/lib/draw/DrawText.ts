import { Draw, DrawData } from './Draw'
import type { Color } from 'p5'

declare module './Draw' {
    interface DrawData {
        isInputOk?: boolean
        text?: string
    }
}

export class DrawText extends Draw {
    drawName = 'text'

    draw (currentDrawData: DrawData) {
        if (Draw.mode === 1 ? currentDrawData.isInputOk : true) {
            const textSize = (currentDrawData.strokeWeight || 1) * 20
            Draw.sk.textSize(textSize)
            Draw.sk.fill(currentDrawData.color! as Color)
            Draw.sk.text(currentDrawData.text!, currentDrawData.startPoint?.x || 0, (currentDrawData.startPoint?.y || 0) + (textSize / 2))
        }
    }
}
