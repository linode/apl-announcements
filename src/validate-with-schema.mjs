#!/usr/bin/env zx

import Ajv from 'ajv'
import envalid, { str } from 'envalid'
import fs from 'fs/promises'
import { loadYAML } from './common.mjs'

const env = envalid.cleanEnv(process.env, {
  YAML_FILE: str({ desc: 'Path to the YAML file to validate', default: 'updates.yaml' }),
  SCHEMA_FILE: str({ desc: 'Path to the JSON schema file', default: 'updates.schema.json' }),
})

async function loadJSONSchema(schemaFilePath) {
  try {
    const schemaContent = await fs.readFile(schemaFilePath, 'utf8')
    return JSON.parse(schemaContent)
  } catch (error) {
    console.error(`Error reading or parsing JSON schema file: ${error.message}`)
    process.exit(1)
  }
}

function validateYAML(data, schema) {
  const ajv = new Ajv()
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (!valid) {
    console.error('Validation errors:', validate.errors)
    return false
  }

  console.log('YAML is valid!')
  return true
}

async function main() {
  const yamlFilePath = env.YAML_FILE // From environment
  const schemaFilePath = env.SCHEMA_FILE // From environment

  const schema = await loadJSONSchema(schemaFilePath)
  const yamlData = await loadYAML(yamlFilePath)
  validateYAML(yamlData, schema)
}

main().catch((err) => {
  console.error(`Unexpected error: ${err.message}`)
  process.exit(1)
})
