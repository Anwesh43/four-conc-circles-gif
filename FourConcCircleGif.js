const gifencoder = require('gifencoder')
const Canvas = require('canvas').Canvas
const w = 600, h = 600
const nodes = 5
const circles = 4
const scGap = 0.05
const scDiv = 0.51
const sizeFactor = 3
const strokeFactor = 90

const maxScale = (scale, i, n) => {
    return Math.max(0, scale - i / n)
}

const divideScale = (scale, i, n) => {
    return Math.min(1/n, maxScale(scale, i, n)) * n
}

const scaleFactor = (scale) => Math.floor(scale / scDiv)

const mirrorValue = (scale, a, b) => {
    const k = scaleFactor(scale)
    return (1 - k ) / a + k / b
}

const updateValue = (scale, dir, a, b) => {
    return mirrorValue(scale, a, b) * dir * scGap 
}
