const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d"),
    clock = {
        border: 5,
        size: 500,
        fontSize: 50,
        bgColor: '#eee',
        get center() {
            return this.size / 2
        }
    },
    audioCtx = new AudioContext

let tickAudio

fetch("tick.mp3").then(async p => {
    tickAudio = await audioCtx.decodeAudioData(await p.arrayBuffer())
})

function update() {
    canvas.width = canvas.height = clock.size * devicePixelRatio

    // draw(new Date(82800000))
    draw(new Date())

    let s = audioCtx.createBufferSource()
    s.buffer = tickAudio
    s.connect(audioCtx.destination)

    if (navigator.userActivation.hasBeenActive) s.start()

    setTimeout(update, 1000)
}

function draw(date) {
    ctx.reset()
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.save()

    ctx.lineWidth = clock.border
    ctx.fillStyle = clock.bgColor

    ctx.beginPath()
    ctx.arc(clock.center, clock.center, clock.center - clock.border / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.textBaseline = "middle"
    ctx.textAlign = "center"
    ctx.font = "20px helvetica"
    ctx.fillStyle = "grey"
    ctx.fillText("DUAL", clock.center, 120)

    drawDay(date)
    drawNums()
    drawHands(date)
}

const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
function drawDay(date) {
    let curDay = dayMap[date.getDay()],
        nextDay = dayMap[date.getDay() + 1 > 6 ? 0 : date.getDay() + 1]
    y = clock.size - 120

    ctx.textBaseline = 'top'
    ctx.textAlign = 'start'
    ctx.font = '25px arial'

    let m = ctx.measureText(curDay),
        h = m.actualBoundingBoxDescent - m.actualBoundingBoxAscent,
        maxW = 50,
        posX = clock.center - (maxW / 2),
        posY = y - h / 2,
        curW = Math.min(m.width, maxW)

    m = ctx.measureText(nextDay)
    let nextW = Math.min(m.width, maxW)

    let pastH = date.getHours() / 24 * h

    ctx.fillStyle = "#f55"
    ctx.fillText(curDay, clock.center - (curW / 2), y - (h / 2) - pastH, maxW)
    ctx.fillText(nextDay, clock.center - (nextW / 2), y + h - (h / 2) - pastH, maxW)

    ctx.fillStyle = clock.bgColor
    ctx.fillRect(posX, posY - h, maxW, h)
    ctx.fillRect(posX, posY + h, maxW, h)

    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(posX, posY, maxW, h, 2)
    ctx.stroke()
}

function drawNums() {
    for (let i = 1; i <= 12; i++) {
        ctx.restore()
        ctx.save()

        ctx.font = clock.fontSize + "px courier new, monospace"
        ctx.textAlign = "start"
        ctx.textBaseline = "top"

        let rad = Math.PI * (i / 12) * 2

        ctx.translate(clock.center, clock.center)
        ctx.rotate(rad)

        if (!(i % 3)) {
            let m = ctx.measureText(i),
                h = m.actualBoundingBoxDescent - m.actualBoundingBoxAscent,
                y = -(clock.center - clock.border - (h / 2) - 5)

            ctx.textBaseline = "top"
            ctx.textAlign = "start"

            ctx.translate(0, y)
            ctx.rotate(-rad)
            ctx.fillText(i, -m.width / 2, -h / 2)
        } else {
            let y = -(clock.center - clock.border - 5)

            ctx.lineWidth = 5

            ctx.translate(0, y)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(0, clock.fontSize)
            ctx.stroke()
        }
    }
}

function drawHands(date) {
    let h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds(),
        tailLength = 25

    // hr
    ctx.restore()
    ctx.lineWidth = 7
    ctx.save()

    ctx.translate(clock.center, clock.center)
    ctx.rotate(Math.PI * ((h / 12 * 2) + (m / 60 * 1 / 6)))

    ctx.beginPath()
    ctx.moveTo(0, tailLength)
    ctx.lineTo(0, tailLength - 110)

    //min
    ctx.restore()
    ctx.save()

    ctx.translate(clock.center, clock.center)
    ctx.rotate(Math.PI * ((m / 60 * 2) + (s / 60 * 1 / 30)))

    ctx.moveTo(0, tailLength)
    ctx.lineTo(0, tailLength - 180)
    ctx.stroke()

    //sec
    ctx.restore()
    ctx.save()

    ctx.translate(clock.center, clock.center)
    ctx.rotate(Math.PI * (s / 60 * 2))

    ctx.strokeStyle = "red"
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.moveTo(0, tailLength * 2.5)
    ctx.lineTo(0, tailLength * 2.5 - 260)
    ctx.stroke()

    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(0, tailLength * 2.5, 10, 0, Math.PI * 2)
    ctx.fill()

    //middl-nub
    ctx.restore()
    ctx.save()

    ctx.fillStyle = "gold"

    ctx.translate(clock.center, clock.center)
    ctx.beginPath()
    ctx.arc(0, 0, 8, 0, Math.PI * 2)
    ctx.fill()
}

update()