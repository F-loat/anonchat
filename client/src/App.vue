<template>
  <div id="app">
    <div class="time">{{timer.duration}}</div>
    <header class="header">
      <span>当前在线总人数：{{chat.count}}</span>
    </header>
    <div class="list">
      <div
        v-for="(message, index) of chat.messages"
        :key="index"
        :class="{ self: message.sender.id === self.id }"
        class="item">
        <img v-if="message.sender.sex === 'male'" class="headimg" :src="`/img/${headimg}_m.jpg`" />
        <img v-else class="headimg" :src="`/img/${headimg}_f.jpg`"  />
        <div class="message">{{message.content}}</div>
      </div>
    </div>
    <form class="form">
      <input class="input" v-model="chat.input"/>
      <button class="submit-btn" @click="sendMessage">发送</button>
    </form>
    <div class="pair-wrap" v-if="chat.status !== 'chating'">
      <div @click="pair" class="pair-btn" v-if="chat.status === null">开始匹配</div>
      <div class="pair-btn" v-if="chat.status === 'pairing'">匹配中...</div>
    </div>
    <div class="sex-wrap" v-if="!self.sex">
      <div class="sex-title">请选择您的性别</div>
      <div class="sex-list">
        <span class="sex-item sex-male" @click="chooseSex('male')">男</span>
        <span class="sex-item sex-female" @click="chooseSex('female')">女</span>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

const socket = io(':3000')

export default {
  name: 'app',
  data () {
    return {
      headimg: 1,
      partner: {
        id: null,
        sex: null
      },
      self: {
        id: null,
        sex: null
      },
      chat: {
        status: null,
        count: 0,
        messages: [],
        input: ''
      },
      timer: {
        id: null,
        duration: 180
      }
    }
  },
  mounted () {
    const sex = localStorage.getItem('sex')
    if (sex) this.chooseSex(sex)
    this.socketInit()
  },
  methods: {
    socketInit () {
      socket.on('connect', () => {
        this.self.id = socket.id
      })
      socket.on('count', (data) => {
        this.chat.count = data
      })
      socket.on('partner', (data) => {
        this.partner = data
        this.chat.status = 'chating'
        this.countDown()
      })
      socket.on('message', (data) => {
        this.chat.messages.push({
          sender: this.partner,
          content: data
        })
      })
      socket.on('end', this.reset)
      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    },
    chooseSex (sex) {
      localStorage.setItem('sex', sex)
      this.self.sex = sex
      socket.emit('sex', sex)
    },
    pair () {
      socket.emit('pair')
      this.chat.status = 'pairing'
    },
    sendMessage (e) {
      e.preventDefault()
      const { chat, partner } = this
      if (!chat.input || !partner.id) return
      socket.emit('message', {
        partner: partner.id,
        message: chat.input
      })
      chat.messages.push({
        sender: this.self,
        content: chat.input
      })
      chat.input = ''
    },
    countDown () {
      const { timer } = this
      clearInterval(timer.id)
      timer.id = setInterval(() => {
        timer.duration -= 1
      }, 1000)
    },
    reset () {
      this.partner = {}
      this.chat.status = null
      this.chat.messages = []
      this.chat.input = ''
      this.timer.duration = 180
      clearInterval(this.timer.id)
    }
  }
}
</script>

<style lang="less">
html, body {
  margin: 0;
  padding: 0;
}
#app {
  text-align: center;
  color: #2c3e50;
  width: 100%;
  min-height: 100vh;
}

.header {
  background-color: #03a9f4;
  color: #fff;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 10px;
  line-height: 1.5;
  padding-top: 10px;
  padding-bottom: 60px;
}
.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  &.self {
    flex-direction: row-reverse;
    align-self: flex-end;
  }
}
.headimg {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}
.message {
  margin: 10px;
  padding: 10px;
  border-radius: 8px;
  word-break: break-all;
  text-align: left;
  background-color: rgba(255, 255, 255, .7)
}

.time {
  background-color: #f1f3f5;
  color: #ffe411;
  font-size: 120px;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;
}

.form {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  min-height: 54px;
  display: flex;
  background-color: #fff;
  border-top: 1px solid #d8d8d8;
  padding: 10px;
  box-sizing: border-box;
}
.input {
  flex: 1;
  border: none;
  border-radius: 8px;
  border: 1px solid #d8d8d8;
  padding: 0 5px;
  outline: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}
.submit-btn {
  margin-left: 10px;
  width: 50px;
  color: #fff;
  background-color: #03a9f4;
  border: none;
  border-radius: 8px;
  outline: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}

.sex-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #ededed;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sex-item {
  display: inline-block;
  width: 80px;
  line-height: 80px;
  border-radius: 50%;
  color: #fff;
  margin: 40px;
}
.sex-male {
  background-color: #25C6FC;
}
.sex-female {
  background-color: #FF534D;
}

.pair-wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #ededed;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pair-btn {
  width: 150px;
  line-height: 150px;
  border-radius: 50%;
  color: #fff;
  background-color: #37C6C0;
  font-size: 20px;
}
</style>
