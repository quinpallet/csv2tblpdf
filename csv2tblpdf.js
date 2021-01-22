import fs from 'fs';
import path from 'path';
import jsdom from 'jsdom';

const dom = new jsdom.JSDOM();
global.window = dom.window;
global.document = window.document;

import csv from 'fast-csv';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import htmlToPdfmake from 'html-to-pdfmake';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
		bold: 'Roboto-Regular.ttf',
		italics: 'Roboto-Italic.ttf',
	},
	Mplus1p: { // Japanese Font Definitions (M+ FONTS: https://mplus-fonts.osdn.jp/)
		normal: 'mplus-1p-regular.ttf',
		bold: 'mplus-1p-regular.ttf',
		italics: 'mplus-1p-regular.ttf',
		bolditalics: 'mplus-1p-regular.ttf'
	},
};

// convert 2D array data to HTML
const convTableHTML = (dataList, noHeader) => {
    let html = '<tbody>';

    dataList.forEach((obj, index) => {
        // If no command line parameter -noheader, set the first line as the table header.
        if (!index && !noHeader) {
            let thead = '<thead><tr>';
            thead += Object.keys(obj).map(headStr => '<td>' + headStr + '</td>').join('');
            thead += '</tr></thead>';
            html = thead + html;
        }
        html += '<tr>' + Object.values(obj).map(bodyStr => '<td>' + bodyStr + '</td>').join('') + '</tr>';
    });
    html += '</tbody>';
    html = '<table>' + html + '</table>';

    return html;
}

// convert 2D array data to PDF and generate it.
const convCSV2PDF = (arrayData, outFileName, noHeader) => {
	// convert CSV data of 2D array to HTML table.
	const html = convTableHTML(arrayData, noHeader);

	// document data definition for pdfmake.
	const docDefinition = {
		content: [htmlToPdfmake(html)], // convert HTML to the pdfmake data using html-to-pdfmake.
		styles: {
			'html-thead': {
				fillColor: '#cbf'
			}
		},
		defaultStyle: {
			font: 'Mplus1p',
		}
	};

	// output as PDF file converting data wirh pdfmake.
	pdfMake.createPdf(docDefinition).getBuffer(buffer => {
		fs.writeFileSync(outFileName, new Buffer(new Uint8Array(buffer)));
	});
}

// parse command line arguments.
const parseParams = () => {
	let csvName = '';
	let pdfName = '';
	let isNoheader = false;

	// check command line arguments.
	const args = process.argv.slice(2);

	for (let i = args.length; i--;) {
		let fileExt = path.extname(args[i]);

		if (fileExt === '.csv') {
			csvName = path.basename(args[i]);
			pdfName = csvName.slice(0, csvName.indexOf('.')) + '.pdf';
		} else {
			if (args[i] === '-noheader') {
				isNoheader = true;
			}
		}
		args.splice(i, 1);
	}

	if (csvName === '') {
		console.error(`Usage: node ${path.basename(process.argv[1])} [-noheader] <csv>`);
		process.exit(1);
	}

	return {isNoheader, csvName, pdfName};
}

const main = () => {
	// parse command line arguments to get options and filename variables.
	const {isNoheader, csvName, pdfName} = parseParams();

	// prepare 2D array to store CSV data.
    const csvData = [];

	// convert CSV data to 2D array with pdfmake and create PDF of HTML table.
    csv.parseFile(csvName, { headers: !isNoheader })
        .on('error', error => console.error(error))
        .on('data', row => csvData.push(row))
        .on('end', () => convCSV2PDF(csvData, pdfName, isNoheader));
}

if (typeof module === 'undefined') {
    main();
}
