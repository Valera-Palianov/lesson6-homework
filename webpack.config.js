const path = require('path') //Осуществляет работу с файловой системой
const webpack = require('webpack') //Нужен для включения встроенного HMR плагина

const MiniCssExtractPlugin = require('mini-css-extract-plugin') //Плагин для выделения всех стилей в отдельный файл
const HtmlWebpackPlugin = require('html-webpack-plugin') //Плагин для работы с HTML

//Основные настройки, кроме поля result, оно нужно для служебных целей и определяет что мы хотим получить в итоге, сборку или локальный сервер
const confGeneral = {
	mode: process.env.NODE_ENV,
	result: process.env.NODE_RESULT,
	devtool: process.env.NODE_ENV == 'development' ? 'source-map' : '',
	entry: './index.js',
	context: path.resolve(__dirname, 'src')
}

//Все настройки для выходного файла, с возможностью задействовать чанки которые в этом проекте не используются
const confOutput = {
	filename: 'assets/js/[name].bundle.js?[hash]',
	path: path.resolve(__dirname, 'dist'),
	chunkFilename: 'assets/js/[name].bundle.js?[hash]',
}

//Подключение всех нужных плагинов. В данном случае их 3, это плагин для работы с нашей HTML страницей,
//плагин выноса стилей в отдельный файл если в итоге мы хотим получить сборку и плагин HMR если мы запускаем сервер
const getPlugins = (result = confGeneral.result) => {
	const plugins = [
		new HtmlWebpackPlugin({
			template: './index.html',
			inject: 'body',
			hash: true,
		})
	]
	if(result == "build") {
		plugins.push(
			new MiniCssExtractPlugin(
				{
					filename: 'assets/style/[name].css?[hash]'
				}
			)
		)
	} else {
		plugins.push(
			new webpack.HotModuleReplacementPlugin()
		)
	}
	return plugins
}

//Определяет правила для работы с CSS файлами, подключает сам CSS загрузчик и, в зависимости от того, что мы хотим получить, сборку или сервер
//подключает либо style-loader, который поместит наши стили в шапку HTML страницы, либо CssExtractPlugin, который вынесет их в отдельный файл
const getCssRule = (mode = confGeneral.mode, result = confGeneral.result) => {
	const loaders = []
	if(result == "build") {
		loaders.push(MiniCssExtractPlugin.loader)
	} else {
		loaders.push('style-loader')
	}
	loaders.push('css-loader')
	return loaders
}

//Расширение для обычных CSS правил на случай, если используется SASS
const getSassRule = (mode = confGeneral.mode, defaultLoaders = getCssRule()) => {
	const loaders = defaultLoaders
	loaders.push({
		loader: 'sass-loader',
		options: {
			sourceMap: mode == "development" ? true : false,
		}
	})
	return loaders
}

//Натсройки сервера разработки с указанием порта, рабочей директории и с включенной опцией HMR
const getDevServer = (result = confGeneral.result, port = process.env.PORT) => {
	devServer = {}
	if(result == "server") {
		devServer.inline = true
		devServer.hot = true
		devServer.contentBase = 'dist'
		devServer.host = 'localhost'
		devServer.port = port
	}
	return devServer
}

const confPlugins = getPlugins()
const confDevServer = getDevServer()

//Определяем правила работы с модулями. Подключаем babel для использование функций import 
const confModule = {
	rules: [
		{
			test: /\.js$/,
    		loader: 'babel-loader',
    		exclude: [
    			/node_modules/,
    		]
		},
		{
			test: /\.sass$/,
			use: getSassRule(),
		},
		{
			test: /\.css$/,
			use: getCssRule(),
		}
	]
}

//Собираем все воедино 
const conf = {
	context: confGeneral.context,
	entry: confGeneral.entry,
	devtool: confGeneral.devtool,
	mode: confGeneral.mode,
	output: confOutput,
	module: confModule,
	plugins: confPlugins,
	devServer: confDevServer
}

module.exports = conf