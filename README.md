# NILO v1 REAL

Энэ хувилбарт fake profile / fake match / fake chat байхгүй.
Зөвхөн Supabase database-д `approved` болсон бодит хэрэглэгчид Discover дээр гарна.

## 1. Supabase
1. Supabase дээр шинэ project үүсгэ.
2. SQL Editor → `supabase.sql`-ийн кодыг ажиллуул.
3. Authentication → Providers → Email ашиглана.
4. Project Settings → API-аас Project URL + anon public key ав.
5. `config.js` дотор 2 утгыг солино.

## 2. Admin болгох
1. Эхлээд өөрийн admin email/password-аар Supabase Auth user үүсгэ (Dashboard → Authentication → Users → Add user).
2. Тэр user-ийн UUID-г хуул.
3. SQL Editor:
   insert into public.admins(user_id) values ('ТЭР-UUID');
4. `admin.html` дээр тэр email/password-аар нэвтэрнэ.

## 3. GitHub Pages
Repository үүсгээд энэ folder-ийн БҮХ файлыг upload/push хийнэ.
Settings → Pages → Deploy from branch → main / root.
Дараа нь GitHub Pages URL дээр `index.html` ажиллана.
Admin: URL-ийн ард `/admin.html`.

## Flow
Register → Supabase Auth + зураг private Storage → profiles.status=pending
→ Admin `/admin.html` → Approve
→ хэрэглэгч Login → status=approved бол Discover
→ approved хүмүүс л Discover дээр гарна.

## Чухал
- `service_role` key-г browser/GitHub-д ХЭЗЭЭ Ч бүү тавь.
- SISi ID profile дээр нийтэд харуулахгүй.
- Одоогийн SISi баталгаажуулалт нь manual admin review. MUIS-ийн албан API/SSO байхгүй бол “автоматаар SISi-гаар баталгаажсан” гэж үзэж болохгүй.
- Production launch-аас өмнө report/block, moderation, terms/privacy, account deletion, image moderation, email verification нэмэх хэрэгтэй.
