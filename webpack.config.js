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
		],
	},
	plugins: [
		new CopyWebpackPlugin([
			{ from: 'src/css/', to: 'css/' },
			{ from: 'node_modules/react-notifications/lib/notifications.css', to: 'css/notifications.css' },
		]),
		new HtmlWebpackPlugin({
			template: './src/www/index.html',
			filename: 'index.html',
			inject: 'body',
		}),
	],
}
