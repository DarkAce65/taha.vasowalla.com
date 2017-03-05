import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const Home = resolve => {
	require.ensure(['@/components/Home/index'], () => {
		resolve(require('@/components/Home/index'));
	});
};

const Other = resolve => {
	require.ensure(['@/components/Other/index'], () => {
		resolve(require('@/components/Other/index'));
	});
};

export default new Router({
	mode: 'history',
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home
		},
		{
			path: '/other',
			name: 'Other',
			component: Other
		}
	]
});
