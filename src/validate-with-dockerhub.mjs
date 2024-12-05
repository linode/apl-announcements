#!/usr/bin/env zx

import fs from 'fs'
import yaml from 'js-yaml'

const filePath = 'updates.yaml'
let updates

// Load the updates.yaml file
try {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  updates = yaml.load(fileContents).updates
} catch (e) {
  console.error('Failed to load updates.yaml:', e)
  process.exit(1)
}

let allImagesExist = true

for (const update of updates) {
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
