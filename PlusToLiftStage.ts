const w : number = window.innerWidth
const h : number = window.innerHeight
const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = '#0D47A1'

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1 / n, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) : number => {
    return Math.floor(scale / scDiv)
}

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    return (1 - scaleFactor(scale)) / a + scaleFactor(scale) / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawRotatedLine : Function = (context : CanvasRenderingContext2D, deg : number, size : number) => {
    if (size !== 0) {
        context.save()
        context.rotate(deg)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, size)
        context.stroke()
        context.restore()
    }
}

const drawPTLNode : Function =  (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = h / (nodes + 1)
    const size : number = gap / sizeFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const deg : number = (2 * Math.PI) / lines
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = foreColor
    context.save()
    context.translate(w/2, gap * (i + 1))
    for (var j = 0; j < lines; j++) {
        const rotDeg : number = Math.PI/2 * j
        const newSize : number = -size * divideScale(sc1, j, lines)
        const newDeg : number = rotDeg + (deg / 2) * divideScale(sc2, j, lines)
        drawRotatedLine(context, newDeg, newSize)
    }
    context.restore()
}

class PlusToLiftStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : PlusToLiftStage = new PlusToLiftStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }

}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateValue(this.scale, this.dir, lines, lines)
        console.log(this.dir)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            console.log(this.dir)
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class PTLNode {
    next : PTLNode
    prev : PTLNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new PTLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawPTLNode(context, this.i, this.state.scale)
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : PTLNode {
        var curr : PTLNode = this.next
        if (dir == -1) {
            curr = this.prev
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class PlusToLift {
    curr : PTLNode = new PTLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {
    ptl : PlusToLift = new PlusToLift()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.ptl.draw(context)
    }

    handleTap(cb : Function) {
        this.ptl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ptl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
