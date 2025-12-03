import { useState, useEffect } from "react"
import PreviewContentModal from './PreviewContentModal'
import { toast } from 'react-toastify'
import { create } from "@/services/WhatWeDoService";
import { handlePostWhatWeDo } from "@/redux/AdminDataSlice";    
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/Spinner/Spinner";

const WhatWeDo = () => {
    const dispatch = useDispatch()  
    const service = useSelector((state) => state.AdminDataSlice.whatWeDo)
    const [isLoading, setIsLoading] = useState(false)
    const [content, setContent] = useState([{
        head: '',
        body: ''
    }])

    // Load initial data from Redux
    useEffect(() => {
        if (service && Array.isArray(service) && service.length > 0) {
            setContent(service.map(item => ({ head: item.head || '', body: item.body || '' })));
        } else {
            setContent([{
                head: '',
                body: ''
            }]);
        }
    }, [service])

    // Add new content
    const addContent = () => {
        if (content.length < 4) {
            setContent([...content, { head: "", body: "" }]);
        } else {
            toast.warning("You cannot add more than 4 contents.");
        }
    };

    // Update a specific content field
    const updateContent = (index, field, value) => {
        const updatedContent = [...content];
        updatedContent[index][field] = value;
        setContent(updatedContent);
    };

    // Remove specific content
    const removeContent = (index) => {
        if (content.length > 1) {
            setContent(content.filter((_, i) => i !== index));
        } else {
            toast.warning("At least one content section is required");
        }
    };

    // Submit data to server
    const submitData = async() => {
        // Validate content before submission
        const isValid = content.every(item => item.head.trim() && item.body.trim());
        
        if (!isValid) {
            toast.error('Please fill all fields before saving');
            return;
        }

        try {
            setIsLoading(true);
            const response = await create(content);
            
            if (response.success) {
                dispatch(handlePostWhatWeDo(content));
                toast.success('Content Updated Successfully!');
            } else {
                throw new Error(response.message || 'Failed to update content');
            }
        } catch (error) {
            console.error('Error updating content:', error);
            toast.error(error.message || 'Failed to update content');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card my-3">
                <div className="card-header pt-4 pb-2">
                    <div className="flex-cs header">
                        <h6>
                            What We Do 
                            <span data-tooltip="Preview">
                                <button 
                                    className="cs-btn"
                                    type="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modal-content"
                                >
                                    <i className="fa-regular fa-lg fa-circle-info" style={{color: '#aaa'}} />
                                </button>
                            </span>
                        </h6>
                        <button 
                            className="btn btn-primary btn-md" 
                            type="button" 
                            onClick={submitData} 
                            disabled={isLoading}
                        >
                            <i className="fa-solid fa-floppy-disk" /> &nbsp; 
                            Save {isLoading && <Spinner />}
                        </button>
                    </div>
                </div>
                <div className="card-body py-2">
                    <div className="projects-content">
                        {content?.map((value, index) => (
                            <div className="w-100" key={index}>
                                {index !== 0 && <div className="divider" />}
                                <div className="layout">
                                    <div className="mb-2 w-100 flex-cs header">
                                        <h5 className="m-0">Content {index !== 0 && index + 1}</h5>
                                        {index !== 0 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeContent(index)} 
                                                className="btn bg-gradient-danger m-0"
                                            >
                                                remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="my-3">
                                        <input 
                                            type="text" 
                                            value={value.head} 
                                            onChange={(e) => updateContent(index, 'head', e.target.value)}  
                                            className="form-control" 
                                            placeholder="Enter Title" 
                                        />
                                    </div>
                                    <div className="my-3">
                                        <textarea 
                                            value={value.body} 
                                            onChange={(e) => updateContent(index, 'body', e.target.value)} 
                                            className="form-control" 
                                            rows={5} 
                                            placeholder="Enter Content"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addContent} 
                            className="btn m-0 bg-gradient-success"
                        >
                            <i className="fa-solid fa-plus" /> &nbsp; Add More
                        </button>
                    </div>
                </div>
            </div>

            <PreviewContentModal img={'/assets/img/what-we-do.JPG'} />
        </>
    )
}

export default WhatWeDo