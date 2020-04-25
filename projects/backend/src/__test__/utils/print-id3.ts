import * as ID3Parser from "id3-parser"
import * as fs from "fs"

// tslint:disable
;(async () => {
	if (process.argv.length <= 2) {
		throw "Missing file path argument"
	}

	const filePath = process.argv[2]
	const fileContent = fs.readFileSync(filePath)

	const id3Meta = ID3Parser.parse(fileContent)

	console.log(id3Meta)
})()
