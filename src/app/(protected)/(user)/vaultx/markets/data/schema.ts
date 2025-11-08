// import { z } from "zod"

// // Schema for market/exchange price data
// // Matches examples like:
// // {
// //   asset: "crypto",
// //   change: null,
// //   change_pct: null,
// //   exchange: "BINANCE",
// //   last_close: 106988,
// //   last_close_dt: "2025-11-03",
// //   last_price: 103831,
// //   last_updated: "2025-11-04T09:39:00+00:00",
// //   name: "Bitcoin / Tether",
// //   prev_close: null,
// //   symbol: "BTCUSDT"
// // }
// export const MarketDataSchema = z.object({
//   asset: z.string(),
//   change: z.number().nullable().optional(),
//   change_pct: z.number().nullable().optional(),
//   exchange: z.string(),
//   last_close: z.number().nullable().optional(),
//   last_close_dt: z.string().nullable().optional(),
//   last_price: z.number(),
//   last_updated: z.string().nullable(),
//   name: z.string(),
//   prev_close: z.number().nullable().optional(),
//   symbol: z.string(),
// })

// export type MarketData = z.infer<typeof MarketDataSchema>




import { z } from "zod";

export const MarketDataSchema = z.object({
  asset: z.string(),
  exchange: z.string(),
  last_price: z.number(),
  name: z.string(),
  symbol: z.string(),

  // Coerce undefined → null so UI never sees `undefined`
  change: z.number().nullable().default(null),
  change_pct: z.number().nullable().default(null),
  last_close: z.number().nullable().default(null),
  last_close_dt: z.string().nullable().default(null),
  prev_close: z.number().nullable().default(null),
  last_updated: z.string().nullable().default(null),
});

export type MarketData = z.infer<typeof MarketDataSchema>;

export const MarketResponseSchema = z.object({
  items: z.array(MarketDataSchema).default([]),
  count: z.number().optional().default(0),
  category: z.string().optional().default("all"),
});

export type MarketResponse = z.infer<typeof MarketResponseSchema>;
