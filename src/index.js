const path = require('path')
const express = require('express')
const mg = require('morgan')
const app = express()
const port = 8900


app.use(mg('{\n user_IP: :remote-addr \n remote_user: :remote-user \n time: :date[clf] \n method: :method \n url: :url \n httpversion: :http-version \n status: :status\n res: :res[content-length] \n ref: :referrer \n user agent: :user-agent \n response time: :response-time[digits] ms \n total time: :total-time[digits] ms\n}'))

app.get('/vr', (req, res) => {
	var options = {
    root: path.join(__dirname, 'views'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  //var fileName = req.params.name
  var fileName = 'vr.html'
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})

app.get('/', (req, res) => {
  var options = {
    root: path.join(__dirname, 'views'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  //var fileName = req.params.name
  var fileName = 'web.html'
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})