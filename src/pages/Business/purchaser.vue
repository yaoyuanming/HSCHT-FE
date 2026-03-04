<template>
	<view>
		<view>商业</view>
		<CustomTabBar v-if="showCustomTabBar" :current="1" />
	</view>
</template>

<script>
import CustomTabBar from '@/components/CustomTabBar/CustomTabBar.vue'
import { shouldUseCustomTabBar } from '@/utils/app.js'
import share from '@/mixins/share.js'

export default {
	components: {
		CustomTabBar
	},
	mixins: [share],
	data() {
		return {
			showCustomTabBar: shouldUseCustomTabBar(),
			shareTitle: '海丝出海通-商业'
		}
	}
}
</script>

<style>

</style>
