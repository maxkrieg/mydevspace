import { spawnSync } from 'child_process'
import fs from 'fs'

export const validateDockerComposeDir = (dir: string): { success: boolean; message?: string } => {
  if (!fs.existsSync(dir)) {
    return {
      success: false,
      message: 'Directory does not exist'
    }
  }

  process.chdir(dir)
  const result = spawnSync('docker-compose', ['ps'])
  if (result.status !== 0) {
    return {
      success: false,
      message: 'No docker-compose file found'
    }
  }

  return { success: true }
}
