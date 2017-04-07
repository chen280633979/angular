var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
//获取图书
function getBooks(callback) {
    fs.readFile('./book.json','utf8',function (err, data) {
        if(err){
            callback([]);
        }else {
            callback(JSON.parse(data));
        }
    })
}
//设置图书
function setBooks(data,callback) {
    fs.writeFile('./book.json',JSON.stringify(data),callback);
    console.log(data)
}
var server = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url,true);
    var pathname = urlObj.pathname;
   if(pathname == '/'){
       res.setHeader('Content-Type','text/html;charset=utf8');
       fs.createReadStream('./index.html').pipe(res);
   }else if(/\/book(\/\d+)?/.test(pathname)){
       var id = /\/book(\/\d+)?/.exec(pathname)[2];
       switch (req.method){
           case 'GET':
               if(id){

               }else {
                   getBooks(function (data) {
                       res.end(JSON.stringify(data))
                   });
               }
               break;
           case 'POST':
               //增加
               var str = '';
               req.on('data',function (data) {
                   str+=data;
               });
               req.on('end',function () {
                   var book = JSON.parse(str);
                   getBooks(function (data) {
                       book.id = data.length?parseInt(data[data.length-1].id)+1:1;
                        data.push(book);
                       setBooks(data,function () {
                           res.end(JSON.stringify(book));
                       });
                   });
               });
               break;
           case 'DELETE':
               break;
           case 'PUT':
               break;
       }

   }else {
       fs.exists('.'+pathname,function (flag) {
           if(flag){
               res.setHeader('Content-Type',mime.lookup(pathname)+';charset=utf8');
               fs.createReadStream('.'+pathname).pipe(res);
           }else {
               res.statusCode = 404;
               res.end('Not Found');
           }
       })
   }

});
server.listen(5000);