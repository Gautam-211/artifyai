"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import {  useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { IImage } from "@/lib/database/models/image.model"
import { updateCredits } from "@/lib/actions/user.actions"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.actions"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"

export const formSchema = z.object({
  title : z.string(),
  aspectRatio : z.string().optional(),
  color : z.string().optional(),
  prompt : z.string().optional(),
  publicId : z.string()
})


const TransformationForm = ({action , data=null, userId, type, creditBalance, config=null} : TransformationFormProps) => {

    const transformationType = transformationTypes[type];

    const [image, setImage] = useState(data);
    const [newTransformation, setNewTransformation] = useState<Transformations>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformationConfig, setTransformationConfig] = useState(config) 
    const [isPending, startTransition] = useTransition()
    const router = useRouter();

    const intitialValues = data && action === "Update" ? {
        title : data?.title,
        aspectRatio : data?.aspectRatio,
        color : data?.color,
        prompt : data?.prompt,
        publicId : data?.publicId,
    } : defaultValues

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: intitialValues
    })
    
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        if(data || image){
            const transformationURL = getCldImageUrl({
                width : image?.width,
                height : image?.height,
                src : image?.publicId,
                ...transformationConfig
            })

            const imageData = {
                title : values.title, 
                publicId : image?.publicId,
                transformationType : type, 
                width : image?.width as number, 
                height : image?.height as number,
                config : transformationConfig,
                secureURL : image.secureURL,
                transformationURL : transformationURL, 
                aspectRatio : values.aspectRatio,
                prompt : values.prompt, 
                color : values.color
            }

            if(action === "Add"){
                try {
                    const newImage = await addImage({
                        image : imageData, 
                        userId,
                        path : '/'
                    })

                    if(newImage){
                        form.reset();
                        setImage(data);
                        router.push(`/transformations/${newImage._id}`)
                    }
                } catch (error) {
                    console.log(error)
                }
            }

            if(action === "Update"){
                try {
                    const updatedImage = await updateImage({
                        image : {
                            ...imageData,
                            _id : data._id
                        }, 
                        userId,
                        path : `/transformations/${data._id}`
                    })

                    if(updatedImage){
                        router.push(`/transformations/${updatedImage._id}`)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        setIsSubmitting(false);
    }

    const onSelectFieldHandler = (value : string, onChangeField : (value : string) => void) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey];

        setImage((prevState : IImage | null) => ({
            ...prevState,
            aspectRatio : imageSize.aspectRatio,
            width : imageSize.width ,
            height : imageSize.height
        }))

        setNewTransformation(transformationType.config)
        return onChangeField(value);
    }

    const onInputChangeHandler = (fieldName : string, value : string, type : keyof Transformations & (keyof Pick<Transformations, "remove" | "recolor">), onChangeField : (value : string) => void) => {
        debounce(() => {
            setNewTransformation((prevState) => ({
                ...prevState,
                [type] : {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to'] : value 
                }
            }))

        }, 1000)()
        return onChangeField(value);
    } 

    const onTransformHandler = async() => {
        setIsTransforming(true);

        setTransformationConfig(
            deepMergeObjects(newTransformation , transformationConfig)
        )

        setNewTransformation({});  //  possible error
        
        startTransition(async() => {
            await updateCredits(userId, 0); //testing
        })
    }

    useEffect(() => {
        if(image && (type === 'restore' || type === 'removeBackground')){
            setNewTransformation(transformationType.config);
        }
    },[image, transformationType.config, type])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {
                        creditBalance < Math.abs(creditFee) && (
                            <InsufficientCreditsModal/>
                        )
                    }
                    <CustomField
                    control = {form.control}
                    name = "title"
                    formLabel="Image Title"
                    className="w-full"
                    render = {({field}) => <Input {...field} className="input-field"/> }
                    />

                    {
                    type === 'fill' && (
                        <CustomField
                        control={form.control}
                        name="aspectRatio"
                        formLabel="Aspect Ratio"
                        className="w-full" 
                        render={({field}) => (
                            <Select
                                onValueChange={(value: string) => onSelectFieldHandler(value, field.onChange as (value: string) => void)}
                                value={field?.value as string}
                            >
                                <SelectTrigger className="select-field">
                                    <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        Object.keys(aspectRatioOptions).map((key) => (
                                            <SelectItem key={key} value={key} className="select-item">
                                                {aspectRatioOptions[key as AspectRatioKey].label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        )}
                        />
                    )
                    }

                    {
                    (type == 'remove'|| type === 'recolor') && (
                        <div className="prompt-field">
                            <CustomField
                                control={form.control}
                                name="prompt"
                                formLabel={
                                    type === 'remove' ? 'Object to remove' : "Object to recolor"
                                }
                                className="w-full"
                                render={({field}) => (
                                    <Input
                                        value={field.value as string}
                                        className="input-field"
                                        onChange={(e) => (onInputChangeHandler(
                                            'prompt',
                                            e.target.value,
                                            type,
                                            field.onChange as (value : string) => void 
                                        ))}
                                    />
                                )}
                            />

                            {
                                type === 'recolor' && (
                                    <CustomField
                                        control = {form.control}
                                        name="color"
                                        formLabel="Replacement color"
                                        className="w-full"
                                        render={({field}) => (
                                            <Input
                                                value={field.value as string}
                                                className="input-field"
                                                onChange={(e) => (onInputChangeHandler(
                                                    'color',
                                                    e.target.value,
                                                    'recolor',
                                                    field.onChange as (value : string) => void 
                                                ))} 
                                            />
                                        )}
                                    />
                                )
                            }
                        </div>
                    )
                    }

                    <div className="media-uploader-field">
                        <CustomField
                            control={form.control}
                            name="publicId"
                            className="flex size-full flex-col"
                            render = {({field}) => (
                                <MediaUploader
                                    onValueChange={field.onChange as (value: string) => void}
                                    setImage={setImage}
                                    publicId = {field.value as string}
                                    image={image}
                                    type = {type}
                                />
                            )}
                        />

                        <TransformedImage
                            image={image}
                            type={type}
                            title={form.getValues().title}
                            isTransforming={isTransforming}
                            setIsTransforming={setIsTransforming}
                            transformationConfig={transformationConfig}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button type="button" className="submit-button capitalize cursor-pointer" disabled={isTransforming} //possible error
                        onClick={onTransformHandler}>
                            {
                                isTransforming ? "Transforming..." : "Apply Transformation"
                            }
                        </Button>
                        <Button type="submit" className="submit-button capitalize" disabled={isSubmitting}>
                            {
                                isSubmitting ? "Submitting..." : "Save Image"
                            }
                        </Button>
                    </div>
            </form>
        </Form>
    )
    }

    export default TransformationForm