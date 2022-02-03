import { FC } from 'react'
import { Button, Input, Menu, Popover } from 'antd'
import MarkPanel from './MarkPanel'
import { useReactive } from 'ahooks'
import P5Overlay from './P5Overlay'

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
                            drawMethod.drawOptions.enable = false
                        } }
                    >取消</Button>
                    <Button
                        type="primary"
                        className="ml-auto"
                        onClick={ () => {
                            innerData.inputVisibility = false
                            drawMethod.drawOptions.isInputOk = true
                            markerStore.push({
                                ...(drawMethod.drawOptions as any),
                                path: [[drawMethod.drawOptions!.startPointTransformed!.x, drawMethod.drawOptions!.startPointTransformed!.y]],
                                text: innerData.inputText
                            })
                            sk.noLoop()
                            viewer.setMouseNavEnabled(true)
                            innerData.inputText = ''
                            drawMethod.drawOptions.enable = false
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
                            drawMethod.drawOptions = data
                            drawMethod.startDraw(() => {
                                innerData.inputVisibility = true
                            })
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
