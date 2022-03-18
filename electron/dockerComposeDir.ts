import { homedir } from 'os'
import fs from 'fs'

// let dockerComposeDir = ''

export const getDockerComposeDir = (): string => {
  if (fs.existsSync(`${homedir()}/.docker-compose-dir`)) {
    const dockerComposeDir = fs.readFileSync(`${homedir()}/.docker-compose-dir`, 'utf8')
    return dockerComposeDir
  }
  console.log('file not found')
  return ''
}

export const setDockerComposeDir = (dir: string): void => {
  fs.writeFileSync(`${homedir()}/.docker-compose-dir`, dir)
  // dockerComposeDir = dir
}
