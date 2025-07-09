alter table "public"."profiles" add column "birth_date" date;
alter table "public"."profiles" add column "birth_time" time without time zone;
alter table "public"."profiles" add column "birth_location" text;
alter table "public"."profiles" add column "birth_lat" numeric;
alter table "public"."profiles" add column "birth_lon" numeric; 