import P5Overlay from './P5Overlay'
import { Point } from 'openseadragon'
import { noop } from 'lodash-es'
import { DrawMethod } from './draw'
import { Draw, DRAW_MODE, DrawData } from './draw/Draw'

type SK = Required<P5Overlay>['sk']

export interface CanvasInfo {
    zoom: number
    image?: OpenSeadragon.TiledImage
}

export class DrawMark {
    private overlay: P5Overlay
    private readonly sk: SK
    private drawMethods: DrawMethod
    private canvasInfo: CanvasInfo = { zoom: 0.1 }

    constructor (overlay: P5Overlay) {
        this.overlay = overlay
        this.sk = overlay.sk!
        this.drawMethods = new DrawMethod(overlay.sk!)
    }

    public setCanvasInfo (info: CanvasInfo) {
        this.canvasInfo = info
    }

    /**
     * 开始绘画
     * @param openTextModal
     */
    public startDraw (openTextModal?: () => void) {
        const drawInstance = this.drawMethods.methods[Draw.drawData.type || '']
        this.overlay.crop!.cancelCrop()
        Draw.drawData.enable = true
        this.overlay.viewer.setMouseNavEnabled(false)
        Draw.drawData.startPoint = null
        Draw.drawData.endPoint = null
        Draw.drawData.startPointTransformed = null
        drawInstance?.active?.()
        this.sk.loop()

        this.sk.mousePressed = (event: any) => {
            if (event.target.nodeName !== 'CANVAS') return false
            drawInstance.start()
            Draw.drawData!.startPoint = new Point(this.sk.mouseX, this.sk.mouseY)
            if (Draw.drawData.type === 'text') {
                const inputWrap = this.sk.select('#inputWrap')
                if (inputWrap) {
                    inputWrap?.position(Draw.drawData.startPoint.x, Draw.drawData.startPoint.y)
                    openTextModal?.()
                } else {
                    console.error('inputWrap is null')
                }
            }
        }
        this.sk.mouseReleased = (event: any) => {
            if (event.target.nodeName !== 'CANVAS') return false
            if (Draw.drawData.type === 'text') {
                this.sk.mousePressed = noop
                return false
            }
            Draw.drawData.enable = false
            this.sk.noLoop()
            this.overlay.viewer.setMouseNavEnabled(true)
            this.sk.mousePressed = noop
            drawInstance.end?.(this.canvasInfo)
            Draw.drawData = {}
            this.sk.mouseReleased = noop
        }
    }

    /**
     * 循环绘画现有的标记
     */
    public drawMarkStore (zoom: number) {
        Draw.store.forEach(item => {
            this.draw(this.sk, item, DRAW_MODE.SYSTEM)
        })
    }

    /**
     * 根据drawOptions设置绘画单个图形
     * @param sk
     * @param drawOptions
     * @param mode
     */
    public draw (sk: SK, drawOptions: DrawData, mode: DRAW_MODE) {
        const drawInstance = this.drawMethods.methods[drawOptions.type || '']
        const canDraw = mode === DRAW_MODE.USER ? drawOptions.enable && sk.mouseIsPressed && drawOptions && drawOptions.startPoint && sk.mouseButton === sk.LEFT : true
        if (canDraw) {
            sk.push()
            const color = sk.color(drawOptions!.color! as string)
            color.setAlpha(sk.map(drawOptions!.opacity!, 0, 1, 0, 255))
            drawOptions.startPointTransformed = this.canvasInfo.image?.viewerElementToImageCoordinates(drawOptions.startPoint!)
            drawOptions.endPoint = this.canvasInfo.image?.viewerElementToImageCoordinates(new Point(sk.mouseX, sk.mouseY))
            let startPoint: Point
            let endPoint: Point
            if (mode === DRAW_MODE.USER) {
                startPoint = drawOptions.startPointTransformed!
                endPoint = drawOptions.endPoint!
            } else {
                startPoint = new Point(...drawOptions.path![0])
                endPoint = new Point(...(drawOptions.path?.[1] || [0, 0]))
            }
            const strokeWeight = drawOptions!.strokeWeight! * this.overlay.viewer.viewport.getMinZoom() / this.overlay.viewer.viewport.getHomeZoom()
            Draw.mode = mode
            if (drawOptions?.type) {
                drawInstance?.draw({
                    ...drawOptions,
                    color,
                    startPoint,
                    endPoint,
                    strokeWeight
                })
            }
            sk.pop()
        }
    }

    public setDrawOptions (drawOptions: DrawData) {
        Draw.drawData = drawOptions
    }

    public setStore (markStore: DrawData[]) {
        Draw.store = markStore
        this.overlay.redraw()
    }
}
