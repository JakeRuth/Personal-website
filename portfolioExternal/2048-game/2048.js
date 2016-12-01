/*
 *
 *
 * 2048 re-code by: Jake Ruth
 *
 *
 */
 
/* Globals */
var MAX_TILES = 16;
var WINNING_VALUE = 8192;
var SQUARE_SIZE = 115;
var SQUARE_MARGIN = 8; //(500 - (115 * 4) / 4)
var STAGE_HEIGHT = 500;
var STAGE_WIDTH = 500;
var COLORS = ['maroon','red','orangered','orange','yellow','lightgreen','green','cyan','darkcyan','blue', 'purple', 'pink', 'magenta'];

$(function() {
	Game.init();
});

var Game = {
	stage: null,
	squareLayer: null,
	tileLayer: null,
	grid: null,
	squares: new Array(),
	squaresFilled: new Array(),
	squaresEmpty: new Array(),
	tiles: new Array(),
	gameIsNotOver: null,
	totalScore: 0,
	
	init: function() {
		Game.gameIsNotOver = true;
		
		/* create the stage */
		Game.stage = new Kinetic.Stage({container: 'game', width: STAGE_WIDTH, height: STAGE_HEIGHT});
		Game.createGrid();
		Game.createStartButtonListeners();
		Game.activateArrowKeyListeners();
		/* instantiate the arrays that will be used to keep track of which boxes are filled or empty */
		Game.initArrays();
		Game.initLayers();
		Game.start();
	},
	
	createGrid: function() {
		var grid = new Array();
		/* loop throught he grid of the game and create start points
		   for the boxes to be drawn */
		for(var x=SQUARE_MARGIN; x<STAGE_WIDTH; x += SQUARE_SIZE) {
			for(var y=SQUARE_MARGIN; y<STAGE_HEIGHT; y += SQUARE_SIZE) {
				grid.push({x:x , y:y});
				y += SQUARE_MARGIN;
			}
			x += SQUARE_MARGIN;
		}
		
		Game.grid = grid;
	},
	
	createStartButtonListeners: function() {
		var button = $('.start-over');
		
		button.mouseenter(function() {
			button.css('cursor', 'pointer');
		});
		
		button.mouseleave(function() {
			button.css('cursor', 'default')
		});
		
		button.click(function() {
			window.location.reload();
		});
	},
	
	activateArrowKeyListeners: function() {
		$(document).keydown(function(event){
		
			event.preventDefault();
			/* Up arrow pressed */
			var generateTile = false;
			
			if(event.which === 38) {
				if(Game.moveUp()) {
					generateTile = true;
				}
				if(Game.moveUpCombine()) {
					generateTile = true;
				}
			}
			
			/* Down arrow pressed */
			if(event.which === 40) {
				if(Game.moveDown()) {
					generateTile = true;
				}
				if(Game.moveDownCombine()) {
					generateTile = true;
				}
			}
			
			/* Right arrow pressed */
			if(event.which === 39) {
				if(Game.moveRight()) {
					generateTile = true;
				}
				if(Game.moveRightCombine()) {
					generateTile = true;
				}
			}
			
			/* Left arrow pressed */
			if(event.which === 37) {
				if(Game.moveLeft()) {
					generateTile = true;
				}
				if(Game.moveLeftCombine()) {
					generateTile = true;
				}
			}
			
			/* generate a random tile */
			if(generateTile) {
				setTimeout(function() {
					Game.generateRandomTile();
				}, 30);
			}
		});
	},
	
	initArrays: function() {
		/* loop through the arrays and initialize them all */
		for(var i=0; i<MAX_TILES; i++) {
			Game.squaresEmpty.push(i);
		}
	},
	
	initLayers: function() {
		Game.squareLayer = new Kinetic.Layer();
		Game.backgroundSquareLayer();
	},
	
	backgroundSquareLayer: function() {
		var group = new Kinetic.Group();
		
		/* loop through the game area to create 20 light gray boxes */
		for(var i=0; i<Game.grid.length; i++) {
			var square = new Kinetic.Rect({
				x: Game.grid[i].x,
				y: Game.grid[i].y,
				width: SQUARE_SIZE,
				height: SQUARE_SIZE,
				fill: '#D1D1D1'
			});
			
			group.add(square);
			Game.squares.push({square:false});
		}
		
		Game.squareLayer.add(group);
		Game.stage.add(Game.squareLayer);
	},

	generateRandomTile: function() {
		/* generate a random location for the tile to generate where there is no tile already */
		var randIndex = Math.floor(Math.random() * Game.squaresEmpty.length )
		var randEmptyValue = Game.squaresEmpty[randIndex];
		
		/* if the random index was undefined that means the game is over */
		if(!randIndex  && randIndex !== 0) {
			Game.showScore();
		}
		
		/* add this index to the filled square array and delete from the empty array */
		Game.squaresFilled.push(randEmptyValue);
		Game.squaresEmpty.splice(randIndex, 1);
		
		group = new Kinetic.Group();
		
		/* decide whether square will be a 2 or 4 randomly */
		var squareValue;
		if(Math.random() > .5) {
			squareValue = 2;
		} else {
			squareValue = 4;
		}
		
		var square = new Kinetic.Rect({
			x: Game.grid[randEmptyValue].x,
			y: Game.grid[randEmptyValue].y,
			width: SQUARE_SIZE,
			height: SQUARE_SIZE,
			fill: squareValue === 2 ? COLORS[0] : COLORS[1],
			cornerRadius: 10,
			name: 'tile'
		});
		group.add(square);
		
		var text = new Kinetic.Text({
			x: Game.grid[randEmptyValue].x,
			y: 0,
			fontSize: 50,
			fontFamily: 'Arial Black',
			fill: '#D1D1D1',
			stroke: 'black',
			strokeWidth: 2,
			width: SQUARE_SIZE,
			align: 'center',
			text: squareValue,
			name: 'text'
		});
		var textY = square.getAttr('y') + ((square.getAttr('height') - text.getAttr('height')) / 2);
		text.setAttr('y', textY)
		group.add(text);
		Game.tiles.push({tile: square, text: text, value: squareValue, index: randEmptyValue});
		
		/* sort the tiles array */
		Game.tiles = Utilities.sortTileArray(Game.tiles);
		
		/* sort the arrays */ 
		Game.squaresFilled.sort(function(a, b) { return a - b; });
		Game.squaresEmpty.sort(function(a, b) { return a - b; });
		
		Game.tileLayer.add(group);
		Game.stage.add(Game.tileLayer);
	},
	
	start: function() {
		Game.tileLayer = new Kinetic.Layer();
		for(var i=0; i<2; i++) {
			Game.generateRandomTile();
		}
	},

	moveUp: function() {
		var didTilesMove = false;
	
		/* loop through the tiles starting from the top of the grid and traverse down
		   sliding the tiles up if necessary */
		var tileIndex, moveIndex;
		for(var i=0; i<Game.tiles.length; i++) {
			var move;
			tileIndex = Game.tiles[i].index;
			/* if the tile is in the top row do nothing */
			if(tileIndex % 4 === 0) {
				move = false;
			} else {
				/* check to see if the tile before it is free, if it is look at the next tile
				   and do this until you reach the top of the board of another tile */
				for(var j=0; j < tileIndex % 4; j++) {
					/* check to see if the tile before it is taken */
					if(Utilities.checkItemInArray((tileIndex - (j+1)), Game.squaresFilled)) {
						/* make move false only if the object already isn't set to move */
						if(!move) {
							move = false;
						}
						/* index is already occupied, exit loop */
						break;
					} else {
						/* space is not occupied, square is allowed to move here */
						move = true;
						moveIndex = tileIndex - (j+1);
					}
				}
			}
			 
			/* move the tile to its new space */
			if(move) {
				/* update the tiles index */
				Game.tiles[i].index = moveIndex;
				
				/* update the arrays to keep track of filled and unfilled tile spaces */
				Game.squaresFilled.push(moveIndex);
				Game.squaresFilled.splice(Game.squaresFilled.indexOf(tileIndex), 1);
				Game.squaresEmpty.splice(Game.squaresEmpty.indexOf(moveIndex), 1);
				Game.squaresEmpty.push(tileIndex);
				/* sort the arrays */ 
				Game.squaresFilled.sort(function(a, b) { return a - b; });
				Game.squaresEmpty.sort(function(a, b) { return a - b; });
				Game.moveTile(i, moveIndex);
				
				didTilesMove = true;
			}
		}
		
		return didTilesMove;
	},
	
	moveDown: function() {
		var didTilesMove = false;
	
		/* loop through the tiles starting from the bottom right of the grid and traverse up
		   sliding the tiles up if necessary */
		var tileIndex, moveIndex;
		for(var i=Game.tiles.length - 1; i>=0; i--) {
			var move;
			tileIndex = Game.tiles[i].index;
			/* if the tile is in the bottom row do nothing */
			if(tileIndex % 4 === 3) {
				move = false;
			} else {
				/* find the index of the bottom most tile of this row */
				var bottomTileIndex;
				//tile is in 1st collumn
				if(tileIndex < 3) { bottomTileIndex = 3; }
				//tile is in 2nd collumn
				else if(tileIndex < 7) { bottomTileIndex = 7; }
				//tile is in 3rd collumn
				else if(tileIndex < 11) { bottomTileIndex = 11; }
				//tile is in last collumn
				else { bottomTileIndex = 15; }
				
				/* check to see if the tile before it is free, if it is look at the next tile
				   and do this until you reach the top of the boarder of another tile */
				for(var j=tileIndex; j < bottomTileIndex; j++) {
					/* check to see if the tile before it is taken */
					if(Utilities.checkItemInArray((j + 1), Game.squaresFilled)) {
						/* make move false only if the object already isn't set to move */
						if(!move) {
							move = false;
						}
						/* index is already occupied, exit loop */
						break;
					} else {
						/* space is not occupied, square is allowed to move here */
						move = true;
						moveIndex = j + 1;
					}
				}
			}
			 
			/* move the tile to its new space */
			if(move) {
				/* update the tiles index */
				Game.tiles[i].index = moveIndex;
				
				/* update the arrays to keep track of filled and unfilled tile spaces */
				Game.squaresFilled.push(moveIndex);
				Game.squaresFilled.splice(Game.squaresFilled.indexOf(tileIndex), 1);
				Game.squaresEmpty.splice(Game.squaresEmpty.indexOf(moveIndex), 1);
				Game.squaresEmpty.push(tileIndex);
				/* sort the arrays */ 
				Game.squaresFilled.sort(function(a, b) { return a - b; });
				Game.squaresEmpty.sort(function(a, b) { return a - b; });
				Game.moveTile(i, moveIndex);
				
				didTilesMove = true;
			}
		}
		
		return didTilesMove;
	},
	
	moveRight: function() {
		var didTilesMove = false;
		
		/* loop through the tiles starting from the top left of the grid and traverse right
		   sliding the tiles right if necessary */
		var tileIndex, moveIndex;
		
		/* create a loop to increase index as follows :
		 * 0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
		 *
		 * The bottom of the loop has more loop logic
		 */
		var move;
		for(var i=Game.tiles.length - 1; i >= 0; i--) {
			move = false;
			tileIndex = Game.tiles[i].index;
			/* if the tile is in the right collumn do nothing */
			if(tileIndex > 11) {
				move = false;
			} else {
				/* find the index of the right most tile of this row */
				var rightTileIndex;
				//tile is in 1st row
				if(tileIndex % 4 === 0) { rightTileIndex = 12; }
				//tile is in 2nd row
				else if(tileIndex % 4 === 1) { rightTileIndex = 13; }
				//tile is in 3rd row
				else if(tileIndex % 4 === 2) { rightTileIndex = 14; }
				//tile is in last row
				else if(tileIndex % 4 === 3) { rightTileIndex = 15; }
				
				/* check to see if the tile before it is free, if it is look at the next tile
				   and do this until you reach the top of the board of another tile */
				for(var j=tileIndex; j < rightTileIndex; j+=4) {
					/* check to see if the tile before it is taken */
					if(Utilities.checkItemInArray((j + 4), Game.squaresFilled)) {
						/* make move false only if the object already isn't set to move */
						if(!move) {
							move = false;
						}
						/* index is already occupied, exit loop */
						break;
					} else {
						/* space is not occupied, square is allowed to move here */
						move = true;
						moveIndex = j + 4;
					}
				}
			}
			 
			/* move the tile to its new space */
			if(move) {
				/* update the tiles index */
				Game.tiles[i].index = moveIndex;
				
				/* update the arrays to keep track of filled and unfilled tile spaces */
				Game.squaresFilled.push(moveIndex);
				Game.squaresFilled.splice(Game.squaresFilled.indexOf(tileIndex), 1);
				Game.squaresEmpty.splice(Game.squaresEmpty.indexOf(moveIndex), 1);
				Game.squaresEmpty.push(tileIndex);
				/* sort the arrays */ 
				Game.squaresFilled.sort(function(a, b) { return a - b; });
				Game.squaresEmpty.sort(function(a, b) { return a - b; });
				Game.moveTile(i, moveIndex);
				
				didTilesMove = true;
			}
		}
		
		return didTilesMove;
	},
	
	moveLeft: function() {
		var didTilesMove = false;
		
		/* loop through the tiles starting from the top left of the grid and traverse right
		   sliding the tiles right if necessary */
		var tileIndex, moveIndex;
		
		/* create a loop to increase index as follows :
		 * 0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
		 *
		 * The bottom of the loop has more loop logic
		 */
		var move;
		for(var i=0; i < Game.tiles.length; i++) {
			move = false;
			tileIndex = Game.tiles[i].index;
			
			/* if the tile is in the left row do nothing */
			if(tileIndex < 4) {
				move=false;
			} else {
				/* find the index of the bottom most tile of this row */
				var leftTileIndex;
				//tile is in 1st row
				if(tileIndex % 4 === 0) { leftTileIndex = 0; }
				//tile is in 2nd row
				else if(tileIndex % 4 === 1) { leftTileIndex = 1; }
				//tile is in 3rd row
				else if(tileIndex % 4 === 2) { leftTileIndex = 2; }
				//tile is in last row
				else if(tileIndex % 4 === 3) { leftTileIndex = 3; }
				
				/* check to see if the tile before it is free, if it is look at the next tile
				   and do this until you reach the top of the board of another tile */
				for(var j=tileIndex; j > leftTileIndex; j-=4) {
					/* check to see if the tile before it is taken */
					if(Utilities.checkItemInArray((j - 4), Game.squaresFilled)) {
						/* make move false only if the object already isn't set to move */
						if(!move) {
							move = false;
						}
						/* index is already occupied, exit loop */
						break;
					} else {
						/* space is not occupied, square is allowed to move here */
						move = true;
						moveIndex = j - 4;
					}
				}
			}
			 
			/* move the tile to its new space */
			if(move) {
				/* update the tiles index */
				Game.tiles[i].index = moveIndex;
				
				/* update the arrays to keep track of filled and unfilled tile spaces */
				Game.squaresFilled.push(moveIndex);
				Game.squaresFilled.splice(Game.squaresFilled.indexOf(tileIndex), 1);
				Game.squaresEmpty.splice(Game.squaresEmpty.indexOf(moveIndex), 1);
				Game.squaresEmpty.push(tileIndex);
				/* sort the arrays */ 
				Game.squaresFilled.sort(function(a, b) { return a - b; });
				Game.squaresEmpty.sort(function(a, b) { return a - b; });
				Game.moveTile(i, moveIndex);
				
				didTilesMove = true;
			}
		}
		
		return didTilesMove;
	},
	
	moveTile: function(tileIndex, moveIndex) {
		var tween = new Kinetic.Tween({
			node: Game.tiles[tileIndex].tile, 
			x: Game.grid[moveIndex].x,
			y: Game.grid[moveIndex].y,
			easing: Kinetic.Easings['StrongEaseOut'],
			duration: .03
        });
		tween.play();
		
		tween = new Kinetic.Tween({
			node: Game.tiles[tileIndex].text, 
			x: Game.grid[moveIndex].x,
			y: Game.grid[moveIndex].y + 30,
			easing: Kinetic.Easings['StrongEaseOut'],
			duration: .03
        });
		tween.play();
	},
	
	moveTileCustom: function(tileIndex, moveIndex, array) {
		var tween = new Kinetic.Tween({
			node: array[tileIndex].text, 
			x: Game.grid[moveIndex].x,
			y: Game.grid[moveIndex].y + 30,
			easing: Kinetic.Easings['StrongEaseOut'],
			duration: .03
        });
		tween.play();
		tween = new Kinetic.Tween({
			node: array[tileIndex].tile, 
			x: Game.grid[moveIndex].x,
			y: Game.grid[moveIndex].y,
			easing: Kinetic.Easings['StrongEaseOut'],
			duration: .03
        });
		tween.play();
	},
	
	moveUpCombine: function() {
		var didTilesMove = false;
	
		Game.tiles = Utilities.sortTileArray(Game.tiles);
	
		/* loop through the tiles and combine two tiles if they have the same value */
		for(var i=0; i<Game.tiles.length - 1; i++) {
			var currTile = Game.tiles[i];
			/* if there is another tile, get at it and store it */
			var nextTile = Game.tiles[i+1] ? Game.tiles[i+1] : null;
			
			/* check to see it the two tiles should be combined, only if they are in the same collumn */
			if((nextTile) && (nextTile.index % 4 !== 0)) {
				/* if the two tiles have the same value and are adjacent to each other, combine them */
				if((currTile.index === (nextTile.index - 1)) && (currTile.value === nextTile.value)) {
					didTilesMove = true;
					
					/* destroy the next tile from the game */
					var indexOfTileToRemove = Game.tiles.indexOf(nextTile);
					Game.tiles[indexOfTileToRemove].tile.destroy();
					Game.tiles[indexOfTileToRemove].text.destroy();
					Game.tiles.splice(indexOfTileToRemove, 1);
					
					Utilities.updateArrays();
					
					/* update the tiles value */
					var newColorIndex = Utilities.getNextColor(Game.tiles[i].value);
					
					//if the value is too big, make the font smaller
					if(Game.tiles[i].value >= 5000) {
						Game.tiles[i].text.setAttr('fontSize', 30);
					} else if(Game.tiles[i].value >= 500) {
						Game.tiles[i].text.setAttr('fontSize', 40);
					}
					Game.tiles[i].tile.setAttr('fill', COLORS[newColorIndex]);
					var newTileValue = Game.tiles[i].value * 2;
					Game.tiles[i].text.setAttr('text', newTileValue);
					Game.tiles[i].value = newTileValue;
					
					/* increase the score and change the UI to match */
					Game.totalScore += newTileValue;
					$('.score-number').text(Game.totalScore);
					
					/* if there are other tiles in that row, move them up to the next available space */
					var searchUntilIndex = currTile.index < 3  ? 3
									     : currTile.index < 7  ? 7
									     : currTile.index < 11 ? 11
									     : currTile.index < 15 ? 15
									     : null;
					var moveToIndex = currTile.index + 1;
					
					for(var j=indexOfTileToRemove; j<Game.tiles.length; j++) {
						var tile = Game.tiles[j];
						
						/* if the tile is within the move range, move it to the next available space */
						if(tile.index <= searchUntilIndex) {
							Game.moveTile(j, moveToIndex);

							/* update the index of the moved tile */
							Game.tiles[j].index = moveToIndex;
							
							/* update arrays */
							Utilities.updateArrays();
							
							/* sort the arrays(not necessary but here for safety) */
							Game.squaresFilled.sort(function(a, b) { return a - b; });
							Game.squaresEmpty.sort(function(a, b) { return a - b; });
							moveToIndex++;
						} else {
							break;
						}
					}
					
				}
			}
		}
		
		return didTilesMove;
	},
	
	moveDownCombine: function() {
		var didTilesMove = false;
		
		Game.tiles = Utilities.sortTileArray(Game.tiles);
		
		/* loop through the tiles and combine two tiles if they have the same value */
		for(var i=Game.tiles.length - 1; i>=0; i--) {
			var currTile = Game.tiles[i];
			/* if there is another tile, get at it and store it */
			var nextTile = Game.tiles[i-1] ? Game.tiles[i-1] : null;
			
			/* check to see it the two tiles should be combined, only if they are in the same collumn */
			if((nextTile) && (nextTile.index % 4 !== 3)) {
				/* if the two tiles have the same value and are adjacent to each other, combine them */
				if((currTile.index === (nextTile.index + 1)) && (currTile.value === nextTile.value)) {
					didTilesMove = true;
					/* destroy the next tile from the game */
					var indexOfTileToRemove = Game.tiles.indexOf(nextTile);
					Game.tiles[indexOfTileToRemove].tile.destroy();
					Game.tiles[indexOfTileToRemove].text.destroy();
					Game.tiles.splice(indexOfTileToRemove, 1);
					
					/* decrement i because Game.tiles now has one less element */
					i--;
					
					Utilities.updateArrays();
					
					/* update the tiles value */
					var newColorIndex = Utilities.getNextColor(Game.tiles[i].value);
					Game.tiles[i].tile.setAttr('fill', COLORS[newColorIndex]);
					
					//if the value is too big, make the font smaller
					if(Game.tiles[i].value >= 5000) {
						Game.tiles[i].text.setAttr('fontSize', 30);
					} else if(Game.tiles[i].value >= 500) {
						Game.tiles[i].text.setAttr('fontSize', 40);
					}
					var newTileValue = Game.tiles[i].value * 2;
					Game.tiles[i].text.setAttr('text', newTileValue);
					Game.tiles[i].value = newTileValue;
					
					/* increase the score and change the UI to match */
					Game.totalScore += newTileValue;
					$('.score-number').text(Game.totalScore);
					
					/* if there are other tiles in that row, move them up to the next available space */
					var searchUntilIndex = currTile.index > 12 ? 12
									     : currTile.index > 8  ? 8
									     : currTile.index > 4  ? 4
									     : currTile.index > 0  ? 0
									     : null;
					var moveToIndex = currTile.index - 1;
					
					for(var j=indexOfTileToRemove - 1; j>=0; j--) {
						var tile = Game.tiles[j];
						
						/* if the tile is within the move range, move it to the next available space */
						if(tile.index >= searchUntilIndex) {
							Game.moveTile(j, moveToIndex);

							/* update the index of the moved tile */
							Game.tiles[j].index = moveToIndex;
							
							/* update arrays */
							Utilities.updateArrays();
							
							/* sort the arrays(not necessary but here for safety) */
							Game.squaresFilled.sort(function(a, b) { return a - b; });
							Game.squaresEmpty.sort(function(a, b) { return a - b; });
							moveToIndex--;
						} else {
							break;
						}
					}
					
				}
			}
		}
		
		return didTilesMove;
	},
	
	moveRightCombine: function() {
		var didTilesMove = false;
		
		Game.tiles = Utilities.sortTileArray(Game.tiles);
		
		/* create a modified game tile array to loop through so that the order
		 * of the tiles reads left to right, top to bottom */
		var modifiedGameTiles = new Array(),
			modulus = 3;
			
		while(modulus >= 0) {
			for(var k=Game.tiles.length - 1; k>=0; k--) {
				if(Game.tiles[k].index % 4 === modulus) {
					modifiedGameTiles.push(Game.tiles[k]);
				}
			}
			
			modulus--;
		}
	
		/* loop through the tiles and combine two tiles if they have the same value */
		for(var i=0; i < modifiedGameTiles.length; i++) {
			var currTile = modifiedGameTiles[i];
			/* if there is another tile, get at it and store it */
			var nextTile = modifiedGameTiles[i+1] ? modifiedGameTiles[i+1] : null;
			
			/* check to see if the two tiles should be combined, only if they are in the same row */
			if((nextTile) && (nextTile.index < 12)) {
				/* if the two tiles have the same value and are adjacent to each other, combine them */
				if(((currTile.index % 4) === (nextTile.index % 4)) && (currTile.value === nextTile.value)) {
					didTilesMove = true;
					
					/* destroy the next tile from the game */
					var indexOfTileToRemove = modifiedGameTiles.indexOf(nextTile);
					modifiedGameTiles[indexOfTileToRemove].tile.destroy();
					modifiedGameTiles[indexOfTileToRemove].text.destroy();
					modifiedGameTiles.splice(indexOfTileToRemove, 1);
					Game.tiles = modifiedGameTiles;
					
					Game.tiles = Utilities.sortTileArray(Game.tiles);
					Utilities.updateArrays();
					
					/* update the tiles value */
					var newColorIndex = Utilities.getNextColor(modifiedGameTiles[i].value);
					modifiedGameTiles[i].tile.setAttr('fill', COLORS[newColorIndex]);
					
					//if the value is too big, make the font smaller
					if(modifiedGameTiles[i].value >= 5000) {
						modifiedGameTiles[i].text.setAttr('fontSize', 30);
					} else if(modifiedGameTiles[i].value >= 500) {
						modifiedGameTiles[i].text.setAttr('fontSize', 40);
					}
					var newTileValue = modifiedGameTiles[i].value * 2;
					modifiedGameTiles[i].text.setAttr('text', newTileValue);
					modifiedGameTiles[i].value = newTileValue;
					Game.tiles = modifiedGameTiles;
					Game.tiles = Utilities.sortTileArray(Game.tiles);
					
					/* increase the score and change the UI to match */
					Game.totalScore += newTileValue;
					$('.score-number').text(Game.totalScore);
					
					/* if there are other tiles in that row, move them up to the next available space */
					var searchWithinModulusIndex = currTile.index % 4 === 3 ? 3
									     : currTile.index % 4 === 2 ? 2
									     : currTile.index % 4 === 1 ? 1
									     : currTile.index % 4 === 0 ? 0
									     : null;
					var moveToIndex = currTile.index - 4;
					
					for(var j=indexOfTileToRemove; j<modifiedGameTiles.length; j++) {
						var tile = modifiedGameTiles[j];
						
						/* if the tile is within the move range, move it to the next available space */
						if(tile.index % 4 === searchWithinModulusIndex) {
							Game.moveTileCustom(j, moveToIndex, modifiedGameTiles);

							/* update the index of the moved tile */
							modifiedGameTiles[j].index = moveToIndex;
							
							/* update arrays */
							Game.tiles = modifiedGameTiles;
							Game.tiles = Utilities.sortTileArray(Game.tiles);
							Utilities.updateArrays();
							
							/* sort the arrays(not necessary but here for safety) */
							Game.squaresFilled.sort(function(a, b) { return a - b; });
							Game.squaresEmpty.sort(function(a, b) { return a - b; });
							moveToIndex-=4;
						} else {
							break;
						}
					}
					
				}
			}
		}
		
		return didTilesMove;
	},
	
	moveLeftCombine: function() {
		var didTilesMove = false;
		
		Game.tiles = Utilities.sortTileArray(Game.tiles);
		
		/* create a modified game tile array to loop through so that the order
		 * of the tiles reads left to right, top to bottom */
		var modifiedGameTiles = new Array(),
			modulus = 3;
			
		while(modulus >= 0) {
			for(var k=Game.tiles.length - 1; k>=0; k--) {
				if(Game.tiles[k].index % 4 === modulus) {
					modifiedGameTiles.push(Game.tiles[k]);
				}
			}
			
			modulus--;
		}
	
		/* loop through the tiles and combine two tiles if they have the same value */
		for(var i=modifiedGameTiles.length - 1; i >= 0; i--) {
			var currTile = modifiedGameTiles[i];
			/* if there is another tile, get at it and store it */
			var nextTile = modifiedGameTiles[i-1] ? modifiedGameTiles[i-1] : null;
			
			/* check to see if the two tiles should be combined, only if they are in the same row */
			if((nextTile) && (nextTile.index > 3)) {
				/* if the two tiles have the same value and are adjacent to each other, combine them */
				if(((currTile.index % 4) === (nextTile.index % 4)) && (currTile.value === nextTile.value)) {
					didTilesMove = true;
					
					/* destroy the next tile from the game */
					var indexOfTileToRemove = modifiedGameTiles.indexOf(nextTile);
					modifiedGameTiles[indexOfTileToRemove].tile.destroy();
					modifiedGameTiles[indexOfTileToRemove].text.destroy();
					modifiedGameTiles.splice(indexOfTileToRemove, 1);
					Game.tiles = modifiedGameTiles;
					
					//decrement i to compensate for list having one less item
					i--;
					
					Game.tiles = Utilities.sortTileArray(Game.tiles);
					Utilities.updateArrays();
					
					/* update the tiles value */
					var newColorIndex = Utilities.getNextColor(modifiedGameTiles[i].value);
					modifiedGameTiles[i].tile.setAttr('fill', COLORS[newColorIndex]);
					
					//if the value is too big, make the font smaller
					if(modifiedGameTiles[i].value >= 5000) {
						modifiedGameTiles[i].text.setAttr('fontSize', 30);
					} else if(modifiedGameTiles[i].value >= 500) {
						modifiedGameTiles[i].text.setAttr('fontSize', 40);
					}
					var newTileValue = modifiedGameTiles[i].value * 2;
					modifiedGameTiles[i].text.setAttr('text', newTileValue);
					modifiedGameTiles[i].value = newTileValue;
					Game.tiles = modifiedGameTiles;
					Game.tiles = Utilities.sortTileArray(Game.tiles);
					
					/* increase the score and change the UI to match */
					Game.totalScore += newTileValue;
					$('.score-number').text(Game.totalScore);
					
					/* if there are other tiles in that row, move them up to the next available space */
					var searchWithinModulusIndex = currTile.index % 4 === 3 ? 3
									     : currTile.index % 4 === 2 ? 2
									     : currTile.index % 4 === 1 ? 1
									     : currTile.index % 4 === 0 ? 0
									     : null;
					var moveToIndex = currTile.index + 4;
					
					for(var j=indexOfTileToRemove-1; j>=0; j--) {
						var tile = modifiedGameTiles[j];
						
						/* if the tile is within the move range, move it to the next available space */
						if(tile.index % 4 === searchWithinModulusIndex) {
							Game.moveTileCustom(j, moveToIndex, modifiedGameTiles);

							/* update the index of the moved tile */
							modifiedGameTiles[j].index = moveToIndex;
							
							/* update arrays */
							Game.tiles = modifiedGameTiles;
							Game.tiles = Utilities.sortTileArray(Game.tiles);
							Utilities.updateArrays();
							
							/* sort the arrays(not necessary but here for safety) */
							Game.squaresFilled.sort(function(a, b) { return a - b; });
							Game.squaresEmpty.sort(function(a, b) { return a - b; });
							moveToIndex+=4;
						} else {
							break;
						}
					}
					
				}
			}
		}
		
		return didTilesMove;
	}
};

var Utilities = {
	//this is a very messy function, should be cleaned up and optimized
	sortTileArray: function(tileArray) {
		var sortedArray = new Array();
		var indexList = new Array();
		for(var i=0; i<tileArray.length; i++) {
			indexList.push(tileArray[i].index);
		}
		indexList.sort(function(a, b) { return a - b; });
		
		for(var i=0; i<tileArray.length; i++) {
			var tile;
			var currIndex = indexList[i];
			/* loop to find the index in tile array map that matches the current index */
			for(var j=0; j<tileArray.length; j++) {
				if(tileArray[j].index === currIndex) {
					tile = tileArray[j];
					break;
				}
			}
			/* add the tile to the sorted array */
			sortedArray.push(tile);
		}
		return sortedArray;
	},
	
	checkItemInArray: function(item, array) {
		for(var i=0; i<array.length; i++) {
			if(array[i] === item) {
				return true
			}
		}
		return false;
	},
	
	getNextColor: function(value) {
		var colorIndex;
		var powersOfTwo = 2;
		
		for(var i=1; i<COLORS.length; i++) {
			if(value === powersOfTwo) {
				return i;
			}
			
			powersOfTwo = powersOfTwo * 2;
		}
		
		return colorIndex;
	},
	
	updateArrays: function() {
		Game.squaresFilled = new Array();
		Game.squaresEmpty = new Array();
		
		j=0;
		for(var i=0; i<MAX_TILES; i++) {
			if((Game.tiles[j]) && (Game.tiles[j].index === i)) {
				Game.squaresFilled.push(i);
				j++;
			} else {
				Game.squaresEmpty.push(i);
			}
		}
	}
};