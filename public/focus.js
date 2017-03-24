
var Direction = {
    rest: 0,
    forward: 1,
    back: -1
 };

function FocusModel($header, nodes = [], options = {}) {

  this.header    = $header;

  this.nodes = $.map(nodes, function(n){
   return $(n);
  });

  this.options   = options
  this.index     = options.index || 0;
  this.stretch   = 0;
  this.direction = Direction.rest;
  this.focusing  = false;
  this.scrolltrigger = options.scrolltrigger || 200.0;
  this.headerHeight = options.headerHeight || 20;
  this.activeHeight = options.activeHeight || 50.0;
  this.closedHeight = options.closedHeight || 0;
}

FocusModel.prototype.runfocus = function(cb){

  var self = this;
  setTimeout(function(){
    self.focusing = false;
    if(cb){
      cb();
    }
  },650);
}
FocusModel.prototype.increment = function(){
 if (this.index < this.nodes.length - 1){
    this.index++;
 }
}

FocusModel.prototype.decrement = function(){
 if(this.index > 0){
  this.index--;
 }
}

FocusModel.prototype.setStretch = function(stretch){

  if(stretch == 0){
    this.direction = Direction.rest
  } else if(stretch > this.stretch){
    this.direction = Direction.forward;
  }else if (stretch < this.stretch){
    this.direction = Direction.back;
  }else{
    this.direction = Direction.rest
  }
  this.stretch = stretch;
}

FocusModel.prototype.activeNode = function(){
 return this.nodes[this.index];
}

function FocusRenderEngine(focusModel){
 this.model = focusModel;
}

FocusRenderEngine.prototype.render = function(){
 //set heights of all nodes
 //animate changes
 this.model.focusing = true;
 window.scrollTo(0, this.model.scrolltrigger);
 this.model.header.css({height: this.model.headerHeight+"vh"});
 for(var i = 0; i < this.model.nodes.length; i++){
    this.renderNode(this.model.nodes[i],i);
 }
 //give a small delay before retriggering
 var self = this;
 this.model.runfocus(function(){
  window.scrollTo(0, self.model.scrolltrigger);
 });
}

FocusRenderEngine.prototype.renderNode = function($node, index){

 $node.css({minHeight: "auto"});

 var activeIndex    = this.model.index;
 var unopenedCount  = (this.model.nodes.length - 1) - activeIndex;
 var stretch        = this.model.stretch;
 var activeHeight   = this.model.activeHeight - stretch;
 var availableSpace = 100 - this.model.headerHeight - activeHeight;
 var unopenedHeight = (unopenedCount > 0) ? (availableSpace/unopenedCount) : 0;
 var focusDistance  = activeIndex - index;
 var distance = Math.abs(focusDistance);

 var height = 0;

 if(focusDistance == 0){
  height = activeHeight - stretch;
 }else if (focusDistance == 1){
  if(this.model.direction = Direction.back){
      height = stretch;
  }
 }else if(focusDistance < 0){
  //this is an unopened cell
  height = unopenedHeight + (stretch/distance);
 }

  $node.css({height: height+"vh"});
}

FocusRenderEngine.prototype.setStretch = function(stretch){
  this.model.setStretch(stretch);
  this.render();
}
FocusRenderEngine.prototype.focusNext = function(){
 if(this.model.focusing){
  return;
 }
 this.stretch = 0;
 this.model.increment();
 this.render();
}

FocusRenderEngine.prototype.focusLast = function(){
  if(this.model.focusing){
   return;
  }
  this.stretch = 0;
  this.model.decrement();
  this.render();
}

$(document).ready(function(){

  var $header = $('.focus-header');
  var $nodes  = $('.focus-node');
  var scrolltrigger = 200;
  //ensure we have more than enough height
  $('#scrollover').height(window.innerHeight + (scrolltrigger * 2.0));
  var scrollover = $('#scrollover')[0];

  var options    = {activeHeight: 50, scrolltrigger: scrolltrigger};
  var stack      = new FocusModel($header, $nodes, options);
  window.engine  = new FocusRenderEngine(stack);
  engine.render();

  $(window).scroll(function(e){

      if(engine.model.focusing){
        return;
      }
      var dist  = Math.abs(scrollover.getBoundingClientRect().top);

      if(dist >= (scrolltrigger * 2.0)){
        engine.focusNext();
      }
      if(dist == 0){
        engine.focusLast();
      }
   });
});
