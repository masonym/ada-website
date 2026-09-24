# Cloudflare Workers deploy

The site builds with [OpenNext](https://opennext.js.org/cloudflare) and runs on the `ada-website` Worker. Production deploys come from `.github/workflows/deploy-cloudflare.yml`. It runs after CI passes on `main`, or when started by hand from the Actions tab.

Deploy only from CI, never from your own machine. The OpenNext build copies any `.env` / `.env.local` it finds into the Worker as a fallback, and Next writes `NEXT_PUBLIC_*` values into the browser code from whichever machine runs the build. A deploy from your machine would ship your local dev values. `npm run cf:preview` is still fine for trying it locally.

## One-time setup

Use Node 24 (`nvm use 24`). Wrangler won't run on Node 20.

1. **Plan.** Switch the Cloudflare account to Workers Paid ($5/mo). The Worker is about 4 MB compressed, which is over the free plan's 3 MB limit.
2. **Log in and create the cache bucket.**
   ```
   npx wrangler login
   npx wrangler r2 bucket create ada-website-cache
   ```
3. **API token.** In the Cloudflare dashboard, go to My Profile → API Tokens → Create Token and use the **Edit Cloudflare Workers** template, limited to this account. Copy the Account ID from the Workers & Pages overview page.
4. **Production env file.** Create a file *outside the repo* that holds every production value in `.env` format. Get the values from Vercel (Project → Settings → Environment Variables → Production). Vercel won't reveal variables marked *Sensitive*, so get those from where they came from (Stripe, Google Cloud, Resend, AWS, Sanity).

   Variables the app reads:
   ```
   # Browser-visible, written into the build
   NEXT_PUBLIC_SITE_URL=https://americandefensealliance.org
   NEXT_PUBLIC_CDN_DOMAIN  NEXT_PUBLIC_STORAGE_BUCKET  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   NEXT_PUBLIC_MAPS_API_KEY  NEXT_PUBLIC_MAP_ID  NEXT_PUBLIC_MY_EMAIL
   NEXT_PUBLIC_APP_ENV  NEXT_PUBLIC_DEV_MODE

   # Server
   ADMIN_PASSWORD  ADMIN_SESSION_SECRET  MASTER_ORDER_KEY
   STRIPE_SECRET_KEY  STRIPE_WEBHOOK_SECRET
   RESEND_API_KEY  MY_EMAIL  REGISTRATION_CONTACT_EMAIL_ADDRESS
   AWS_ACCESS_KEY_ID  AWS_SECRET_ACCESS_KEY  AWS_REGION  AWS_BUCKET_NAME
   DYNAMODB_TABLE_NAME  PERMANENT_REGISTRATIONS_TABLE_NAME  FAILED_REGISTRATIONS_TABLE_NAME
   GOOGLE_SHEETS_CLIENT_EMAIL  GOOGLE_SHEETS_PRIVATE_KEY
   GOOGLE_CLIENT_ID  GOOGLE_CLIENT_SECRET  GOOGLE_REFRESH_TOKEN
   GOOGLE_SHEETS_SPREADSHEET_ID  GOOGLE_SHEETS_SPREADSHEET_ID_<EVENT>   (one per mapped event)
   SANITY_API_TOKEN  SANITY_WRITE_TOKEN
   ICONTACT_APP_ID  ICONTACT_EMAIL  ICONTACT_PASSWORD  ICONTACT_ACCOUNT_ID
   ICONTACT_CLIENT_FOLDER_ID  ICONTACT_API_URL  ICONTACT_LIST_ID
   DISCORD_ADMIN_WEBHOOK_URL
   ```
   `MY_PASSWORD` is no longer used; the contact form sends through Resend. Put `GOOGLE_SHEETS_PRIVATE_KEY` in double quotes. It can be on one line with literal `\n` sequences or span several lines.
5. **GitHub secrets.**
   ```
   gh secret set CLOUDFLARE_ENV_FILE < /path/to/production.env
   gh secret set CLOUDFLARE_API_TOKEN
   gh secret set CLOUDFLARE_ACCOUNT_ID
   ```
   Then delete the local file.
6. **Deploy.** Push to `main`, or run *Deploy to Cloudflare* from the Actions tab. The site comes up at `https://ada-website.<your-subdomain>.workers.dev`.

Until all three secrets are set, the workflow skips itself and leaves a notice. Having it on `main` early is harmless.

## Changing a variable

Update `CLOUDFLARE_ENV_FILE` (`gh secret set` again), then re-run the deploy. That one secret is the only source of truth: the build reads it, and the deploy uploads it as the Worker's secrets. Uploads only add or overwrite, so a variable you delete from the file stays on the Worker until you run `npx wrangler secret delete NAME`.

## Caching

Pages with `revalidate` and Sanity fetches are cached in the R2 bucket `ada-website-cache`, with a per-data-centre cache in front of it (`open-next.config.ts`). There is no tag cache. If code starts calling `revalidateTag` or `revalidatePath`, add one, or those calls will silently do nothing.

## Logs

Workers Logs is on (`observability` in `wrangler.jsonc`). Dashboard → Workers → ada-website → Logs. For a live tail: `npx wrangler tail ada-website`.
