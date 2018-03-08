const Koa = require('koa')
const socketIo = require('socket.io')

const app = new Koa()

app.use(async ctx => {
  ctx.body = 'Hello Anonchat'
})

const server = app.listen(3000)
const io = socketIo(server)

const loners = []

io.on('connection', (socket) => {
  io.emit('count', io.eio.clientsCount)

  socket.on('pair', () => {
    if (loners.length === 0) {
      loners.push(socket)
      return
    }
    const random = parseInt(loners.length * Math.random())
    const partner = loners.splice(random, 1)[0]
    socket.join(partner.id)
    socket.to(partner.id).emit('partner', {
      id: socket.id,
      sex: socket.sex
    })
    socket.emit('partner', {
      id: partner.id,
      sex: partner.sex
    })
    setTimeout(() => {
      socket.emit('end')
      socket.to(partner.id).emit('end')
      socket.leave(partner.id)
    }, 180000)
  })

  socket.on('sex', (data) => {
    socket.sex = data
  })

  socket.on('message', (data) => {
    socket.to(data.partner).emit('message', data.message)
  })

  socket.on('disconnect', () => {
    io.emit('count', io.eio.clientsCount)
  })
})
