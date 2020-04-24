const ID3Parser = require("id3-parser")
const fs = require('fs')

if (process.argv.length !== 3) {
	console.error('Incorrect usage! Please call with one argument providing the audio file path')

	process.exit(1)
}

const audioBuffer = fs.readFileSync(process.argv[1])
const id3Tags = ID3Parser.parse(audioBuffer)

console.log(id3Tags)