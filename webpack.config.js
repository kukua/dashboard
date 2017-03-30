const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/js/main.js',
	output: {
		path: path.resolve(__dirname, 'www'),
		filename: 'js/main.js'
	},
	devServer: {
		inline: true,
		historyApiFallback: true,
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
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: 'file-loader?name=css/fonts/[name].[ext]',
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
