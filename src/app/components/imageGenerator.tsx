"use client";

import { useState } from "react";
import { generateImage } from "../actions/generateImage";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageURL(null);
    setError(null);

    try {
      const result = await generateImage(inputText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      if (result.imageURL) {
        const img = new Image();
        img.onload = () => {
          setImageURL(result.imageURL);
          setInputText(result.message); 
      };
      img.src = result.imageURL;
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message: "Failed to generate image",
      );  
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // TODO: Update the UI here to show the images generated
    
    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1 flex flex-col items-center gap-8">
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {imageURL && (
          <div className="w-full max-w-xl rounded-lg overflow-hidden shadow-lg">
            <img
              src={imageURL}
              alt="Generated Artwork"
              className="w-full h-auto"
            />
            <p style={{ marginTop: "10px", fontStyle: "italic" }}>
              Caption: {inputText}
            </p>
          </div>
        )}

        {/* isLoading */}
      </main>      

      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
