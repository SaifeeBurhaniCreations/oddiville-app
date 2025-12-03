import React from 'react';
import CustomImage from '../CustomImage';
import { FullWidthImageComponentProps } from '@/src/types';

const FullWidthImageComponent: React.FC<FullWidthImageComponentProps> = ({ data, color }) =>  {
    const { imageUrl } = data
    
    return (
        <CustomImage src={imageUrl} height={150} />
);
}

export default FullWidthImageComponent;
