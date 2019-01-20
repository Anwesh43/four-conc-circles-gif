const GifEncoder = require('gifencoder')
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

class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += updateValue(this.scale, this.dir, lines, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}

class FCCNode {
    constructor(i) {
        this.i = i
        this.state = new State()

    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new FCCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        drawFCCNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (this.dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class FourConcCircle {
    constructor() {
        this.root = new FCCNode(0)
        this.curr = this.root
        this.dir = 1
    }

    draw(context) {
        if (this.root) {
            this.root.draw(context)
        }
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }

    startUpdating() {
        this.curr.startUpdating()
    }
}

class Renderer {
    constructor() {
        this.running = true
        this.fcc = new FourConcCircle()
    }

    render(context, cb, endcb) {
        this.fcc.startUpdating()
        while(this.running) {
            context.fillStyle = '#BDBDBD'
            context.fillRect(0, 0, w, h)
            this.fcc.draw(context)
            cb(context)
            this.fcc.update(() => {
                this.running = false
                endcb()
            })
        }
    }
}

class FourConcCircleGif {
    constructor(fn) {
        this.encoder = new GifEncoder(w, h)
        this.canvas = new Canvas(w, h)
        this.renderer = new Renderer()
        this.init(fn)
    }

    init(fn) {
        this.context = this.canvas.getContext('2d')
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.encoder.setQuality(100)
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
    }

    create() {
        this.encoder.start()
        this.renderer.render(this.context, (context) => {
            this.encoder.addFrame(context)
        }, () => {
            this.encoder.end()
        })
    }

    static init(fn) {
        const gif = new FourConcCircleGif(fn)
        gif.create()
    }
}
