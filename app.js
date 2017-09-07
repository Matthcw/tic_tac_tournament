const app = require('express')();
const exphbs = require('express-handlebars');
const path = require('path');

const server = require('http').Server(app);

const io = require('socket.io')();

var gameState = ['', '', '',
                 '', '', '',
                 '', '', ''];

var users = {};
var playerOne;
var playerTwo;
var turn = "X";

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'));

app.get('/', (req, res) => {
  const uri = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.render('index',{
      uri:uri
    });
});

io.attach(server);

io.on('connection', (socket) => {
  users[socket.id] = socket.id;

  if(Object.keys(users).length == 2 || users[playerTwo] == undefined){
    playerTwo = socket.id;
  }
  if(Object.keys(users).length == 1 || users[playerOne] == undefined){
    playerOne = socket.id;
  }

  console.log("New user: " + JSON.stringify(users));

  io.emit("setState", gameState);

  socket.on("buttonClicked", (id) => {
    //console.log(socket.id);
    //console.log(playerOne)
    if(socket.id == playerOne && gameState[id-1] == "" && turn == "X"){
      gameState[id-1] = 'X';
      turn = "O";
      io.emit("setState", gameState);
      checkIfWin("X", io);
    } else if(socket.id == playerTwo && gameState[id-1] == "" && turn == "O"){
      gameState[id-1] = 'O';
      turn = "X";
      io.emit("setState", gameState);
      checkIfWin("O", io);
    }

  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    console.log("User left: " + JSON.stringify(users));
  });

});

function checkIfWin(player){
  //horizontal
  for(var i = 0; i <= 6; i+=3){
    if(gameState[i] == player && gameState[i+1] == player && gameState[i+2] == player){
      console.log(player + " wins");
      io.emit('playerWins', player);
      resetState();
    }
  }
  //vertical
  for(var i = 0; i < 3; i++){
    if(gameState[i] == player && gameState[i+3] == player && gameState[i+6] == player){
      console.log(player + " wins");
      io.emit('playerWins', player);
      resetState();
    }
  }

  //diagonal
  if(gameState[0] == player && gameState[4] == player && gameState[8] == player){
    console.log(player + " wins");
    io.emit('playerWins', player);
    resetState();
  } else if(gameState[2] == player && gameState[4] == player && gameState[6] == player){
    console.log(player + " wins");
    io.emit('playerWins', player);
    resetState();
  }

  var gameStateCheck = gameState.join('');
  if(gameStateCheck.length >= 9){
    console.log("Draw!");
    io.emit('gameDraw');
    resetState();
  }

}

function resetState(){
  gameState = ['','','','','','','','',''];
}
