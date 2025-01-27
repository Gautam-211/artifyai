# AI Image SaaS Platform

An AI-powered image transformation platform built to offer a wide range of image processing features. Users can upload, transform, and manage their images with advanced functionalities such as image restoration, recoloring, object removal, generative filling, and background removal. The platform also includes secure payment integration and a robust community showcase.

## Demo

Check out the live demo of the platform [(link to demo)](https://imaginify-rust-three.vercel.app/)

## Features

- **Authentication & Authorization**: Secure user access with registration, login, and route protection.
- **Community Image Showcase**: Explore user transformations with easy navigation via pagination.
- **Advanced Image Search**: Search for images by content or objects present in the image quickly and accurately.
- **Image Restoration**: Revive old or damaged images effortlessly.
- **Image Recoloring**: Replace objects with desired colors.
- **Image Generative Fill**: Fill in missing areas of images seamlessly.
- **Object Removal**: Clean up images by removing unwanted objects.
- **Background Removal**: Extract objects from backgrounds.
- **Download Transformed Images**: Save and share AI-transformed images.
- **Transformed Image Details**: View details of transformations for each image.
- **Transformation Management**: Control over deletion and updates of transformations.
- **Credits System**: Earn or purchase credits for image transformations.
- **Profile Page**: Access personal transformed images and credit information.
- **Credits Purchase**: Securely buy credits via Stripe.
- **Responsive UI/UX**: Seamless experience across devices with a user-friendly interface.

## Tech Stack

- **Next.js**: Framework for server-side rendered React applications.
- **TypeScript**: JavaScript with static typing for enhanced development experience.
- **MongoDB**: NoSQL database for storing user data and image transformations.
- **Clerk**: Authentication and authorization solution for secure access.
- **Cloudinary**: Cloud service for media management and transformations.
- **Stripe**: Payment gateway for purchasing credits.
- **Shadcn**: Component library for UI design.
- **TailwindCSS**: Utility-first CSS framework for responsive UI.

## Installation

To get started with the project, clone this repository and install the necessary dependencies.

```bash
git clone https://github.com/Gautam-211/artifyai.git
cd artifyai
npm install
```

Make sure to setup the following environment variables
```bash
#clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

#clerk webhook secret
WEBHOOK_SECRET = 

#mongodb
MONGODB_URL = 

#cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 
CLOUDINARY_API_KEY = 
CLOUDINARY_API_SECRET = 

#stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 
STRIPE_SECRET_KEY = 
STRIPE_WEBHOOK_SECRET = 

#other
NEXT_PUBLIC_SERVER_URL =
```

Then run the development server
```bash
npm run dev
```
