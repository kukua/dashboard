const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/js/main.js',
	output: {
		path: './www',
		filename: 'js/main.js'
	},
	devServer: {
		inline: true,
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader',
			},
		],
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'node_modules/react-notifications/lib/fonts', to: 'css/fonts/' },
		]),
		new HtmlWebpackPlugin({
			template: './src/www/index.html',
			filename: 'index.html',
			inject: 'body',
		}),
	],
}
