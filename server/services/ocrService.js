const path = require('path')
const fs = require('fs')

const extractFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse')
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return { text: data.text?.trim() || '', source: 'PDF_PARSE' }
  } catch (err) {
    console.error('PDF parse error:', err.message)
    return { text: '', source: 'NONE', error: err.message }
  }
}

const extractFromImage = async (filePath) => {
  try {
    const Tesseract = require('tesseract.js')
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {} // suppress logs
    })
    return { text: text?.trim() || '', source: 'OCR' }
  } catch (err) {
    console.error('OCR error:', err.message)
    return { text: '', source: 'NONE', error: err.message }
  }
}

const extractText = async (filePath, mimetype) => {
  if (mimetype === 'application/pdf') return extractFromPDF(filePath)
  if (['image/jpeg', 'image/jpg', 'image/png'].includes(mimetype)) return extractFromImage(filePath)
  return { text: '', source: 'NONE', error: 'Unsupported file type' }
}

module.exports = { extractText }