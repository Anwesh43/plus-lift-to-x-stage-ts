const w : number = window.innerWidth
const h : number = window.innerHeight
const nodes : number = 5
const lines : number = 4
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = '#4527A0'

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
    return (1 - scaleFactor()) / a + scaleFactor() / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawPTLNode : Function =  (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = h / (nodes + 1)
    const size : number = gap / sizeFactor
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const deg : number = 2 * Math.PI / lines
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = foreColor
    context.save()
    context.translate(w/2, gap * (i + 1))
    for (var j = 0; j < lines; j++) {
        context.save()
        context.rotate(j * Math.PI/2 + (deg / 2) * divideScale(sc2, j, lines))
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, -size * divideScale(sc1, j, lines))
        context.stroke()
        context.restore()
    }
    context.restore()
}
