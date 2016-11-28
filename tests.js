const expect = require('chai').expect;
const postcss = require('postcss');
const plugin = require('./');

function process(input, expected, opts = {}) {
	return postcss([ plugin(opts) ]).process(input)
		.then((result) => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(0);
		});
}

describe('CSS declarations', () => {
	it('should parse declaration values', () => {
		return process(
			'$size: 10px;\na { width: $size; height: $size }',
			'a { width: 10px; height: 10px }'
		);
	});

	it('should parse nested declaration values', () => {
		return process(
			'$size: 10px;\n.block { &__elem { width: $size; } height: $size }',
			'.block { &__elem { width: 10px; } height: 10px }'
		);
	});
});

describe('Variables', () => {
	it('should be scoped by blocks', () => {
		return process(
			'$size: 10px;\n.block { &__elem { $size: 20px; width: $size; } height: $size }',
			'.block { &__elem { width: 20px; } height: 10px }'
		);
	});

	it('should not be visible to an outside block', () => {
		return process(
			'.block { &__elem { $size: 20px; width: $size; } height: $size }',
			'.block { &__elem { width: 20px; } height: $size }'
		);
	});
});