const ROOT_URL = process.env.ROOT_URL || "https://grab-rust.vercel.app"

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Grab",
    subtitle: "Download videos & onchain analytics",
    description: "Download videos from Farcaster casts and track usage onchain.",
    screenshotUrls: [
      `${ROOT_URL}/placeholder.jpg`,
    ],
    iconUrl: `${ROOT_URL}/placeholder-logo.png`,
    splashImageUrl: `${ROOT_URL}/placeholder-logo.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utilities",
    tags: ["video", "analytics", "farcaster", "base"],
    heroImageUrl: `${ROOT_URL}/placeholder.jpg`,
    tagline: "",
    ogTitle: "Grab Mini App",
    ogDescription: "Download videos from Farcaster casts & pay on Base.",
    ogImageUrl: `${ROOT_URL}/placeholder.jpg`,
  },
} as const

export default minikitConfig


