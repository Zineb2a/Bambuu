
  # Bambu


  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend setup

  This app now expects Supabase Auth and a `transactions` table.

  1. Open your Supabase project dashboard.
  2. Run the SQL in `supabase/schema.sql`.
  3. In Auth settings, disable email confirmation if you want sign-up to create a live session immediately during local development.
  4. Run `npm install` again so `@supabase/supabase-js` is installed.
  5. Create a `.env` file from `.env.example`.

  This is a Vite app, so client-side env vars must use `VITE_` prefixes, not `NEXT_PUBLIC_`.
  
