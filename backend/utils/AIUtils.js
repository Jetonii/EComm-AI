import { OpenAI } from "openai";
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import axios from "axios";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function askAI(imagePath, content) {
    try {
        const imageURL = await uploadImageAndGetURL(imagePath);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: content },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageURL, 
                            },
                        },
                    ],
                },
            ],
        });

        return response.choices[0];
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        throw error;
    }
}

export async function askAIForHomePageInfo(imagePath) {
    const content = `
        This image is the homepage of an ecommerce website. Analyze the image and try to find category names.
        Give the answer in the following format:
        Ex: categoriesFound: ~category1, category2, ... category~.
        Also, try to find xpaths of these categories:
        Ex: category1XPath: ~\\[div(contains(. 'category1')~
    `;
    return await askAI(imagePath, content);
}

export async function askAIForProductPageInfo(imagePath) {
    const content = `
        This is the image of a product of an ecommerce site, analyze it and answer these questions:
        1. What is the price of this product? 
        2. What is the discount price of this product?
        3. What is the name of this product? 
        Also, try to find relative xpaths of these elements and provide the answer in this format:
        Ex:  currency: EUR, price: '15', discountPrice: '10', productName: 'earphones'
        priceXPath: 'appropriate price xpath', discountPriceXPath: 'discount price xpath', productNameXPath: 'product name xpath'
    `;
    return await askAI(imagePath, content);
}


async function uploadImageAndGetURL(imagePath) {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    try {
        const response = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
                'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
                ...formData.getHeaders()
            }
        });
        return response.data.data.link;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}