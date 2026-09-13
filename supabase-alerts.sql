-- RYDEXS: email alert (via Brevo) whenever a new enquiry is saved.
-- Run once in Supabase → SQL Editor → New query → Run.
-- Needs two Vault secrets (Supabase → Ctrl+K → "Vault" → Add new secret):
--   brevo_api_key : your Brevo API key (Brevo → SMTP & API → API Keys)
--   alert_email   : the email that receives alerts; must be a verified sender in Brevo
-- If either secret is missing, enquiries still save, just without an email.

create extension if not exists pg_net;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Escape visitor-typed text before putting it in the email HTML
create or replace function private.esc(t text)
returns text
language sql
immutable
set search_path = ''
as $$
  select replace(replace(replace(coalesce(nullif(t, ''), '—'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
$$;

create or replace function private.notify_new_enquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key     text;
  alert_email text;
  kind        text;
  contact     text;
begin
  select decrypted_secret into api_key     from vault.decrypted_secrets where name = 'brevo_api_key';
  select decrypted_secret into alert_email from vault.decrypted_secrets where name = 'alert_email';
  if api_key is null or alert_email is null then
    return new;
  end if;

  kind := case new.source
            when 'contact' then 'Contact enquiry'
            when 'planner' then 'Trip quote request'
            else 'Callback request'
          end;

  -- phone is guaranteed 10 digits by the table's check constraint, so it is safe in links
  contact := case when new.phone is null then '—' else format(
    '<a href="tel:+91%1$s">+91 %1$s</a> &nbsp;·&nbsp; <a href="https://wa.me/91%1$s">WhatsApp</a>', new.phone) end;

  perform net.http_post(
    url     := 'https://api.brevo.com/v3/smtp/email',
    headers := jsonb_build_object('api-key', api_key, 'Content-Type', 'application/json', 'accept', 'application/json'),
    body    := jsonb_build_object(
      'sender',  jsonb_build_object('name', 'RYDEXS Website', 'email', alert_email),
      'to',      jsonb_build_array(jsonb_build_object('email', alert_email)),
      'subject', 'New ' || kind || coalesce(' — ' || nullif(new.name, ''), '') || coalesce(' (' || new.phone || ')', ''),
      'htmlContent', format(
        '<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">'
        '<h2 style="margin:0 0 12px">New %s</h2>'
        '<table cellpadding="6" style="border-collapse:collapse">'
        '<tr><td><b>Name</b></td><td>%s</td></tr>'
        '<tr><td><b>Phone</b></td><td>%s</td></tr>'
        '<tr><td><b>Destination</b></td><td>%s</td></tr>'
        '<tr><td><b>Travel date</b></td><td>%s</td></tr>'
        '<tr><td><b>Travellers</b></td><td>%s</td></tr>'
        '<tr><td><b>Trip type</b></td><td>%s</td></tr>'
        '<tr><td valign="top"><b>Message</b></td><td style="white-space:pre-wrap">%s</td></tr>'
        '<tr><td><b>Page</b></td><td>%s</td></tr>'
        '<tr><td><b>Received</b></td><td>%s IST</td></tr>'
        '</table></div>',
        kind,
        private.esc(new.name),
        contact,
        private.esc(new.destination),
        coalesce(to_char(new.travel_date, 'DD Mon YYYY'), '—'),
        coalesce(new.travellers::text, '—'),
        private.esc(new.trip_type),
        private.esc(new.message),
        private.esc(new.page),
        to_char(new.created_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM')
      )
    )
  );
  return new;
exception when others then
  -- never let an email problem block the enquiry from saving
  raise warning 'Enquiry email alert failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists enquiry_email_alert on public.enquiries;
create trigger enquiry_email_alert
  after insert on public.enquiries
  for each row execute function private.notify_new_enquiry();
