import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export function backupDatabase() {
  try {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'yanyon.db')
    
    if (!fs.existsSync(dbPath)) return

    // Common Google Drive paths on Windows
    const envUserProfile = process.env.USERPROFILE || ''
    const possiblePaths = [
      'G:\\My Drive',
      path.join(envUserProfile, 'Google Drive'),
      // Add more if needed based on typical configurations
    ]

    let drivePath: string | null = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        drivePath = p
        break
      }
    }

    if (drivePath) {
      const backupDir = path.join(drivePath, 'YanYon Backup')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      
      const destPath = path.join(backupDir, 'yanyon.db')
      fs.copyFileSync(dbPath, destPath)
      console.log(`Database successfully backed up to ${destPath}`)
    } else {
      console.log('Google Drive folder not found for auto-backup.')
    }
  } catch (err) {
    console.error('Failed to backup database:', err)
  }
}
