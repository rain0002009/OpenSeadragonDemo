import P5 from 'p5'
import type OpenSeaDragon from 'openseadragon'
import './index.less'
import { EventEmitter } from 'events'
import { Crop } from './Crop'
import { DrawMark } from './DrawMark'

type ShapeStyle = 'rect' | 'circle' | 'line' | 'free' | 'text'

export interface MarkerItem {
    type?: ShapeStyle | null | string
    strokeWeight?: number
    color?: string
    opacity?: number
    path?: [number, number][]
    text?: string
}

export default class P5Overlay {
    public viewer: OpenSeaDragon.Viewer
    private readonly wrapDiv: HTMLDivElement
    public sk!: P5
    public crop!: Crop
    public overlayEvent: EventEmitter
    public drawMarker!: DrawMark

    constructor (viewer: OpenSeaDragon.Viewer) {
        this.overlayEvent = new EventEmitter()
        this.viewer = viewer
        this.wrapDiv = document.createElement('div')
        this.wrapDiv.classList.add('p5-wrap')
        this.viewer.canvas.append(this.wrapDiv)
        this.sk = new P5((sk) => {
            this.sk = sk
            this.drawMarker = new DrawMark(this)
            sk.setup = () => {
                const viewerSize = this.viewer.viewport.getContainerSize()
                sk.createCanvas(viewerSize.x, viewerSize.y)
                sk.noLoop()
            }
            sk.draw = () => {
                let viewportZoom = this.viewer.viewport.getZoom(true)
                sk.clear()
                for (let i = 0, count = this.viewer.world.getItemCount(); i < count; i++) {
                    let image = this.viewer.world.getItemAt(i)
                    if (image) {
                        let zoom = image.viewportToImageZoom(viewportZoom)
                        let vp = image.imageToViewportCoordinates(0, 0, true)
                        let p = this.viewer.viewport.pixelFromPoint(vp, true)
                        if (!this.crop.cropInfo.enable) {
                            sk.push()
                            sk.translate(p.x, p.y)
                            sk.scale(zoom, zoom)
                            this.drawMarker.drawMarkStore(viewportZoom)
                            this.drawMarker.draw(sk, this.drawMarker.drawOptions, 1, viewportZoom, image)
                            sk.pop()
                        }
                        this.crop.doCrop()
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
}
