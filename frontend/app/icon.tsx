import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Set size to native 512x512 resolution for pixel-perfect HD clarity
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  // Load the pre-cropped 512x512 favicon.png
  const faviconPath = join(process.cwd(), "public", "favicon.png");
  const faviconBuffer = readFileSync(faviconPath);
  const faviconBase64 = `data:image/png;base64,${faviconBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000", // High contrast dark background
        borderRadius: "50%", // Circular parent container
        overflow: "hidden",
      }}
    >
      <img
        src={faviconBase64}
        style={{
          width: 512,
          height: 512,
          borderRadius: "50%", // Force image clipping on the image element itself to remove light-gray corners
        }}
        alt="TradeTracker Pro Favicon"
      />
    </div>,
    {
      ...size,
    }
  );
}
