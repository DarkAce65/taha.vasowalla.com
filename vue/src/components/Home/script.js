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
