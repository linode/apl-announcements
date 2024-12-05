import yaml from 'js-yaml'
export async function loadYAML(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8')
    return yaml.load(fileContent)
  } catch (error) {
    console.error(`Error reading or parsing YAML file: ${error.message}`)
    process.exit(1)
  }
}
