import P5Overlay from './P5Overlay'
import { Point, Rect, Viewer } from 'openseadragon'
import { Element, Graphics, Image } from 'p5'
import { createPortal } from 'react-dom'
import { Button } from 'antd'
import { CropListItem } from './CropPanel'
import { EventEmitter } from 'events'

const SQUARE_WIDTH = 8
const HALF_SQUARE_WIDTH = SQUARE_WIDTH / 2
const BUTTON_WRAPPER_HEIGHT = 34

export class Crop {
    private viewer: Viewer
    private sk: P5Overlay['sk']
    /**
     * 存储截图文件对象
     */
    public store: CropListItem[]
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
    private eventSource: EventEmitter
    /**
     * 裁剪确认按钮
     */
    public holder: React.ReactPortal

    constructor (overlay: P5Overlay) {
        this.store = []
        this.viewer = overlay.viewer
        this.sk = overlay.sk
        this.eventSource = overlay.overlayEvent
        this.buttonWrapperDiv = this.sk.createDiv()
        this.buttonWrapperDiv.hide()
        this.buttonWrapperDiv.addClass('w-120px')
        const viewerSize = this.viewer.viewport.getContainerSize()
        this.pg = this.sk.createGraphics(viewerSize.x, viewerSize.y)
        this.holder = createPortal(<>
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

    /**
     * 开始截图
     */
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
                    new Point(Math.min(this.cropInfo.startPoint!.x, this.sk.mouseX), Math.min(this.cropInfo.startPoint!.y, this.sk.mouseY)),
                    new Point(Math.max(this.cropInfo.startPoint!.x, this.sk.mouseX), Math.max(this.cropInfo.startPoint!.y, this.sk.mouseY))
                ]
                let temp = this.cropInfo.currentSelected[0]
                if (this.cropInfo.currentSelected[0].x > this.cropInfo.currentSelected[1].x) {
                    this.cropInfo.currentSelected[0] = this.cropInfo.currentSelected[1]
                    this.cropInfo.currentSelected[1] = temp
                }
                this.buttonWrapperDiv.show()
            } else {
                const p0 = this.cropInfo.currentSelected![0]
                const p1 = this.cropInfo.currentSelected![1]
                this.cropInfo.currentSelected = [
                    new Point(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y)),
                    new Point(Math.max(p0.x, p1.x), Math.max(p0.y, p1.y))
                ]
            }
            this.cropInfo.startPoint = void 0
        }
    }

    /**
     * 取消截图
     */
    public cancelCrop () {
        this.buttonWrapperDiv.hide()
        this.viewer.setMouseNavEnabled(true)
        try {
            this.sk.cursor(this.sk.ARROW)
        } catch (e) {}
        this.sk.noLoop()
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
        const divTop = topLeftPoint.y - BUTTON_WRAPPER_HEIGHT
        this.buttonWrapperDiv.position(topLeftPoint.x, divTop < 0 ? bottomLeftRect.y + 16 : divTop)
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
            const p0 = this.cropInfo.currentSelected![0]
            const p1 = this.cropInfo.currentSelected![1]
            const width = p1.x - p0.x
            const height = p1.y - p0.y
            const nextTop = this.sk.constrain(p0.y + deltaY, 0, this.sk.height)
            const nextRight = this.sk.constrain(p1.x + deltaX, 0, this.sk.width)
            const nextBottom = this.sk.constrain(p1.y + deltaY, 0, this.sk.height)
            const nextLeft = this.sk.constrain(p0.x + deltaX, 0, this.sk.width)
            switch (this.cropInfo.onWhere) {
                case 'inside':
                    p0.x = this.sk.constrain(p0.x + deltaX, 0, this.sk.width - width)
                    p0.y = this.sk.constrain(p0.y + deltaY, 0, this.sk.height - height)
                    p1.x = p0.x + width
                    p1.y = p0.y + height
                    break
                case 'top':
                    this.cropInfo.currentSelected![0].y = nextTop
                    break
                case 'right':
                    this.cropInfo.currentSelected![1].x = nextRight
                    break
                case 'bottom':
                    this.cropInfo.currentSelected![1].y = nextBottom
                    break
                case 'left':
                    this.cropInfo.currentSelected![0].x = nextLeft
                    break
                case 'topLeft':
                    this.cropInfo.currentSelected![0].y = nextTop
                    this.cropInfo.currentSelected![0].x = nextLeft
                    break
                case 'topRight':
                    this.cropInfo.currentSelected![0].y = nextTop
                    this.cropInfo.currentSelected![1].x = nextRight
                    break
                case 'bottomRight':
                    this.cropInfo.currentSelected![1].y = nextBottom
                    this.cropInfo.currentSelected![1].x = nextRight
                    break
                case 'bottomLeft':
                    this.cropInfo.currentSelected![1].y = nextBottom
                    this.cropInfo.currentSelected![0].x = nextLeft
                    break
            }
        }
    }

    /**
     * 截图完成
     * @private
     */
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
                this.store.push({ blob, url, key: url })
                this.eventSource.emit('cropStoreChange', this.store)
            }
        })

        this.eventSource.emit('cropFinish', this)

        this.cancelCrop()
    }

    public resize () {
        const viewerSize = this.viewer.viewport.getContainerSize()
        this.pg.resizeCanvas(viewerSize.x, viewerSize.y)
    }

    public setStore (cropStore: CropListItem[]) {
        this.store = cropStore
        this.eventSource.emit('cropStoreChange', cropStore)
    }

    /**
     * 通过index删除截图
     * @param index
     * @param deleteCount
     */
    public deleteCropStore (index: number, deleteCount: number = 1) {
        const deleteArray = this.store.splice(index, deleteCount)
        deleteArray.forEach(item => {
            if (item.blob) {
                URL.revokeObjectURL(item.url)
            }
        })
        this.eventSource.emit('cropStoreChange', this.store)
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
