import P5Overlay from './P5Overlay'
import { Point } from 'openseadragon'
import { noop } from 'lodash-es'
import { DrawMethod } from './draw'
import { Draw, DrawData } from './draw/Draw'

type SK = Required<P5Overlay>['sk']

export class DrawMark {
    private overlay: P5Overlay
    private readonly sk: SK
    private drawMethods: DrawMethod

    constructor (overlay: P5Overlay) {
        this.overlay = overlay
        this.sk = overlay.sk!
        this.drawMethods = new DrawMethod(overlay.sk!)
    }

    /**
     * 开始绘画
     * @param openTextModal
     */
    public startDraw (openTextModal?: () => void) {
        this.overlay.crop!.cancelCrop()
        Draw.drawData.enable = true
        this.overlay.viewer.setMouseNavEnabled(false)
        Draw.drawData.startPoint = null
        Draw.drawData.endPoint = null
        Draw.drawData.startPointTransformed = null
        this.drawMethods.methods[Draw.drawData.type || '']?.start?.()
        this.sk.loop()

        this.sk.mousePressed = (event: any) => {
            if (event.target.nodeName !== 'CANVAS') return false
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
            this.drawMethods.methods[Draw.drawData.type || ''].end?.()
            Draw.drawData = {}
            this.sk.mouseReleased = noop
        }
    }

    /**
     * 循环绘画现有的标记
     * @param zoom
     */
    public drawMarkStore (zoom: number) {
        Draw.store.forEach(item => {
            this.draw(this.sk, item, 2, zoom,)
        })
    }

    /**
     * 根据drawOptions设置绘画单个图形
     * @param sk
     * @param drawOptions
     * @param mode 1：用户操作。2：历史记录
     * @param zoom
     * @param image
     */
    public draw (sk: SK, drawOptions: DrawData, mode: 1 | 2, zoom: number, image?: OpenSeadragon.TiledImage) {
        const drawInstance = this.drawMethods.methods[drawOptions.type || '']
        const canDraw = mode === 1 ? drawOptions.enable && sk.mouseIsPressed && drawOptions && drawOptions.startPoint && sk.mouseButton === sk.LEFT : true
        if (canDraw) {
            sk.push()
            const color = sk.color(drawOptions!.color! as string)
            color.setAlpha(sk.map(drawOptions!.opacity!, 0, 1, 0, 255))
            drawOptions.startPointTransformed = image?.viewerElementToImageCoordinates(drawOptions.startPoint!)
            drawOptions.endPoint = image?.viewerElementToImageCoordinates(new Point(sk.mouseX, sk.mouseY))
            let startPoint: Point
            let endPoint: Point
            const strokeWeight = drawOptions!.strokeWeight! * this.overlay.viewer.viewport.getMinZoom() / this.overlay.viewer.viewport.getHomeZoom()
            if (mode === 1) {
                startPoint = drawOptions.startPointTransformed!
                endPoint = drawOptions.endPoint!
            } else {
                startPoint = new Point(...drawOptions.path![0])
                endPoint = new Point(...(drawOptions.path?.[1] || [0, 0]))
            }
            if (drawInstance.needStroke) {
                sk.noFill()
                sk.strokeWeight(strokeWeight * 2)
                sk.stroke(color)
            }
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
