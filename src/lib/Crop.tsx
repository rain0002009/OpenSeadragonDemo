import P5Overlay from './P5Overlay'
import { Point, Rect, Viewer } from 'openseadragon'
import { Element, Graphics, Image } from 'p5'
import { render } from 'react-dom'
import { Button } from 'antd'

const SQUARE_WIDTH = 8
const HALF_SQUARE_WIDTH = SQUARE_WIDTH / 2
const BUTTON_WRAPPER_HEIGHT = 34

export class Crop {
    private viewer: Viewer
    private sk: P5Overlay['sk']
    public cropInfo: {
        prevCanvasImage?: Image
        seaDragonImage?: Image
        enable?: boolean
        startPoint?: Point
        currentSelected?: [Point, Point]
        onWhere?: 'inside' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | string
    } = {}
    private buttonWrapperDiv: Element
    private readonly pg: Graphics
    private readonly onFinish?: P5Overlay['onCropFinish']

    constructor (overlay: P5Overlay) {
        this.onFinish = overlay.onCropFinish
        this.viewer = overlay.viewer
        this.sk = overlay.sk
        this.buttonWrapperDiv = this.sk.createDiv()
        this.buttonWrapperDiv.hide()
        this.buttonWrapperDiv.addClass('w-120px')
        const viewerSize = this.viewer.viewport.getContainerSize()
        this.pg = this.sk.createGraphics(viewerSize.x, viewerSize.y)
        render(<>
            <Button
                size="small"
                type="primary"
                onClick={ () => {
                    this.finish()
                } }
            >确定</Button>
            <Button
                className="ml-4"
                size="small"
                danger
                type="primary"
                onClick={ () => {
                    this.cancelCrop()
                } }
            >取消</Button>
        </>, this.buttonWrapperDiv.elt)
        this.viewer.container.append(this.buttonWrapperDiv.elt)
    }

    public startCrop () {
        if (this.cropInfo.enable) {
            return false
        }
        this.cropInfo.prevCanvasImage = this.sk.get()
        this.viewer.setMouseNavEnabled(false);
        (this.viewer.drawer.canvas as HTMLCanvasElement).toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob)
                this.sk.loadImage(url, (image) => {
                    this.cropInfo.seaDragonImage = image
                    URL.revokeObjectURL(url)
                })
            }
        })
        this.sk.loop()
        this.cropInfo.enable = true

        this.sk.mousePressed = (event: any) => {
            if (!this.cropInfo.enable || event.target.nodeName !== 'CANVAS') return false
            if (!this.cropInfo.onWhere) {
                this.cropInfo.startPoint = new Point(this.sk.mouseX, this.sk.mouseY)
                this.cropInfo.currentSelected = void 0
            }
            return false
        }
        this.sk.mouseReleased = (event: any) => {
            if (!this.cropInfo.enable || event.target.nodeName !== 'CANVAS') return false
            if (!this.cropInfo.currentSelected) {
                this.cropInfo.currentSelected = [
                    this.cropInfo.startPoint!,
                    new Point(this.sk.mouseX, this.sk.mouseY)
                ]
                this.buttonWrapperDiv.show()
            }
            this.cropInfo.startPoint = void 0
        }
    }

    public cancelCrop () {
        this.buttonWrapperDiv.hide()
        this.viewer.setMouseNavEnabled(true)
        this.sk.noLoop()
        this.sk.cursor(this.sk.ARROW)
        this.cropInfo = {}
    }

    public doCrop () {
        if (this.cropInfo.enable) {
            this.cropInfo.seaDragonImage && this.sk.image(this.cropInfo.seaDragonImage, 0, 0, this.sk.width, this.sk.height)
            this.sk.image(this.cropInfo.prevCanvasImage!, 0, 0, this.sk.width, this.sk.height)
            const startPoint = this.cropInfo.startPoint
            const endPoint = new Point(this.sk.mouseX, this.sk.mouseY)
            if (!this.cropInfo.onWhere) {
                this.sk.cursor(this.sk.CROSS)
            }
            startPoint && this.drawQuad(startPoint, endPoint)
            if (this.cropInfo.currentSelected) {
                this.drawQuad(...this.cropInfo.currentSelected)
                this.transformQuad(...this.cropInfo.currentSelected)
            }
        }
    }

    /**
     * 画选中区域方块
     * @param startPoint
     * @param endPoint
     * @private
     */
    private drawQuad (startPoint: Point, endPoint: Point) {
        if (startPoint && 'globalCompositeOperation' in this.pg.drawingContext) {
            const points = [new Point(startPoint.x, startPoint.y), new Point(endPoint.x, startPoint.y), new Point(endPoint.x, endPoint.y), new Point(startPoint.x, endPoint.y)]
            this.pg.clear()
            this.pg.background(0, 0, 0, 120)
            this.pg.push()
            this.pg.drawingContext.globalCompositeOperation = 'destination-out'
            this.pg.fill(255, 255, 255, 255)
            this.pg.quad(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y)
            this.pg.pop()
            this.pg.push()
            this.pg.noFill()
            this.pg.stroke(0, 0, 255)
            this.pg.strokeWeight(2)
            this.pg.quad(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y)
            points.forEach(point => {
                this.pg.fill(0, 0, 255)
                this.pg.square(point.x - HALF_SQUARE_WIDTH, point.y - HALF_SQUARE_WIDTH, SQUARE_WIDTH)
            })
            this.pg.pop()
            this.sk.image(this.pg, 0, 0, this.sk.width, this.sk.height)
        }
    }

    /**
     * 拖拽/缩放选中区域
     * @param startPoint
     * @param endPoint
     * @private
     */
    private transformQuad (startPoint: Point, endPoint: Point) {
        if (!startPoint) {
            return false
        }
        const currentMousePoint = new Point(this.sk.mouseX, this.sk.mouseY)
        const {
            mainRect,
            leftRect,
            rightRect,
            bottomRect,
            topRect,
            topLeftRect,
            topRightRect,
            bottomLeftRect,
            bottomRightRect,
            topLeftPoint
        } = Crop.getRectFromPoint(startPoint, endPoint)

        this.buttonWrapperDiv.position(topLeftPoint.x, topLeftPoint.y - BUTTON_WRAPPER_HEIGHT)
        if (!this.sk.mouseIsPressed) {
            this.cropInfo.onWhere = void 0
            if (mainRect.containsPoint(currentMousePoint)) {
                this.sk.cursor(this.sk.MOVE)
                this.cropInfo.onWhere = 'inside'
            }
            [
                { cursor: 'ns-resize', rect: topRect, onWhere: 'top' },
                { cursor: 'ew-resize', rect: rightRect, onWhere: 'right' },
                { cursor: 'ns-resize', rect: bottomRect, onWhere: 'bottom' },
                { cursor: 'ew-resize', rect: leftRect, onWhere: 'left' },
                { cursor: 'nwse-resize', rect: topLeftRect, onWhere: 'topLeft' },
                { cursor: 'nesw-resize', rect: topRightRect, onWhere: 'topRight' },
                { cursor: 'nwse-resize', rect: bottomRightRect, onWhere: 'bottomRight' },
                { cursor: 'nesw-resize', rect: bottomLeftRect, onWhere: 'bottomLeft' }
            ].forEach(({ cursor, rect, onWhere }) => {
                if (rect.containsPoint(currentMousePoint)) {
                    this.sk.cursor(cursor)
                    this.cropInfo.onWhere = onWhere
                }
            })
        }
        if (this.sk.mouseIsPressed) {
            const deltaX = currentMousePoint.x - this.sk.pmouseX
            const deltaY = currentMousePoint.y - this.sk.pmouseY
            switch (this.cropInfo.onWhere) {
                case 'inside':
                    this.cropInfo.currentSelected?.forEach((point) => {
                        point.x += deltaX
                        point.y += deltaY
                    })
                    break
                case 'top':
                    this.cropInfo.currentSelected![0].y += deltaY
                    break
                case 'right':
                    this.cropInfo.currentSelected![1].x += deltaX
                    break
                case 'bottom':
                    this.cropInfo.currentSelected![1].y += deltaY
                    break
                case 'left':
                    this.cropInfo.currentSelected![0].x += deltaX
                    break
                case 'topLeft':
                    this.cropInfo.currentSelected![0].x += deltaX
                    this.cropInfo.currentSelected![0].y += deltaY
                    break
                case 'topRight':
                    this.cropInfo.currentSelected![1].x += deltaX
                    this.cropInfo.currentSelected![0].y += deltaY
                    break
                case 'bottomRight':
                    this.cropInfo.currentSelected![1].x += deltaX
                    this.cropInfo.currentSelected![1].y += deltaY
                    break
                case 'bottomLeft':
                    this.cropInfo.currentSelected![0].x += deltaX
                    this.cropInfo.currentSelected![1].y += deltaY
                    break
            }
        }
    }

    private finish () {
        const [startPoint, endPoint] = this.cropInfo.currentSelected!
        const { mainInsideRect } = Crop.getRectFromPoint(startPoint, endPoint)
        this.cropInfo.enable = false
        this.sk.noLoop()
        this.sk.clear()
        this.cropInfo.seaDragonImage && this.sk.image(this.cropInfo.seaDragonImage, 0, 0, this.sk.width, this.sk.height)
        this.sk.image(this.cropInfo.prevCanvasImage!, 0, 0, this.sk.width, this.sk.height)
        const imageCanvas = (this.sk.get(mainInsideRect.x, mainInsideRect.y, mainInsideRect.width, mainInsideRect.height) as any).canvas as HTMLCanvasElement
        imageCanvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob)
                this.onFinish?.({ blob, url, key: url })
            }
        })

        this.cancelCrop()
    }

    public resize () {
        const viewerSize = this.viewer.viewport.getContainerSize()
        this.pg.resizeCanvas(viewerSize.x, viewerSize.y)
    }

    private static getRectFromPoint (startPoint: Point, endPoint: Point) {
        const topLeftInsidePoint = new Point(Math.min(startPoint.x, endPoint.x), Math.min(startPoint.y, endPoint.y))
        const bottomRightInsidePoint = new Point(Math.max(startPoint.x, endPoint.x), Math.max(startPoint.y, endPoint.y))
        const topLeftPoint = new Point(topLeftInsidePoint.x - HALF_SQUARE_WIDTH, topLeftInsidePoint.y - HALF_SQUARE_WIDTH)
        const bottomRightPoint = new Point(bottomRightInsidePoint.x + HALF_SQUARE_WIDTH, bottomRightInsidePoint.y + HALF_SQUARE_WIDTH)
        const width = bottomRightPoint.x - topLeftPoint.x
        const widthInside = bottomRightInsidePoint.x - topLeftInsidePoint.x
        const height = bottomRightPoint.y - topLeftPoint.y
        const heightInside = bottomRightInsidePoint.y - topLeftInsidePoint.y
        const mainRect = new Rect(topLeftPoint.x, topLeftPoint.y, width, height)
        const mainInsideRect = new Rect(topLeftInsidePoint.x, topLeftInsidePoint.y, widthInside, heightInside)
        const topRect = new Rect(topLeftPoint.x, topLeftPoint.y, width, SQUARE_WIDTH)
        const rightRect = new Rect(bottomRightPoint.x - SQUARE_WIDTH, topLeftPoint.y, SQUARE_WIDTH, height)
        const bottomRect = new Rect(topLeftPoint.x, bottomRightPoint.y - SQUARE_WIDTH, width, SQUARE_WIDTH)
        const leftRect = new Rect(topLeftPoint.x, topLeftPoint.y, SQUARE_WIDTH, height)
        const topLeftRect = new Rect(topLeftPoint.x, topLeftPoint.y, SQUARE_WIDTH, SQUARE_WIDTH)
        const topRightRect = new Rect(bottomRightPoint.x - SQUARE_WIDTH, topLeftPoint.y, SQUARE_WIDTH, SQUARE_WIDTH)
        const bottomLeftRect = new Rect(topLeftPoint.x, bottomRightPoint.y - SQUARE_WIDTH, SQUARE_WIDTH, SQUARE_WIDTH)
        const bottomRightRect = new Rect(bottomRightPoint.x - SQUARE_WIDTH, bottomRightPoint.y - SQUARE_WIDTH, SQUARE_WIDTH, SQUARE_WIDTH)
        return {
            mainRect,
            topRect,
            topLeftPoint,
            rightRect,
            bottomRect,
            leftRect,
            topLeftRect,
            topRightRect,
            bottomLeftRect,
            bottomRightRect,
            mainInsideRect
        }
    }
}
