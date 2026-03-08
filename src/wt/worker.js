import { workerData, parentPort } from 'node:worker_threads'

const sorted = [...workerData].sort((a, b) => a - b)
parentPort.postMessage(sorted)
