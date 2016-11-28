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

function processFail(input, expected, opts = {}) {
	return postcss([ plugin(opts) ]).process(input)
		.then((result) => {
			expect(result.css).to.equal(expected);
			expect(result.warnings().length).to.equal(1);
		});
}

describe('CSS declarations', () => {
	it('should resolve values', () => {
		return process(
			`$size: 10px;
			a {
				width: $size;
				height: $size;
			}`,
			`a {
				width: 10px;
				height: 10px;
			}`
		);
	});

	it('should resolve nested values', () => {
		return process(
			`$size: 10px;
			.block {
				&__elem {
					width: $size;
				}
				height: $size;
			}`,
			`.block {
				&__elem {
					width: 10px;
				}
				height: 10px;
			}`
		);
	});

	it('should resolve multiple variables in the same declaration', () => {
		return process(
			`$fontStyle: italic;
			$fontSize: 2rem;
			$fontWeight: bold;
			a {
				font: $fontStyle $fontSize $fontWeight;
			}`,
			`a {
				font: italic 2rem bold;
			}`
		);
	});

	it('should resolve variable properties', () => {
		return process(
			`$decl: color;
			.block {
				$(decl): blue;
			}`,
			`.block {
				color: blue;
			}`
		);
	});

	it('should resolve variables as part of string values', () => {
		return process(
			`$path: /img/icons;
			.block {
				background-image: url('$(path)/share.svg');
			}`,
			`.block {
				background-image: url('/img/icons/share.svg');
			}`
		);
	});
});

describe('Variable scope', () => {
	it('should be by block', () => {
		return process(
			`$size: 10px;
			.block {
				&__elem {
					$size: 20px;
					width: $size;
				}
				height: $size;
			}`,
			`.block {
				&__elem {
					width: 20px;
				}
				height: 10px;
			}`
		);
	});

	it('should not be visible to an outside block', () => {
		return processFail(
			`.block {
				&__elem {
					$size: 20px;
					width: $size;
				}
				height: $size;
			}`,
			`.block {
				&__elem {
					width: 20px;
				}
				height: $size;
			}`
		);
	});

	it('should resolve globals passed as plugin options', () => {
		return process(
			`a {
				color: $color;
				font-size: $fontSize;
			}`,
			`a {
				color: blue;
				font-size: 20px;
			}`,
			{
				globals: {
					color: 'blue',
					fontSize: '20px'
				}
			}
		);
	});
});

describe('Variable lists', () => {
	it('should be resolved with comma and space separating arguments', () => {
		return process(
			`$fontStyle: italic;
			$fontSize: 2rem;
			$fontFamily: "Open Sans", Arial, sans-serif;
			a {
				font: $fontStyle $fontSize $fontFamily;
			}`,
				`a {
				font: italic 2rem "Open Sans", Arial, sans-serif;
			}`
		);
	});
});

describe('Rules', () => {
	it('should resolve variable selectors', () => {
		return process(
			`$sel: .block;
			$(sel) {
				color: blue;
			}`,
			`.block {
				color: blue;
			}`
		);
	});

	it('should resolve nested variable selectors', () => {
		return process(
			`$sel: elem;
			.block {
				&__$(sel) {
					color: blue;
				}
			}`,
			`.block {
				&__elem {
					color: blue;
				}
			}`
		);
	});
});

describe('At-Rules', () => {
	it('should resolve params', () => {
		return process(
			`$condition: min-width;
			$size: 743px;
			@media ($condition: $size) {
				font-size: 20rem;
			}`,
			`@media (min-width: 743px) {
				font-size: 20rem;
			}`
		);
	});

	// TODO: Investigate why quotes are stripped from @import url('/$path/screen.css')
	// TODO: Not this plugin (see test below). Looks to be postcss itself.
	it('should resolve @import path', () => {
		return process(
			`$path: ./path/to;
			@import '$(path)/style.css'`,
			`@import './path/to/style.css'`
		);
	});

	// TODO: Finish @rule tests (font-face, supports, etc)
});