"use client";

import { useState } from "react";

interface ImageGeneratorProps {
    generateImage: (
        text: string
    ) => Promise<{success: boolean; imageURL ?: string; message ?: string; error ?: string }>;
}

export default function ImageGenerator({generateImage}: ImageGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<
    { url: string; prompt: string; likes: number; dislikes: number }[]>([]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setInputText("");
    setError(null);

    try {
      const result = await generateImage(inputText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      if (result.imageURL) {
        const img = new Image();
        const url = result.imageURL;
        setImages((prev) => [
            ...prev,
            { url: url, prompt: inputText, likes: 0, dislikes: 0 },
          ]);
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

  const handleLike = (index: number) => {
    setImages((prev) =>
      prev.map((image, i) =>
        i === index ? { ...image, likes: image.likes + 1 } : image
      )
    );
  };

  const handleDislike = (index: number) => {
    setImages((prev) =>
      prev.map((image, i) =>
        i === index ? { ...image, dislikes: image.dislikes + 1 } : image
      )
    );
  };
  return (
    <div className="min-h-screen flex flex-col justify-between p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white-800 mb-4">Pentagram: Image Generation</h1>
        </div>
      <main className="flex-1 flex flex-col items-center gap-8">
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={image.url}
                  alt={`Generated Artwork ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
                <p
                  style={{
                    marginTop: "10px",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  Caption: {image.prompt}
                </p>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    onClick={() => handleLike(index)}
                    className="px-4 py-2 rounded  text-white hover:bg-green-600"
                  > 
                    👍 {image.likes}
                  </button>
                  <button
                    onClick={() => handleDislike(index)}
                    className="px-4 py-2 rounded text-white hover:bg-red-600"
                  >
                    👎 {image.dislikes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h4>Welcome to Pentagram! Enter prompt below to generate images</h4>
        )}
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
