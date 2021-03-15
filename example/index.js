const EventDispatcher = require('../src/index')
const cluster = require('cluster')
const express = require('express')

const app = express()

if(cluster.isMaster){
    const dispatcher = new EventDispatcher()
    for(let i = 0; i < require('os').cpus().length; i++){
        const worker = cluster.fork()
        dispatcher.initWorker(worker)
    }
    dispatcher.on('call', data => {
        console.log('/ was called: ', data)
        dispatcher.dispatch('response', 'hello')
    })
} else {
    const dispatcher = new EventDispatcher()

    dispatcher.on('response', data => console.log(data))

    app.get('/', (req, res) => {
        res.send('cluster-eventdispatcher example')
        dispatcher.dispatch('call', {
            someData: 'data'
        })
    })

    app.listen(8080)
}