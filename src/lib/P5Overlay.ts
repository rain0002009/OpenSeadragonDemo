import P5 from 'p5'
import type OpenSeaDragon from 'openseadragon'
import './index.less'
import { EventEmitter } from 'events'
import { Crop } from './Crop'
import { DrawMark } from './DrawMark'
import { Draw, DRAW_MODE } from './draw/Draw'

export default class P5Overlay {
    public viewer: OpenSeaDragon.Viewer
    private readonly wrapDiv: HTMLDivElement
    public sk?: P5
    public crop?: Crop
    public overlayEvent: EventEmitter
    public drawMarker?: DrawMark
    private onReadyCallback: (() => void)[]

    constructor (viewer: OpenSeaDragon.Viewer) {
        this.onReadyCallback = []
        this.overlayEvent = new EventEmitter()
        this.viewer = viewer
        this.wrapDiv = document.createElement('div')
        this.wrapDiv.classList.add('p5-wrap')
        this.viewer.canvas.append(this.wrapDiv)
        new P5((sk) => {
            this.sk = sk
            this.drawMarker = new DrawMark(this)
            sk.setup = () => {
                const viewerSize = this.viewer.viewport.getContainerSize()
                sk.createCanvas(viewerSize.x, viewerSize.y)
                sk.noLoop()
                this.onReadyCallback.forEach((fn) => {
                    fn?.()
                })
            }
            sk.draw = () => {
                const viewportZoom = this.viewer.viewport.getZoom(true)
                sk.clear()
                for (let i = 0, count = this.viewer.world.getItemCount(); i < count; i++) {
                    let image = this.viewer.world.getItemAt(i)
                    if (image) {
                        const zoom = image.viewportToImageZoom(viewportZoom)
                        const vp = image.imageToViewportCoordinates(0, 0, true)
                        const p = this.viewer.viewport.pixelFromPoint(vp, true)
                        this.drawMarker?.setCanvasInfo({ zoom, image })
                        if (!this.crop?.cropInfo.enable) {
                            sk.push()
                            sk.translate(p.x, p.y)
                            sk.scale(zoom, zoom)
                            this.drawMarker?.drawMarkStore(zoom)
                            this.drawMarker?.draw(sk, Draw.drawData, DRAW_MODE.USER)
                            sk.pop()
                        }
                        this.crop?.doCrop()
                    }
                }
            }
        }, this.wrapDiv)
        this.crop = new Crop(this)
        this.viewer.addHandler('open', this.redraw.bind(this))
        this.viewer.addHandler('update-viewport', this.redraw.bind(this))
        this.viewer.addHandler('resize', this.resizeCanvas.bind(this))
    }

    private resizeCanvas () {
        const viewerSize = this.viewer.viewport.getContainerSize()
        this.sk?.resizeCanvas(viewerSize.x, viewerSize.y, false)
        this.crop?.resize()
    }

    public redraw () {
        this.sk?.redraw()
    }

    public onReady (fn: () => void) {
        this.onReadyCallback.push(fn)
    }

    destroy () {
        this.sk?.remove()
        this.sk = void 0
        this.crop = void 0
        this.drawMarker = void 0
        this.onReadyCallback = []
    }
}
