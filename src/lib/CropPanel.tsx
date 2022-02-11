import React, { FC } from 'react'
import VirtualList from 'rc-virtual-list'
import { Button, Image, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export interface CropListItem {
    url: string
    blob?: Blob
    key: string | number
}

interface Props {
    value?: CropListItem[]
    onCropCancel?: () => void
    onDelete?: (index: number) => void
}

const CropPanel: FC<Props> = ({ value, onDelete }) => {
    if (value?.length === 0) {
        return <Empty className="w-240px !m-0" />
    }
    return <VirtualList
        className="w-240px"
        data={ value || [] }
        itemKey="key"
        itemHeight={ 116 }
        height={ (value?.length || 0) > 3 ? 3 * 116 : void 0 }
    >
        { (data, index) => {
            return <div className="py-2 flex">
                <Image
                    width={ 200 }
                    height={ 100 }
                    src={ data.url }
                    preview={ { maskStyle: { zIndex: 1100 }, wrapStyle: { zIndex: 1100 } } }
                />
                <Button
                    className="ml-auto"
                    danger
                    type="primary"
                    shape="circle"
                    icon={ <DeleteOutlined /> }
                    onClick={ () => {
                        onDelete?.(index)
                    } }
                />
            </div>
        } }
    </VirtualList>
}

export default CropPanel
