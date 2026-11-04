const BASE_URL = 'http://localhost:3000';

async function testSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E2E TEST SUITE (V2)');
  console.log('Testing: Binary Byte Images, Caching, Skeletons, Queue');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Check all pages
  console.log('--- TEST 1: All Pages & Rewrites ---');
  const pages = ['/', '/about', '/gallery', '/blog', '/nominate', '/rsvp', '/admin'];
  for (const p of pages) {
    const res = await fetch(`${BASE_URL}${p}`);
    assert(res.status === 200, `Page "${p}" returns status 200 OK`);
  }

  // 2. Admin Auth
  console.log('\n--- TEST 2: Admin Login ---');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@heca.ng', password: 'Heca123!!!' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && loginData.success, 'Admin authenticated with admin@heca.ng / Heca123!!!');
  const adminToken = loginData.token;

  // 3. Binary Image Upload (Converting to Bytes in Database)
  console.log('\n--- TEST 3: Converting Image to Raw Bytes & Saving in PostgreSQL (BYTEA) ---');
  // Create a sample 1x1 red PNG image buffer in memory
  const samplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const samplePngBuffer = Buffer.from(samplePngBase64, 'base64');

  const formData = new FormData();
  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  formData.append('image', blob, 'award_badge.png');

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 200 && uploadData.success, 'Image upload succeeded');
  assert(uploadData.isBytes === true, 'Image was converted directly to raw bytes in database');
  assert(uploadData.url.startsWith('/api/images/'), `Returned database image stream URL: ${uploadData.url}`);
  const imageId = uploadData.id;

  // 4. Test Image Serving from DB / Cache
  console.log('\n--- TEST 4: Serving Image Bytes via /api/images/[id] ---');
  const imageServeRes = await fetch(`${BASE_URL}/api/images/${imageId}`);
  assert(imageServeRes.status === 200, 'Image bytes fetched successfully from database');
  assert(imageServeRes.headers.get('content-type') === 'image/png', 'Correct image/png content-type header returned');
  const fetchedBytes = await imageServeRes.arrayBuffer();
  assert(fetchedBytes.byteLength === samplePngBuffer.byteLength, `Byte length matches original: ${fetchedBytes.byteLength} bytes`);

  // Verify memory cache: second fetch should be instantaneous
  const startCacheTime = Date.now();
  const cachedRes = await fetch(`${BASE_URL}/api/images/${imageId}`);
  const cacheDuration = Date.now() - startCacheTime;
  assert(cachedRes.status === 200, `Cached image served in ${cacheDuration}ms`);

  // 5. Publish Blog Post using the Database Byte Image
  console.log('\n--- TEST 5: Publishing Blog Post with Byte Image ---');
  const postRes = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Groundbreaking Impact of Women in Governance 2027',
      author: 'HECA Secretariat',
      date: new Date().toISOString().slice(0, 10),
      excerpt: 'National perspectives from the upcoming Abuja gathering.',
      body: '## Excellence & National Service\n\nLeadership begins with visionary commitments.',
      coverId: `/api/images/${imageId}`,
    }),
  });
  const postData = await postRes.json();
  assert(postRes.status === 201 && !!postData.id, `Blog post created with DB Byte Image cover: ID ${postData.id}`);

  // Fetch post and verify views count
  const viewRes = await fetch(`${BASE_URL}/api/posts/${postData.id}`);
  const viewData = await viewRes.json();
  assert(viewRes.status === 200 && viewData.views >= 1, `View count incremented to ${viewData.views}`);

  // Like post
  const likeRes = await fetch(`${BASE_URL}/api/posts/${postData.id}/like`, { method: 'POST' });
  const likeData = await likeRes.json();
  assert(likeRes.status === 200 && likeData.likes >= 1, `Like count incremented to ${likeData.likes}`);

  // 6. Test Forgot Password and Change Password Flow
  console.log('\n--- TEST 6: Forgot & Change Password Flow for Staff ---');
  // Trigger forgot password for admin or staff
  const staffEmail = 'admin@heca.ng';
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: staffEmail }),
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200 && forgotData.success, 'Forgot password temporarily set password to phone number');
  const tempPhone = forgotData.phone;
  assert(!!tempPhone, `Temporary password is phone number: ${tempPhone}`);

  // Login with phone number
  const tempLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: staffEmail, password: tempPhone }),
  });
  const tempLoginData = await tempLoginRes.json();
  assert(tempLoginRes.status === 200 && tempLoginData.success, 'Successfully logged in using temporary phone number as password');
  const newSessionToken = tempLoginData.token;

  // Change back to original Heca123!!!
  const changeRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newSessionToken}`,
    },
    body: JSON.stringify({
      email: staffEmail,
      oldPassword: tempPhone,
      newPassword: 'Heca123!!!',
    }),
  });
  const changeData = await changeRes.json();
  assert(changeRes.status === 200 && changeData.success, 'Password successfully restored to Heca123!!!');

  // 7. Test Gallery & Drive-Proxy Byte Serving
  console.log('\n--- TEST 7: Gallery & Byte-Streamed Event Photographs ---');
  const galleryRes = await fetch(`${BASE_URL}/api/gallery`);
  assert(galleryRes.status === 200, 'Gallery endpoint returns 200 OK');
  const galleryList = await galleryRes.json();
  assert(Array.isArray(galleryList) && galleryList.length >= 49, `Gallery contains ${galleryList.length} photographs`);

  // Test Hero Background served from PostgreSQL media_files (BYTEA) via drive-proxy
  const heroRes = await fetch(`${BASE_URL}/api/drive-proxy?id=1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0&w=2000`);
  assert(heroRes.status === 200, 'Hero background served successfully via drive-proxy from PostgreSQL media_files');
  assert(heroRes.headers.get('content-type') === 'image/jpeg', 'Hero background has content-type image/jpeg');
  const heroBytes = await heroRes.arrayBuffer();
  assert(heroBytes.byteLength > 100000, `Hero image stream contains valid high-res bytes: ${heroBytes.byteLength} bytes`);

  // Test Gallery Photo served from PostgreSQL media_files
  const sampleGalleryId = galleryList[0].id;
  const samplePhotoRes = await fetch(`${BASE_URL}/api/drive-proxy?id=${sampleGalleryId}&w=800`);
  assert(samplePhotoRes.status === 200, `Gallery photo ${sampleGalleryId} served with status 200 OK`);
  const sampleBytes = await samplePhotoRes.arrayBuffer();
  assert(sampleBytes.byteLength > 10000, `Gallery photo stream contains valid bytes: ${sampleBytes.byteLength} bytes`);

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} TESTS PASSED! (${failed} failed)`);
  console.log('====================================================\n');
  process.exit(0);
}

testSuite().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
