import React from 'react'
import SimpleFileUpload from '../SimpleFileUpload'
import { FileUploadComponentProps } from '@/src/types'

const FileUploadComponent = ({data}: FileUploadComponentProps) => {
  return (
    <SimpleFileUpload fileState={[null, () => {}]}>
        {data?.label}
    </SimpleFileUpload>
  )
}

export default FileUploadComponent