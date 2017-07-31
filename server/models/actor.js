'use strict';

module.exports = function(Actor) {

	Actor.observe('before save',(ctx,next)=>{
		if(ctx.currentInstance){//Update
			ctx.data.date_update=new Date();
		}else{//Create
			ctx.instance.date_create=new Date();
		}
		next();
	});

};
