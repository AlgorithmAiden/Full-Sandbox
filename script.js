//setup the canvas
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

/**make the canvas always fill the screen**/;
(function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = resize
})()

//for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

//define the toolbar area
const toolbarSize = canvas.height * .1

//define the pixel size
const targetPixelSize = 5
const gx = Math.round(canvas.width / targetPixelSize)
const gy = Math.round((canvas.height - toolbarSize) / targetPixelSize)
const px = canvas.width / gx
const py = (canvas.height - toolbarSize) / gy

//define brush size
const brushSize = (gx + gy) / 2 / 10

//create the sandbox
let sandbox = []
for (let y = 0; y < gy; y++) {
    sandbox[y] = []
    for (let x = 0; x < gx; x++) {
        sandbox[y][x] = 'void'
    }
}

//record the current sand type
let currentSand = 'void'

//define the sands
const sandTypes = {
    'void': {
        color: 'rgb(0,0,0)',
        name: 'Void'
    },
    'stone': {
        color: 'rgb(100,100,100)',
        name: 'Stone',
        update(x, y, newSandbox) { newSandbox[y][x] = 'stone' }
    },
    'sand': {
        color: 'rgb(100,100,0)',
        name: 'Sand',
        update(x, y, newSandbox) {
            if (y < gy - 1 && sandbox[y + 1][x] == 'void')
                newSandbox[y + 1][x] = 'sand'
            else
                newSandbox[y][x] = 'sand'

        }
    },
    'lava': {
        color: 'rgb(255,100,0)',
        name: 'Lava',
        update(x, y, newSandbox) {
            if (y < gy - 1 && sandbox[y + 1][x] == 'void' && Math.random() < .5)
                newSandbox[y + 1][x] = 'lava'
            else
                newSandbox[y][x] = 'lava'
            if (y < gy - 1 && sandbox[y + 1][x] == 'stone' && Math.random() < .1)
                sandbox[y + 1][x] = 'void'
        }
    },
    'water': {
        color: 'rgb(50,50,255)',
        name: 'Water',
        update(x, y, newSandbox) {
            if (y < gy - 1 && sandbox[y + 1][x] == 'void')
                newSandbox[y + 1][x] = 'water'
            else {
                let dir = Math.round(Math.random()) * 2 - 1
                if (x - dir >= 0 && x < gx && sandbox[y][x + dir] == 'void'&&newSandbox[y][x+dir]=='void')
                    newSandbox[y][x + dir] = 'water'
                else
                    newSandbox[y][x] = 'water'
            }
        }
    }

}

//now for the logic loop
setInterval(() => {
    let newSandbox = []
    for (let y = 0; y < gy; y++) {
        newSandbox[y] = []
        for (let x = 0; x < gx; x++) {
            newSandbox[y][x] = 'void'
        }
    }

    for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
            let pixelType = sandTypes[sandbox[y][x]]
            if (pixelType.update)
                pixelType.update(x, y, newSandbox)
        }
    }

    sandbox = newSandbox
    render()
}, 1000 / 10)

//the render function
function render() {
    //clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //render the sandbox
    for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
            ctx.fillStyle = sandTypes[sandbox[y][x]].color
            ctx.fillRect(x * px, y * py, px, py)
        }
    }

    //render the toolbar
    const typesAsArray = Object.keys(sandTypes)
    const typeWidth = canvas.width / typesAsArray.length
    ctx.font = '100px arial'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.strokeStyle = 'rgb(0,0,0,.5)'
    ctx.lineWidth = 5
    for (let index in typesAsArray) {
        const type = sandTypes[typesAsArray[index]]
        ctx.fillStyle = type.color
        ctx.fillRect(index * typeWidth, canvas.height - toolbarSize, typeWidth, canvas.height - toolbarSize)
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.fillText(type.name, index * typeWidth + typeWidth / 2, canvas.height - toolbarSize / 2, typeWidth, canvas.height - toolbarSize)
        ctx.strokeText(type.name, index * typeWidth + typeWidth / 2, canvas.height - toolbarSize / 2, typeWidth, canvas.height - toolbarSize)
    }
}

//listen for clicks
document.addEventListener('click', e => {
    const x = e.clientX
    const y = e.clientY
    const typesAsArray = Object.keys(sandTypes)
    const typeWidth = canvas.width / typesAsArray.length
    //find which type they picked
    if (y > canvas.height - toolbarSize) {
        currentSand = typesAsArray[Math.floor(x / typeWidth)]
    }
})

//now listen for dragging
document.addEventListener('touchmove', e => drag(e.changedTouches[e.changedTouches.length - 1].clientX, e.changedTouches[e.changedTouches.length - 1].clientY))
document.addEventListener('mousemove', e => { if (e.buttons > 0) drag(e.x, e.y) })

function drag(x, y) {
    const startX = Math.round((x - px * brushSize / 2) / canvas.width * gx)
    const startY = Math.round((y - py * brushSize / 2) / (canvas.height - toolbarSize) * gy)

    for (let x = startX; x < startX + brushSize; x++)
        for (let y = startY; y < startY + brushSize; y++)
            sandbox[y][x] = currentSand
}

render()