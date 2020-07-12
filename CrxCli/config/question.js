module.exports= [
	{
		type:'input',
		name:'name',
		message:'Project name',
		default:typeof option ==='string'?option:'crx-cli-template',
		filter(val){
			return val.trim()
		},
		validate(val){
			const validate = (val.trim().split(" ")).length===1;
			return validate || 'Project name is not allowed to have spaces';
		},
		transformer(val){
			return val;
		}
	},
	{
		type:'input',
		name:'description',
		message:'Project description',
		default:'Crx Project',
		validate(){
			return true;
		},
		transformer(val){
			return val;
		}
	},
	{
		type:'input',
		name:'author',
		message:'Author',
		default:'',
		validate(){
			return true;
		},
		transformer(val){
			return val;
		}
	}
]