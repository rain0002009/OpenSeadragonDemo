import { FC, useEffect } from 'react'
import { Button, Input, Menu, Popover } from 'antd'
import MarkPanel from './MarkPanel'
import { useCreation, useReactive } from 'ahooks'
import P5Overlay from './P5Overlay'
import CropPanel, { CropListItem } from './CropPanel'

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

export interface ControlPanelProps {
    overlay: P5Overlay
    beforeDeleteCrop?: (deleteCrop: CropListItem, index: number) => Promise<boolean> | boolean
}

const ControlPanel: FC<ControlPanelProps> = ({ overlay, beforeDeleteCrop }) => {
    const beforeDelete = useCreation((() => {
        return beforeDeleteCrop ? beforeDeleteCrop : () => true
    }), [beforeDeleteCrop])
    const { sk, viewer, drawMarker } = overlay
    const { drawOptions } = drawMarker
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
                    >取消</Button>
                    <Button
                        type="primary"
                        className="ml-auto"
                        onClick={ () => {
                            innerData.inputVisibility = false
                            drawOptions.isInputOk = true
                            drawMarker.store.push({
                                ...(drawOptions as any),
                                path: [[drawOptions!.startPointTransformed!.x, drawOptions!.startPointTransformed!.y]],
                                text: innerData.inputText
                            })
                            sk.noLoop()
                            viewer.setMouseNavEnabled(true)
                            innerData.inputText = ''
                            drawOptions.enable = false
                        } }
                    >确认</Button>
                </div>
            </div> }
        >
            <div id="inputWrap" />
        </Popover>
        <div className="absolute right-0 w-100px">
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
                <Item
                    key="mark"
                    style={ { paddingLeft: 24 } }
                >
                    <div
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center"
                    >
                        <Popover
                            className="pl-24px"
                            placement="leftTop"
                            title={ <p>标注</p> }
                            content={
                                <MarkPanel
                                    onChange={ (data) => {
                                        innerData.markVisibility = false
                                        drawMarker.setDrawOptions(data)
                                        drawMarker.startDraw(() => {
                                            innerData.inputVisibility = true
                                        })
                                    } }
                                />
                            }
                            trigger="click"
                            visible={ innerData.markVisibility }
                        >
                            <a
                                onClick={ () => {
                                    innerData.markVisibility = !innerData.markVisibility
                                    innerData.cropVisibility = false
                                } }
                            >
                                标注
                            </a>
                        </Popover>
                    </div>
                </Item>

                <Item
                    key="crop"
                    style={ { paddingLeft: 24 } }
                >
                    <div
                        className="absolute top-0 right-0 bottom-0 left-0 flex items-center"
                    >
                        <Popover
                            className="pl-24px"
                            placement="leftTop"
                            style={ { zIndex: 1000 } }
                            title={ <>
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={ () => {
                                        overlay.crop.startCrop()
                                        innerData.cropVisibility = false
                                    } }
                                >开始</Button>
                                <Button
                                    type="primary"
                                    size="small"
                                    danger
                                    className="ml-4"
                                    onClick={ () => {
                                        innerData.cropVisibility = false
                                        overlay.crop.cancelCrop()
                                    } }
                                >取消</Button>
                            </> }
                            content={ <CropPanel
                                value={ innerData.cropList }
                                onDelete={ async (index) => {
                                    if (await beforeDelete(innerData.cropList[index], index)) {
                                        overlay.crop.deleteCropStore(index)
                                    }
                                } }
                            /> }
                            visible={ innerData.cropVisibility }
                        >
                            <a
                                onClick={ () => {
                                    innerData.markVisibility = false
                                    innerData.cropVisibility = !innerData.cropVisibility
                                } }
                            >
                                裁剪
                            </a>
                        </Popover>
                    </div>
                </Item>
            </Menu>
        </div>
    </>
}

export default ControlPanel
