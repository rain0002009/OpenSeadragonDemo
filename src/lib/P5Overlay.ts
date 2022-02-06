import P5 from 'p5'
import type OpenSeaDragon from 'openseadragon'
import './index.less'
import { render } from 'react-dom'
import ControlPanel, { ControlPanelProps } from './ControlPanel'
import { createElement, ComponentType } from 'react'
import { Point } from 'openseadragon'
import _ from 'lodash'
import { Crop } from './Crop'

type ShapeStyle = 'rect' | 'circle' | 'line' | 'free' | 'text'

export interface MarkerItem {
    type?: ShapeStyle | null | string
    strokeWeight?: number
    color?: string
    opacity?: number
    path?: [number, number][]
    text?: string
}

interface DrawOptions extends MarkerItem {
    startPoint?: Point | null
    endPoint?: Point | null
    isInputOk?: boolean
    startPointTransformed?: Point | null
    freePath?: [number, number][]
    enable?: boolean
}

interface Options {
    markerStore?: MarkerItem[]
    ControlPanel?: ComponentType<ControlPanelProps>
    onCropFinish?: (data: { blob: Blob }) => void
}

export default class P5Overlay {
    public viewer: OpenSeaDragon.Viewer
    private readonly wrapDiv: HTMLDivElement
    public sk!: P5
    public drawMethod: {
        startDraw: (openTextModal?: () => void) => void
        draw (sk: P5, drawOptions: DrawOptions, mode: 1 | 2, zoom: number, image?: OpenSeadragon.TiledImage): void
        drawOptions: DrawOptions
    }
    public markerStore: MarkerItem[]
    private readonly ControlPanel!: ComponentType<ControlPanelProps>
    public crop!: Crop
    public onCropFinish: Options['onCropFinish']

    constructor (viewer: OpenSeaDragon.Viewer, options: Options) {
        this.onCropFinish = options.onCropFinish
        this.ControlPanel = options.ControlPanel || ControlPanel
        this.markerStore = options.markerStore || []
        this.viewer = viewer
        this.wrapDiv = document.createElement('div')
        this.wrapDiv.classList.add('p5-wrap')
        this.viewer.canvas.append(this.wrapDiv)
        this.drawMethod = {
            drawOptions: {},
            startDraw: (openTextModal) => {
                this.crop.cancelCrop()
                this.drawMethod.drawOptions.enable = true
                viewer.setMouseNavEnabled(false)
                this.drawMethod.drawOptions.startPoint = null
                this.drawMethod.drawOptions.endPoint = null
                this.drawMethod.drawOptions.startPointTransformed = null
                this.drawMethod.drawOptions.freePath = []
                this.sk.loop()

                this.sk.mousePressed = () => {
                    this.drawMethod.drawOptions!.startPoint = new Point(this.sk.mouseX, this.sk.mouseY)
                    if (this.drawMethod.drawOptions?.type === 'text') {
                        const inputWrap = this.sk.select('#inputWrap')
                        if (inputWrap) {
                            inputWrap?.position(this.drawMethod.drawOptions.startPoint.x, this.drawMethod.drawOptions.startPoint.y)
                            openTextModal?.()
                        } else {
                            console.error('inputWrap is null')
                        }
                    }
                }
                this.sk.mouseReleased = () => {
                    if (this.drawMethod.drawOptions?.type === 'text') {
                        this.sk.mousePressed = _.noop
                        return false
                    }
                    this.drawMethod.drawOptions.enable = false
                    this.sk.noLoop()
                    viewer.setMouseNavEnabled(true)
                    this.sk.mousePressed = _.noop
                    const markItem = {
                        ...this.drawMethod.drawOptions!
                    }
                    switch (this.drawMethod.drawOptions?.type) {
                        case 'circle':
                        case 'rect':
                        case 'line':
                            markItem.path = [[this.drawMethod.drawOptions.startPointTransformed!.x, this.drawMethod.drawOptions!.startPointTransformed!.y], [this.drawMethod.drawOptions!.endPoint!.x, this.drawMethod.drawOptions!.endPoint!.y]]
                            break
                        case 'free':
                            markItem.path = this.drawMethod.drawOptions!.freePath
                            break
                    }
                    this.markerStore.push(markItem)
                    this.drawMethod.drawOptions = {}
                    this.sk.mouseReleased = _.noop
                }
            },
            draw: (sk, drawOptions, mode, zoom, image) => {
                const canDraw = mode === 1 ? drawOptions.enable && sk.mouseIsPressed && drawOptions && drawOptions.startPoint && sk.mouseButton === sk.LEFT : true
                if (canDraw) {
                    sk.push()
                    const color = sk.color(drawOptions!.color!)
                    color.setAlpha(sk.map(drawOptions!.opacity!, 0, 1, 0, 255))
                    drawOptions.startPointTransformed = image?.viewerElementToImageCoordinates(drawOptions.startPoint!)
                    drawOptions.endPoint = image?.viewerElementToImageCoordinates(new Point(sk.mouseX, sk.mouseY))
                    let startPoint: Point
                    let endPoint: Point
                    const strokeWeight = drawOptions!.strokeWeight! * viewer.viewport.getMinZoom() / viewer.viewport.getHomeZoom()
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
        }
        this.sk = new P5((sk) => {
            sk.setup = () => {
                const viewerSize = this.viewer.viewport.getContainerSize()
                sk.createCanvas(viewerSize.x, viewerSize.y)
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
                        if (!this.crop.cropInfo.enable) {
                            sk.push()
                            sk.translate(p.x, p.y)
                            sk.scale(zoom, zoom)
                            this.drawMarkStore(viewportZoom)
                            this.drawMethod.draw(sk, this.drawMethod.drawOptions, 1, viewportZoom, image)
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

    private addControl () {
        const wrap = document.createElement('div')
        this.viewer.container.append(wrap)
        setTimeout(() => {
            render(createElement(this.ControlPanel, { overlay: this }, null), wrap)
        }, 0)
    }

    public setMarkStore (markStore: MarkerItem[]) {
        this.markerStore = markStore
        this.redraw()
    }

    private drawMarkStore (zoom: number) {
        this.markerStore.forEach(item => {
            this.drawMethod.draw(this.sk, item, 2, zoom,)
        })
    }
}
