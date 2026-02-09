-- INSTRUCCIONES:
-- 1. Copia el contenido de "PASO 1" y ejecútalo en el SQL Editor de Supabase.
-- 2. Verifica que los usuarios listados sean los correctos.
-- 3. Si todo coincide, ejecuta el bloque "PASO 2".

-- ==========================================
-- PASO 1: DRY RUN (VERIFICACIÓN)
-- ==========================================
select id, email, created_at, email_confirmed_at
from auth.users
where email in (
  'josuegregpro@gmail.com',
  'josuegregf@gmail.com',
  'aelabs5002@gmail.com'
);

-- ==========================================
-- PASO 2: DELETE (ELIMINACIÓN REAL)
-- ==========================================
do $$
declare
  emails text[] := array[
    'josuegregpro@gmail.com',
    'josuegregf@gmail.com',
    'aelabs5002@gmail.com'
  ];
begin
  -- Eliminar identidades asociadas
  delete from auth.identities
  where user_id in (select id from auth.users where email = any(emails));

  -- Eliminar sesiones activas
  delete from auth.sessions
  where user_id in (select id from auth.users where email = any(emails));

  -- Eliminar refresh tokens
  delete from auth.refresh_tokens
  where user_id in (select id from auth.users where email = any(emails));

  -- Eliminar usuarios
  delete from auth.users
  where email = any(emails);
end $$;

-- ==========================================
-- PASO 3: VERIFICACIÓN FINAL
-- ==========================================
select email as "Usuarios Restantes (Debe ser 0)"
from auth.users
where email in (
  'josuegregpro@gmail.com',
  'josuegregf@gmail.com',
  'aelabs5002@gmail.com'
);
