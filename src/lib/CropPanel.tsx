import React, { FC } from 'react'
import VirtualList from 'rc-virtual-list'
import { Image } from 'antd'

export interface CropListItem {
    url: string
    blob?: Blob
    key: string | number
}

interface Props {
    value?: CropListItem[]
    onCropCancel?: () => void
}

const CropPanel: FC<Props> = ({ value }) => {
    return <VirtualList
        className="w-200px"
        data={ value || [] }
        itemKey="key"
        itemHeight={ 116 }
        height={ (value?.length || 0) > 3 ? 3 * 116 : void 0 }
    >
        { (data) => {
            return <div className="py-2 w-200px">
                <Image
                    width={ 200 }
                    height={ 100 }
                    src={ data.url }
                    preview={ { maskStyle: { zIndex: 1100 }, wrapStyle: { zIndex: 1100 } } }
                />
            </div>
        } }
    </VirtualList>
}

export default CropPanel
