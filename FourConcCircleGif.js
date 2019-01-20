const gifencoder = require('gifencoder')
const Canvas = require('canvas').Canvas
const w = 600, h = 600
const nodes = 5
const circles = 4
const scGap = 0.05
const scDiv = 0.51
const sizeFactor = 3
const strokeFactor = 90
const strokeColor = "#0D47A1"

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

const drawCircle = (context, sc, x, y, r) => {
    context.save()
    context.translate(x, y)
    context.beginPath()
    for (var i = start; i<=end; i++) {
        const x = r * Math.cos(i * Math.PI/180), y = r * Math.sin(i * Math.PI/180)
        if (i == start) {
            context.moveTo(x, y)
        } else {
            context.lineTo(x, y)
        }
    }
    context.stroke()
    context.restore()
}
const drawFCCNode = (context, i, scale) => {
    const gap = w / (nodes + 1)
    const sc1 = divideScale(scale, circles, 1)
    const sc2 = divideScale(scale, circles, 2)
    context.strokeStyle = strokeColor
    context.lineCap = 'round'
    context.lineWidth = Math.min(w, h) / strokeFactor
    save()
    translate(gap * (i + 1), h/2)
    drawCircle(context, 1, 0, 0, size/2)
    for (var j = 0; j < circles; j++) {
        context.save()
        context.rotate(Math.PI/2 * j)
        drawCircle(context, divideScale(sc1, j, circles), 3 * size/2, 0, size/2)
        context.restore()
    }
    restore()
}
