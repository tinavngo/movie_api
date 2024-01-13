
const http = require('http');
  fs = require('fs'),
  url = require('url');

//Variable declarations
  http.createServer((request, response) => {
    let addr = request.url,
      q = new URL(addr, 'http://localhost:8080'),
      filePath = '';

      //if else statements for doc&html
      if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
      } else {
        filePath = 'index.html';
      }

      //append for logging
      fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
          console.log('log error');
        } else {
          console.log('Added to log.');
        }
      });
    
      fs.readFile(filePath, (err, data) => {
        if (err) {
          throw err;
        }
    
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end("hello node");
    
      });
    
    })
    
    .listen(8080);
    console.log('My test server is running on Port 8080.');