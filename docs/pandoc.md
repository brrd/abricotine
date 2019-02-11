# How to use Pandoc to create PDF, docx...

[Pandoc](https://pandoc.org/) is a cross-platform application which can convert markdown documents to many different document formats such as PDF, Microsoft Word docx and OpenOffice/LibreOffice ODT.

Pandoc is available as a task in Abricotine default config, so you only have to install the required dependencies on your computer to make it work.

## Installation

1. Download and install [Pandoc](https://pandoc.org/installing.html)
2. If you want to convert markdown documents to PDF then you will also need to install LaTeX on your computer. Pandoc documentation explains how to do this easily according to your operating system: https://pandoc.org/installing.html
3. Restart Abricotine.

## Usage

Select the menu item: `File` > `Tasks` > `Export with Pandoc`. You will have to select a location where to save the document. The output format is determined by the file extension.

For instance, by naming the document `file.pdf` you will produce a PDF, while `file.docx` will convert it to a MS Word docx, etc.

## Customize Pandoc options

To customize Pandoc options (such as template, PDF engine...) create a [custom task in config.json](https://github.com/brrd/Abricotine/tree/master/docs/configuration.md#tasks).