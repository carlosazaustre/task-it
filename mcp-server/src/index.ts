#!/usr/bin/env node
import { createServer, startServer } from './server.js'
import { registerTaskTools } from './tools/tasks.js'
import { registerTagTools } from './tools/tags.js'
import { registerResources } from './resources/summary.js'

const server = createServer()

registerTaskTools(server)
registerTagTools(server)
registerResources(server)

startServer(server)
