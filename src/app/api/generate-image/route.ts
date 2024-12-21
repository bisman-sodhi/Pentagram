import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    const apisecret = request.headers.get("X-API-Key");
    if (apisecret !== process.env.API_KEY_MODAL) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    console.log(text)
    const modal_url = process.env.MODAL_URL;
    if (!modal_url) {
      throw new Error("MODAL_URL environment variable is invalid or missing");
    }
    const url = new URL(modal_url);
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
