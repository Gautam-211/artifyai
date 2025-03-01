"use client"

import React from 'react'
import { useToast } from '@/hooks/use-toast'
import {CldImage, CldUploadWidget} from "next-cloudinary"
import Image from 'next/image'
import { AspectRatioKey, dataUrl, getImageSize } from '@/lib/utils'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'

type MediaUploaderProps = {
    onValueChange : (value : string) => void, 
    setImage : React.Dispatch<React.SetStateAction<{ width: number; height: number; aspectRatio?: AspectRatioKey }>>,
    publicId : string,
    image : { width: number; height: number; apsectRatio?: AspectRatioKey },
    type : string
}

const MediaUploader = ({
    onValueChange, 
    setImage, 
    image, 
    publicId,
    type
} : MediaUploaderProps) => {

    const {toast} = useToast();

    const onUploadSuccessHandler = (result: { info?: { public_id: string; width: number; height: number; secure_url: string } | string }) => {
        if (typeof result.info === 'object' && result.info !== null && 'public_id' in result.info) {
            setImage((prevState) => ({
                ...prevState,
                publicId: typeof result.info === 'object' && result.info !== null ? result.info.public_id : '',
                width: typeof result.info === 'object' ? result.info.width : 0,
                height: typeof result.info === 'object' ? result.info.height : 0,
                secureURL: typeof result.info === 'object' ? result.info.secure_url : ''
            }))

            onValueChange(result.info.public_id)
        }

        toast({
            title: "Image uploaded successfully",
            description:"1 credit deducted from your account",
            duration: 5000, 
            className:"success-toast"
        })  
    }

    const onUploadErrorHandler = () => {
        toast({
            title: "Something went wrong while uploading",
            description:"Please try again",
            duration: 5000, 
            className:"error-toast"
        })
    }

  return (
    <CldUploadWidget
        uploadPreset='gautam_imaginify'
        options={{
            multiple: false,
            resourceType:"image"
        }}    
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}
    >
        {({open}) => (
            <div className='flex flex-col gap-4'>
                <h3 className='h3-bold text-dark-600'>
                    Original
                </h3>
                {
                    publicId ? (
                        <>  
                            <div className='cursor-pointer overflow-hidden rounded-[10px]'>
                                <CldImage
                                    src={publicId}
                                    width={getImageSize(type, image, "width")}
                                    height={getImageSize(type, image, "height")}
                                    alt='image'
                                    sizes={"(max-width: 767px) 100vw, 50vw"}
                                    placeholder={dataUrl as PlaceholderValue}
                                    className='media-uploader_cldImage'
                                />
                            </div>
                        </>
                    ) : (
                        <div className='media-uploader_cta' onClick={() => open()}>
                            <div className="media-uploader_cta-image">
                                <Image
                                    src={"/assets/icons/add.svg"}
                                    alt='Add Image'
                                    width={24}
                                    height={24}
                                />
                            </div>
                            
                            <p className="p-14-medium">
                                Upload Image
                            </p>
                        </div>
                    )
                }
            </div>
        )}
    </CldUploadWidget>
  )
}

export default MediaUploader