const postcss = require('postcss');

/**
 * Retrieve variable
 *
 * @param {object} variables
 * @param {string} prop
 * @param {object} node
 * @param {object} result
 * @returns {*}
 */
function get(variables, prop, node, result) {
	prop = clean(prop);

	if (variables[prop] !== undefined) {
		return variables[prop];
	}

	node.warn(result, 'Undefined variable $' + prop);
}

/**
 * Set variable
 *
 * @param {object} variables
 * @param {string} prop
 * @param {string} value
 */
function set(variables, prop, value) {
	variables[clean(prop)] = value;
}

/**
 * Parse single variables
 *
 * @param {object} variables
 * @param {string} string
 * @param {object} node
 * @param {object} result
 * @returns {*}
 */
function parseSingle(variables, string, node, result) {
	return string.replace(/(^|[^\w])\$([\w\d-_]+)/g, (full, before, prop) => {
		return before + get(variables, prop, node, result);
	});
}

/**
 * Parse interpolated variables
 *
 * @param {object} variables
 * @param {string} string
 * @param {object} node
 * @param {object} result
 * @returns {*}
 */
function parseInterpolation(variables, string, node, result) {
	return string.replace(/\${\s*([\w\d-_]+)\s*}/g, (full, prop) => {
		return get(variables, prop, node, result);
	});
}

/**
 * Parse out both single and interpolated variables
 *
 * @param {object} variables
 * @param {string} string
 * @param {object} node
 * @param {object} result
 * @returns {*}
 */
function parse(variables, string, node, result) {
	string = parseSingle(variables, string, node, result);
	string = parseInterpolation(variables, string, node, result);

	return string;
}

/**
 * Remove $ from string
 *
 * @param {string} str
 * @returns {string|void|XML|*}
 */
function clean(str) {
	return str.replace('$', '');
}

module.exports = postcss.plugin('postcss-variables', (options) => {
	return (css, result) => {
		options = options || {};
		const variables = options.variables || {};

		css.walk((node) => {
			if (node.type === 'decl') {
				let value = node.value,
					prop = node.prop;

				if (value.includes('$')) {
					node.value = parse(variables, value, node, result);
				} else if (prop.includes('$', 0)) {
					set(variables, prop, value);
					node.remove();
				}
			} else if (node.type === 'rule') {
				let selector = node.selector;

				if (selector.includes('$', 0)) {
					node.selector = parse(variables, selector, node, result);
				}
			} else if (node.type === 'atrule') {
				let params = node.params;

				if (params && params.includes('$')) {
					node.params = parse(variables, params, node, result);
				}
			}
		});
	};
});