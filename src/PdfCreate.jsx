import React from 'react'
import { PDFDocument } from 'pdf-lib'



const PdfCreate = () => {

const [fileList, setFileList] = React.useState([]) // files list state
const [pdfDocState, setPdfDocState] = React.useState(null)

// console.log(fileList)
function handleChange(e){
    const filesArray = Array.from(e.target.files) // getting array from file lists
    setFileList(prev=>(
        [...prev, ...filesArray]
    ))

    // call createpdf if there is a file list

    if(fileList){
        createPdf()
    }
}

console.log(pdfDocState)

async function createPdf() {
    console.log("createpdfcalled")
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([350, 400]);
    page.moveTo(110, 200);
    page.drawText('Hello World!');
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    console.log(pdfDataUri)
    setPdfDocState(pdfDataUri)
}

    return ( 
        <div className="app-container">
                <div className="input">
                        <input 
                        id='input' 
                        type="file" 
                        multiple style={{"display" : "none"}}
                        onChange={handleChange}
                        />
                        <label className='input-label' htmlFor="input">Upload PDFs</label>
                        
                        {/* iterating array of files */}
                        <div className="file-list"> 
                        {fileList.map((list, index)=>(
                            <h1 className='file-item' key={index}>{list.name}</h1>
                        ))}
                </div>
                
                
                </div>
                
                <div onClick={createPdf} className="output">{pdfDocState ? <object className='pdf-doc' data={pdfDocState}></object> : "Output File"}</div>
        </div>
     );
}
 
export default PdfCreate;