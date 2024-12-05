#!/usr/bin/env zx

import envalid, { str } from 'envalid'
import { loadYAML } from './common.mjs'

const env = envalid.cleanEnv(process.env, {
  YAML_FILE: str({ desc: 'Path to the YAML file to validate', default: 'updates.yaml' }),
})

async function main() {
  const yamlFilePath = env.YAML_FILE
  const yamlData = await loadYAML(yamlFilePath)

  let allImagesExist = true

  for (const update of yamlData.updates) {
    const version = update.version
    const imageTag = `linode/apl-core:${version}`

    console.log(`Checking Docker image: ${imageTag}`)
    try {
      await $`docker manifest inspect ${imageTag}`
      console.log(`✔ Docker image ${imageTag} exists.`)
    } catch {
      console.error(`✘ Docker image ${imageTag} does NOT exist.`)
      allImagesExist = false
    }
  }

  if (!allImagesExist) {
    console.error('Some Docker images are missing.')
    process.exit(1)
  } else {
    console.log('All Docker images exist.')
  }
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.message}`)
  process.exit(1)
})
