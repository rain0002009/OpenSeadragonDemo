import React, { FC } from 'react'
import { Button, Slider } from 'antd'
import { CirclePicker } from 'react-color'
import { useReactive } from 'ahooks'
import { DrawData } from './draw/Draw'

interface Props {
    onChange?: (data: DrawData) => void
}

const TYPES = [
    { type: 'circle', label: '圆形' },
    { type: 'rect', label: '矩形' },
    { type: 'line', label: '直线' },
    { type: 'free', label: '自由' },
    { type: 'text', label: '文字' }
]

const MarkPanel: FC<Props> = ({ onChange }) => {
    const innerData = useReactive<DrawData>({
        strokeWeight: 10,
        opacity: 1,
        color: '#3f51b5',
        type: void 0
    })
    return <div className="w-230px space-y-4">
        <div>
            <p>画笔粗细：{ innerData.strokeWeight }</p>
            <Slider
                min={ 10 }
                max={ 100 }
                onChange={ (e) => {
                    innerData.strokeWeight = e
                } }
            />
        </div>
        <div>
            <p>透明度：{ innerData.opacity }</p>
            <Slider
                min={ 0.1 }
                max={ 1 }
                step={ 0.1 }
                defaultValue={ 1 }
                onChange={ (e) => {
                    innerData.opacity = e
                } }
            />
        </div>
        <div>
            <p>颜色：<span
                className="inline-block w-15px h-15px rounded-100px"
                style={ { backgroundColor: innerData.color as string, verticalAlign: -3 } }
            /></p>
            <CirclePicker
                onChange={ (color) => {
                    innerData.color = color.hex
                } }
            />
        </div>
        <div>
            <p>类型：</p>
            <div className="grid grid-cols-3 gap-1">
                {
                    TYPES.map(({ type, label }) => {
                        return <Button
                            key={ type }
                            onClick={ () => {
                                innerData.type = type
                                onChange?.(innerData)
                            } }
                        >
                            { label }
                        </Button>
                    })
                }
            </div>
        </div>
    </div>
}

export default MarkPanel
