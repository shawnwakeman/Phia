<script lang="ts">


	export let active: Boolean;
</script>
<button on:click={()=> active = !active}>
	{active? 'Close' : 'Open'} Menu
</button>
<aside class:active>
	I'm a sidebar
</aside>

<style>
	aside {
		position: absolute;
		left: -500px;
		transition: all .5s;
		height: 500px;
		width: 300px;
		padding: 20px;
		border: 1px solid #ddd;
		background-color: #efefef;
	}
	.active {
		left: 0px
	}

</style>