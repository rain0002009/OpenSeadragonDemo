import React, { FC } from 'react'
import { Button, Slider } from 'antd'
import { CirclePicker } from 'react-color'
import { useReactive } from 'ahooks'
import { MarkerItem } from './P5Overlay'

interface Props {
    onChange?: (data: MarkerItem) => void
}

const TYPES = [
    { type: 'circle', label: '圆形' },
    { type: 'rect', label: '矩形' },
    { type: 'line', label: '直线' },
    { type: 'free', label: '自由' },
    { type: 'text', label: '文字' }
]

const MarkPanel: FC<Props> = ({ onChange }) => {
    const innerData = useReactive<MarkerItem>({
        strokeWeight: 10,
        opacity: 1,
        color: '#3f51b5',
        type: null
    })
    return <div className="w-230px space-y-4">
        <div>
            <p>画笔粗细：</p>
            <Slider
                min={ 10 }
                max={ 100 }
                onChange={ (e) => {
                    innerData.strokeWeight = e
                } }
            />
        </div>
        <div>
            <p>透明度：</p>
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
            <p>颜色：</p>
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
