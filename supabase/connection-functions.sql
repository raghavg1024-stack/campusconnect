-- Additive, service-only transaction functions for the existing tables.
-- Existing tables, records, RLS policies, and grants are not altered.
begin;
create or replace function public.campus_register(p_event_id uuid,p_user_id uuid)
returns uuid language plpgsql security invoker set search_path='' as $$
declare e public."Events"%rowtype; result_id uuid;
begin
 select * into e from public."Events" where id=p_event_id for update;
 if not found then raise exception 'Event not found'; end if;
 if e."timestamp" is not null and e."timestamp"<now() then raise exception 'Registration is closed'; end if;
 if exists(select 1 from public."Registration" where event_id=p_event_id and user_id=p_user_id) then raise exception 'You are already registered'; end if;
 if (select count(*) from public."Registration" where event_id=p_event_id)>=coalesce(e.capacity,0) then raise exception 'This event is full'; end if;
 insert into public."Registration"(id,event_id,user_id,created_id) values(gen_random_uuid(),p_event_id,p_user_id,now()) returning id into result_id;
 return result_id;
end $$;
create or replace function public.campus_update_event(p_event_id uuid,p_owner_id uuid,p_title text,p_capacity integer,p_timestamp timestamptz)
returns uuid language plpgsql security invoker set search_path='' as $$
declare e public."Events"%rowtype;
begin
 select * into e from public."Events" where id=p_event_id for update;
 if not found or e.organiser_id<>p_owner_id then raise exception 'Event ownership check failed'; end if;
 if p_capacity<1 or p_capacity>10000 or length(trim(p_title))<4 or length(p_title)>120 or p_timestamp<=now() then raise exception 'Invalid event details'; end if;
 if p_capacity<(select count(*) from public."Registration" where event_id=p_event_id) then raise exception 'Capacity cannot be below the registration count'; end if;
 update public."Events" set title=p_title,capacity=p_capacity,"timestamp"=p_timestamp where id=p_event_id;
 return p_event_id;
end $$;
create or replace function public.campus_walkin(p_event_id uuid,p_owner_id uuid,p_email text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare e public."Events"%rowtype; student_id uuid; result_id uuid;
begin
 select * into e from public."Events" where id=p_event_id for update;
 if not found or e.organiser_id<>p_owner_id then raise exception 'Event ownership check failed'; end if;
 if length(p_email)>254 or p_email!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid email'; end if;
 if (select count(*) from public."Registration" where event_id=p_event_id)>=coalesce(e.capacity,0) then raise exception 'This event is full'; end if;
 if (select count(*) from public."USER" where lower(email)=lower(p_email))>1 then raise exception 'Multiple student records match this email'; end if;
 select id into student_id from public."USER" where lower(email)=lower(p_email) limit 1;
 if student_id is null then insert into public."USER"(id,email,role) values(gen_random_uuid(),lower(p_email),'student') returning id into student_id; end if;
 if exists(select 1 from public."Registration" where event_id=p_event_id and user_id=student_id) then raise exception 'This student is already registered'; end if;
 insert into public."Registration"(id,event_id,user_id,created_id) values(gen_random_uuid(),p_event_id,student_id,now()) returning id into result_id;
 return result_id;
end $$;
revoke all on function public.campus_register(uuid,uuid) from public,anon,authenticated;
revoke all on function public.campus_update_event(uuid,uuid,text,integer,timestamptz) from public,anon,authenticated;
revoke all on function public.campus_walkin(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.campus_register(uuid,uuid) to service_role;
grant execute on function public.campus_update_event(uuid,uuid,text,integer,timestamptz) to service_role;
grant execute on function public.campus_walkin(uuid,uuid,text) to service_role;
commit;
