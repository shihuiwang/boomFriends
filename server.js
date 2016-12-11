var express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];//保存所有在线用户的昵称的数组

app.use('/', express.static(__dirname + '/www'));//指定静态HTML文件的位置
server.listen(process.env.PORT || 3000);
io.sockets.on('connection', function(socket) {
    //昵称设置
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
             //向所有连接到服务器的客户端发送当前登陆用户的昵称 
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //用户离开
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            users.splice(socket.userIndex, 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //接收新消息
    socket.on('postMsg', function(msg, color) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});