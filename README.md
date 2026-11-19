# Techyy

Techyy is a responsive electronics storefront prototype. Serve the folder over HTTP and open it in a browser to try it.

## Included

- Browse, search, sort, and filter sample electronics
- Switch between buy and rent, with rental length in the cart
- Supabase email/password sign-up and sign-in, plus local favourites and shopping bag
- Admin workspace to add/remove products and upload a UPI QR image
- Demo checkout that displays the uploaded QR but does not collect payment

## Run locally

From this directory, run `python3 -m http.server 8000` and open `http://localhost:8000`. Add that URL to the Supabase project's Authentication URL configuration (Site URL and allowed redirect URLs). Add your deployed site URL there too when publishing.

The Supabase project URL and publishable key are configured in `app.js`. A publishable key is intended for browser use; never put a Supabase secret or service-role key in this website. Email/password accounts use Supabase Auth, but products, the admin workspace, uploaded QR, and demo orders are still stored locally in this browser. Admin actions are not secured by an admin role, and checkout does not take payment or create a real order. Do not use this prototype to process real orders. Product photography and fonts load from external image/font hosts.
