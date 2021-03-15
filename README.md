# cluster-eventdispatcher
Small and simple EventDispatcher, which executes events in **all processes**.
## Install
```
npm i --save cluster-eventdispatcher
```
## How to use
1. Create an instance of Eventdispatcher (whether in the master or in a worker):
```js
const EventDispatcher = require('cluster-eventdispatcher')

/* ... */
const dispatcher = new EventDispatcher()
```
2. Listen to events:
```js
dispatcher.on('eventname', eventdata => {
    /* Do what you want*/
})

/* OR */

dispatcher.once('eventname', eventdata => {
    /* Do what you want*/
})

```
3. Dispatch Events:
```js
dispatcher.dispatch('eventname', {
    /* your data here */
})
```
## Full Example

File is also available in the `example` directory
```js
const EventDispatcher = require('cluster-eventdispatcher')
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
```