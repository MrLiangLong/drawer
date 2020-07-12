//例子
const tokens = {
	admin:{
		token:'admin-token'
	}
}
export default[
	{
		url:'/login',
		type:'get',
		response:req=>{ //config-->请求体
			const {username} = req.body;
			const token = tokens[username];
			if(!token){
				return{
					code:500,
					message:'Acount not exist'
				}
			}
			
			return{
				code:200,
				success:true,
				data:token
			}
		}
	}
]