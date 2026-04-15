import { ElectronAPI as ToolkitAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ToolkitAPI
  }
}
