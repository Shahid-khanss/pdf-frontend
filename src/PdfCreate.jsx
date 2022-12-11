import React from 'react'




const PdfCreate = () => {

const [fileList, setFileList] = React.useState([])

console.log(fileList)
function handleChange(e){
    const filesArray = Array.from(e.target.files)
    setFileList(prev=>(
        [...prev, ...filesArray]
    ))
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
                        
                        <div className="file-list">
                        {fileList.map((list, index)=>(
                            <h1 className='file-item' key={index}>{list.name}</h1>
                        ))}
                </div>
                
                
                </div>
                
                <div className="output">output box</div>
        </div>
     );
}
 
export default PdfCreate;