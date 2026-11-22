import { describeImageWithModel } from "../image.js";
import { describeGeminiVideo } from "./video.js";
export const googleProvider = {
    id: "google",
    capabilities: ["image", "audio", "video"],
    describeImage: describeImageWithModel,
    describeVideo: describeGeminiVideo,
};
