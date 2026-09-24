import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

/**
 * Without an incremental cache every `revalidate = 60` page (agenda, speakers,
 * matchmaking, print-schedule) and every `next: { revalidate }` Sanity fetch is
 * rendered fresh on each request, which is slow and burns Sanity API quota.
 *
 * - R2 holds the rendered pages and fetch results (NEXT_INC_CACHE_R2_BUCKET).
 * - The regional cache keeps hot entries in the data centre's Cache API so most
 *   hits never reach R2.
 * - The Durable Object queue (NEXT_CACHE_DO_QUEUE) runs stale-while-revalidate
 *   re-renders in the background and dedupes them across requests.
 *
 * No tag cache: nothing calls revalidateTag/revalidatePath, so time-based
 * revalidation is all we need. Add d1NextTagCache or doShardedTagCache if that
 * changes, or on-demand revalidation will silently do nothing.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: doQueue,
});
