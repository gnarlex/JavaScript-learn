<template>
 <div id="app">
 
 	<hello></hello>
 </div>
</template>

<script>
import hello from "./hello"

export default{
	name:'app',
	components:{
		hello
	}
}
</script>
 
<!-- 样式代码 -->
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>