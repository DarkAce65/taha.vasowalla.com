<template>
	<div class="home">
		<div class="stacked">
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
			<span>Header</span>
		</div>
		<h1>{{msg}}</h1>
		<router-link to="/other">Second Page</router-link>
		<h2>Essential Links</h2>
		<ul>
			<li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
			<li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
			<li><a href="https://gitter.im/vuejs/vue" target="_blank">Gitter Chat</a></li>
			<li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
			<br>
			<li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
		</ul>
		<h2>Ecosystem</h2>
		<ul>
			<li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
			<li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
			<li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
			<li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
		</ul>
	</div>
</template>

<script>
function lerp(a, b, f) {
	return Math.round(((b - a) * f + a) * 1000) / 1000;
}

export default {
	name: 'home',
	data: function() {
		return {
			msg: 'Welcome to Your Vue.js App',
			r: true,
			rx: 0,
			ry: 0,
			mx: 0,
			my: 0
		};
	},
	methods: {
		mouse: function(e) {
			this.mx = e.x * 2 / window.innerWidth - 1;
			this.my = e.y * 2 / window.innerHeight - 1;
		},
		render: function() {
			if(this.r) {
				this.rx = lerp(this.rx, -this.my * 3, 0.1);
				this.ry = lerp(this.ry, this.mx * 3, 0.1);
				document.querySelector('.home').style.transform = 'rotateX(' + this.rx + 'deg) rotateY(' + this.ry + 'deg)';
				requestAnimationFrame(this.render);
			}
		}
	},
	beforeRouteEnter: function(to, from, next) {
		next(function(vm) {
			document.addEventListener('mousemove', vm.mouse);
			vm.render();
		});
	},
	beforeRouteLeave: function(to, from, next) {
		this.r = false;
		document.removeEventListener('mousemove', this.mouse);
		next();
	}
};
</script>

<style scoped>
h1, h2 {
	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
