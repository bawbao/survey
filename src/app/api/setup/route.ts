import { prisma } from "@/lib/prisma";
import { seedInitialData } from "@/lib/seed-data";

function page(title: string, body: string, ok: boolean) {
  return new Response(
    `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f4f6f5; color: #1c2521; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { background: #fff; border: 1px solid #e2e8e4; border-radius: 16px; padding: 32px; max-width: 480px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    h1 { font-size: 20px; margin: 0 0 12px; color: ${ok ? "#047857" : "#dc2626"}; }
    p { line-height: 1.6; }
    code { background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 6px; font-size: 14px; }
    a.btn { display: inline-block; margin-top: 16px; background: #059669; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

// Endpoint setup satu-kali: buka URL ini sekali di browser setelah deploy
// pertama untuk mengisi akun admin/kasir contoh + data awal. Aman dijalankan
// berkali-kali — kalau sudah pernah ada pengguna di database, tidak akan
// mengubah apa pun lagi.
export async function GET() {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return page(
        "Sudah pernah di-setup",
        `<p>Database sudah punya ${existingUsers} akun pengguna, jadi data awal tidak dibuat ulang.</p>
         <p>Silakan langsung login seperti biasa.</p>
         <a class="btn" href="/login">Ke halaman Login</a>`,
        true,
      );
    }

    await seedInitialData(prisma);

    return page(
      "Setup berhasil! 🎉",
      `<p>Akun contoh berikut sudah dibuat:</p>
       <p><strong>Admin</strong><br/>Email: <code>admin@grosir.local</code><br/>Password: <code>admin123</code></p>
       <p><strong>Kasir</strong><br/>Email: <code>kasir@grosir.local</code><br/>Password: <code>kasir123</code></p>
       <p>Beberapa kategori, produk contoh, dan 1 supplier contoh juga sudah ditambahkan. Segera ganti password akun ini setelah login pertama kali (menu <em>Pengguna</em>).</p>
       <a class="btn" href="/login">Login Sekarang</a>`,
      true,
    );
  } catch (err) {
    console.error(err);
    return page(
      "Setup gagal",
      `<p>Terjadi kesalahan saat mengisi data awal. Cek kembali environment variable <code>DATABASE_URL</code> di Vercel, lalu coba buka halaman ini lagi.</p>`,
      false,
    );
  }
}
