import { FC, useEffect } from 'react'
import { Button, Input, Popover } from 'antd'
import MarkPanel from './MarkPanel'
import { useCreation, useReactive } from 'ahooks'
import P5Overlay from './P5Overlay'
import CropPanel, { CropListItem } from './CropPanel'
import { Draw } from './draw/Draw'

export interface ControlPanelProps {
    overlay: P5Overlay
    beforeDeleteCrop?: (deleteCrop: CropListItem, index: number) => Promise<boolean> | boolean
}

const ControlPanel: FC<ControlPanelProps> = ({ overlay, beforeDeleteCrop }) => {
    const beforeDelete = useCreation((() => {
        return beforeDeleteCrop ? beforeDeleteCrop : () => true
    }), [beforeDeleteCrop])
    const { sk, viewer, drawMarker } = overlay
    const drawOptions = Draw.drawData
    const innerData = useReactive({
        markVisibility: false,
        inputVisibility: false,
        cropVisibility: false,
        cropList: [] as CropListItem[],
        inputText: '',
    })

    useEffect(() => {
        const handle = (data: any) => {
            innerData.cropList = data
        }
        overlay.overlayEvent.on('cropStoreChange', handle)
        return () => {
            overlay.overlayEvent.off('cropStoreChange', handle)
        }
    }, [overlay])

    if (!sk) return null

    return <>
        { overlay?.crop?.holder }
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
                            drawOptions.enable = false
                        } }
                    >??????</Button>
                    <Button
                        type="primary"
                        className="ml-auto"
                        onClick={ () => {
                            innerData.inputVisibility = false
                            drawOptions.isInputOk = true
                            Draw.store.push({
                                ...(drawOptions as any),
                                path: [[drawOptions!.startPointTransformed!.x, drawOptions!.startPointTransformed!.y]],
                                text: innerData.inputText
                            })
                            sk.noLoop()
                            viewer.setMouseNavEnabled(true)
                            innerData.inputText = ''
                            drawOptions.enable = false
                        } }
                    >??????</Button>
                </div>
            </div> }
        >
            <div id="inputWrap" />
        </Popover>
        <div className="absolute right-0 w-100px h-200px">
            <div
                className="border border-color-hex-dedede shadow px-2 py-3 space-y-2 bg-white"
            >
                <Button block onClick={ () => {viewer.setFullScreen(true)} }>??????</Button>
                <Button block onClick={ () => {viewer.viewport.goHome(true)} }>??????</Button>
                <Popover
                    className=""
                    placement="leftTop"
                    title={ <p>??????</p> }
                    content={
                        <MarkPanel
                            onChange={ (data) => {
                                innerData.markVisibility = false
                                drawMarker?.setDrawOptions(data)
                                drawMarker?.startDraw(() => {
                                    innerData.inputVisibility = true
                                })
                            } }
                        />
                    }
                    trigger="click"
                    visible={ innerData.markVisibility }
                >
                    <Button
                        block
                        onClick={ () => {
                            innerData.markVisibility = !innerData.markVisibility
                            innerData.cropVisibility = false
                        } }
                    >
                        ??????
                    </Button>
                </Popover>
                <Popover
                    className=""
                    placement="leftTop"
                    style={ { zIndex: 1000 } }
                    title={ <>
                        <Button
                            type="primary"
                            size="small"
                            onClick={ () => {
                                overlay.crop?.startCrop()
                                innerData.cropVisibility = false
                            } }
                        >??????</Button>
                        <Button
                            type="primary"
                            size="small"
                            danger
                            className="ml-4"
                            onClick={ () => {
                                innerData.cropVisibility = false
                                overlay.crop?.cancelCrop()
                            } }
                        >??????</Button>
                    </> }
                    content={ <CropPanel
                        value={ innerData.cropList }
                        onDelete={ async (index) => {
                            if (await beforeDelete(innerData.cropList[index], index)) {
                                overlay.crop?.deleteCropStore(index)
                            }
                        } }
                    /> }
                    visible={ innerData.cropVisibility }
                >
                    <Button
                        block
                        onClick={ () => {
                            innerData.markVisibility = false
                            innerData.cropVisibility = !innerData.cropVisibility
                        } }
                    >
                        ??????
                    </Button>
                </Popover>
            </div>
        </div>
    </>
}

export default ControlPanel
