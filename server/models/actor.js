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

	Actor.observe('after save',function(ctx,next){
		let movieId=ctx.instance.movieId;
		Actor.find({where:{movieId:movieId}},function(err, actors){
			if(err){
				Actor.throwError('Ocurrio un error '+ err.message,err.status,next);
			}
			let count=actors.length;
			// Access to relation model
			Actor.app.models.Movie.findById(movieId,{},function(err,movie){
				if(err){
					Actor.throwError('Ocurrio un error '+ err.message,err.status,next);
				}
				movie.updateAttribute("actor_count",count,function(err){
					if(err){
						Actor.throwError('Ocurrio un error '+ err.message,err.status,next);
					}
				})
			});
		});
		next();
	});


	Actor.prototype.setRanking=function(ranking,cb){
		let ActorModel=this;
		let result='';

		ActorModel.ranking=ranking;
		//Update instance
		Actor.upsert(
			ActorModel,
			function(err, instance){
				if(err){
					//send a custom error
					Actor.throwError('Ocurrio un error '+ err.message,err.status,cb);
				}else if(instance){
					result="success";
					cb(null,result);
				}
								
			}
		);
	}

	Actor.prototype.dead=function(cb){
		let ActorModel=this;
		//Delete instance
		Actor.destroyById(this.id,function(err){
			if(err){
				//send a custom error
				Actor.throwError('Ocurrio un error '+ err.message,err.status,cb);	
			}else{
				let result="success";
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


	Actor.throwError=function(msg,statusCode,cb){
		let errorObject=new Error(msg);
		errorObject.status=statusCode;
		cb(errorObject);
	}
};
