import { FC, useRef } from 'react'
import { Button, Input, Menu, Popover } from 'antd'
import MarkPanel from './MarkPanel'
import { useMemoizedFn, useReactive } from 'ahooks'
import { Point } from 'openseadragon'
import P5Overlay, { MarkerItem } from './P5Overlay'
import _ from 'lodash'

const { Item } = Menu

const CONTROL_TYPES = [
    {
        type: 'fullscreen',
        label: '全屏',
    },
    {
        type: 'home',
        label: '主页',
    }
]

const ControlPanel: FC<P5Overlay> = ({ viewer, sk, drawMethod, markerStore }) => {
    const innerData = useReactive({
        markVisibility: false,
        inputVisibility: false,
        inputText: '',
    })
    const markOptions = useRef<MarkerItem | null>(null)
    const isInputOk = useRef(false)
    const points = useRef({
        startPointTransformed: null as Point | null,
    })

    const draw = useMemoizedFn(() => {
        viewer.setMouseNavEnabled(false)
        let startPoint: Point | null = null
        let endPoint: Point | null = null
        points.current.startPointTransformed = null
        const freePath = [] as [number, number][]
        sk.loop()

        sk.mousePressed = () => {
            // setTimeout(() => {
            //     viewer.setMouseNavEnabled(true)
            // }, 0)
            startPoint = new Point(sk.mouseX, sk.mouseY)
            if (markOptions.current?.type === 'text') {
                const inputWrap = sk.select('#inputWrap')
                if (inputWrap) {
                    inputWrap?.position(startPoint.x, startPoint.y)
                    innerData.inputVisibility = true
                } else {
                    console.error('inputWrap is null')
                }
            }
        }
        sk.mouseReleased = () => {
            if (markOptions.current?.type === 'text') {
                sk.mousePressed = _.noop
                return false
            }
            sk.noLoop()
            viewer.setMouseNavEnabled(true)
            sk.mousePressed = _.noop
            drawMethod.draw = _.noop
            const markItem = {
                ...markOptions.current!
            }
            switch (markOptions.current?.type) {
                case 'circle':
                case 'rect':
                case 'line':
                    markItem.path = [[points.current.startPointTransformed!.x, points.current.startPointTransformed!.y], [endPoint!.x, endPoint!.y]]
                    break
                case 'free':
                    markItem.path = freePath
                    break
            }
            markerStore.push(markItem)
            markOptions.current = null
            sk.mouseReleased = _.noop
        }
        drawMethod.draw = (image) => {
            if (sk.mouseIsPressed && startPoint) {
                if (sk.mouseButton === sk.LEFT) {
                    sk.push()
                    const color = sk.color(markOptions.current!.color!)
                    color.setAlpha(sk.map(markOptions.current!.opacity!, 0, 1, 0, 255))
                    points.current.startPointTransformed = image.viewerElementToImageCoordinates(startPoint)
                    endPoint = image.viewerElementToImageCoordinates(new Point(sk.mouseX, sk.mouseY))
                    if (['circle', 'rect', 'line', 'free'].includes(markOptions.current!.type!)) {
                        sk.noFill()
                        sk.strokeWeight(markOptions.current?.strokeWeight || 1)
                        sk.stroke(color)
                    }
                    switch (markOptions.current?.type) {
                        case 'circle':
                            sk.circle(points.current.startPointTransformed.x, points.current.startPointTransformed.y, points.current.startPointTransformed.distanceTo(endPoint) * 2)
                            break
                        case 'rect':
                            sk.quad(points.current.startPointTransformed.x, points.current.startPointTransformed.y, endPoint.x, points.current.startPointTransformed.y, endPoint.x, endPoint.y, points.current.startPointTransformed.x, endPoint.y)
                            break
                        case 'line':
                            sk.line(points.current.startPointTransformed.x, points.current.startPointTransformed.y, endPoint.x, endPoint.y)
                            break
                        case 'free':
                            if (freePath.length === 0) {
                                freePath.push([points.current.startPointTransformed.x, points.current.startPointTransformed.y])
                            }
                            if ((new Point(..._.last(freePath)!).distanceTo(endPoint)) > 20) {
                                freePath.push([endPoint.x, endPoint.y])
                            }
                            freePath.forEach((point, pointIndex) => {
                                const nextPoint = freePath[pointIndex + 1]
                                if (nextPoint) {
                                    sk.line(...point, ...nextPoint)
                                }
                            })
                            break
                        case 'text':
                            if (isInputOk.current) {
                                sk.textSize(markOptions.current!.strokeWeight! * 10)
                                sk.fill(color)
                                sk.text(innerData.inputText, points.current.startPointTransformed.x, points.current.startPointTransformed.y)
                            }
                            break
                    }
                    sk.pop()
                }
            }
        }
    })

    if (!sk) return null

    return <div className="ml-auto w-100px">
        <Popover
            zIndex={ 10 }
            visible={ innerData.inputVisibility }
            content={ <div className="space-y-4 w-300px">
                <Input
                    autoFocus
                    value={ innerData.inputText }
                    onChange={ (event) => {
                        innerData.inputText = event.target.value
                    } }
                />
                <div className="flex">
                    <Button
                        onClick={ () => {
                            innerData.inputVisibility = false
                            innerData.inputText = ''
                            sk.noLoop()
                            viewer.setMouseNavEnabled(true)
                        } }
                    >取消</Button>
                    <Button
                        type="primary"
                        className="ml-auto"
                        onClick={ () => {
                            innerData.inputVisibility = false
                            isInputOk.current = true
                            markerStore.push({
                                ...markOptions.current!,
                                path: [[points.current.startPointTransformed!.x, points.current.startPointTransformed!.y]],
                                text: innerData.inputText
                            })
                            sk.noLoop()
                            viewer.setMouseNavEnabled(true)
                            innerData.inputText = ''
                        } }
                    >确认</Button>
                </div>
            </div> }
        >
            <div id="inputWrap" />
        </Popover>
        <Menu
            mode="inline"
            className="border border-color-[#dedede] shadow"
        >
            {
                CONTROL_TYPES.map(({ type, label }) => {
                    return <Item
                        key={ type }
                        onClick={ ({ key }) => {
                            switch (key) {
                                case 'fullscreen':
                                    viewer.setFullScreen(true)
                                    break
                                case 'home':
                                    viewer.viewport.goHome(true)
                                    break
                            }
                        } }
                    >
                        { label }
                    </Item>
                })
            }
            <Popover
                placement="leftTop"
                title={ <p>标注</p> }
                content={
                    <MarkPanel
                        onChange={ (data) => {
                            innerData.markVisibility = false
                            markOptions.current = data
                            draw()
                        } }
                    />
                }
                trigger="click"
                visible={ innerData.markVisibility }
            >
                <Item
                    key="mark"
                    style={ { paddingLeft: 24 } }
                    onClick={ () => {
                        innerData.markVisibility = !innerData.markVisibility
                    } }
                >
                    标注
                </Item>
            </Popover>
        </Menu>
    </div>
}

export default ControlPanel
