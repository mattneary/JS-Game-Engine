//Keyboard functions
var kkeys 	= {},
	isDown 	= function(char) {
		return kkeys[char];
	};
	
$(document).keydown(function(e) {				
	kkeys[String.fromCharCode(e.keyCode)] = true;	
	//Prevent beep
	return false;
});
$(document).keyup(function(e) {
	kkeys[String.fromCharCode(e.keyCode)] = false;
});						

//Main function	
var go 			= function() {				
	var t = 0;
	var int = setInterval(function() {
		ctx.clearRect(0,0,1000,1000);					
		move(t), draw(t);
		t++;				
	}, 30);
};
	
//Constructors			
var Rect 		= function(options) {				
	var color = options.color || "#000", 
		x = options.x, 
		y = options.y, 
		width = options.width, 
		height = options.height, 
		size = options.size;
	this.x = x;
	this.y = y;
	this.color = color;
	
	//Either maintain height, width or just size
	this.width = width || size;
	this.height = height || size;
};			
var Character 	= function(parameters, spawn /*Pushes new character by default*/) {							
	shapes = parameters.shapes || [], 
	title = parameters.title || "", 
	speeds = parameters.speeds || {x: Function('return 0'), y: Function('return 0')}, 
	collisions = parameters.collisions || {};
				
	this.title = title;
	this.shapes = shapes;				
	this.speed = {
		x: speeds.x,
		y: speeds.y
	};
	this.offset = {
		x: 0,
		y: 0
	};								
	this.collisions = collisions;				
		
	if( spawn !== false ) characters[title] = this;				
};

//Bulk drawing
var drawRects 	= function(rects, offset, overrideColor) {
	for( var k in rects ) {
		var rect = rects[k];					
		//Defaults
		rect.width 	= rect.width  || rect.size,
		rect.height = rect.height || rect.size;
		offset = offset || {
			x: 0, y: 0
		};				

		ctx.fillStyle = overrideColor || rect.color;											
		ctx.fillRect(rect.x+offset.x, height-(rect.y+offset.y), rect.width, rect.height);		
	}
};	

//Functions performed on all characters
var move 		= function(t) {
	for( var k in characters ) {
		character = characters[k];					
		character.move(t);					
		
		var collisions = character.collisions;
		for( var k in collisions ) {
			var collision = collisions[k];
			
			character.overlaps(characters[k]) || characters[k].overlaps(character) && collision();
		}
	}
};
var draw 		= function(t) {
	for( var k in characters ) {
		character = characters[k];					
		character.shade(t);
	}
};

Character.prototype = {
	shade: function() {
		drawRects(this.shapes, this.offset);
	},
	move: function(t) {
		//Speed is a function of time -- more natural than position
		this.offset.x += this.speed.x.call(this, t);
		this.offset.y += this.speed.y.call(this, t);
	},
	isOccupied: function(x,y) {
		for( var k in this.shapes ) {
			var shape = this.shapes[k],
				pastx = x + (shape.width  || shape.size),
				pasty = y + (shape.height || shape.size);							
		
		//Check if x is in range [offset.x + shape.x, offset.x + shape.x + size]
		//Check if y is in range [offset.y + shape.y, offset.y + shape.y + size]
		
		if(
				(pastx >= (this.offset.x+shape.x) && pastx <= (this.offset.x+shape.x)+shape.width) &&
				(pasty >= (this.offset.y+shape.y) && pasty <= (this.offset.y+shape.y)+shape.height)
			) return true;
		}
		return false;
	},
	overlaps: function(character) {
		for( var k in shapes ) {
			var shape  = character.shapes[k],
				offset = character.offset;					
			
			//Check corners for overlap
			if(		(this.isOccupied(offset.x+shape.x, offset.y+shape.y)) ||
					(this.isOccupied(offset.x+shape.x+(shape.width||shape.size), offset.y+shape.y)) ||
					(this.isOccupied(offset.x+shape.x, offset.y+(shape.height||shape.size))) ||
					(this.isOccupied(offset.x+shape.x+(shape.width||shape.size), offset.y+shape.y+(shape.height||shape.size)))
			) return true;
		}
		return false;
	},
	kill: function() {
		delete(characters[this.title]);
	},
	revive: function() {
		characters[this.title] = this;
	}
};