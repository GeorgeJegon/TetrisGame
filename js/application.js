function tetrisGame(){
	var d = document,
		gamePaused = false,
		gameStarted = false,
		gameSpeed = 1000,
		gameLineComplete = 0,
		gameCurrentScore = 0,
		gameCurrentLevel = 1,
		gameMap = [],
		gameMapCounter = [],
		gameLines = 20,
		gameColumns = 10,
		gameObjects = [],
		listObjects = [],
		piecesUnit = 34,
		borderWidth = 5,
		canvasWidth = (gameColumns*(piecesUnit-borderWidth))+borderWidth,
		canvasHeight = (gameLines*(piecesUnit-borderWidth))+borderWidth,
		gameInterval = false,
		_currentObject = false,
		_nextObject = false,
		gameStage = d.getElementById("gameStage"),
		ctx = gameStage.getContext("2d"),
		objGameScore = d.getElementById("gameScore"),
		objGameLevel = d.getElementById("gameLevel"),
		objGameLines = d.getElementById("gameLines");

	function getRandomNumber(limit){
		return Math.floor(Math.random()*limit);
	}

	function getRandomObject(){
		var len = gameObjects.length;
		if(!isNaN(len) && len>0){
			var obj = new gameObjects[getRandomNumber(len)](4,0,ctx);
			obj.setListIndex(listObjects.length);
			listObjects.push(obj);
			return obj;
		}
		return false;
	}

	function Point(x,y,color,ctx,obj){
		this.color = color;
		this.posX = x;
		this.posY = y;
		this.ctx = ctx;
		this.callerPiece = obj;
		this.setColor = function(c){
			this.color = c;
			return this;
		};
		this.setPosX = function(x){
			this.posX = x;
			return this;
		};
		this.setPosY = function(y){
			this.posY = y;
			return this;
		};
		this.draw = function(){
			var tempX = this.posX*(piecesUnit-borderWidth),tempY = this.posY*(piecesUnit-borderWidth);
			this.ctx.beginPath();
			this.ctx.fillStyle = "#000";
			this.ctx.fillRect(tempX,tempY,piecesUnit,piecesUnit);
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(tempX+borderWidth,tempY+borderWidth,piecesUnit-(borderWidth*2),piecesUnit-(borderWidth*2));
			this.ctx.closePath();
			gameMap[this.posY][this.posX] = this;
			gameMapCounter[y]++;
			return this;
		};
		this.clear = function(){
			var x = this.posX, y = this.posY;
			var tempX = x*(piecesUnit-borderWidth),tempY = y*(piecesUnit-borderWidth);
			this.ctx.clearRect(tempX,tempY,piecesUnit,piecesUnit);
			gameMap[y][x] = 0;
			gameMapCounter[y]--;
			return this;
		};
	}

	function Piece(){
		this.color = "#fff";
		this.ctx = null;
		this.listIndex = 0;
		this.rotateNumber = 0;
		this.points = new Array(4);
		this.isLeftBlock = false;
		this.isRightBlock = false;
		this.isBlock = false;
		this.setRotateNumber = function(n){
			this.rotateNumber = n;
			return this;
		};
		this.getRotateNumber = function(){
			return this.rotateNumber;
		};
		this.getListIndex = function(){
			return this.listIndex;
		};
		this.setListIndex = function(i){
			this.listIndex = i;
			return this;
		};
		this.getPoints = function(){
			return this.points;
		};
		this.setPoints = function(p){
			this.points = p;
			return this;
		};
		this.getContext = function(){
			return this.ctx;
		};
		this.setContext = function(ctx){
			this.ctx = ctx;
			return this;
		};
		this.getColor = function(){
			return this.color;
		};
		this.setColor = function(c){
			this.color = c;
			return this;
		};
		this.checkCollision = function(arrayPoints,moveType){
			for(var x in arrayPoints){
				var p = arrayPoints[x], _posX = p[0], _posY = p[1];
				var _index = this.getListIndex();
				if(_index>0 && _posY<gameLines && _posX<gameColumns){
					var point = gameMap[_posY][_posX];
					if((point instanceof Point) && point.callerPiece!==this){
						this.isBlock = (moveType=="moveDown");
						this.isLeftBlock = (moveType=="moveLeft");
						this.isRightBlock = (moveType=="moveRight");
						return false;
					}
				}
				this.isBlock = _posY>=gameLines;
				this.isLeftBlock = _posX<=-1;
				this.isRightBlock = _posX>=gameColumns;
				if(this.isBlock || this.isLeftBlock || this.isRightBlock){
					return false;
				}
			}
			return true;
		};
		this.moveDown = function(v){
			var tempP = [] ,unit = v || 1;
			if(!this.isBlock){
				for(var i in this.points){
					var p = this.points[i];
					tempP.push([p[0],p[1]+unit]);
				}
				if(this.checkCollision(tempP,"moveDown")){
					this.clear().setPoints(tempP).draw();
				}
			}
			return this;
		};
		this.moveLeft = function(v){
			var tempP = [] ,unit = v || 1;
			if(!this.isBlock && !this.isLeftBlock){
				for(var i in this.points){
					var p = this.points[i];
					tempP.push([p[0]-unit,p[1]]);
				}
				if(this.checkCollision(tempP,"moveLeft")){
					this.clear().setPoints(tempP).draw();
				}
			}
			return this;
		};
		this.moveRight = function(v){
			var tempP = [] ,unit = v || 1;
			if(!this.isBlock && !this.isRightBlock){
				for(var i in this.points){
					var p = this.points[i];
					tempP.push([p[0]+unit,p[1]]);
				}
				if(this.checkCollision(tempP,"moveRight")){
					this.clear().setPoints(tempP).draw();
				}
			}
			return this;
		};
		this.checkGameMapPointsRender = function(x,y,obj){
			if(x>=0 && x<gameColumns && y>=0 && y<gameLines){
				var p = gameMap[y][x];
				if(p instanceof Point && p.callerPiece!==obj){
					p.draw();
				}
			}
		};
		this.clear = function(){
			for(var x in this.points){
				var p = this.points[x],tempX = p[0]*(piecesUnit-borderWidth),tempY = p[1]*(piecesUnit-borderWidth);
				if((p[1]>=0 && p[1]<gameLines) && (p[0]>=0 && p[0]<gameColumns)){
					gameMap[p[1]][p[0]] = 0;
					gameMapCounter[p[1]]--;
					ctx.clearRect(tempX,tempY,piecesUnit,piecesUnit);
					this.checkGameMapPointsRender(p[0]+1,p[1],this);
					this.checkGameMapPointsRender(p[0]-1,p[1],this);
					this.checkGameMapPointsRender(p[0],p[1]+1,this);
					this.checkGameMapPointsRender(p[0],p[1]-1,this);
					this.checkGameMapPointsRender(p[0]+1,p[1]-1,this);
					this.checkGameMapPointsRender(p[0]-1,p[1]-1,this);
				}
			}
			return this;
		};
		this.draw = function(){
			var p = this.points, len = p.length;
			if(len>0){
				for(var i=0;i<len;i++){
					var x = p[i][0], y = p[i][1];
					(new Point(p[i][0],p[i][1],this.color,this.ctx,this)).draw();
				}
			}
			return this;
		};
		this.rotate90 = function(){
		};
	}

	function updateGameInfo(){
		objGameLevel.innerHTML = gameCurrentLevel;
		objGameScore.innerHTML = gameCurrentScore;
		objGameLines.innerHTML = gameLineComplete;
	}

	function Reta(x,y,ctx){
		this.setColor("#FF6600").setContext(ctx).setPoints([[x,y],[x,y+1],[x,y+2],[x,y+3]]);
		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[1];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x-1,y],[x,y],[x+1,y],[x+2,y]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y-1],[x,y],[x,y+1],[x,y+2]]).draw();
					break;
			}
			this.rotateNumber = (!rn%2);
		};
	}
	Reta.prototype = new Piece();
	gameObjects.push(Reta);

	function Quadrado(x,y,ctx){
		this.setColor("#f00").setContext(ctx).setPoints([[x,y],[x+1,y],[x,y+1],[x+1,y+1]]);
	}
	Quadrado.prototype = new Piece();
	gameObjects.push(Quadrado);

	function BlocoAzul(x,y,ctx){
		this.setColor("#66CCFF").setContext(ctx).setPoints([[x,y],[x+1,y],[x,y+1],[x-1,y+1]]);
		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[0];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x,y],[x,y+1],[x+1,y+1],[x+1,y+2]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y],[x+1,y],[x,y+1],[x-1,y+1]]).draw();
					break;
			}
			this.rotateNumber = (!rn%2);
		};
	}
	BlocoAzul.prototype = new Piece();
	gameObjects.push(BlocoAzul);

	function BlocoVerde(x,y,ctx){
		this.setColor("#00FF00").setContext(ctx).setPoints([[x,y],[x-1,y],[x,y+1],[x+1,y+1]]);

		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[0];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x,y],[x,y+1],[x+1,y],[x+1,y-1]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y],[x-1,y],[x,y+1],[x+1,y+1]]).draw();
					break;
			}
			this.rotateNumber = (!rn%2);
		};
	}
	BlocoVerde.prototype = new Piece();
	gameObjects.push(BlocoVerde);

	function BlocoAmarelo(x,y,ctx){
		this.setColor("#FFFF00").setContext(ctx).setPoints([[x,y],[x,y+1],[x+1,y+1],[x-1,y+1]]);

		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[0];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x,y],[x,y+1],[x+1,y+1],[x,y+2]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y],[x-1,y],[x+1,y],[x,y+1]]).draw();
					break;
				case 2:
					this.clear().setPoints([[x,y],[x,y+1],[x-1,y+1],[x,y+2]]).draw();
					break;
				case 3:
					this.clear().setPoints([[x,y],[x,y+1],[x+1,y+1],[x-1,y+1]]).draw();
					break;
			}
			this.rotateNumber = (++rn>3)?0:rn;
		};
	}
	BlocoAmarelo.prototype = new Piece();
	gameObjects.push(BlocoAmarelo);

	function BlocoRosa(x,y,ctx){
		this.setColor("#CC00FF").setContext(ctx).setPoints([[x,y],[x+1,y],[x,y+1],[x,y+2]]);

		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[0];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x,y],[x-1,y],[x+1,y],[x+1,y+1]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y],[x,y+1],[x,y+2],[x-1,y+2]]).draw();
					break;
				case 2:
					this.clear().setPoints([[x,y],[x-1,y],[x+1,y],[x-1,y-1]]).draw();
					break;
				case 3:
					this.clear().setPoints([[x,y],[x+1,y],[x,y+1],[x,y+2]]).draw();
					break;
			}
			this.rotateNumber = (++rn>3)?0:rn;
		};
	}
	BlocoRosa.prototype = new Piece();
	gameObjects.push(BlocoRosa);

	function BlocoAzulEscuro(x,y,ctx){
		this.setColor("#0000FF").setContext(ctx).setPoints([[x,y],[x-1,y],[x,y+1],[x,y+2]]);

		this.rotate90 = function(){
			var rn = this.getRotateNumber(), p = this.getPoints()[0];
			var x = p[0], y = p[1];
			switch(rn){
				case 0:
					this.clear().setPoints([[x,y],[x-1,y],[x+1,y],[x+1,y-1]]).draw();
					break;
				case 1:
					this.clear().setPoints([[x,y],[x,y+1],[x,y+2],[x+1,y+2]]).draw();
					break;
				case 2:
					this.clear().setPoints([[x,y],[x+1,y],[x-1,y],[x-1,y+1]]).draw();
					break;
				case 3:
					this.clear().setPoints([[x,y],[x-1,y],[x,y+1],[x,y+2]]).draw();
					break;
			}
			this.rotateNumber = (++rn>3)?0:rn;
		};
	}
	BlocoAzulEscuro.prototype = new Piece();
	gameObjects.push(BlocoAzulEscuro);

	this.init = function(){
		gameStage.setAttribute("width",canvasWidth);
		gameStage.setAttribute("height",canvasHeight);
		gameStage.setAttribute("style","border: solid 1px red;");
		updateGameInfo();
		for(var i=0;i<gameLines;i++){
			gameMap[i] = [];
			gameMapCounter[i] = 0;
			for(var j=0;j<gameColumns;j++){
				gameMap[i][j] = 0;
			}
		}

		addEvent(window,"keydown",function(event){
			var keyCode = event.keyCode;
			switch(keyCode){
				case 0x25:
					if(!gamePaused){
						_currentObject.moveLeft();
					}
					break;
				case 0x26:
					if(!gamePaused){
						_currentObject.rotate90();
					}
					break;
				case 0x27:
					if(!gamePaused){
						_currentObject.moveRight();
					}
					break;
				case 0x28:
					if(!gamePaused){
						_currentObject.moveDown();
					}
					break;
				case 0x50:
					if(!gamePaused){
						gamePaused = true;
						clearInterval(gameInterval);
					}else{
						gamePaused = false;
						gameInterval = setInterval(moveGame,1000);
					}
					break;
				default:
					break;
			}
		});

		return this;
	};

	function removeLine(lineIndex){
		for(var i=0;i<gameColumns;i++){
			var p = gameMap[lineIndex][i];
				p.clear();
		}

		gameMapCounter[lineIndex] = 0;
		gameCurrentScore+=100;
		gameLineComplete++;
		if(!(gameCurrentScore%1000)){
			gameSpeed-=100;
			gameCurrentLevel++;
			clearInterval(gameInterval);
			gameInterval = setInterval(moveGame,gameSpeed);
		}
		updateGameInfo();

		for(var i=lineIndex-1;i>=0;i--){
			for(var j=0;j<gameColumns;j++){
				var p = gameMap[i][j];
				if(!(p instanceof Point)){
					continue;
				}else{
					p.clear().setPosX(j).setPosY(i+1).draw();
				}
			}
		}
	}

	function checkLineCompleted(){
		linesloop:
		for(var i = gameLines-1;i>=0;i--){
			for(var j = 0; j<gameColumns;j++){
				var p = gameMap[i][j];
				if(!(p instanceof Point)){
					continue linesloop;
				}else if(j==gameColumns-1){
					removeLine(i);
					return checkLineCompleted();
				}
			}
		}
	}

	function moveGame(){
		_currentObject.moveDown();
		if(_currentObject.isBlock){
			checkLineCompleted();
			_currentObject = _nextObject;
			_nextObject = getRandomObject();
			_currentObject.draw();
		}
	}

	this.run = function(){
		gameStarted = true;
		ctx.lineWidth = borderWidth;
		ctx.strokeStyle = "#0f0";
		_currentObject = getRandomObject();
		_nextObject = getRandomObject();
		_currentObject.draw();
		gameInterval = setInterval(moveGame,gameSpeed);
	};
}

function addEvent(obj,evt,callback){
	if(obj.addEventListener){
		obj.addEventListener(evt,callback,false);
	}else if(obj.attachEvent){
		obj.attachEvent("on"+evt,callback);
	}
}