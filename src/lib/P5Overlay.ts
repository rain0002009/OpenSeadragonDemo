import P5 from 'p5'
import type OpenSeaDragon from 'openseadragon'
import './index.less'
import { render } from 'react-dom'
import ControlPanel from './ControlPanel'
import { createElement } from 'react'
import { Point } from 'openseadragon'

type ShapeStyle = 'rect' | 'circle' | 'line' | 'free' | 'text'

export interface MarkerItem {
    type: ShapeStyle | null | string
    strokeWeight?: number
    color?: string
    opacity?: number
    path?: [number, number][]
    text?: string
}

interface Options {
    markerStore?: MarkerItem[]
}

export default class P5Overlay {
    public viewer: OpenSeaDragon.Viewer
    private readonly wrapDiv: HTMLDivElement
    public sk!: P5
    public drawMethod: { draw (image: OpenSeadragon.TiledImage): void }
    public markerStore: MarkerItem[]

    constructor (viewer: OpenSeaDragon.Viewer, options: Options) {
        this.markerStore = options.markerStore || []
        this.viewer = viewer
        this.wrapDiv = document.createElement('div')
        this.wrapDiv.classList.add('p5-wrap')
        this.viewer.canvas.append(this.wrapDiv)
        this.drawMethod = {
            draw (image: OpenSeadragon.TiledImage) {}
        }
        this.sk = new P5((sk) => {
            sk.setup = () => {
                sk.createCanvas(this.viewer.container.clientWidth, this.viewer.container.clientHeight)
                sk.noLoop()
                this.addControl()
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
                        sk.translate(p.x, p.y)
                        sk.scale(zoom, zoom)
                        this.drawMarkStore()
                        this.drawMethod.draw(image)
                    }
                }
            }
        }, this.wrapDiv)
        this.viewer.addHandler('open', this.redraw.bind(this))
        this.viewer.addHandler('update-viewport', this.redraw.bind(this))
        this.viewer.addHandler('resize', this.resizeCanvas.bind(this))
    }

    private resizeCanvas () {
        this.sk?.resizeCanvas(this.viewer.container.clientWidth, this.viewer.container.clientHeight, false)
    }

    public redraw () {
        this.sk?.redraw()
    }

    private addControl () {
        const wrap = document.createElement('div')
        wrap.classList.add('flex', 'w-full', 'relative')
        this.viewer.container.append(wrap)
        render(createElement(ControlPanel, this, null), wrap)
    }

    public setMarkStore (markStore: MarkerItem[]) {
        this.markerStore = markStore
        this.redraw()
    }

    private drawMarkStore () {
        this.markerStore.forEach(item => {
            this.sk.push()
            const start = new Point(...item.path![0])
            let end = new Point(0, 0)
            const color = this.sk.color(item.color!)
            color.setAlpha(this.sk.map(item.opacity!, 0, 1, 0, 255))
            if (['rect', 'circle', 'line', 'free'].includes(item.type!)) {
                this.sk.noFill()
                this.sk.stroke(color)
                this.sk.strokeWeight(item.strokeWeight!)
                end = new Point(...item.path![1])
            }

            switch (item.type) {
                case 'circle':
                    this.sk.circle(start.x, start.y, start.distanceTo(end) * 2)
                    break
                case 'rect':
                    this.sk.quad(start.x, start.y, end.x, start.y, end.x, end.y, start.x, end.y)
                    break
                case 'line':
                    this.sk.line(start.x, start.y, end.x, end.y)
                    break
                case 'free':
                    item.path?.forEach((point, pointIndex) => {
                        const nextPoint = item.path![pointIndex + 1]
                        if (nextPoint) {
                            this.sk.line(...point, ...nextPoint)
                        }
                    })
                    break
                case 'text':
                    this.sk.textSize(item.strokeWeight! * 10)
                    this.sk.fill(color)
                    this.sk.text(item.text!, start.x, start.y)
                    break
            }
            this.sk.pop()
        })
    }
}
