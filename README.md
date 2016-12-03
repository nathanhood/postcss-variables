# PostCSS Variables

[![Build Status](https://travis-ci.org/nathanhood/postcss-variables.svg?branch=master)](https://travis-ci.org/nathanhood/postcss-variables)

<img align="right" width="135" height="95" src="http://postcss.github.io/postcss/logo-leftp.png" title="Philosopher’s stone, logo of PostCSS">

Converts variables into CSS.

```scss
/* before (nesting requires postcss-nested) */

$dir: assets/icons;
$color: blue;

.block {
	background: url('$(dir)/foo.png');
	&__elem {
		$color: green;
		color: $color;
	}
	&__elem2 {
		color: $color;
	}
}

/* after */

.block {
	background: url('assets/icons/foo.png');
	&__elem {
		color: green;
	}
	&__elem2 {
		color: blue;
	}
}
```


## Usage

Add PostCSS Variables to your build tool:

```bash
npm install postcss-variables --save-dev
```

#### Node

```js
require('postcss-variables')({ /* options */ }).process(YOUR_CSS);
```

#### PostCSS

Add [PostCSS](https://github.com/postcss/postcss) to your build tool:

```bash
npm install postcss --save-dev
```

Load PostCSS Variables as a PostCSS plugin:

```js
postcss([
	require('postcss-variables')({ /* options */ })
]);
```

## Options

### `globals`

Type: `Object`  
Default: `{}`

Specifies your own global variables.

```js
require('postcss-variables')({
	globals: {
		siteWidth: '960px',
		colors: {
			primary: '#fff',
			secondary: '#000'
		}
	}
});
```

```css
/* before */

.hero {
	color: $colors.primary;
	max-width: $siteWidth;
}

/* after */

.hero {
	color: #fff;
	max-width: 960px;
}
```

**Note:** Please refer to [Advanced Variables](https://github.com/jonathantneal/postcss-advanced-variables) for more advanced features. This library is essentially a simplification and alteration of that plugin. Thank you to the author for making it available.