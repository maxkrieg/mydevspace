let dockerComposeDir = ''

export const getDockerComposeDir = (): string => dockerComposeDir

export const setDockerComposeDir = (dir: string): void => {
  dockerComposeDir = dir
}
