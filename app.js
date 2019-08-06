//설치한 express 모듈을 require를 통해 불러오기
const express = require("express");
//설치한 socket.io 모듈을 require를 통해  불러오기
const socket = require("socket.io");
//Node.js 기본 내장 모듈을 require를 통해  불러오기
const http = require("http");
//Node.js 기본 내장 모듈, File과 관련된 처리를 한다.
const fs = require("fs");
//express 객체 생성
const app = express();
//express  http 서버 생성
const server = http.createServer(app);
//서버를 socket.io에 바인딩
const io = socket(server);

//정적 파일을 제공하기위해 미들웨어를 사용한다.
//app.use를 사용해 원하는 미들웨어를 추가하여 조합가능!
app.use('/css',express.static('./static/css'));
app.use('/js',express.static('./static/js'));

/*
    get 방식으로 / 경로에 접속하면 실행 됨 
    get(경로, 함수)는 서버의 / 경로를 Get 방식으로 접속하면 호출이 된다.
    함수는 request와 response 객체를 받는다.
*/
let id ;
app.get("/",(request, response) => {
    fs.readFile('./static/js/index.html',(err,data) => {
        if(err)
            response.send('error');
        else{
            id = request.query.id;
            console.log(id);
            response.writeHead(200,{'Content-Type':'text/html'});
            response.write(data);
            //response.write를 통해 응답할 경우 end로 마무리를 해야하낟.
            response.end();
        }
    })
});

io.sockets.on('connection', socket =>{
    socket.on('newUser',function(name){
        socket.name = id;
        socket.emit('update',{
            type: 'connect',
            name : 'SERVER',
            message : socket.name + '님이 접속 하였습니다.'
        });
    });
    socket.on('message', function(data){
        data.name = socket.name;

        socket.broadcast.emit('update',data);
    });

    socket.on('disconnect',function(){
        socket.broadcast.emit('update',{
            type : 'disconnect',
            name : 'SERVER',
            message : socket.name + '님이 나가셨습니다.'
        });
    });
});
/* 
    listen 메소드를 통해 원하는 포트 번호로 서버를 시작한다. 
    listen(포트, 리스너)
*/
server.listen(8090, function(){
    console.log("서버 실행중...");
})