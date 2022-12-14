import React, { useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
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

// console.log(fileList)
// console.log(pdfDocState)
async function handleChange(e){
    const filesArray = Array.from(e.target.files) // getting array from file lists
    setFileList(prev=>(
        prev ? [...prev, ...filesArray] : [...filesArray]
    ))    
}
 
// call createpdf if there is a file list
React.useEffect(()=>{
    if(fileList){
        // console.log(file)
        createPdf()
    }
},[fileList]) // render (call filelist whenever fileList state changes)


// console.log(pdfDocState)

async function createPdf() {
    // console.log("createpdfcalled")
    // console.log("inside if")

    const mergedDoc = await PDFDocument.create() // create pdfdocument instance as mergedDoc
    
    for(let i=0;i<fileList.length;i++){ // loop through the list of files that are uploaded from fileList state.
            
        async function readFile(file) { // making file reader work as syncrounous so that it will read PDFs one by as as per the list
            const result = await new Promise((resolve) => {
                const fr = new FileReader();
                fr.onload = (e) => resolve(fr.result);
                fr.readAsArrayBuffer(file);
            });
            return result;
        }

            const result = await readFile(fileList[i]) // calling readFile (to work as syncronous)  
            const srcDoc = await PDFDocument.load(result) // load pdf document in pdf-lib object as srcDoc
            const copyDoc = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices()) // copyDoc will have pages from srcDoc
            
            
            
            copyDoc.forEach(page=>{ // if srcDoc has more than one pages, loop though them
                mergedDoc.addPage(page) // add pages one by one to our mergedDoc
            })
           
            if(i===fileList.length-1){ // on last iteration save mergedDoc as base64url in pdfDatauri and then set state of latest pdfDocState
                const pdfDataUri = await mergedDoc.save({ dataUri: true }); // data is saved as uint8array buffer.
                /* 
                we can also directly render pdfDatauri(if we save as base64) in iframe tag, but it has a limitation of size.
                so we first have to create a blob  using array buffer and then to bloburl for rendering it in iframe
                */             
                const blob = new Blob([pdfDataUri], {type : "application/pdf"}) // convert array buffer in blob
                const blobUrl = URL.createObjectURL(blob) // convert blob into blobUrl using URL API so that it can be rendered in src
                // console.log(pdfDataUri)
                setPdfDocState(blobUrl)
            }
        
    }
      
}



function handleDelete(e,index){
    setFileList(prev=>{
        prev.splice(index,1)
        console.log("delete")
        return [...prev]
    })
}

// handle drag
function handleDragStart(e,index){
    console.log(`drag Start at ${index}`)
    item.current = e.target
    item.current.addEventListener('dragend', handleDragEnd)
    dragStartIndex.current = index
}

function handleDragEnter(e,index){
    console.log(`drag Enter at ${index}`)
    dragEndIndex.current = index
}

function handleDragEnd(e){
    
if(dragStartIndex!==dragEndIndex){
    // console.log(`dragEnd at ${dragEndIndex.current}`)
    
    setFileList(prev=>{        
        prev[dragEndIndex.current] = prev.splice(dragStartIndex.current, 1, prev[dragEndIndex.current])[0] // swappin array elements
        return  [...prev]
    })

    // dragStartIndex.current = null
    // dragEndIndex.current = null
}
}



return ( 
        <div className="app-container">
                <div className="input-container">
                    {/* below input-label-placeholder is just a hidden placeholder so as to position input-placeholder (at line 108) correctly */}
                {fileList ? <label className='input-label' htmlFor="input">Add PDFs</label> : <div className='input-label-placeholder'></div> } 
                <div className="input">
                        <input 
                        id='input' 
                        type="file" 
                        multiple style={{"display" : "none"}}
                        onChange={handleChange}
                        />
                       
                        
                        {/* iterating array of files */}
                        <div className="file-list"> 
                        {fileList ? fileList.map((list, index)=>(
                           <div 
                           key={list.name} 
                           className='file-item' 
                           draggable
                           onDragStart={(e)=>handleDragStart(e,index)}
                           onDragEnter={(e)=>handleDragEnter(e,index)}
                           >
                            <p className="file-name">{list.name}</p>
                            <p className='page-no'>{index+1}</p>
                            <p onClick={(e)=>handleDelete(e,index)} className='file-delete'><span className="material-symbols-outlined">delete</span></p>
                           </div> 
                        )) : <label htmlFor="input"><div className='input-placeholder'>Upload Docs</div></label>}
                </div>
                
                </div>
                </div>
                
                <div onClick={createPdf} className="output">
                    {pdfDocState ? <iframe className='pdf-doc' src={pdfDocState} ></iframe> : <img src={pdfImage} alt="image" /> }
                </div>
        </div>
     );
}
 
export default PdfCreate;