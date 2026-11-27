# Supabase setup

1. Create a Supabase project owned by Dripxel.
2. Apply `migrations/001_initial_schema.sql` in the SQL Editor.
3. Create the owner's Auth user in Supabase Authentication.
4. Copy that user's UUID and add it to the allowlist:

```sql
insert into public.studio_owners(user_id)
values ('REPLACE-WITH-AUTH-USER-UUID');
```

5. Copy `.env.example` to `.env` and add the project URL and publishable/anon key.
6. Restart Vite.

The browser uses only the publishable/anon key. Never put the service-role key in frontend code or any `VITE_` variable. Keep RLS enabled. Disable public sign-ups after creating the owner account.
