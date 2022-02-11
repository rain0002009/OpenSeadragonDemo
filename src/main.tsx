import React from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import './index.css'
import App from './App'
import 'virtual:windi.css'

ReactDOM.render(
    <React.StrictMode>
        <ConfigProvider locale={ zhCN }><App /></ConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
