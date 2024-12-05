#!/usr/bin/env zx

import Ajv from 'ajv'
import envalid, { str } from 'envalid'
import fs from 'fs/promises'
import yaml from 'js-yaml'

// Step 1: Use envalid to validate environment variables
const env = envalid.cleanEnv(process.env, {
  YAML_FILE: str({ desc: 'Path to the YAML file to validate', default: 'updates.yaml' }),
  SCHEMA_FILE: str({ desc: 'Path to the JSON schema file', default: 'updates.schema.json' }),
})

// Step 2: Load a JSON schema from a file
async function loadJSONSchema(schemaFilePath) {
  try {
    const schemaContent = await fs.readFile(schemaFilePath, 'utf8')
    return JSON.parse(schemaContent)
  } catch (error) {
    console.error(`Error reading or parsing JSON schema file: ${error.message}`)
    process.exit(1)
  }
}

// Step 3: Load and parse a YAML file
async function loadYAML(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8')
    return yaml.load(fileContent)
  } catch (error) {
    console.error(`Error reading or parsing YAML file: ${error.message}`)
    process.exit(1)
  }
}

// Step 4: Validate YAML against JSON schema
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

// Main function to orchestrate validation
async function main() {
  const yamlFilePath = env.YAML_FILE // From environment
  const schemaFilePath = env.SCHEMA_FILE // From environment

  const schema = await loadJSONSchema(schemaFilePath)
  const yamlData = await loadYAML(yamlFilePath)

  validateYAML(yamlData, schema)
}

// Execute the main function
main().catch((err) => {
  console.error(`Unexpected error: ${err.message}`)
  process.exit(1)
})
