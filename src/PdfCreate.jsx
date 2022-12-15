import React, { useEffect } from 'react'
import { PageSizes, PDFDocument } from 'pdf-lib'
import pdfImage from './PDF-Placeholder.png'



const PdfCreate = () => {


    // list and doc states
    const [fileList, setFileList] = React.useState() // files list state
    const [pdfDocState, setPdfDocState] = React.useState(null)

    // drag state to handleDrag
    const [dragging, setDragging] = React.useState(false)
    const item = React.useRef()
    const dragStartIndex = React.useRef()
    const dragEndIndex = React.useRef()

    console.log(fileList)
    // console.log(pdfDocState)
    async function handleChange(e) {
        const filesArray = Array.from(e.target.files) // getting array from file lists
        setFileList(prev => (
            prev ? [...prev, ...filesArray] : [...filesArray]
        ))
    }

    // call createpdf if there is a file list
    React.useEffect(() => {
        if (fileList) {
            // console.log(file)
            createPdf()
        }
    }, [fileList]) // render (call filelist whenever fileList state changes)


    // console.log(pdfDocState)

/* 
    How to work in PDF files. (pdf-lib)

    1.  First create an empty pdf document instance by PDFDocument.create()
    2.  Then we can use addPage() function to add:-
        a. Blank page of desired size by addPage(a,b) (where a and b are dimensions of page in pixels)
        b. Blank page of desired size by addPage(PageSizes.A4)
        c. Add a copied page by addPage(copiedpage) (copied page is obtain by doc.copyPages())
    3. After adding blank page, we can draw embed images or embed pdf pages on the blank page.
    4. Embed pages / images means we have stored there pages / images in context of pdf document memory in a variable.
    5. we can embed pdf by first loading (or reading) an array buffer or base64 data and then embed it.
    6.  const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, [73]) (souch pdf is arrayBuffer or base64data, [73] is array of pages to be embed)

    7. We can embed image as
        const embeddedImage = await pdfDoc.embedjpg(arrayBuffer / base64 data)

    8. After embedding we have the data (image or pdf) in memory in context of pdfdocument.
    9. Now we can draw these in our blank page according to our need (position and size).
    10. If we directly copy pages from other pdf docs we need not to create blank page or draw.

    This is how to draw image by adding blank A4 page:-
    
    const jpgDims = jpgImage.scale(1) // scale of image (get image dimensions)
    const page = mergedDoc.addPage(PageSizes.A4) // add blank page of A4 size
    page.drawImage(jpgImage, {
        x: 60, // position of image from left
        y: 70, // position of image from below
        width: 500, 
        height: 700, // from below
    })
*/

    async function createPdf() {
        // console.log("createpdfcalled")
        // console.log("inside if")

        const mergedDoc = await PDFDocument.create() // create pdfdocument instance as mergedDoc

        for (let i = 0; i < fileList.length; i++) { // loop through the list of files that are uploaded from fileList state.

            async function readFile(file) { // making file reader work as syncrounous so that it will read PDFs one by as as per the list
                const result = await new Promise((resolve) => {
                    const fr = new FileReader();
                    fr.onload = (e) => resolve(fr.result);
                    fr.readAsArrayBuffer(file);
                });
                return result;
            }


            if (fileList[i].type === "image/jpg" || fileList[i].type === "image/jpeg" || fileList[i].type === "image/png") {
                console.log("inside image")
                const result = await readFile(fileList[i])
                // Embed the JPG image bytes and PNG image bytes
                const jpgImage = await mergedDoc.embedJpg(result)
                const jpgDims = jpgImage.scale(1) // scale of image (get image dimensions)
                const page = mergedDoc.addPage(PageSizes.A4) // add page of A4 size
                page.drawImage(jpgImage, {
                    x: 60, // position of image from left
                    y: 70, // position of image from below
                    width: 500, 
                    height: 700, // from below
                })

            }

            // if it is of type pdf
            else if (fileList[i].type === "application/pdf") {

                const result = await readFile(fileList[i]) // calling readFile (to work as syncronous)  
                const srcDoc = await PDFDocument.load(result) // load pdf document in pdf-lib object as srcDoc
                const copyDoc = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices()) // copyDoc will have pages from srcDoc

                copyDoc.forEach(page => { // if srcDoc has more than one pages, loop though them
                    mergedDoc.addPage(page) // add pages one by one to our mergedDoc
                })
            }
            if (i === fileList.length - 1) { // on last iteration save mergedDoc as base64url in pdfDatauri and then set state of latest pdfDocState
                const pdfDataUri = await mergedDoc.save({ dataUri: true }); // data is saved as uint8array buffer.
                /* 
                we can also directly render pdfDatauri(if we save as base64) in iframe tag, but it has a limitation of size.
                so we first have to create a blob  using array buffer and then to bloburl for rendering it in iframe
                */
                const blob = new Blob([pdfDataUri], { type: "application/pdf" }) // convert array buffer in blob
                const blobUrl = URL.createObjectURL(blob) // convert blob into blobUrl using URL API so that it can be rendered in src
                // console.log(pdfDataUri)
                setPdfDocState(blobUrl)
            }

        }

    }



    function handleDelete(e, index) {
        setFileList(prev => {
            prev.splice(index, 1)
            console.log("delete")
            return [...prev]
        })
    }

    // handle drag
    function handleDragStart(e, index) {
        console.log(`drag Start at ${index}`)
        item.current = e.target
        item.current.addEventListener('dragend', handleDragEnd)
        dragStartIndex.current = index
    }

    function handleDragEnter(e, index) {
        console.log(`drag Enter at ${index}`)
        dragEndIndex.current = index
    }

    function handleDragEnd(e) {

        if (dragStartIndex !== dragEndIndex) {
            // console.log(`dragEnd at ${dragEndIndex.current}`)

            setFileList(prev => {
                prev[dragEndIndex.current] = prev.splice(dragStartIndex.current, 1, prev[dragEndIndex.current])[0] // swappin array elements
                return [...prev]
            })

            // dragStartIndex.current = null
            // dragEndIndex.current = null
        }
    }

    // clear all button
    function handleClear() {
        setFileList(null)
        setPdfDocState(null)
    }



    return (
        <div className="app-container">
            <div className="input-container">
                {/* below input-label-placeholder is just a hidden placeholder so as to position input-placeholder (at line 108) correctly */}
                {fileList ?
                    <div className='head-label'>
                        <label className='input-label' htmlFor="input">Add PDFs</label>
                        <div className="clear"><span class="material-symbols-outlined" onClick={handleClear}>restart_alt</span></div>
                    </div> :
                    <div className='input-label-placeholder'></div>}
                <div className="input">
                    <input
                        id='input'
                        type="file"
                        multiple style={{ "display": "none" }}
                        onChange={handleChange}
                    />


                    {/* iterating array of files */}
                    <div className="file-list">
                        {fileList ? fileList.map((list, index) => (
                            <div
                                key={list.name}
                                className='file-item'
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                            >
                                <p className="file-name">{list.name}</p>
                                <p className='page-no'>{index + 1}</p>
                                <p onClick={(e) => handleDelete(e, index)} className='file-delete'><span className="material-symbols-outlined">delete</span></p>
                            </div>
                        )) : <label htmlFor="input"><div className='input-placeholder'>Upload Docs/Images</div></label>}
                    </div>

                </div>
            </div>

            <div onClick={createPdf} className="output">
                {pdfDocState ? <iframe className='pdf-doc' src={pdfDocState} ></iframe> : <img src={pdfImage} alt="image" />}
            </div>
        </div>
    );
}

export default PdfCreate;