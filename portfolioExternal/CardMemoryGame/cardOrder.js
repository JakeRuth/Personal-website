/* 
 *
 *  Card Order game by Jake Ruth 
 *	
 */

/* global variables */
var CENTERX = null;
var CENTERY = null;
var STAGE_HEIGHT = null;
var STAGE_WIDTH = null;
var CARD_WIDTH = null;
var CARD_HEIGHT = null;
var CARD_Y = null;
var CARD_START_X = null;
var CARD_PADDING = null;
var CARD_CONTAINER_WIDTH = null;
var CHOICE_WIDTH = null;
var CHOICE_HEIGHT = null;
var CHOICES_Y = null;

var CURR_ROUND = 1;
var MAX_ROUND = 10;
var CURR_LEVEL = 1;
var MAX_LEVEL = 4;
var BOTTOM_OFFSET = 130;

$(function() {
	$('html,body').animate({scrollTop: $('#title').offset().top}, 'fast');
	
	/* initiliaze instruction close listener */
	$('#instruction-close').on('click', function () {
		Utilities.instructions(false);
	});
	
	$('#start').click(function() {
		$('#startUp').hide();
		/* wait for a fraction of a seconds before the game begins */
		setTimeout(function() {
			cardOrder.init();
		}, 300);
	});
});

var cardOrder = {

	stage: null,
	cardLayer: null,
	roundLayer: null,
	choiceLayer: null,
	totalCardsToPlay: 40,
	cardsPerTurn: 4,
	cardFontSize: 160,
	numCorrect: 0,
	numWrong: 0,
	cardsSelected: 0,
	numbersToDisplay: [],
	numbersSelected: [],
	cards: [],
	
	init: function () {
		cardOrder.setSizes();
		cardOrder.stage = new Kinetic.Stage({container: 'game', width: STAGE_WIDTH, height: STAGE_HEIGHT});
		cardOrder.setNumbersToDisplay();
		
		/* instantiate the layers */
		cardOrder.initLayers();
		setTimeout(function () {
			cardOrder.fadeInCards();
			
			/* flip the cards over after 3 seconds */
			setTimeout(function () {
				cardOrder.flipCardsOver();
				
				setTimeout(function () {
					cardOrder.fadeChoicesIn();
					cardOrder.choiceLayer.setAttr('listening', true);
				}, 2000);
			}, 3000);
		}, 300);
	},
	
	setSizes: function () {
		/* get the width and height of the stage */
		var width = $(window).innerWidth();
		var height = $(window).innerHeight() - $('#container').height() - BOTTOM_OFFSET;
		STAGE_WIDTH = width < 1126 ? 1126 : width;
		STAGE_HEIGHT = height < 400 ? 400 : height;
		CENTERY = STAGE_HEIGHT / 2;
		CENTERX = STAGE_WIDTH / 2;
		
		/* set the width of the game container */
		$('#game').width(STAGE_WIDTH - 40);
		
		/* set card deminsions */
		CARD_START_X = 150;
		CARD_CONTAINER_WIDTH = STAGE_WIDTH - (CARD_START_X * 2);
		CARD_WIDTH = CARD_CONTAINER_WIDTH / cardOrder.cardsPerTurn >= 220 ? 220 : (CARD_CONTAINER_WIDTH / cardOrder.cardsPerTurn) - 20;
		CARD_HEIGHT = STAGE_HEIGHT / 2;
		CARD_Y = STAGE_HEIGHT / 6;
		
		/* set additional card variables */
		if (cardOrder.cardsPerTurn === 2) {
			 CARD_PADDING = (CARD_CONTAINER_WIDTH - (cardOrder.cardsPerTurn * CARD_WIDTH)) ;
		} else {
			CARD_PADDING = (CARD_CONTAINER_WIDTH - (cardOrder.cardsPerTurn * CARD_WIDTH)) / cardOrder.cardsPerTurn;
		}
		
		/* set the dimensions for the choice boxes */
		CHOICE_WIDTH = CARD_CONTAINER_WIDTH / 10;
		CHOICE_HEIGHT = CARD_HEIGHT / 2;
		CHOICES_Y = STAGE_HEIGHT - (CHOICE_HEIGHT * 1.2);
		
		/* reset necessary variables */
		cardOrder.cardsSelected = 0;
		cardOrder.cardsPlayed = 0;
		cardOrder.numbersToDisplay = [];
		cardOrder.numbersSelected = [];
		cardOrder.cards = [];
	},
	
	setNumbersToDisplay: function () {
		//gnereate a list of of unique numbers
		var possibleNumbers = [0,1,2,3,4,5,6,7,8,9];
		
		for(var i=0; i<cardOrder.cardsPerTurn; i++) {
			var randomIndex = Math.floor(Math.random() * possibleNumbers.length);
			cardOrder.numbersToDisplay.push(possibleNumbers[randomIndex]);
			possibleNumbers.splice(randomIndex, 1);
		}
	},
	
	initLayers: function () {
		cardOrder.roundLayer = new Kinetic.Layer();
		cardOrder.initRoundLayer();
		cardOrder.cardLayer = new Kinetic.Layer({ opacity: 0 });
		cardOrder.initCardLayer();
		cardOrder.choiceLayer = new Kinetic.Layer({ 
			opacity: 0,
			listening: false
		});
		cardOrder.initChoiceLayer();
	},
	
	initRoundLayer: function () {
		var round = new Kinetic.Text({
            x: 15,
            y: 15,
            text: 'Round: ' + CURR_ROUND + '/' + MAX_ROUND,
            fontSize: 25,
            fontFamily: 'Calibri',
            fill: 'black',
            name: 'round'
        });
		cardOrder.roundLayer.add(round);
		cardOrder.stage.add(cardOrder.roundLayer);
	},
	
	initCardLayer: function () {
		var x = CARD_START_X;
	
		for(var i=0; i<cardOrder.cardsPerTurn; i++) {
			var group = new Kinetic.Group();
			
			var card = new Kinetic.Rect({
				x: x,
				y: CARD_Y,
				width: CARD_WIDTH,
				height: CARD_HEIGHT,
				cornerRadius: 8,
				fill: 'white',
				stroke: 1,
				strokeFill: 'black'
			});
			group.add(card);
			
			var numberToDisplay = cardOrder.numbersToDisplay[i];
			var cardNumber = new Kinetic.Text({
				x: x + (CARD_WIDTH / 3),
				y: CARD_Y + (CARD_HEIGHT / 4),
				text: numberToDisplay,
				fontSize: cardOrder.cardFontSize,
				fontFamily: 'Calibri',
				fill: 'midnightblue'
			});
			group.add(cardNumber);
			
			cardOrder.cards.push(group);
			cardOrder.cardLayer.add(group);
			
			x += (CARD_PADDING + CARD_WIDTH);
		}
		
		cardOrder.stage.add(cardOrder.cardLayer);
	},
	
	initChoiceLayer: function () {
		var  x = CARD_START_X;
		
		for(var i=0; i<10; i++) {
			var group = new Kinetic.Group();
			
			var choiceContainer = new Kinetic.Rect({
				x: x,
				y: CHOICES_Y,
				width: CHOICE_WIDTH,
				height: CHOICE_HEIGHT,
				fill: 'white',
				stroke: 'black',
				strokeFill: 1,
				cornerRadius: 5
			});
			group.add(choiceContainer);
			
			var number = new Kinetic.Text({
				x: x + (CHOICE_WIDTH / 3),
				y: CHOICES_Y + (CHOICE_HEIGHT / 4),
				text: i,
				fontSize: 80,
				fontFamily: 'Calibri',
				fill: 'midnightblue'
			});
			group.add(number);
			
			cardOrder.setChoiceListener(group);
			cardOrder.choiceLayer.add(group);
			
			x  += CHOICE_WIDTH;
		}
		cardOrder.stage.add(cardOrder.choiceLayer);
	},
	
	setChoiceListener: function (group) {
		group.on('mouseover', function () {
			var cardContainer = this.children[0];
			cardContainer.setAttr('fill', 'cyan');
			cardOrder.choiceLayer.draw();
			
			$('#game').css('cursor', 'pointer');
		});
		
		group.on('mouseout', function () {
			var cardContainer = this.children[0];
			cardContainer.setAttr('fill', 'white');
			cardOrder.choiceLayer.draw();
			
			$('#game').css('cursor', 'default');
		});
		
		group.on('click touchstart dragend', function () {
			var cardContainer = this.children[0]
				  number = this.children[1];
				  
			if (cardOrder.cardsSelected < cardOrder.cardsPerTurn) {
				cardContainer.setAttr('opacity', .4);
				number.setAttr('opacity', .4);
				this.setAttr('listening', false);
				cardOrder.choiceLayer.draw();
				
				cardOrder.numbersSelected.push(number.getAttr('text'));
				cardOrder.cardsSelected++;
			} 
			
			if (cardOrder.cardsSelected >= cardOrder.cardsPerTurn) {
				cardOrder.choiceLayer.setAttr('listening', false);
				cardOrder.choiceLayer.draw();
				
				/* the round is now over, compute the score depending on whether or not
				   the game is currently expecting reverse order or normal order */
				var score;
				if (CURR_LEVEL % 2 === 1) {
					score = cardOrder.computeScoreForward();
				} else {
					score = cardOrder.computeScoreBackward();
				}
				
				/* update users score */
				if (score >= .8) {
					cardOrder.numCorrect++;
				} else {
					cardOrder.numWrong++;
				}
				
				if (CURR_ROUND != MAX_ROUND) {
					//if the score is >=(80%) then the user get that round correct
					if (score >= .8) {
						cardOrder.showNextMessage(score);
					} else {
						cardOrder.showNextMessage(score);
					}
				} else {
					/* re-compute the score now that the level is over */
					score = cardOrder.numCorrect / (cardOrder.numCorrect + cardOrder.numWrong);
					if (score >= .8) {
						cardOrder.showWinMessage(score);
					} else {
						cardOrder.showLossMessage(score);
					}
				}
			}
		});
	},
	
	fadeInCards: function () {
		var tween = new Kinetic.Tween({
			node: cardOrder.cardLayer,
			opacity: 1,
			duration: 3
		});
		tween.play();
	},
	
	flipCardsOver: function () {
		for(var i=0; i<cardOrder.cardsPerTurn; i++) {
			var card = cardOrder.cards[i],
				cardContainer = card.children[0],
				cardNumber = card.children[1];
				
			var cardCloseTween = new Kinetic.Tween({
				node: cardContainer,
				duration: 1,
				width: 0,
				cornerRadius: 0,
				x: cardContainer.getAttr('x') + (CARD_WIDTH / 2)
			});
			cardCloseTween.play();
			
			var numberVanishTween = new Kinetic.Tween({
				node: cardNumber,
				duration: .6,
				opacity: 0
			});
			numberVanishTween.play();
		}
		
		/* wait for the cards to close, then re-open them in a flipped over state */
		setTimeout(function () {
			for(var i=0; i<cardOrder.cardsPerTurn; i++) {
				var card = cardOrder.cards[i],
					cardContainer = card.children[0],
					cardNumber = card.children[1];
					
				var cardReOpenTween = new Kinetic.Tween({
					node: cardContainer,
					duration: 1,
					width: CARD_WIDTH,
					cornerRadius: 8,
					x: cardContainer.getAttr('x') - (CARD_WIDTH / 2)
				});
				cardReOpenTween.play();
				
				/* set proper attribute before card fully re-flips back over */
				cardContainer.setAttr('fill', '#8FD8FF');
				cardContainer.setAttr('opacity', .7);
			}
		}, 1000);
	},
	
	fadeChoicesIn: function () {
		var tween = new Kinetic.Tween({
			node: cardOrder.choiceLayer,
			opacity: 1,
			duration: 1
		});
		tween.play();
	},
	
	computeScoreForward: function () {
		var numCorrect = 0,
			numWrong = 0; 
	
		for(var i=0; i<cardOrder.cardsPerTurn; i++) {
			if (cardOrder.numbersToDisplay[i] === Number(cardOrder.numbersSelected[i])) {
				numCorrect++;
			} else {
				numWrong++;
			}
		}
		
		return numCorrect / cardOrder.cardsPerTurn;
	},
	
	computeScoreBackward: function () {
		var j=0,
			numCorrect = 0,
			numWrong = 0;
		for(var i=cardOrder.cardsPerTurn - 1; i >= 0; i--) {
			if (cardOrder.numbersToDisplay[i] === Number(cardOrder.numbersSelected[j++])) {
				numCorrect++;
			} else {
				numWrong++;
			}
		}
		
		return numCorrect / cardOrder.cardsPerTurn;
	},
	
	showLossMessage: function (score) {
		var winMessage = new Kinetic.Layer();
		var group = new Kinetic.Group();
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			width: 520,
			height: 170,
			fill: '#8787C3',
			stroke: 'midnightblue',
			strokeWidth: 6,
			cornerRadius: 5
		});
		container.setAttr('y', ((STAGE_HEIGHT - 200) / 2));
		container.offsetX(container.width()/2);
		group.add(container);
		
		
		var text1 = new Kinetic.Text({
			x: CENTERX,
			y: container.getAttr('y') + 20,
			text: 'You scored ' + Math.round(score * 100) + '% try again.',
			fontSize: 40,
			fontFamily: 'Calibri',
			fill: 'black',
			fontStyle: 'bold',
			align: 'center'
		});
		text1.offsetX(text1.width()/2);
		group.add(text1);
		
		winMessage.add(group);
		cardOrder.stage.add(winMessage);
		
		cardOrder.playAgainNoNext();
	},
	
	showWinMessage: function (score) {
		var winMessage = new Kinetic.Layer();
		var group = new Kinetic.Group();
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			width: 520,
			height: 170,
			fill: '#8787C3',
			stroke: 'midnightblue',
			strokeWidth: 6,
			cornerRadius: 5
		});
		container.setAttr('y', ((STAGE_HEIGHT - 200) / 2));
		container.offsetX(container.width()/2);
		group.add(container);
		
		
		var text1 = new Kinetic.Text({
			x: CENTERX,
			y: container.getAttr('y') + 20,
			text: 'You scored ' + Math.round(score * 100) + '% nice job!',
			fontSize: 40,
			fontFamily: 'Calibri',
			fill: 'black',
			fontStyle: 'bold',
			align: 'center'
		});
		text1.offsetX(text1.width()/2);
		group.add(text1);
		
		winMessage.add(group);
		cardOrder.stage.add(winMessage);
		
		if (CURR_LEVEL < MAX_LEVEL) {
			CURR_LEVEL++;
			CURR_ROUND = 1;
			cardOrder.setVariablesForHigherDifficulty();
			cardOrder.playNextLevel();
		} else {
			CURR_LEVEL = 1;
			CURR_ROUND = 1;
			cardOrder.resetVariablesForStartingDifficulty();
			cardOrder.playNextLevel('Start Over');
		}
	},
	
	showNextMessage: function (score) {
		cardOrder.increaseRound();
	
		var winMessage = new Kinetic.Layer();
		var group = new Kinetic.Group();
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			width: 520,
			height: 170,
			fill: '#8787C3',
			stroke: 'midnightblue',
			strokeWidth: 6,
			cornerRadius: 5
		});
		container.setAttr('y', ((STAGE_HEIGHT - 200) / 2));
		container.offsetX(container.width()/2);
		group.add(container);
		
		
		var text1 = new Kinetic.Text({
			x: CENTERX,
			y: container.getAttr('y') + 20,
			text: 'You scored ' + Math.round(score * 100) + '%',
			fontSize: 40,
			fontFamily: 'Calibri',
			fill: 'black',
			fontStyle: 'bold',
			align: 'center'
		});
		text1.offsetX(text1.width()/2);
		group.add(text1);
		
		winMessage.add(group);
		cardOrder.stage.add(winMessage);
		
		cardOrder.playAgain('Next');
	},
	
	setVariablesForHigherDifficulty: function () {
		if (CURR_LEVEL % 2 === 1) {
			cardOrder.cardsPerTurn++;

			if (cardOrder.cardsPerTurn >= 5) {
				cardOrder.cardFontSize -= 20;
			}
		}
		
		cardOrder.numCorrect = 0;
		cardOrder.numWrong = 0;
		
		cardOrder.totalCardsToPlay = cardOrder.cardsPerTurn * 10;
		cardOrder.toggleSubtitle();
	},
	
	resetVariablesForStartingDifficulty: function () {
		cardOrder.cardsPerTurn = 4;
		cardOrder.totalCardsToPlay = 40;
		cardOrder.cardFontSize = 160;
		
		cardOrder.numCorrect = 0;
		cardOrder.numWrong = 0;
		
		cardOrder.toggleSubtitle();
	},
	
	resetCurrentLevel: function () {
		CURR_ROUND = 1;
		cardOrder.numCorrect = 0;
		cardOrder.numWrong = 0;
	},
	
	toggleSubtitle: function () {
		var subtitle = $('#subtitle-guidance'),
			subtitleText = subtitle.text();
		
		if (subtitleText === 'left to right') {
			subtitle.text('right to left');
		} else {
			subtitle.text('left to right');
		}
	},
	
	increaseRound: function () {
		if(CURR_ROUND < MAX_ROUND) {
			CURR_ROUND++;
		} else {
			CURR_ROUND = 1;
		}	
	},
	
	playAgain: function (messageOverride) {
		var group = new Kinetic.Group();
		var againLayer = new Kinetic.Layer();
		
		var link = messageOverride ? messageOverride : 'Play Again';
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			y: CENTERY + 7,
			width: 100,
			height: 45,
			fill: 'whitesmoke',
			cornerRadius: 5
		});
		container.offsetX(container.width()/2);
		group.add(container);
		
		var text = new Kinetic.Text({
			x: CENTERX,
			y: CENTERY + 14,
			text: link,
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'black'
		});
		text.offsetX(text.width()/2);
		group.add(text);
		
		/* set the event listeners for the replay button */
		container.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        container.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		text.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        text.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		container.on('click touchstart', function() {
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		text.on('click touchstart', function() {
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		
		againLayer.add(group);
		cardOrder.stage.add(againLayer);
	},
	
	playAgainNoNext: function (messageOverride) {
		var group = new Kinetic.Group();
		var againLayer = new Kinetic.Layer();
		
		var link = messageOverride ? messageOverride : 'Play Again';
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			y: CENTERY + 7,
			width: 150,
			height: 45,
			fill: 'whitesmoke',
			cornerRadius: 5
		});
		container.offsetX(container.width()/2);
		group.add(container);
		
		var text = new Kinetic.Text({
			x: CENTERX,
			y: CENTERY + 14,
			text: link,
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'black'
		});
		text.offsetX(text.width()/2);
		group.add(text);
		
		/* set the event listeners for the replay button */
		container.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        container.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		text.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        text.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		container.on('click touchstart', function() {
			cardOrder.resetCurrentLevel();
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		text.on('click touchstart', function() {
			cardOrder.resetCurrentLevel();
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		
		againLayer.add(group);
		cardOrder.stage.add(againLayer);
	},
	
	playNextLevel: function (messageOverride) {
		var group = new Kinetic.Group();
		var againLayer = new Kinetic.Layer();
		
		var link = messageOverride ? messageOverride : 'Next Level';
		
		var container = new Kinetic.Rect({
			x: CENTERX,
			y: CENTERY + 7,
			width: 150,
			height: 45,
			fill: 'whitesmoke',
			cornerRadius: 5
		});
		container.offsetX(container.width()/2);
		group.add(container);
		
		var text = new Kinetic.Text({
			x: CENTERX,
			y: CENTERY + 14,
			text: link,
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'black'
		});
		text.offsetX(text.width()/2);
		group.add(text);
		
		/* set the event listeners for the replay button */
		container.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        container.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		text.on('mouseover', function() {
            document.getElementById("game").style.cursor="pointer";
        });
        text.on('mouseout', function() {
            document.getElementById("game").style.cursor="default";
		});
		container.on('click touchstart', function() {
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		text.on('click touchstart', function() {
			cardOrder.stage.destroy();
			cardOrder.init();
			document.getElementById("game").style.cursor="default";
		});
		
		againLayer.add(group);
		cardOrder.stage.add(againLayer);
	}
};

var Utilities = {
	
	toggleInstructions: function () {
        if ($('#instructions').is(':visible')) {
            Utilities.instructions(false);
        } else {
            Utilities.instructions(true);
        }
    },
	
	instructions: function (show) {
        if (show) {
            $('#instructions').slideDown();
        } else {
            $('#instructions').slideUp();
        }
    }
}