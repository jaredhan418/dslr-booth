import { useState, useEffect } from 'react'
import { Camera, Settings, Image as ImageIcon, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState<string>('none')
  const [statusMessage, setStatusMessage] = useState('未连接')
  const [gphoto2Available, setGphoto2Available] = useState(false)
  const [wslAvailable, setWslAvailable] = useState(false)
  const [useGPhoto2, setUseGPhoto2] = useState(false)

  // Check gphoto2-wsl availability on mount
  useEffect(() => {
    checkGPhoto2Availability()
  }, [])

  const checkGPhoto2Availability = async () => {
    try {
      // Check if electronAPI is available (preload script loaded)
      if (!window.electronAPI || !window.electronAPI.checkGPhoto2WSL) {
        console.warn('electronAPI not available - preload script may not have loaded')
        setStatusMessage('Electron API 未加载')
        return
      }

      const result = await window.electronAPI.checkGPhoto2WSL()
      if (result.success) {
        setGphoto2Available(result.available)
        setWslAvailable(result.wslAvailable)
        
        if (result.available) {
          setStatusMessage('gphoto2 + WSL2 可用 ✓')
        } else if (result.wslAvailable) {
          setStatusMessage('WSL2 可用，但 gphoto2 未安装')
        } else {
          setStatusMessage('WSL2 不可用')
        }
      }
    } catch (error) {
      console.error('检查 gphoto2 失败:', error)
      setStatusMessage('检查 gphoto2 失败')
    }
  }

  const connectCamera = async () => {
    if (!window.electronAPI || !window.electronAPI.connectCamera) {
      setStatusMessage('Electron API 未加载')
      return
    }

    setStatusMessage('正在连接相机...')
    
    try {
      const result = await window.electronAPI.connectCamera({
        preferGPhoto2: useGPhoto2
      })
      
      if (result.success) {
        setConnected(true)
        setConnectionMode(result.mode)
        setStatusMessage(result.message)
      } else {
        setStatusMessage(result.message)
      }
    } catch (error: any) {
      setStatusMessage('连接失败: ' + error.message)
    }
  }

  const capturePhoto = async () => {
    if (!window.electronAPI || !window.electronAPI.capturePhoto) {
      setStatusMessage('Electron API 未加载')
      return
    }

    if (!connected) {
      setStatusMessage('请先连接相机')
      return
    }

    setStatusMessage('正在拍照...')
    
    try {
      const result = await window.electronAPI.capturePhoto()
      
      if (result.success) {
        setStatusMessage('拍照成功！')
      } else {
        setStatusMessage(result.message)
      }
    } catch (error: any) {
      setStatusMessage('拍照失败: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">DSLR Photo Booth</h1>
                <p className="text-sm text-gray-600">v2.0 - Electron 40 + React + gphoto2</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* gphoto2 Toggle */}
              {gphoto2Available && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={useGPhoto2}
                    onChange={(e) => setUseGPhoto2(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>使用 gphoto2</span>
                </label>
              )}
              
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                connected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {connectionMode !== 'none' ? `${connectionMode} 模式` : statusMessage}
              </div>
              
              <Button
                onClick={connectCamera}
                disabled={connected}
                variant={connected ? "secondary" : "default"}
              >
                {connected ? '已连接' : '连接相机'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="col-span-2 bg-white rounded-lg shadow-xl p-6">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p>相机预览区域</p>
                <p className="text-sm mt-2">连接相机后显示实时预览</p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={capturePhoto}
                disabled={!connected}
                size="lg"
                className="flex-1"
              >
                <Camera className="w-5 h-5 mr-2" />
                拍照
              </Button>
              
              <Button
                disabled={!connected}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                ⏱️ 倒计时拍照
              </Button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <ImageIcon className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="gallery">
                  <Printer className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-4">
                <h3 className="font-semibold text-lg">相机设置</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="connection-mode">连接模式</label>
                  <p id="connection-mode" className="text-sm text-gray-600">
                    {gphoto2Available ? (
                      <span className="text-green-600">✓ gphoto2 可用</span>
                    ) : wslAvailable ? (
                      <span className="text-yellow-600">WSL2 可用，需安装 gphoto2</span>
                    ) : (
                      <span className="text-gray-600">仅支持基础模式</span>
                    )}
                  </p>
                </div>
                
                {gphoto2Available && connectionMode === 'gphoto2-wsl' && (
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      🎉 gphoto2 连接成功！
                    </p>
                    <p className="text-xs text-green-600">
                      现在可以使用完整的相机控制功能
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="countdown-input">倒计时</label>
                  <Input id="countdown-input" type="number" defaultValue="3" min="1" max="10" />
                </div>
              </TabsContent>
              
              <TabsContent value="filters">
                <h3 className="font-semibold text-lg mb-4">图片滤镜</h3>
                <p className="text-sm text-gray-600">
                  滤镜功能开发中...
                </p>
              </TabsContent>
              
              <TabsContent value="gallery">
                <h3 className="font-semibold text-lg mb-4">照片相册</h3>
                <p className="text-sm text-gray-600">
                  相册功能开发中...
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-white rounded-lg shadow-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {statusMessage}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ImageIcon className="w-4 h-4 mr-2" />
                保存
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                打印
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
