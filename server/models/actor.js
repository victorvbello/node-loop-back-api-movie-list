'use strict';

module.exports = function(Actor) {

	Actor.observe('before save',function(ctx,next){
		if(ctx.instance){//Create
			ctx.instance.date_create=new Date();
		}else{//Update
			ctx.data.date_update=new Date();
		}
		next();
	});



	Actor.prototype.setRanking=function(ranking,cb){
		var ActorModel=this;
		console.log(ActorModel)
		var result='';

		ActorModel.ranking=ranking;
		//Update instance
		Actor.upsert(
			ActorModel,
			function(err, instance){
				if(err){
					//send a custom error
					var error=new Error('Ocurrio un error '+ err.message);
					error.status=err.status;
					cb(error);		
				}else if(instance){
					result="success";
					cb(null,result);
				}
								
			}
		);
	}

	Actor.prototype.dead=function(cb){
		var ActorModel=this;
		//Delete instance
		Actor.destroyById(this.id,function(err){
			if(err){
				//send a custom error
				var error=new Error('Ocurrio un error '+ err.message);
				error.status=err.status;
				cb(error);		
			}else{
				var result="success";
				cb(null,result);
			}
		});
	}


	Actor.remoteMethod('setRanking',{
		isStatic: false,// only if you need one element
		accepts:[
			{arg:'ranking',type:'number'}
		],
		http:{
			verb:'get',
			path:'/set-ranking'
		},
		returns:{
			arg:'message',
			type:'string'
		}
	});

	Actor.remoteMethod('dead',{
		isStatic: false, // only if you need one element
		accepts:[],
		http:{
			verb:'post',
			path:'/dead'
		},
		returns:{
			arg:'message',
			type:'string'
		}
	});

	//disable endpoint defaul
	Actor.disableRemoteMethodByName('upsertWithWhere');
};
