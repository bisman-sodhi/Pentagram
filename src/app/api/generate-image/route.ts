import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    console.log(text)

    const url = new URL("https://bisman-sodhi--main-text-to-image-model-generate.modal.run/")
    url.searchParams.set("prompt", text)
    console.log("Requesting URL: ", url.toString())

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.API_KEY_MODAL || "",
        Accept: "image/jpeg",
      },
    });

    if(!response.ok) {
      const errorText = await response.text();
      console.error("API Response: ", errorText);
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    }
    //TODO store prompt as well
    const imageBuffer = await response.arrayBuffer();
    const fileName = `${crypto.randomUUID()}.jpg`
    const blob = await put(fileName, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      success: true,
      imageURL: blob.url,
      message: `${text}`, // This is the prompt that the user type on the frontend
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
