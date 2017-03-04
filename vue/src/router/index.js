import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const Home = resolve => {
	require.ensure(['@/components/Home'], () => {
		resolve(require('@/components/Home'));
	});
};

const Other = resolve => {
	require.ensure(['@/components/Other'], () => {
		resolve(require('@/components/Other'));
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
