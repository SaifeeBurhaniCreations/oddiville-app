
import PreviewContentModal from "./PreviewContentModal";

const Content = ({ content, setContent, sliderContent, setSliderContent }) => {

    // Add new content
    const addContent = () => {
        const newContent = [...content, { heading: "", description: "" }];
        setContent(newContent);
    };

    // Update a specific content field
    const updateContent = (index, field, value) => {
        const updatedContent = content.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setContent(updatedContent);
    };

    // Remove specific content
    const removeContent = (index) => {
        const updatedContent = content.filter((_, i) => i !== index);
        setContent(updatedContent);
    };

    const toggleSliderContent = (field, value) => {
        setSliderContent({...sliderContent, [field]: value})
    }

    return (
        <>
            <div className="card my-3">
                <div className="card-header pt-4 pb-2">
                    <div className="flex-cs header">
                        <h6>Add Slider 
                            <span data-tooltip="Preview">
                                <button 
                                    className='cs-btn'
                                    type="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modal-content"
                                >
                                    <i className="fa-regular fa-lg fa-circle-info" style={{color: '#aaa'}} />
                                </button>
                            </span>
                        </h6>
                    </div>
                </div>
                <div className="card-body py-2">
                    <div className="my-3">
                        <input 
                            type="text" 
                            value={sliderContent?.heading} 
                            onChange={(e)=>{toggleSliderContent('heading', e.target.value)}}  
                            className='form-control' 
                            placeholder='Enter Main Heading' 
                            />
                    </div>
                    <div className="my-3">
                        <textarea 
                            type="text" 
                            value={sliderContent?.description} 
                            onChange={(e)=>{toggleSliderContent('description', e.target.value)}}  
                            className='form-control' 
                            rows={5} 
                            placeholder='Enter Description'
                        />
                    </div>
                    <div className="projects-content">
                    
                        {content?.map((value, index) => (
                            <div key={index} className="w-100">
                                {index !== 0 && (
                                    <div className="divider"></div>
                                )}
                                <div className="layout">
                                    <div className="mb-2 w-100 flex-cs header">
                                        <h5 className='m-0'>Slide Content {index !== 0 && index+1}</h5>
                                        {index !== 0 && (
                                            <button 
                                                type='button' 
                                                onClick={() => removeContent(index)} 
                                                className='btn bg-gradient-danger m-0'
                                            >
                                                remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="my-3">
                                        <input 
                                            type="text" 
                                            value={value.heading} 
                                            onChange={(e) => updateContent(index, 'heading', e.target.value)}  
                                            className='form-control' 
                                            placeholder='Enter Title' 
                                        />
                                    </div>
                                    <div className="my-3">
                                        <textarea 
                                            type="text" 
                                            value={value.description} 
                                            onChange={(e) => updateContent(index, 'description', e.target.value)} 
                                            className='form-control' 
                                            rows={5} 
                                            placeholder='Enter Content'
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            type='button' 
                            onClick={addContent} 
                            className='btn m-0 bg-gradient-success'
                        >
                            <i className="fa-solid fa-plus" /> &nbsp; Add More
                        </button>
                    </div>
                </div>
            </div>
            <PreviewContentModal img={'/assets/img/content.JPG'} />
        </>
    );
};

export default Content;