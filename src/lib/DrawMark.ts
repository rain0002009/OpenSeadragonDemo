import P5Overlay, { MarkerItem } from './P5Overlay'
import { Point } from 'openseadragon'
import _ from 'lodash'

interface DrawOptions extends MarkerItem {
    startPoint?: Point | null
    endPoint?: Point | null
    isInputOk?: boolean
    startPointTransformed?: Point | null
    freePath?: [number, number][]
    enable?: boolean
}

type SK = P5Overlay['sk']

export class DrawMark {
    private overlay: P5Overlay
    public drawOptions: DrawOptions
    private readonly sk: SK
    public store: MarkerItem[]

    constructor (overlay: P5Overlay) {
        this.overlay = overlay
        this.drawOptions = {}
        this.sk = overlay.sk
        this.store = []
    }

    /**
     * 开始绘画
     * @param openTextModal
     */
    public startDraw (openTextModal?: () => void) {
        this.overlay.crop.cancelCrop()
        this.drawOptions.enable = true
        this.overlay.viewer.setMouseNavEnabled(false)
        this.drawOptions.startPoint = null
        this.drawOptions.endPoint = null
        this.drawOptions.startPointTransformed = null
        this.drawOptions.freePath = []
        this.sk.loop()

        this.sk.mousePressed = () => {
            this.drawOptions!.startPoint = new Point(this.sk.mouseX, this.sk.mouseY)
            if (this.drawOptions?.type === 'text') {
                const inputWrap = this.sk.select('#inputWrap')
                if (inputWrap) {
                    inputWrap?.position(this.drawOptions.startPoint.x, this.drawOptions.startPoint.y)
                    openTextModal?.()
                } else {
                    console.error('inputWrap is null')
                }
            }
        }
        this.sk.mouseReleased = () => {
            if (this.drawOptions?.type === 'text') {
                this.sk.mousePressed = _.noop
                return false
            }
            this.drawOptions.enable = false
            this.sk.noLoop()
            this.overlay.viewer.setMouseNavEnabled(true)
            this.sk.mousePressed = _.noop
            const markItem = {
                ...this.drawOptions!
            }
            switch (this.drawOptions?.type) {
                case 'circle':
                case 'rect':
                case 'line':
                    markItem.path = [[this.drawOptions.startPointTransformed!.x, this.drawOptions!.startPointTransformed!.y], [this.drawOptions!.endPoint!.x, this.drawOptions!.endPoint!.y]]
                    break
                case 'free':
                    markItem.path = this.drawOptions!.freePath
                    break
            }
            this.store.push(markItem)
            this.drawOptions = {}
            this.sk.mouseReleased = _.noop
        }
    }

    /**
     * 循环绘画现有的标记
     * @param zoom
     */
    public drawMarkStore (zoom: number) {
        this.store.forEach(item => {
            this.draw(this.sk, item, 2, zoom,)
        })
    }

    /**
     * 根据drawOptions设置绘画单个图形
     * @param sk
     * @param drawOptions
     * @param mode
     * @param zoom
     * @param image
     */
    public draw (sk: SK, drawOptions: DrawOptions, mode: 1 | 2, zoom: number, image?: OpenSeadragon.TiledImage) {
        const canDraw = mode === 1 ? drawOptions.enable && sk.mouseIsPressed && drawOptions && drawOptions.startPoint && sk.mouseButton === sk.LEFT : true
        if (canDraw) {
            sk.push()
            const color = sk.color(drawOptions!.color!)
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
            if (['circle', 'rect', 'line', 'free'].includes(drawOptions!.type!)) {
                sk.noFill()
                sk.strokeWeight(strokeWeight * 2)
                sk.stroke(color)
            }
            switch (drawOptions?.type) {
                case 'circle':
                    sk.circle(startPoint.x, startPoint.y, startPoint.distanceTo(endPoint) * 2)
                    break
                case 'rect':
                    sk.quad(startPoint.x, startPoint.y, endPoint.x, startPoint.y, endPoint.x, endPoint.y, startPoint.x, endPoint.y)
                    break
                case 'line':
                    sk.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                    break
                case 'free':
                    if (mode == 1) {
                        if (drawOptions.freePath?.length === 0) {
                            drawOptions.freePath.push([startPoint.x, startPoint.y])
                        }
                        if ((new Point(..._.last(drawOptions.freePath)!).distanceTo(endPoint)) > 20) {
                            drawOptions.freePath?.push([endPoint.x, endPoint.y])
                        }
                    }
                    drawOptions[mode === 1 ? 'freePath' : 'path']?.forEach((point, pointIndex) => {
                        const nextPoint = drawOptions.freePath?.[pointIndex + 1]
                        if (nextPoint) {
                            sk.line(...point, ...nextPoint)
                        }
                    })
                    break
                case 'text':
                    if (mode === 1 ? drawOptions.isInputOk : true) {
                        sk.textSize(strokeWeight * 25)
                        sk.fill(color)
                        sk.text(drawOptions.text!, startPoint.x, startPoint.y)
                    }
                    break
            }
            sk.pop()
        }
    }

    public setDrawOptions (drawOptions: DrawOptions) {
        this.drawOptions = drawOptions
    }

    public setStore (markStore: MarkerItem[]) {
        this.store = markStore
        this.overlay.redraw()
    }
}
