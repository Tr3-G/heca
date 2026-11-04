const BASE_URL = 'http://localhost:3000';

async function testSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END HTTP INTEGRATION TESTS');
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

  // ----------------------------------------------------
  // TEST 1: PAGES & ROUTING
  // ----------------------------------------------------
  console.log('--- TEST 1: Pages & Rewrites ---');
  const pages = [
    '/',
    '/about',
    '/gallery',
    '/blog',
    '/nominate',
    '/rsvp',
    '/admin',
    '/home.html',
    '/about.html',
    '/gallery.html',
    '/blog.html',
    '/nominate.html',
    '/rsvp.html',
    '/admin.html',
  ];

  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    assert(res.status === 200, `Page "${page}" returned status 200 OK`);
  }

  // ----------------------------------------------------
  // TEST 2: ADMIN AUTHENTICATION
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Pre-seeded Administrator Login ---');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@heca.ng', password: 'Heca123!!!' }),
  });
  const adminData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && adminData.success, 'Admin login with "admin@heca.ng" and "Heca123!!!" succeeds');
  assert(adminData.user.name === 'administrator', 'Admin name is "administrator"');
  assert(adminData.user.role === 'admin', 'Admin role is "admin"');
  const adminToken = adminData.token;
  assert(!!adminToken, 'Admin token was issued');

  // Verify /api/auth/check
  const checkRes = await fetch(`${BASE_URL}/api/auth/check`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const checkData = await checkRes.json();
  assert(checkData.authenticated === true, 'Token verified via /api/auth/check');

  // ----------------------------------------------------
  // TEST 3: STAFF CREATION & MANAGEMENT
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Staff Management & Creation ---');
  const testStaffEmail = 'chidinma@heca.ng';
  const testStaffPhone = '+2348055667788';
  const testStaffPass = 'ChidinmaPass2027!';

  const createStaffRes = await fetch(`${BASE_URL}/api/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Chidinma Okafor',
      email: testStaffEmail,
      phone: testStaffPhone,
      password: testStaffPass,
      role: 'staff',
    }),
  });

  const createStaffData = await createStaffRes.json();
  if (createStaffRes.status === 201) {
    assert(createStaffData.success === true, 'Created new staff member Chidinma Okafor');
  } else if (createStaffRes.status === 409) {
    console.log('  ℹ️ Staff member already exists, proceeding');
  } else {
    assert(false, 'Create staff returned unexpected status: ' + createStaffRes.status);
  }

  // List staff
  const listStaffRes = await fetch(`${BASE_URL}/api/staff`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const listStaffData = await listStaffRes.json();
  assert(listStaffData.success && listStaffData.staff.length >= 2, 'Staff list contains both admin and newly added staff');

  // ----------------------------------------------------
  // TEST 4: FORGOT PASSWORD FLOW (TEMPORARY PHONE AS PASSWORD)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Forgot Password Flow ---');
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStaffEmail }),
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200 && forgotData.success, 'Forgot password returned success');
  assert(forgotData.phone === testStaffPhone, 'Forgot password reset temporary password to registered phone number');
  console.log(`  ℹ️ System message: "${forgotData.message}"`);

  // Login using phone number as temporary password
  const phoneLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStaffEmail, password: testStaffPhone }),
  });
  const phoneLoginData = await phoneLoginRes.json();
  assert(phoneLoginRes.status === 200 && phoneLoginData.success, 'Staff successfully logged in using temporary phone number as password');
  const staffToken = phoneLoginData.token;

  // ----------------------------------------------------
  // TEST 5: CHANGE PASSWORD FLOW
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Change Password Flow ---');
  const newStaffPass = 'NewChidinmaPass999!';
  const changePassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({
      email: testStaffEmail,
      oldPassword: testStaffPhone,
      newPassword: newStaffPass,
    }),
  });
  const changePassData = await changePassRes.json();
  assert(changePassRes.status === 200 && changePassData.success, 'Password successfully changed to new password');

  // Verify login with new password
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStaffEmail, password: newStaffPass }),
  });
  const newLoginData = await newLoginRes.json();
  assert(newLoginRes.status === 200 && newLoginData.success, 'Staff successfully logged in using new password');

  // ----------------------------------------------------
  // TEST 6: BLOG OPERATIONS (CREATE, VIEW COUNT, LIKE COUNT)
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Blog Creation, View Count Increment, and Likes ---');
  const createBlogRes = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Trailblazing Women in Nigerian Technology and Governance',
      author: 'HECA Secretariat',
      date: new Date().toISOString().slice(0, 10),
      excerpt: 'Exploring the transformative influence of female leadership across Nigerian institutions.',
      body: '## Inspiring the Future\n\nAcross public and private sectors in Nigeria, women leaders are architecting durable solutions.',
      coverId: '1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0',
    }),
  });
  const createdPost = await createBlogRes.json();
  assert(createBlogRes.status === 201 && !!createdPost.id, `Created new blog post with ID: ${createdPost.id}`);

  // Fetch single post: should increment views
  const initialViews = createdPost.views || 0;
  const getPostRes1 = await fetch(`${BASE_URL}/api/posts/${createdPost.id}`);
  const postData1 = await getPostRes1.json();
  assert(getPostRes1.status === 200, 'Fetched single blog post by ID');
  assert(postData1.views >= initialViews + 1, `Post view count incremented (now: ${postData1.views})`);

  // Another view
  const getPostRes2 = await fetch(`${BASE_URL}/api/posts/${createdPost.id}`);
  const postData2 = await getPostRes2.json();
  assert(postData2.views >= postData1.views + 1, `Second view incremented view count (now: ${postData2.views})`);

  // Like post
  const likeRes1 = await fetch(`${BASE_URL}/api/posts/${createdPost.id}/like`, { method: 'POST' });
  const likeData1 = await likeRes1.json();
  assert(likeRes1.status === 200 && likeData1.success, 'Liked blog post successfully');
  assert(likeData1.likes >= 1, `Blog post like count incremented (now: ${likeData1.likes})`);

  // ----------------------------------------------------
  // TEST 7: NOMINATIONS (SUBMIT, REVIEW, UPDATE STATUS)
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Nominations Operations ---');
  const nomRes = await fetch(`${BASE_URL}/api/nominations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nomineeName: 'Chief (Dr.) Nike Okundaye',
      nomineeEmail: 'nike@artgallery.ng',
      nomineePhone: '+2348022222222',
      organisation: 'Nike Art Centre & Foundation',
      category: 'Arts, Culture & Fashion',
      biography: 'Renowned artist, cultural ambassador and textile visionary.',
      achievements: 'Established the largest private art gallery in West Africa and trained thousands in crafts.',
      impact: 'Empowered marginalized women and youths through creative enterprise.',
      reasons: 'Lifelong dedication to African arts and economic independence for women.',
      supporting: 'https://example.com/nike-art',
      nominatorName: 'Mrs. Funke Akindele',
      nominatorEmail: 'funke@example.com',
      nominatorPhone: '+2348077777777',
    }),
  });
  const nomData = await nomRes.json();
  assert(nomRes.status === 201 && nomData.success, 'Nomination submitted successfully');
  const nomId = nomData.nomination.id;

  // Review nomination
  const updateStatusRes = await fetch(`${BASE_URL}/api/nominations/${nomId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Approved', notes: 'Unanimously approved by advisory committee.' }),
  });
  const updateStatusData = await updateStatusRes.json();
  assert(updateStatusRes.status === 200 && updateStatusData.success, 'Nomination status updated to Approved');
  assert(updateStatusData.nomination.status === 'Approved', 'Updated nomination verified as Approved');

  // Stats
  const statsRes = await fetch(`${BASE_URL}/api/nominations/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  assert(statsRes.status === 200 && statsData.stats.total >= 1, 'Nomination stats computed successfully');

  // ----------------------------------------------------
  // TEST 8: GALLERY API
  // ----------------------------------------------------
  console.log('\n--- TEST 8: Gallery API ---');
  const galleryRes = await fetch(`${BASE_URL}/api/gallery`);
  const galleryData = await galleryRes.json();
  assert(galleryRes.status === 200 && Array.isArray(galleryData), 'Gallery endpoint returns list of photographs');
  assert(galleryData.length > 0, `Gallery contains ${galleryData.length} items`);

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed} TESTS PASSED! (${failed} failed)`);
  console.log('====================================================\n');
  process.exit(0);
}

testSuite().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
