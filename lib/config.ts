export const APP_CONFIG = {
  baseChainId: Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID || 8453),
  recipient: (process.env.NEXT_PUBLIC_BASE_RECIPIENT || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x833589fCD6edb6E08f4c7C32D4f71b54bdA02913") as `0x${string}`,
  prices: {
    // ETH equivalents in wei (can be overridden via env)
    downloadEthWei: BigInt(process.env.NEXT_PUBLIC_FEE_DOWNLOAD_ETH_WEI || "250000000000000"),
    analysisEthWei: BigInt(process.env.NEXT_PUBLIC_FEE_ANALYSIS_ETH_WEI || "250000000000000"),
    // USDC amount in base units (6 decimals), default 0.7 USDC = 700000
    usdcUnits: BigInt(process.env.NEXT_PUBLIC_FEE_USDC_UNITS || "700000"),
  },
}


