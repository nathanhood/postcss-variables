module.exports = {
	defer(fn, args) {
		return {
			type: 'deferredFunction',
			fn: fn,
			args: args
		};
	}
};