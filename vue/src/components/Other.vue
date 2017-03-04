<template>
	<div class="other">
		<h1>Second Page</h1>
		<router-link to="/">Home</router-link>
	</div>
</template>

<script>
export default {
	name: 'other',
	data: function() {
		return {};
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
