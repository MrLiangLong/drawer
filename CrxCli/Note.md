### #!/usr/bin/env node在脚本中的作用
告诉操作系统执行这个脚本的时候，调用/usr/bin下的node。   

脚本用env启动的原因，是因为脚本解释器在linux中可能被安装于不同的目录，env可以在系统的PATH目录中查找。
同时，env还规定一些系统环境变量。而如果直接将解释器路径写死在脚本中，可能在某些系统中就会存在找不到解释器的兼容性问题。

### nvm切换node版本
1. 环境变量注册nvm指令%NVM_HOME%
2. 环境变量注册node快捷方式%NUM_SYSLINK%，nvm切换版本会自动连接到nvm底下的node版本。
3. 环境变量注册npm包地址，否则可能导致切换node后，找不到全局包